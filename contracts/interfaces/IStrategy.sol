// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IStrategy {
    function totalAssets() external view returns (uint256);
    function accrueYield() external returns (uint256);
    function deposit(uint256 amount) external returns (uint256);
    function withdraw(uint256 amount) external returns (uint256);
    function emergencyWithdraw() external returns (uint256);
    function setPaused(bool paused) external;
}
