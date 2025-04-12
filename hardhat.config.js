// hardhat.config.js - Copy and paste this entire file
const { HardhatUserConfig } = require("hardhat/config");
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const config = {
  solidity: "0.8.17",
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {},
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [process.env.PRIVATE_KEY]
    }
  },
  paths: {
    root: "./",
    sources: "./contracts",
    artifacts: "./frontend/src/artifacts",
    cache: "./cache",
    tests: "./test"
  }
};

module.exports = config;