// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title yLTC Token
 * @dev Standalone ERC20 representing shares in the LiteYield Vault.
 * Minting and burning are restricted to the LiteVault contract.
 */
contract YLTC is ERC20, Ownable {
    constructor(address initialOwner) ERC20("Yield LTC", "yLTC") Ownable(initialOwner) {}

    /**
     * @notice Mints new shares. Restricted to vault only.
     * @param to Recipient of shares.
     * @param amount Amount of shares to mint.
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /**
     * @notice Burns shares. Restricted to vault only.
     * @param from Address to burn from.
     * @param amount Amount of shares to burn.
     */
    function burn(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
    }
}
