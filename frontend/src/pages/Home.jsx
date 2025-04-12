import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import Header from '../components/Header';
import Footer from '../components/Footer';
import VenueCard from '../components/VenueCard';
import { getAllVenues } from '../utils/contractHelpers';

const Home = () => {
  const { contract, isConnected } = useWeb3();
  const [featuredVenues, setFeaturedVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVenues = async () => {
      if (!contract) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const venues = await getAllVenues(contract);
        
        // Get a few random venues for featured section
        const shuffled = venues.sort(() => 0.5 - Math.random());
        const featured = shuffled.slice(0, Math.min(3, venues.length));
        
        setFeaturedVenues(featured);
      } catch (err) {
        console.error("Error fetching venues:", err);
        setError("Failed to load venues. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchVenues();
  }, [contract]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                  Book Sports Venues on the Blockchain
                </h1>
                <p className="text-lg mb-8 text-primary-100">
                  SportSpot offers a decentralized platform for booking sports venues with complete transparency and security using blockchain technology.
                </p>
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <Link to="/venues" className="btn bg-white text-primary-700 hover:bg-primary-50">
                    Find Venues
                  </Link>
                  {!isConnected && (
                    <Link to="/wallet" className="btn bg-primary-700 text-white border border-primary-500 hover:bg-primary-800">
                      Connect Wallet
                    </Link>
                  )}
                </div>
              </div>
              <div className="hidden md:block">
                <img 
                  src="data:image/jpeg;base64,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" 
                  alt="Sports venue" 
                  className="rounded-lg shadow-2xl"
                />
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
                <p className="text-gray-600">
                  Link your MetaMask wallet to access the SportSpot platform securely via the Sepolia testnet.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-2">Browse Venues</h3>
                <p className="text-gray-600">
                  Discover sports venues near you using our interactive map with detailed information and availability.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-2">Book with Ethereum</h3>
                <p className="text-gray-600">
                  Reserve your venue by making a secure Ethereum payment directly through our smart contract.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Venues Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Featured Venues</h2>
              <Link to="/venues" className="text-primary-600 hover:text-primary-700 font-medium">
                View All →
              </Link>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="spinner"></div>
                <span className="ml-2 text-gray-600">Loading venues...</span>
              </div>
            ) : error ? (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                {error}
              </div>
            ) : featuredVenues.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredVenues.map((venue) => (
                  <VenueCard key={venue.id} venue={venue} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-600">No venues available yet.</p>
                {isConnected && (
                  <Link to="/venues/register" className="btn btn-primary mt-4">
                    Register a Venue
                  </Link>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 bg-gray-900 text-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Benefits of SportSpot</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-primary-500 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Secure Transactions</h3>
                <p className="text-gray-400">
                  All bookings are secured by blockchain technology, ensuring transparency and trust.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-primary-500 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">No Middlemen</h3>
                <p className="text-gray-400">
                  Deal directly with venue owners, eliminating unnecessary fees and intermediaries.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-primary-500 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Real-time Availability</h3>
                <p className="text-gray-400">
                  Check venue availability in real-time, making booking fast and convenient.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-primary-500 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Global Access</h3>
                <p className="text-gray-400">
                  Book venues from anywhere in the world using our decentralized platform.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;