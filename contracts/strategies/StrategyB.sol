// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./BaseStrategy.sol";

contract StrategyB is BaseStrategy {
    constructor(address _underlying, address _vault) BaseStrategy(_underlying, 1000, _vault) {}
}
