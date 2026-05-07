// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IStrategy.sol";

/**
 * @title BaseStrategy
 * @dev Abstract contract for LiteYield strategies implementing deterministic linear yield.
 */
abstract contract BaseStrategy is IStrategy, Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable underlying;
    uint256 public immutable apyBps; // APY in basis points (100 = 1%)
    
    uint256 public totalAssetsTracked;
    uint256 public lastUpdateTime;
    bool public isPaused;

    uint256 public constant SECONDS_PER_YEAR = 365 days;

    event YieldAccrued(uint256 amount, uint256 newTotal);

    constructor(address _underlying, uint256 _apyBps, address _vault) Ownable(_vault) {
        underlying = IERC20(_underlying);
        apyBps = _apyBps;
        lastUpdateTime = block.timestamp;
    }

    /**
     * @notice Returns current total assets including accrued yield.
     * Note: This is an view function, for state changes use accrueYield().
     */
    function totalAssets() public view override returns (uint256) {
        if (totalAssetsTracked == 0 || isPaused) {
            return totalAssetsTracked;
        }
        uint256 timeElapsed = block.timestamp - lastUpdateTime;
        if (timeElapsed == 0) return totalAssetsTracked;

        uint256 accruedYield = (totalAssetsTracked * apyBps * timeElapsed) / (SECONDS_PER_YEAR * 10000);
        return totalAssetsTracked + accruedYield;
    }

    /**
     * @notice Accrues yield into totalAssetsTracked state variable.
     * @return Current total assets after accrual.
     */
    function accrueYield() public override returns (uint256) {
        if (isPaused) return totalAssetsTracked;
        
        uint256 currentAssets = totalAssets();
        uint256 accrued = currentAssets - totalAssetsTracked;
        
        if (accrued > 0) {
            totalAssetsTracked = currentAssets;
            emit YieldAccrued(accrued, currentAssets);
        }
        
        lastUpdateTime = block.timestamp;
        return totalAssetsTracked;
    }

    function deposit(uint256 amount) external override onlyOwner returns (uint256) {
        accrueYield();
        underlying.safeTransferFrom(msg.sender, address(this), amount);
        totalAssetsTracked += amount;
        return amount;
    }

    function withdraw(uint256 amount) external override onlyOwner returns (uint256) {
        accrueYield();
        require(totalAssetsTracked >= amount, "Strategy: insufficient funds");
        
        totalAssetsTracked -= amount;
        underlying.safeTransfer(msg.sender, amount);
        return amount;
    }

    function emergencyWithdraw() external override onlyOwner returns (uint256) {
        accrueYield();
        isPaused = true; // Stop yield accrual
        
        uint256 amount = underlying.balanceOf(address(this));
        // We handle discrepancy between balance and totalAssetsTracked by returning actual balance
        totalAssetsTracked = 0; 
        underlying.safeTransfer(msg.sender, amount);
        return amount;
    }

    function setPaused(bool _paused) external override onlyOwner {
        accrueYield();
        isPaused = _paused;
    }
}
