import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { truncateAddress } from '../utils/contractHelpers';

const Header = () => {
  const location = useLocation();
  const { isConnected, account, balance, connectWallet, disconnectWallet, isConnecting } = useWeb3();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
      closeMenu();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleDisconnectWallet = () => {
    disconnectWallet();
    closeMenu();
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Venues', path: '/venues' },
    { name: 'Wallet', path: '/wallet' },
  ];

  return (
    <header className="bg-white shadow-sm py-4">
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2" onClick={closeMenu}>
          <span className="text-primary-600 text-3xl font-bold">Sport<span className="text-secondary-600">Spot</span></span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <div className="flex space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`font-medium hover:text-primary-600 transition ${
                  location.pathname === link.path ? 'text-primary-600' : 'text-gray-700'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
          
          {/* Wallet Connection */}
          <div className="flex items-center ml-6">
            {isConnected ? (
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  <div className="font-medium">{truncateAddress(account)}</div>
                  <div className="text-xs">{parseFloat(balance).toFixed(4)} ETH</div>
                </div>
                <button
                  onClick={handleDisconnectWallet}
                  className="btn btn-outline text-sm py-1.5"
                >
                  Disconnect
                </button>
              </div>
            ) : (
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
                  'Connect Wallet'
                )}
              </button>
            )}
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-700 hover:text-primary-600 focus:outline-none"
          onClick={toggleMenu}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 absolute w-full left-0 right-0 z-50">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`font-medium py-2 hover:text-primary-600 transition ${
                  location.pathname === link.path ? 'text-primary-600' : 'text-gray-700'
                }`}
                onClick={closeMenu}
              >
                {link.name}
              </Link>
            ))}
            
            {/* Wallet Connection */}
            <div className="pt-2 border-t border-gray-100">
              {isConnected ? (
                <div className="flex flex-col space-y-3">
                  <div className="text-sm text-gray-600">
                    <div className="font-medium">{truncateAddress(account)}</div>
                    <div className="text-xs">{parseFloat(balance).toFixed(4)} ETH</div>
                  </div>
                  <button
                    onClick={handleDisconnectWallet}
                    className="btn btn-outline text-sm w-full"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleConnectWallet}
                  disabled={isConnecting}
                  className="btn btn-primary w-full"
                >
                  {isConnecting ? (
                    <div className="flex items-center justify-center">
                      <div className="spinner w-4 h-4 mr-2"></div>
                      Connecting...
                    </div>
                  ) : (
                    'Connect Wallet'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;