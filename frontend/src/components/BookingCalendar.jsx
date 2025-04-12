import React, { useState, useEffect } from 'react';
import { generateTimeSlots, formatEther, parseEther } from '../utils/contractHelpers';
import { useWeb3 } from '../context/Web3Context';

const BookingCalendar = ({ venue, onBookingComplete }) => {
  const { contract, account, isConnected, refreshBalance } = useWeb3();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingDuration, setBookingDuration] = useState(1);
  const [loading, setLoading] = useState(false);
  const [availabilityMap, setAvailabilityMap] = useState({});
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [error, setError] = useState(null);
  
  // Calculate total price
  const hourlyRate = venue ? formatEther(venue.hourlyRate) : 0;
  const totalPrice = parseFloat(hourlyRate) * bookingDuration;
  
  // Generate next 7 days for date selection
  const getNextSevenDays = () => {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date);
    }
    
    return days;
  };
  
  const nextSevenDays = getNextSevenDays();
  
  // Format date for display
  const formatDateDisplay = (date) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };
  
  // Check if given date is selected
  const isDateSelected = (date) => {
    return date.toDateString() === selectedDate.toDateString();
  };
  
  // Handle date selection
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };
  
  // Handle time slot selection
  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };
  
  // Handle booking duration change
  const handleDurationChange = (e) => {
    const duration = parseInt(e.target.value);
    setBookingDuration(duration);
  };
  
  // Check availability for all slots on the selected date
  const checkAvailability = async () => {
    if (!contract || !venue) return;
    
    setLoadingAvailability(true);
    setError(null);
    
    const slots = generateTimeSlots(selectedDate);
    setTimeSlots(slots);
    
    try {
      const availabilityPromises = slots.map(slot => 
        contract.checkTimeSlotAvailability(venue.id, slot.timestamp)
      );
      
      const availabilityResults = await Promise.all(availabilityPromises);
      
      const newAvailabilityMap = {};
      slots.forEach((slot, index) => {
        newAvailabilityMap[slot.timestamp] = availabilityResults[index];
      });
      
      setAvailabilityMap(newAvailabilityMap);
    } catch (error) {
      console.error("Error checking availability:", error);
      setError("Failed to check availability. Please try again.");
    } finally {
      setLoadingAvailability(false);
    }
  };
  
  // Effect to generate time slots and check availability when date or venue changes
  useEffect(() => {
    if (venue && contract) {
      checkAvailability();
    }
  }, [selectedDate, venue, contract]);
  
  // Handle booking submission
  const handleBookVenue = async () => {
    if (!isConnected || !venue || !selectedSlot || !contract) {
      setError("Please connect your wallet and select a time slot.");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const price = parseEther(totalPrice.toString());
      const tx = await contract.bookVenue(
        venue.id,
        selectedSlot.timestamp,
        bookingDuration,
        { value: price }
      );
      
      await tx.wait();
      
      // Refresh balance after successful booking
      refreshBalance();
      
      // Notify parent component about successful booking
      if (onBookingComplete) {
        onBookingComplete();
      }
      
      // Reset selection
      setSelectedSlot(null);
      checkAvailability();
    } catch (error) {
      console.error("Error booking venue:", error);
      setError(error.message || "Failed to book venue. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  // Check if consecutive slots are available
  const areConsecutiveSlotsAvailable = (startSlot, duration) => {
    if (!availabilityMap[startSlot.timestamp]) return false;
    
    const startIndex = timeSlots.findIndex(slot => slot.timestamp === startSlot.timestamp);
    if (startIndex === -1) return false;
    
    for (let i = 0; i < duration; i++) {
      const checkIndex = startIndex + i;
      if (
        checkIndex >= timeSlots.length || 
        !availabilityMap[timeSlots[checkIndex].timestamp]
      ) {
        return false;
      }
    }
    
    return true;
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-xl font-semibold mb-4">Book This Venue</h3>
      
      {/* Date Selection */}
      <div className="mb-6">
        <label className="label">Select Date:</label>
        <div className="grid grid-cols-7 gap-2">
          {nextSevenDays.map((date, index) => (
            <button
              key={index}
              className={`text-center py-2 rounded-lg transition ${
                isDateSelected(date)
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              onClick={() => handleDateSelect(date)}
            >
              <div className="text-xs">{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
              <div className="font-semibold">{date.getDate()}</div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Time Slots */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="label">Select Time:</label>
          <span className="text-sm text-gray-600">
            {formatDateDisplay(selectedDate)}
          </span>
        </div>
        
        {loadingAvailability ? (
          <div className="flex justify-center py-8">
            <div className="spinner"></div>
            <span className="ml-2 text-gray-600">Checking availability...</span>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {timeSlots.map((slot, index) => (
              <button
                key={index}
                className={`py-2 text-center rounded-lg transition ${
                  selectedSlot && selectedSlot.timestamp === slot.timestamp
                    ? 'bg-primary-600 text-white'
                    : availabilityMap[slot.timestamp]
                    ? areConsecutiveSlotsAvailable(slot, bookingDuration)
                      ? 'bg-green-100 hover:bg-green-200 text-green-800'
                      : 'bg-yellow-100 text-yellow-800 cursor-not-allowed'
                    : 'bg-red-100 text-red-800 cursor-not-allowed'
                }`}
                onClick={() => areConsecutiveSlotsAvailable(slot, bookingDuration) && handleSlotSelect(slot)}
                disabled={!areConsecutiveSlotsAvailable(slot, bookingDuration)}
              >
                {slot.time}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Duration Selection */}
      <div className="mb-6">
        <label htmlFor="duration" className="label">Duration (hours):</label>
        <select
          id="duration"
          value={bookingDuration}
          onChange={handleDurationChange}
          className="input"
        >
          {[1, 2, 3, 4].map(hour => (
            <option key={hour} value={hour}>{hour} hour{hour > 1 ? 's' : ''}</option>
          ))}
        </select>
      </div>
      
      {/* Price Summary */}
      {venue && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Hourly Rate:</span>
            <span className="font-medium">{parseFloat(hourlyRate).toFixed(5)} ETH</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Duration:</span>
            <span className="font-medium">{bookingDuration} hour{bookingDuration > 1 ? 's' : ''}</span>
          </div>
          <div className="border-t border-gray-200 my-2 pt-2 flex justify-between">
            <span className="font-semibold">Total:</span>
            <span className="font-bold text-primary-600">{totalPrice.toFixed(5)} ETH</span>
          </div>
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      
      {/* Book Now Button */}
      <button
        onClick={handleBookVenue}
        disabled={!isConnected || !selectedSlot || loading}
        className="btn btn-primary w-full"
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="spinner w-4 h-4 mr-2"></div>
            Processing...
          </div>
        ) : (
          isConnected ? 'Book Now' : 'Connect Wallet to Book'
        )}
      </button>
    </div>
  );
};

export default BookingCalendar;