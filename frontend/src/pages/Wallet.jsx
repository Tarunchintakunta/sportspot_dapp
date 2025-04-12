import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import Header from '../components/Header';
import Footer from '../components/Footer';
import WalletConnect from '../components/WalletConnect';
import { getUserBookings, getVenueDetails, formatDate, formatDuration } from '../utils/contractHelpers';

const Wallet = () => {
  const { contract, account, isConnected } = useWeb3();
  const [bookings, setBookings] = useState([]);
  const [venueDetails, setVenueDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('wallet'); // 'wallet' or 'bookings'

  // Fetch user bookings
  useEffect(() => {
    const fetchUserBookings = async () => {
      if (!contract || !isConnected || !account) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Get user bookings
        const userBookings = await getUserBookings(contract, account);
        setBookings(userBookings);
        
        // Get venue details for each booking
        const venueDetailsPromises = userBookings.map(booking => 
          getVenueDetails(contract, booking.venueId)
        );
        
        const venueDetailsResults = await Promise.all(venueDetailsPromises);
        
        // Create a map of venue ID to venue details
        const venueDetailsMap = {};
        venueDetailsResults.forEach(venue => {
          venueDetailsMap[venue.id] = venue;
        });
        
        setVenueDetails(venueDetailsMap);
      } catch (err) {
        console.error("Error fetching user bookings:", err);
        setError("Failed to load your bookings. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserBookings();
  }, [contract, account, isConnected]);

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Your Wallet</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* Tabs */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
                <div className="flex border-b border-gray-100">
                  <button
                    className={`flex-1 py-4 text-center font-medium ${
                      activeTab === 'wallet' 
                        ? 'text-primary-600 border-b-2 border-primary-600' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    onClick={() => handleTabChange('wallet')}
                  >
                    Wallet & Transfers
                  </button>
                  <button
                    className={`flex-1 py-4 text-center font-medium ${
                      activeTab === 'bookings' 
                        ? 'text-primary-600 border-b-2 border-primary-600' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    onClick={() => handleTabChange('bookings')}
                  >
                    Your Bookings
                  </button>
                </div>
                
                <div className="p-6">
                  {activeTab === 'wallet' ? (
                    <div>
                      <h2 className="text-xl font-semibold mb-4">Wallet Management</h2>
                      <p className="text-gray-600 mb-4">
                        Connect your MetaMask wallet to book venues, manage your reservations, and transfer ETH.
                      </p>
                      
                      {!isConnected && (
                        <div className="bg-primary-50 p-4 rounded-lg text-primary-700 mb-4">
                          <div className="font-medium mb-1">Connect Your Wallet</div>
                          <p className="text-sm">
                            To access all features, please connect your MetaMask wallet.
                          </p>
                        </div>
                      )}
                      
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-2">What You Can Do:</h3>
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Book sports venues with ETH</span>
                          </li>
                          <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Transfer ETH to other addresses</span>
                          </li>
                          <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Withdraw venue rental earnings</span>
                          </li>
                          <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>View your booking history</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h2 className="text-xl font-semibold mb-4">Your Bookings</h2>
                      
                      {loading ? (
                        <div className="flex justify-center py-8">
                          <div className="spinner"></div>
                          <span className="ml-2 text-gray-600">Loading your bookings...</span>
                        </div>
                      ) : error ? (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                          {error}
                        </div>
                      ) : !isConnected ? (
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                          <p className="text-gray-600 mb-4">Connect your wallet to view your bookings.</p>
                          <button
                            onClick={() => handleTabChange('wallet')}
                            className="btn btn-primary"
                          >
                            Go to Wallet
                          </button>
                        </div>
                      ) : bookings.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <h3 className="text-lg font-semibold mb-1">No Bookings Yet</h3>
                          <p className="text-gray-600 mb-4">
                            You haven't made any venue bookings yet.
                          </p>
                          <Link to="/venues" className="btn btn-primary">
                            Explore Venues
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {bookings.map((booking) => {
                            const venue = venueDetails[booking.venueId] || null;
                            
                            return (
                              <div key={booking.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="font-semibold">{venue ? venue.name : `Venue #${booking.venueId}`}</h3>
                                    <p className="text-sm text-gray-600">{venue ? venue.sportType : 'Loading venue details...'}</p>
                                  </div>
                                  <div className="bg-primary-50 px-3 py-1 rounded-full text-primary-600 text-sm font-medium">
                                    {booking.isCancelled ? 'Cancelled' : 'Confirmed'}
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                                  <div>
                                    <span className="text-gray-600">Date & Time:</span>
                                    <div className="font-medium">{formatDate(booking.timeSlot)}</div>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Duration:</span>
                                    <div className="font-medium">{formatDuration(booking.bookingDuration)}</div>
                                  </div>
                                </div>
                                <div className="mt-3">
                                  <Link 
                                    to={`/venues/${booking.venueId}`} 
                                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                                  >
                                    View Venue →
                                  </Link>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div>
              <WalletConnect />
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Wallet;