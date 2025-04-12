import { ethers } from 'ethers';

// Helper function to format date for display
export const formatDate = (timestamp) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString();
};

// Helper function to format ETH values
export const formatEther = (wei) => {
  return ethers.utils.formatEther(wei);
};

// Helper function to parse ETH values
export const parseEther = (eth) => {
  return ethers.utils.parseEther(eth.toString());
};

// Helper function to format booking duration
export const formatDuration = (hours) => {
  return hours === 1 ? '1 hour' : `${hours} hours`;
};

export const getVenueDetails = async (contract, venueId) => {
  try {
    // Ensure venueId is a number
    if (isNaN(parseInt(venueId))) {
      throw new Error("Invalid venue ID. Must be a number.");
    }
    
    const numericVenueId = parseInt(venueId);
    
    const venueDetails = await contract.getVenueDetails(numericVenueId);
    return {
      id: numericVenueId,
      name: venueDetails[0],
      sportType: venueDetails[1],
      hourlyRate: venueDetails[2],
      latitude: venueDetails[3],
      longitude: venueDetails[4],
      owner: venueDetails[5],
      isActive: venueDetails[6]
    };
  } catch (error) {
    console.error(`Error getting venue details for ID ${venueId}:`, error);
    throw error;
  }
};


// Helper function to get booking details
export const getBookingDetails = async (contract, bookingId) => {
  try {
    const bookingDetails = await contract.getBookingDetails(bookingId);
    return {
      id: bookingId,
      venueId: bookingDetails[0],
      timeSlot: bookingDetails[1],
      bookingDuration: bookingDetails[2],
      booker: bookingDetails[3],
      isCancelled: bookingDetails[4]
    };
  } catch (error) {
    console.error(`Error getting booking details for ID ${bookingId}:`, error);
    throw error;
  }
};

// Helper function to get all venues
export const getAllVenues = async (contract) => {
  try {
    const venueIds = await contract.getAllVenues();
    const venues = await Promise.all(
      venueIds.map(id => getVenueDetails(contract, id))
    );
    return venues;
  } catch (error) {
    console.error('Error getting all venues:', error);
    throw error;
  }
};

// Helper function to get user bookings
export const getUserBookings = async (contract, userAddress) => {
  try {
    const bookingIds = await contract.getUserBookings(userAddress);
    const bookings = await Promise.all(
      bookingIds.map(id => getBookingDetails(contract, id))
    );
    return bookings;
  } catch (error) {
    console.error(`Error getting bookings for user ${userAddress}:`, error);
    throw error;
  }
};

// Helper function to check time slot availability
export const checkTimeSlotAvailability = async (contract, venueId, timeSlot) => {
  try {
    return await contract.checkTimeSlotAvailability(venueId, timeSlot);
  } catch (error) {
    console.error(`Error checking time slot availability for venue ${venueId}:`, error);
    throw error;
  }
};

// Helper function to register a venue
// Updated registerVenue function
export const registerVenue = async (contract, name, sportType, hourlyRate, latitude, longitude) => {
  try {
    // Convert hourlyRate to wei (BigNumber) properly
    const hourlyRateInWei = ethers.utils.parseEther(hourlyRate.toString());
    
    const tx = await contract.registerVenue(
      name,
      sportType,
      hourlyRateInWei, // Now properly formatted as BigNumber
      latitude,
      longitude
    );
    
    const receipt = await tx.wait();
    
    // Get venue ID from event logs
    const event = receipt.events.find(event => event.event === 'VenueRegistered');
    const venueId = event.args.venueId.toNumber(); // Convert BigNumber to regular number
    
    return venueId;
  } catch (error) {
    console.error('Error registering venue:', error);
    throw error;
  }
};
// Helper function to book a venue
export const bookVenue = async (contract, venueId, timeSlot, bookingDuration, price) => {
  try {
    // Ensure all numeric parameters are properly handled
    const numericVenueId = parseInt(venueId);
    const numericTimeSlot = parseInt(timeSlot);
    const numericDuration = parseInt(bookingDuration);
    
    const tx = await contract.bookVenue(
      numericVenueId,
      numericTimeSlot,
      numericDuration,
      { value: price }
    );
    
    const receipt = await tx.wait();
    
    // Get booking ID from event logs
    const event = receipt.events.find(event => event.event === 'VenueBooked');
    const bookingId = event.args.bookingId.toNumber(); // Convert BigNumber to regular number
    
    return bookingId;
  } catch (error) {
    console.error('Error booking venue:', error);
    throw error;
  }
};

// Helper function to cancel a booking
export const cancelBooking = async (contract, bookingId) => {
  try {
    const tx = await contract.cancelBooking(bookingId);
    await tx.wait();
    return true;
  } catch (error) {
    console.error(`Error cancelling booking ${bookingId}:`, error);
    throw error;
  }
};

// Helper function to withdraw payment
export const withdrawPayment = async (contract) => {
  try {
    const tx = await contract.withdrawPayment();
    await tx.wait();
    return true;
  } catch (error) {
    console.error('Error withdrawing payment:', error);
    throw error;
  }
};

// Helper function to generate time slots for a day
export const generateTimeSlots = (date) => {
  const slots = [];
  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0);
  
  for (let hour = 6; hour < 22; hour++) {
    const slotDate = new Date(startDate);
    slotDate.setHours(hour);
    slots.push({
      time: slotDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Math.floor(slotDate.getTime() / 1000)
    });
  }
  
  return slots;
};

// Helper function to truncate Ethereum address
export const truncateAddress = (address) => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};