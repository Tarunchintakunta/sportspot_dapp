// deploy.cjs
const { ethers } = require("hardhat");

async function main() {
  // Get the signers
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contract with account:", deployer.address);

  // Get the contract factory
  const SportSpot = await ethers.getContractFactory("SportSpot");
  
  // Deploy the contract
  console.log("Deploying SportSpot...");
  const sportSpot = await SportSpot.deploy();
  
  // Wait for the transaction to be mined
  console.log("Waiting for deployment transaction to be mined...");
  await sportSpot.deployed();
  
  console.log("SportSpot deployed to:", sportSpot.address);
  
  // Save the contract address
  const fs = require("fs");
  const path = require("path");
  const contractsDir = "./frontend/src/utils";
  
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(contractsDir, "contractAddress.json"),
    JSON.stringify({ SportSpot: sportSpot.address }, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error during deployment:", error);
    process.exit(1);
  });