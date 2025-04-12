import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import Header from '../components/Header';
import Footer from '../components/Footer';
import VenueMap from '../components/VenueMap';
import BookingCalendar from '../components/BookingCalendar';
import { getVenueDetails, formatEther, truncateAddress } from '../utils/contractHelpers';

const VenueDetails = () => {
  const { id } = useParams();
  const { contract, account } = useWeb3();
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Fetch venue details
  useEffect(() => {
    const fetchVenueDetails = async () => {
      if (!contract || !id) {
        setLoading(false);
        return;
      }
      
      // Check if the id is a valid number
      if (isNaN(parseInt(id))) {
        setError("Invalid venue ID");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Convert id to a number before passing to getVenueDetails
        const venueId = parseInt(id);
        const venueData = await getVenueDetails(contract, venueId);
        setVenue(venueData);
      } catch (err) {
        console.error("Error fetching venue details:", err);
        setError("Failed to load venue details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchVenueDetails();
  }, [contract, id]);

  // Handle successful booking
  const handleBookingComplete = () => {
    setBookingSuccess(true);
    
    // Reset success message after 5 seconds
    setTimeout(() => {
      setBookingSuccess(false);
    }, 5000);
  };

  // Get sport icon
  const getSportIcon = (sportType) => {
    const sportTypeLower = sportType?.toLowerCase() || '';
    
    if (sportTypeLower.includes('football') || sportTypeLower.includes('soccer')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
          <path d="M2 12h20"></path>
        </svg>
      );
    } else if (sportTypeLower.includes('basketball')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M4.93 4.93l4.24 4.24"></path>
          <path d="M14.83 9.17l4.24-4.24"></path>
          <path d="M14.83 14.83l4.24 4.24"></path>
          <path d="M9.17 14.83l-4.24 4.24"></path>
          <circle cx="12" cy="12" r="4"></circle>
        </svg>
      );
    } else if (sportTypeLower.includes('tennis')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M20 8a40 40 0 0 1-8 8M4 16a40 40 0 0 1 8-8"></path>
        </svg>
      );
    } else {
      // Default icon
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 20V10"></path>
          <path d="M12 20V4"></path>
          <path d="M6 20v-6"></path>
        </svg>
      );
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* Back link */}
          <Link to="/venues" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Venues
          </Link>
          
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="spinner"></div>
              <span className="ml-2 text-gray-600">Loading venue details...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg">
              {error}
            </div>
          ) : venue ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Venue Details */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  {/* Map View */}
                  <div className="h-64">
                    <VenueMap 
                      venues={[venue]} 
                      center={{ lat: parseFloat(venue.latitude), lng: parseFloat(venue.longitude) }} 
                      zoom={15} 
                    />
                  </div>
                  
                  {/* Venue Info */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{venue.name}</h1>
                        <div className="flex items-center text-gray-600">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>
                            Latitude: {venue.latitude.substring(0, 10)}, Longitude: {venue.longitude.substring(0, 10)}
                          </span>
                        </div>
                      </div>
                      <div className="bg-primary-50 p-3 rounded-full text-primary-600">
                        {getSportIcon(venue.sportType)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Sport Type</h3>
                        <div className="flex items-center text-gray-700">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                          </svg>
                          {venue.sportType}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Hourly Rate</h3>
                        <div className="text-2xl font-bold text-primary-600">
                          {parseFloat(formatEther(venue.hourlyRate)).toFixed(5)} ETH
                          <span className="text-gray-500 text-sm font-normal ml-1">/hour</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-100 pt-6">
                      <h3 className="text-lg font-semibold mb-2">Venue Owner</h3>
                      <div className="flex items-center text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {venue.owner === account ? (
                          <span className="font-medium text-primary-600">You are the owner</span>
                        ) : (
                          <span>{venue.owner}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Booking Section */}
              <div>
                {bookingSuccess && (
                  <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-4 flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="font-medium">Booking Confirmed!</p>
                      <p className="text-sm">Your venue has been successfully booked.</p>
                    </div>
                  </div>
                )}
                
                <BookingCalendar venue={venue} onBookingComplete={handleBookingComplete} />
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-semibold mb-2">Venue Not Found</h3>
              <p className="text-gray-600 mb-6">
                The venue you're looking for doesn't exist or has been removed.
              </p>
              <Link to="/venues" className="btn btn-primary">
                Browse All Venues
              </Link>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default VenueDetails;