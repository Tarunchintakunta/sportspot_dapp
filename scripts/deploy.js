// scripts/deploy.js
const hardhat = require("hardhat");

async function main() {
  console.log("Deploying SportSpot contract...");

  // Get the contract factory
  const SportSpotFactory = await hardhat.ethers.getContractFactory("SportSpot");
  
  // Deploy the contract
  const sportSpot = await SportSpotFactory.deploy();
  console.log("Contract deployed, waiting for confirmation...");
  
  // Wait for deployment (compatible with both ethers v5 and v6)
  await sportSpot.deployTransaction.wait();
  
  console.log(`SportSpot deployed to: ${sportSpot.address}`);
  
  // Store the contract address for frontend use
  const fs = require("fs");
  const contractsDir = "./frontend/src/utils";
  
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }
  
  fs.writeFileSync(
    `${contractsDir}/contractAddress.json`,
    JSON.stringify({ SportSpot: sportSpot.address }, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });