import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import Header from '../components/Header';
import Footer from '../components/Footer';
import VenueCard from '../components/VenueCard';
import VenueMap from '../components/VenueMap';
import { getAllVenues } from '../utils/contractHelpers';

const VenueListing = () => {
  const { contract, isConnected } = useWeb3();
  const [venues, setVenues] = useState([]);
  const [filteredVenues, setFilteredVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'
  const [filters, setFilters] = useState({
    sportType: '',
    priceRange: '',
    search: ''
  });

  // Fetch all venues
  useEffect(() => {
    const fetchVenues = async () => {
      if (!contract) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const allVenues = await getAllVenues(contract);
        setVenues(allVenues);
        setFilteredVenues(allVenues);
      } catch (err) {
        console.error("Error fetching venues:", err);
        setError("Failed to load venues. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchVenues();
  }, [contract]);

  // Apply filters
  useEffect(() => {
    if (venues.length === 0) return;

    let result = [...venues];

    // Apply sport type filter
    if (filters.sportType) {
      result = result.filter(venue => 
        venue.sportType.toLowerCase().includes(filters.sportType.toLowerCase())
      );
    }

    // Apply price range filter
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-').map(parseFloat);
      result = result.filter(venue => {
        const priceInEth = parseFloat(ethers.utils.formatEther(venue.hourlyRate));
        return priceInEth >= min && (max ? priceInEth <= max : true);
      });
    }

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter(venue => 
        venue.name.toLowerCase().includes(searchTerm) || 
        venue.sportType.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredVenues(result);
  }, [filters, venues]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    // Filters already applied via useEffect
  };

  // Toggle view mode
  const toggleViewMode = (mode) => {
    setViewMode(mode);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-xl shadow-sm mb-8">
            {/* Filters */}
            <div className="p-6">
              <div className="flex flex-col md:flex-row justify-between mb-6">
                <h1 className="text-3xl font-bold mb-4 md:mb-0">Find a Venue</h1>
                
                {isConnected && (
                  <Link to="/venues/register" className="btn btn-primary">
                    Register New Venue
                  </Link>
                )}
              </div>
              
              <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="search" className="label">Search:</label>
                  <input
                    type="text"
                    id="search"
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    placeholder="Search venues..."
                    className="input"
                  />
                </div>
                
                <div>
                  <label htmlFor="sportType" className="label">Sport Type:</label>
                  <select
                    id="sportType"
                    name="sportType"
                    value={filters.sportType}
                    onChange={handleFilterChange}
                    className="input"
                  >
                    <option value="">All Sports</option>
                    <option value="Football">Football</option>
                    <option value="Basketball">Basketball</option>
                    <option value="Tennis">Tennis</option>
                    <option value="Swimming">Swimming</option>
                    <option value="Golf">Golf</option>
                    <option value="Cricket">Cricket</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="priceRange" className="label">Price Range (ETH):</label>
                  <select
                    id="priceRange"
                    name="priceRange"
                    value={filters.priceRange}
                    onChange={handleFilterChange}
                    className="input"
                  >
                    <option value="">Any Price</option>
                    <option value="0-0.01">0 - 0.01 ETH</option>
                    <option value="0.01-0.05">0.01 - 0.05 ETH</option>
                    <option value="0.05-0.1">0.05 - 0.1 ETH</option>
                    <option value="0.1-0.5">0.1 - 0.5 ETH</option>
                    <option value="0.5">0.5+ ETH</option>
                  </select>
                </div>
                
                <div className="self-end">
                  <button type="submit" className="btn btn-primary w-full">
                    Apply Filters
                  </button>
                </div>
              </form>
            </div>
            
            {/* View Toggle */}
            <div className="flex border-t border-gray-100">
              <button
                className={`flex-1 py-3 text-center ${viewMode === 'grid' ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                onClick={() => toggleViewMode('grid')}
              >
                <span className="flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Grid View
                </span>
              </button>
              <button
                className={`flex-1 py-3 text-center ${viewMode === 'map' ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                onClick={() => toggleViewMode('map')}
              >
                <span className="flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  Map View
                </span>
              </button>
            </div>
          </div>
          
          {/* Results Count */}
          <div className="mb-4 text-gray-600">
            Showing {filteredVenues.length} {filteredVenues.length === 1 ? 'venue' : 'venues'}
          </div>
          
          {/* Content */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="spinner"></div>
              <span className="ml-2 text-gray-600">Loading venues...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg">
              {error}
            </div>
          ) : filteredVenues.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-semibold mb-2">No Venues Found</h3>
              <p className="text-gray-600 mb-6">
                No venues match your current filters. Try adjusting your search criteria.
              </p>
              <button 
                onClick={() => setFilters({ sportType: '', priceRange: '', search: '' })} 
                className="btn btn-outline"
              >
                Clear Filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVenues.map((venue) => (
                <VenueCard key={venue.id} venue={venue} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden h-[600px]">
              <VenueMap venues={filteredVenues} />
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default VenueListing;