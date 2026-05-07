// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./yLTC.sol";
import "./interfaces/IStrategy.sol";
import "./strategies/BaseStrategy.sol";

/**
 * @title LiteVault
 * @notice Core yield engine for LiteYield. Manages assets, shares, and strategy orchestration.
 */
contract LiteVault is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable underlying;
    YLTC public immutable shareToken;

    IStrategy public strategyA;
    IStrategy public strategyB;

    uint256 public targetBufferBps = 1500; // 15% target liquidity buffer
    uint256 public constant MAX_BPS = 10000;
    
    // Allocation Weights
    uint256 public constant STRAT_A_WEIGHT = 7000; // 70% of allocated funds
    uint256 public constant STRAT_B_WEIGHT = 3000; // 30% of allocated funds

    bool public isPaused;

    event Deposit(address indexed user, uint256 amount, uint256 shares);
    event Withdraw(address indexed user, uint256 amount, uint256 shares);
    event Rebalance(uint256 stratAAssets, uint256 stratBAssets);
    event EmergencyWithdraw();

    constructor(address _underlying, address _initialOwner) Ownable(_initialOwner) {
        underlying = IERC20(_underlying);
        shareToken = new YLTC(address(this));
    }

    modifier whenNotPaused() {
        require(!isPaused, "Vault: paused");
        _;
    }

    function setStrategies(address _stratA, address _stratB) external onlyOwner {
        strategyA = IStrategy(_stratA);
        strategyB = IStrategy(_stratB);
    }

    /**
     * @notice Returns total assets managed by the vault (buffer + strategies).
     */
    function totalAssets() public view returns (uint256) {
        uint256 buffer = underlying.balanceOf(address(this));
        uint256 aAssets = address(strategyA) != address(0) ? strategyA.totalAssets() : 0;
        uint256 bAssets = address(strategyB) != address(0) ? strategyB.totalAssets() : 0;
        return buffer + aAssets + bAssets;
    }

    /**
     * @dev Internal version of totalAssets utilizing a provided buffer value to save gas.
     */
    function _totalAssets(uint256 buffer) internal view returns (uint256) {
        uint256 aAssets = address(strategyA) != address(0) ? strategyA.totalAssets() : 0;
        uint256 bAssets = address(strategyB) != address(0) ? strategyB.totalAssets() : 0;
        return buffer + aAssets + bAssets;
    }

    /**
     * @notice Converts asset amount to shares.
     */
    function convertToShares(uint256 assets) public view returns (uint256) {
        return _convertToShares(assets, totalAssets());
    }

    function _convertToShares(uint256 assets, uint256 currentTotalAssets) internal view returns (uint256) {
        uint256 tShares = shareToken.totalSupply();
        if (tShares == 0) return assets;
        return (assets * tShares) / currentTotalAssets;
    }

    /**
     * @notice Converts shares to asset amount.
     */
    function convertToAssets(uint256 shares) public view returns (uint256) {
        uint256 tShares = shareToken.totalSupply();
        if (tShares == 0) return shares;
        return (shares * totalAssets()) / tShares;
    }

    function _accrueAll() internal {
        if (address(strategyA) != address(0)) strategyA.accrueYield();
        if (address(strategyB) != address(0)) strategyB.accrueYield();
    }

    /**
     * @notice Deposit underlying LTC and mint yLTC shares.
     * @param amount Amount of underlying LTC to deposit.
     * @param minShares Minimum shares to receive (slippage protection).
     */
    function deposit(uint256 amount, uint256 minShares) external nonReentrant whenNotPaused {
        _accrueAll();
        
        uint256 bufferBefore = underlying.balanceOf(address(this));
        uint256 assetsBefore = _totalAssets(bufferBefore);
        
        uint256 shares = _convertToShares(amount, assetsBefore);
        require(shares > 0, "Vault: shares zero");
        require(shares >= minShares, "Slippage exceeded");

        underlying.safeTransferFrom(msg.sender, address(this), amount);
        shareToken.mint(msg.sender, shares);

        // Buffer Enforcement: Auto-allocate excess
        _autoAllocate();

        emit Deposit(msg.sender, amount, shares);
    }

    /**
     * @notice Withdraw assets by burning yLTC shares.
     */
    function withdraw(uint256 shares) external nonReentrant {
        _accrueAll();
        require(shares > 0, "Vault: shares zero");
        require(shareToken.balanceOf(msg.sender) >= shares, "Vault: insufficient shares");

        uint256 tAssets = totalAssets();
        uint256 assetsToWithdraw = (shares * tAssets) / shareToken.totalSupply();
        
        // 1. Withdraw Dust Protection: Ensure no zero-value withdrawals due to rounding
        require(assetsToWithdraw > 0, "Vault: zero withdraw");
        
        shareToken.burn(msg.sender, shares);

        uint256 buffer = underlying.balanceOf(address(this));
        if (buffer < assetsToWithdraw) {
            uint256 needed = assetsToWithdraw - buffer;
            
            // Withdraw from Strategy A first
            if (address(strategyA) != address(0)) {
                uint256 stratABalance = strategyA.totalAssets();
                uint256 toTake = needed > stratABalance ? stratABalance : needed;
                if (toTake > 0) {
                    strategyA.withdraw(toTake);
                    needed -= toTake;
                }
            }

            // Withdraw from Strategy B if still needed
            if (needed > 0 && address(strategyB) != address(0)) {
                uint256 stratBBalance = strategyB.totalAssets();
                uint256 toTake = needed > stratBBalance ? stratBBalance : needed;
                if (toTake > 0) {
                    strategyB.withdraw(toTake);
                    needed -= toTake;
                }
            }
            
            require(needed == 0, "Vault: strategy withdrawal failed");
        }

        underlying.safeTransfer(msg.sender, assetsToWithdraw);
        emit Withdraw(msg.sender, assetsToWithdraw, shares);
    }

    /**
     * @notice Rebalances funds across strategies based on target buffer.
     * Handles both allocation of excess and replenishment of buffer.
     */
    function rebalance() external onlyOwner {
        _accrueAll();
        uint256 tAssets = totalAssets();
        uint256 targetBuffer = (tAssets * targetBufferBps) / MAX_BPS;
        uint256 currentBuffer = underlying.balanceOf(address(this));

        if (currentBuffer > targetBuffer) {
            _allocate(currentBuffer - targetBuffer);
        } else if (currentBuffer < targetBuffer) {
            uint256 needed = targetBuffer - currentBuffer;
            // Replenish buffer from strategies (A then B)
            if (address(strategyA) != address(0)) {
                uint256 aAssets = strategyA.totalAssets();
                uint256 toTake = needed > aAssets ? aAssets : needed;
                if (toTake > 0) {
                    strategyA.withdraw(toTake);
                    needed -= toTake;
                }
            }
            if (needed > 0 && address(strategyB) != address(0)) {
                uint256 bAssets = strategyB.totalAssets();
                uint256 toTake = needed > bAssets ? bAssets : needed;
                if (toTake > 0) {
                    strategyB.withdraw(toTake);
                    needed -= toTake;
                }
            }
            // 2. Rebalance Liquidity Safety Check: Ensure buffer is correctly restored
            require(needed == 0, "Vault: insufficient liquidity to rebalance");
        }
        
        emit Rebalance(
            address(strategyA) != address(0) ? strategyA.totalAssets() : 0,
            address(strategyB) != address(0) ? strategyB.totalAssets() : 0
        );
    }

    function _autoAllocate() internal {
        uint256 tAssets = totalAssets();
        uint256 targetBuffer = (tAssets * targetBufferBps) / MAX_BPS;
        uint256 currentBuffer = underlying.balanceOf(address(this));

        if (currentBuffer > targetBuffer) {
            _allocate(currentBuffer - targetBuffer);
        }
    }

    function _allocate(uint256 amount) internal {
        uint256 amountA = (amount * STRAT_A_WEIGHT) / MAX_BPS;
        uint256 amountB = amount - amountA;

        if (amountA > 0 && address(strategyA) != address(0)) {
            underlying.approve(address(strategyA), 0);
            underlying.approve(address(strategyA), amountA);
            strategyA.deposit(amountA);
        }
        if (amountB > 0 && address(strategyB) != address(0)) {
            underlying.approve(address(strategyB), 0);
            underlying.approve(address(strategyB), amountB);
            strategyB.deposit(amountB);
        }
    }

    /**
     * @notice Emergency withdraw all funds from strategies to vault buffer.
     */
    function emergencyWithdrawAll() external onlyOwner {
        if (address(strategyA) != address(0)) strategyA.emergencyWithdraw();
        if (address(strategyB) != address(0)) strategyB.emergencyWithdraw();
        isPaused = true;
        emit EmergencyWithdraw();
    }

    // --- Helper Functions ---

    /**
     * @notice Returns the price of a single share in underlying assets (scaled by 1e18).
     */
    function sharePrice() public view returns (uint256) {
        uint256 supply = shareToken.totalSupply();
        if (supply == 0) return 1e18;
        return (totalAssets() * 1e18) / supply;
    }

    /**
     * @notice Returns equivalent assets for a user's share position.
     */
    function getUserPosition(address user) external view returns (uint256) {
        uint256 shares = shareToken.balanceOf(user);
        if (shares == 0) return 0;
        return (shares * totalAssets()) / shareToken.totalSupply();
    }

    /**
     * @notice Returns current strategy APYs in basis points.
     */
    function getStrategyAPYs() external view returns (uint256 apyA, uint256 apyB) {
        if (address(strategyA) != address(0)) {
            apyA = BaseStrategy(address(strategyA)).apyBps();
        }
        if (address(strategyB) != address(0)) {
            apyB = BaseStrategy(address(strategyB)).apyBps();
        }
    }

    function setPaused(bool _paused) external onlyOwner {
        isPaused = _paused;
    }

    function setTargetBuffer(uint256 _bps) external onlyOwner {
        require(_bps <= MAX_BPS, "Vault: invalid bps");
        targetBufferBps = _bps;
    }
}
