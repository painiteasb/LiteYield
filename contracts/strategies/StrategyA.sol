// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./BaseStrategy.sol";

contract StrategyA is BaseStrategy {
    constructor(address _underlying, address _vault) BaseStrategy(_underlying, 500, _vault) {}
}
