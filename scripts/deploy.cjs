const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // 1. Deploy MockLTC
  console.log("Deploying MockLTC...");
  const MockLTC = await hre.ethers.getContractFactory("MockLTC");
  const ltc = await MockLTC.deploy();
  await ltc.waitForDeployment();
  const ltcAddress = await ltc.getAddress();
  console.log("MockLTC deployed to:", ltcAddress);

  // 2. Deploy LiteVault
  console.log("Deploying LiteVault...");
  const LiteVault = await hre.ethers.getContractFactory("LiteVault");
  const vault = await LiteVault.deploy(ltcAddress, deployer.address);
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();
  console.log("LiteVault deployed to:", vaultAddress);

  const yLTCAddress = await vault.shareToken();
  console.log("yLTC (shares) deployed to:", yLTCAddress);

  // 3. Deploy StrategyA
  console.log("Deploying StrategyA...");
  const StrategyA = await hre.ethers.getContractFactory("StrategyA");
  const strategyA = await StrategyA.deploy(ltcAddress, vaultAddress);
  await strategyA.waitForDeployment();
  const stratAAddress = await strategyA.getAddress();
  console.log("StrategyA deployed to:", stratAAddress);

  // 4. Deploy StrategyB
  console.log("Deploying StrategyB...");
  const StrategyB = await hre.ethers.getContractFactory("StrategyB");
  const strategyB = await StrategyB.deploy(ltcAddress, vaultAddress);
  await strategyB.waitForDeployment();
  const stratBAddress = await strategyB.getAddress();
  console.log("StrategyB deployed to:", stratBAddress);

  // 5. Initialize Strategies in Vault
  console.log("Configuring Vault strategies...");
  const setStratTx = await vault.setStrategies(stratAAddress, stratBAddress);
  await setStratTx.wait();
  console.log("Strategies successfully set in Vault.");

  console.log("\n--- DEPLOYMENT SUMMARY ---");
  console.log("Mock LTC: ", ltcAddress);
  console.log("LiteVault: ", vaultAddress);
  console.log("yLTC (Shares): ", yLTCAddress);
  console.log("Strategy A (5%): ", stratAAddress);
  console.log("Strategy B (10%): ", stratBAddress);
  console.log("---------------------------\n");
  
  console.log("Update src/contracts/addresses.ts with these addresses.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
