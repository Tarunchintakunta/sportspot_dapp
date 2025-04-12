import React from 'react'; 
import { Link } from 'react-router-dom'; 
import { formatEther } from '../utils/contractHelpers';  

const VenueCard = ({ venue }) => {   
  // Function to determine sport icon based on type   
  const getSportIcon = (sportType) => {     
    const sportTypeLower = sportType.toLowerCase();          
    
    if (sportTypeLower.includes('football') || sportTypeLower.includes('soccer')) {       
      return (         
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">           
          <circle cx="12" cy="12" r="10"></circle>           
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>           
          <path d="M2 12h20"></path>         
        </svg>       
      );     
    } else if (sportTypeLower.includes('basketball')) {       
      return (         
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">           
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
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">           
          <circle cx="12" cy="12" r="10"></circle>           
          <path d="M20 8a40 40 0 0 1-8 8M4 16a40 40 0 0 1 8-8"></path>         
        </svg>       
      );     
    } else if (sportTypeLower.includes('swim')) {       
      return (         
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">           
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"></path>         
        </svg>       
      );     
    } else {       
      // Default icon       
      return (         
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">           
          <path d="M18 20V10"></path>           
          <path d="M12 20V4"></path>           
          <path d="M6 20v-6"></path>         
        </svg>       
      );     
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transform transition-all hover:scale-105">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">{venue.name}</h3>
          <div className="text-primary">
            {getSportIcon(venue.sportType)}
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm text-gray-600 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {venue.location}
          </p>
          <p className="text-sm text-gray-600 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Available Hours: {venue.availableHours}
          </p>
          <p className="text-md font-semibold text-gray-800">
            {formatEther(venue.hourlyRate)} ETH/hour
          </p>
        </div>
        
        <div className="mt-4 flex justify-between items-center">
          <Link 
            to={`/venue/${venue.id}`} 
            className="text-primary hover:underline"
          >
            View Details
          </Link>
          <button 
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default VenueCard;