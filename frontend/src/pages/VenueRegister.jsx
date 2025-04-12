// VenueRegister.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { registerVenue } from '../utils/contractHelpers';

const VenueRegister = () => {
  const { contract, isConnected } = useWeb3();
  const navigate = useNavigate();
  
  const [venueName, setVenueName] = useState('');
  const [sportType, setSportType] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isConnected || !contract) {
      setError("Please connect your wallet first");
      return;
    }
    
    if (!venueName || !sportType || !hourlyRate || !latitude || !longitude) {
      setError("All fields are required");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const venueId = await registerVenue(
        contract, 
        venueName, 
        sportType, 
        hourlyRate, 
        latitude, 
        longitude
      );
      
      // Navigate to the newly created venue page
      navigate(`/venues/${venueId}`);
    } catch (err) {
      console.error("Error registering venue:", err);
      setError("Failed to register venue. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center mb-6">
            <button 
              onClick={() => navigate('/venues')} 
              className="inline-flex items-center text-primary-600 hover:text-primary-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Venues
            </button>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h1 className="text-2xl font-bold mb-6">Register New Venue</h1>
            
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="venueName" className="block text-sm font-medium text-gray-700 mb-1">
                    Venue Name
                  </label>
                  <input
                    type="text"
                    id="venueName"
                    value={venueName}
                    onChange={(e) => setVenueName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter venue name"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="sportType" className="block text-sm font-medium text-gray-700 mb-1">
                    Sport Type
                  </label>
                  <select
                    id="sportType"
                    value={sportType}
                    onChange={(e) => setSportType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="">Select a sport</option>
                    <option value="Football">Football</option>
                    <option value="Basketball">Basketball</option>
                    <option value="Tennis">Tennis</option>
                    <option value="Swimming">Swimming</option>
                    <option value="Cricket">Cricket</option>
                    <option value="Golf">Golf</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-700 mb-1">
                    Hourly Rate (ETH)
                  </label>
                  <input
                    type="number"
                    id="hourlyRate"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="0.01"
                    step="0.001"
                    min="0.001"
                    required
                  />
                </div>
                
                <div className="md:col-span-2 grid grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">
                      Latitude
                    </label>
                    <input
                      type="text"
                      id="latitude"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="40.7128"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">
                      Longitude
                    </label>
                    <input
                      type="text"
                      id="longitude"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="-74.0060"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <button
                  type="submit"
                  disabled={loading || !isConnected}
                  className="w-full btn btn-primary py-3"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="spinner w-5 h-5 mr-3"></div>
                      Registering Venue...
                    </div>
                  ) : !isConnected ? (
                    "Connect Wallet to Register"
                  ) : (
                    "Register Venue"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default VenueRegister;