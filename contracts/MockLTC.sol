// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockLTC is ERC20 {
    uint256 public constant FAUCET_AMOUNT = 0.3 ether; // 0.3 mLTC
    uint256 public constant COOLDOWN = 12 hours;

    mapping(address => uint256) public lastClaim;

    constructor() ERC20("Mock Litecoin", "mLTC") {
        _mint(msg.sender, 1000000 * 10**18);
    }

    /**
     * @notice Public faucet with cooldown
     */
    function faucet() external {
        require(
            block.timestamp >= lastClaim[msg.sender] + COOLDOWN,
            "Faucet: wait 12 hours"
        );

        lastClaim[msg.sender] = block.timestamp;
        _mint(msg.sender, FAUCET_AMOUNT);
    }
}