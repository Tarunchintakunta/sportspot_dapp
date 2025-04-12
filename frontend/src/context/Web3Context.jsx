import React, { createContext, useState, useEffect, useCallback } from 'react';
// Use ethers v5 imports
import { ethers } from 'ethers';
import SportSpotArtifact from '../artifacts/contracts/SportSpot.sol/SportSpot.json';
import contractAddress from '../utils/contractAddress.json';

export const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  // Initialize provider if window.ethereum is available
  useEffect(() => {
    const initProvider = async () => {
      if (window.ethereum) {
        try {
          // Create ethers provider
          const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
          setProvider(ethersProvider);
          
          // Get the network
          const network = await ethersProvider.getNetwork();
          setChainId(network.chainId);
          
          // Check if previously connected
          const accounts = await ethersProvider.listAccounts();
          if (accounts.length > 0) {
            const account = accounts[0];
            const ethersSigner = ethersProvider.getSigner();
            
            // Initialize contract
            const sportSpotContract = new ethers.Contract(
              contractAddress.SportSpot,
              SportSpotArtifact.abi,
              ethersSigner
            );
            
            // Get account balance
            const accountBalance = await ethersProvider.getBalance(account);
            
            setAccount(account);
            setSigner(ethersSigner);
            setContract(sportSpotContract);
            setBalance(ethers.utils.formatEther(accountBalance));
            setIsConnected(true);
          }
        } catch (err) {
          console.error("Error initializing provider:", err);
          setError("Failed to initialize Web3 provider");
        }
      } else {
        setError("MetaMask not installed");
      }
    };
    
    initProvider();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = async (accounts) => {
        if (accounts.length === 0) {
          // User disconnected
          setAccount(null);
          setSigner(null);
          setContract(null);
          setBalance(null);
          setIsConnected(false);
        } else {
          // Account changed
          const newAccount = accounts[0];
          const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
          const ethersSigner = ethersProvider.getSigner();
          
          // Initialize contract with new signer
          const sportSpotContract = new ethers.Contract(
            contractAddress.SportSpot,
            SportSpotArtifact.abi,
            ethersSigner
          );
          
          // Get account balance
          const accountBalance = await ethersProvider.getBalance(newAccount);
          
          setAccount(newAccount);
          setSigner(ethersSigner);
          setContract(sportSpotContract);
          setBalance(ethers.utils.formatEther(accountBalance));
          setIsConnected(true);
        }
      };
      
      const handleChainChanged = (chainIdHex) => {
        // Chain changed, reload the page as recommended by MetaMask
        window.location.reload();
      };
      
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      
      // Cleanup
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  // Connect wallet function
  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      setError("MetaMask not installed");
      return;
    }
    
    setIsConnecting(true);
    setError(null);
    
    try {
      // Check if we're on Sepolia testnet (chainId 11155111)
      const sepoliaChainId = '0xaa36a7'; // 11155111 in hex
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
      
      // Switch to Sepolia if needed
      if (currentChainId !== sepoliaChainId) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: sepoliaChainId }],
          });
        } catch (switchError) {
          // If network doesn't exist in wallet, add it
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: sepoliaChainId,
                  chainName: 'Sepolia Testnet',
                  nativeCurrency: {
                    name: 'Sepolia ETH',
                    symbol: 'ETH',
                    decimals: 18,
                  },
                  rpcUrls: ['https://sepolia.infura.io/v3/'],
                  blockExplorerUrls: ['https://sepolia.etherscan.io'],
                },
              ],
            });
          } else {
            throw switchError;
          }
        }
      }
      
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];
      
      // Create ethers provider and signer
      const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
      const ethersSigner = ethersProvider.getSigner();
      
      // Initialize contract
      const sportSpotContract = new ethers.Contract(
        contractAddress.SportSpot, // Make sure this matches the property name in your JSON
        SportSpotArtifact.abi,
        ethersSigner
      );
      
      // Get account balance
      const accountBalance = await ethersProvider.getBalance(account);
      
      // Update state
      setProvider(ethersProvider);
      setSigner(ethersSigner);
      setContract(sportSpotContract);
      setAccount(account);
      setBalance(ethers.utils.formatEther(accountBalance));
      setIsConnected(true);
      
      // Get and set current chain ID
      const network = await ethersProvider.getNetwork();
      setChainId(network.chainId);
    } catch (err) {
      console.error("Error connecting wallet:", err);
      setError(err.message || "Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Disconnect wallet function
  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setSigner(null);
    setContract(null);
    setBalance(null);
    setIsConnected(false);
  }, []);

  // Refresh balance function
  const refreshBalance = useCallback(async () => {
    if (provider && account) {
      try {
        const accountBalance = await provider.getBalance(account);
        setBalance(ethers.utils.formatEther(accountBalance));
      } catch (err) {
        console.error("Error refreshing balance:", err);
      }
    }
  }, [provider, account]);

  // Value to be provided to consumers
  const contextValue = {
    provider,
    signer,
    contract,
    account,
    balance,
    chainId,
    isConnected,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
    refreshBalance
  };

  return (
    <Web3Context.Provider value={contextValue}>
      {children}
    </Web3Context.Provider>
  );
};

// Custom hook for using Web3 context
export const useWeb3 = () => {
  const context = React.useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};