<div align="center">

# LiteYield

### Institutional yield infrastructure for Litecoin powered by LitVM

<img width="180" alt="LiteYield Logo" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

<br />

🌐 https://liteyield.finance

</div>

---

## Overview

LiteYield is a decentralized Litecoin yield protocol built on LitVM.

The protocol transforms idle Litecoin liquidity into programmable onchain yield strategies through a vault architecture designed for both institutional and retail users.

Users deposit mLTC into the LiteYield vault and receive yLTC vault shares representing their ownership of the vault position and accrued yield over time.

LiteYield combines:
- institutional style vault infrastructure
- automated yield allocation
- programmable liquidity strategies
- consumer friendly UX
- real time vault accounting
- self custody wallet integration

---

## Core Features

### Litecoin Yield Vault
Deposit mLTC into the LiteYield vault and receive yield bearing yLTC shares.

### Automated Yield Strategies
Vault liquidity is allocated across multiple yield strategies with different risk and APY profiles.

### Real Time Share Price Growth
Yield accrues directly into vault share value over time.

### Faucet System
Integrated faucet with cooldown protection for testing and onboarding.

### Wallet Integration
Supports MetaMask wallet connection with automatic reconnection support.

### Auto Add Tokens
Users can add:
- mLTC
- yLTC

directly into MetaMask from the interface.

### Withdraw Anytime
Users can redeem yLTC back into mLTC together with accumulated yield.

### Liquidity Buffer
A vault buffer system improves withdrawal efficiency and protocol liquidity management.

### Responsive UI
Production ready frontend with:
- dark mode
- light mode
- responsive layouts
- wallet controls
- live vault stats

---

## Live Application

### Production
https://liteyield.finance

### GitHub Repository
https://github.com/painiteasb/LiteYield

---

## LiteYield Architecture

LiteYield uses a modular vault architecture composed of:

### Frontend
- React
- TypeScript
- Vite
- TailwindCSS
- Motion

### Smart Contracts
- Solidity
- Hardhat
- OpenZeppelin

### Infrastructure
- LitVM
- Vercel
- Namecheap DNS

### Vault Flow

```text
User Deposit (mLTC)
        ↓
LiteYield Vault
        ↓
Strategy Allocation
        ↓
Yield Accrual
        ↓
Share Price Growth
        ↓
User Withdraws mLTC + Yield

LitVM Integration

LiteYield is powered by LitVM smart contracts.

The protocol demonstrates how Litecoin liquidity can become programmable through:

vault primitives
smart contract yield strategies
tokenized vault shares
automated allocation systems

LiteYield showcases how LitVM expands Litecoin from a payment asset into programmable financial infrastructure.

Smart Contract Addresses
Mock LTC

0x9f86Eb758e083689B0028a283DD4882cD32B21Ff

LiteVault

0xB05b4Cfe61F3D2190b91c4A9e29C0ebdbA361800

yLTC

0xF5d691bAC67aAC85D85DA78958D940592c9A1734

Strategy A

0xa9f803763898F88162463Bc25E6F91D69101F055

Strategy B

0x607679C348BE61673F8F175833E80779eadE8618

Local Development
Prerequisites
Node.js
npm
Install Dependencies
npm install
Run Development Server
npm run dev
Build Production Version
npm run build
Security Notes

LiteYield is currently experimental software deployed for testing and demonstration purposes.

Users should avoid depositing real assets unless the contracts have undergone professional audits.

Private keys and environment variables are excluded from the public repository using .gitignore.

Future Roadmap
Advanced vault analytics
Additional yield strategies
Native LitVM integrations
Vault governance
Dynamic APY allocation
Strategy marketplace
Institutional vault tooling
Mobile optimization
Built By
Painite

X: https://x.com/Painite_ASB

Discord: painiteasb

License

MIT License