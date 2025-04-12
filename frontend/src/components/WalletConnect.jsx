import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { truncateAddress, withdrawPayment } from '../utils/contractHelpers';

const WalletConnect = () => {
  const { isConnected, account, balance, connectWallet, disconnectWallet, isConnecting, contract, refreshBalance } = useWeb3();
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawError, setWithdrawError] = useState(null);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [transferAmount, setTransferAmount] = useState('');
  const [transferAddress, setTransferAddress] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferError, setTransferError] = useState(null);
  const [transferSuccess, setTransferSuccess] = useState(false);

  // Handle wallet connection
  const handleConnectWallet = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  // Handle wallet disconnection
  const handleDisconnectWallet = () => {
    disconnectWallet();
  };

  // Handle withdrawal of venue earnings
  const handleWithdrawPayment = async () => {
    if (!isConnected || !contract) return;
    
    setWithdrawLoading(true);
    setWithdrawError(null);
    setWithdrawSuccess(false);
    
    try {
      await withdrawPayment(contract);
      
      // Refresh balance after successful withdrawal
      refreshBalance();
      
      setWithdrawSuccess(true);
    } catch (error) {
      console.error("Error withdrawing payment:", error);
      setWithdrawError(error.message || "Failed to withdraw payment. You may not have any earnings to withdraw.");
    } finally {
      setWithdrawLoading(false);
    }
  };

  // Handle transfer of ETH to another address
  const handleTransfer = async (e) => {
    e.preventDefault();
    
    if (!isConnected || !account || !transferAddress || !transferAmount) {
      setTransferError("Please enter a valid address and amount");
      return;
    }
    
    // Basic validation
    if (!/^0x[a-fA-F0-9]{40}$/.test(transferAddress)) {
      setTransferError("Invalid Ethereum address");
      return;
    }
    
    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount <= 0) {
      setTransferError("Invalid amount");
      return;
    }
    
    if (amount > parseFloat(balance)) {
      setTransferError("Insufficient balance");
      return;
    }
    
    setTransferLoading(true);
    setTransferError(null);
    setTransferSuccess(false);
    
    try {
      const { ethereum } = window;
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      
      // Convert amount to wei
      const amountWei = ethers.utils.parseEther(transferAmount);
      
      // Create transaction
      const tx = await signer.sendTransaction({
        to: transferAddress,
        value: amountWei
      });
      
      // Wait for transaction to be mined
      await tx.wait();
      
      // Refresh balance after successful transfer
      refreshBalance();
      
      setTransferSuccess(true);
      setTransferAmount('');
      setTransferAddress('');
    } catch (error) {
      console.error("Error transferring ETH:", error);
      setTransferError(error.message || "Failed to transfer ETH");
    } finally {
      setTransferLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      {isConnected ? (
        <div>
          {/* Wallet Info */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Wallet Connected</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="mb-2">
                <span className="text-gray-600">Address:</span>
                <div className="font-medium">{account}</div>
              </div>
              <div className="mb-2">
                <span className="text-gray-600">Balance:</span>
                <div className="font-bold text-primary-600">{parseFloat(balance).toFixed(5)} ETH</div>
              </div>
              <div className="mt-4">
                <button
                  onClick={handleDisconnectWallet}
                  className="btn btn-outline text-sm"
                >
                  Disconnect Wallet
                </button>
                <button
                  onClick={refreshBalance}
                  className="ml-2 btn btn-outline text-sm"
                >
                  Refresh Balance
                </button>
              </div>
            </div>
          </div>
          
          {/* Transfer ETH */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Transfer ETH</h3>
            <form onSubmit={handleTransfer}>
              <div className="mb-4">
                <label htmlFor="transferAddress" className="label">Recipient Address:</label>
                <input
                  type="text"
                  id="transferAddress"
                  value={transferAddress}
                  onChange={(e) => setTransferAddress(e.target.value)}
                  placeholder="0x..."
                  className="input"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="transferAmount" className="label">Amount (ETH):</label>
                <input
                  type="number"
                  id="transferAmount"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="0.01"
                  step="0.00001"
                  min="0.00001"
                  max={balance}
                  className="input"
                  required
                />
              </div>
              
              {transferError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
                  {transferError}
                </div>
              )}
              
              {transferSuccess && (
                <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4">
                  ETH transferred successfully!
                </div>
              )}
              
              <button
                type="submit"
                disabled={transferLoading}
                className="btn btn-primary w-full"
              >
                {transferLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="spinner w-4 h-4 mr-2"></div>
                    Processing Transfer...
                  </div>
                ) : (
                  'Transfer ETH'
                )}
              </button>
            </form>
          </div>
          
          {/* Withdraw Earnings */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Venue Earnings</h3>
            <p className="mb-4 text-gray-600">
              If you've registered venues on the platform, you can withdraw your earnings here.
            </p>
            
            {withdrawError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
                {withdrawError}
              </div>
            )}
            
            {withdrawSuccess && (
              <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4">
                Payment withdrawn successfully!
              </div>
            )}
            
            <button
              onClick={handleWithdrawPayment}
              disabled={withdrawLoading}
              className="btn btn-secondary w-full"
            >
              {withdrawLoading ? (
                <div className="flex items-center justify-center">
                  <div className="spinner w-4 h-4 mr-2"></div>
                  Processing Withdrawal...
                </div>
              ) : (
                'Withdraw Earnings'
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-10">
          <div className="mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-gray-400 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
          <p className="text-gray-600 mb-6">
            Connect your MetaMask wallet to book venues and manage your reservations.
          </p>
          <button
            onClick={handleConnectWallet}
            disabled={isConnecting}
            className="btn btn-primary"
          >
            {isConnecting ? (
              <div className="flex items-center">
                <div className="spinner w-4 h-4 mr-2"></div>
                Connecting...
              </div>
            ) : (
              'Connect MetaMask'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default WalletConnect;