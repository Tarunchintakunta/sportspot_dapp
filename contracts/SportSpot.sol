// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract SportSpot {
    // Structs
    struct Venue {
        uint256 id;
        string name;
        string sportType;
        uint256 hourlyRate; // in wei
        string latitude;
        string longitude;
        address owner;
        bool isActive;
    }

    struct Booking {
        uint256 id;
        uint256 venueId;
        uint256 timeSlot; // Unix timestamp for start time
        uint256 bookingDuration; // in hours
        address booker;
        bool isCancelled;
    }

    // State variables
    uint256 private venueCounter;
    uint256 private bookingCounter;
    mapping(uint256 => Venue) private venues;
    mapping(uint256 => Booking) private bookings;
    mapping(uint256 => mapping(uint256 => bool)) private venueTimeSlots; // venueId => timeSlot => isBooked

    // Events
    event VenueRegistered(uint256 indexed venueId, string name, address indexed owner);
    event VenueBooked(uint256 indexed bookingId, uint256 indexed venueId, address indexed booker);
    event BookingCancelled(uint256 indexed bookingId);
    event PaymentWithdrawn(address indexed receiver, uint256 amount);

    // Modifiers
    modifier onlyVenueOwner(uint256 _venueId) {
        require(venues[_venueId].owner == msg.sender, "Not venue owner");
        _;
    }

    modifier validVenue(uint256 _venueId) {
        require(_venueId > 0 && _venueId <= venueCounter, "Invalid venue ID");
        require(venues[_venueId].isActive, "Venue not active");
        _;
    }

    modifier validBooking(uint256 _bookingId) {
        require(_bookingId > 0 && _bookingId <= bookingCounter, "Invalid booking ID");
        require(bookings[_bookingId].booker == msg.sender, "Not booking owner");
        require(!bookings[_bookingId].isCancelled, "Booking already cancelled");
        _;
    }

    // Functions
    function registerVenue(
        string memory _name,
        string memory _sportType,
        uint256 _hourlyRate,
        string memory _latitude,
        string memory _longitude
    ) external returns (uint256) {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(_hourlyRate > 0, "Hourly rate must be greater than zero");

        venueCounter++;
        uint256 venueId = venueCounter;

        venues[venueId] = Venue({
            id: venueId,
            name: _name,
            sportType: _sportType,
            hourlyRate: _hourlyRate,
            latitude: _latitude,
            longitude: _longitude,
            owner: msg.sender,
            isActive: true
        });

        emit VenueRegistered(venueId, _name, msg.sender);
        return venueId;
    }

    function bookVenue(
        uint256 _venueId,
        uint256 _timeSlot,
        uint256 _bookingDuration
    ) external payable validVenue(_venueId) returns (uint256) {
        require(_timeSlot > block.timestamp, "Cannot book in the past");
        require(_bookingDuration > 0, "Duration must be greater than zero");
        require(_bookingDuration <= 24, "Cannot book for more than 24 hours"); // Reasonable limit
        
        Venue memory venue = venues[_venueId];
        uint256 totalCost = venue.hourlyRate * _bookingDuration;
        
        require(msg.value >= totalCost, "Insufficient payment");

        // Check if all time slots are available for the duration
        for (uint256 i = 0; i < _bookingDuration; i++) {
            uint256 slotToCheck = _timeSlot + (i * 1 hours);
            require(!venueTimeSlots[_venueId][slotToCheck], "Time slot not available");
            venueTimeSlots[_venueId][slotToCheck] = true;
        }

        bookingCounter++;
        uint256 bookingId = bookingCounter;

        bookings[bookingId] = Booking({
            id: bookingId,
            venueId: _venueId,
            timeSlot: _timeSlot,
            bookingDuration: _bookingDuration,
            booker: msg.sender,
            isCancelled: false
        });

        emit VenueBooked(bookingId, _venueId, msg.sender);
        return bookingId;
    }

    function cancelBooking(uint256 _bookingId) external validBooking(_bookingId) returns (bool) {
        Booking storage booking = bookings[_bookingId];
        Venue memory venue = venues[booking.venueId];
        
        // Check if cancelation is at least 24 hours before booking time
        require(booking.timeSlot > block.timestamp + 24 hours, "Too late to cancel");
        
        // Free up the time slots
        for (uint256 i = 0; i < booking.bookingDuration; i++) {
            uint256 slotToFree = booking.timeSlot + (i * 1 hours);
            venueTimeSlots[booking.venueId][slotToFree] = false;
        }
        
        booking.isCancelled = true;
        
        // Refund 90% of the payment
        uint256 refundAmount = (venue.hourlyRate * booking.bookingDuration * 90) / 100;
        payable(msg.sender).transfer(refundAmount);
        
        emit BookingCancelled(_bookingId);
        return true;
    }
    
    function withdrawPayment() external {
        uint256 totalEarnings = 0;
        
        // Calculate earnings for venue owner
        for (uint256 i = 1; i <= bookingCounter; i++) {
            Booking memory booking = bookings[i];
            if (!booking.isCancelled && venues[booking.venueId].owner == msg.sender) {
                totalEarnings += venues[booking.venueId].hourlyRate * booking.bookingDuration;
            }
        }
        
        require(totalEarnings > 0, "No earnings to withdraw");
        require(address(this).balance >= totalEarnings, "Insufficient contract balance");
        
        payable(msg.sender).transfer(totalEarnings);
        
        emit PaymentWithdrawn(msg.sender, totalEarnings);
    }

    function getVenueDetails(uint256 _venueId) external view validVenue(_venueId) returns (
        string memory name,
        string memory sportType,
        uint256 hourlyRate,
        string memory latitude,
        string memory longitude,
        address owner,
        bool isActive
    ) {
        Venue memory venue = venues[_venueId];
        return (
            venue.name,
            venue.sportType,
            venue.hourlyRate,
            venue.latitude,
            venue.longitude,
            venue.owner,
            venue.isActive
        );
    }
    
    function getBookingDetails(uint256 _bookingId) external view returns (
        uint256 venueId,
        uint256 timeSlot,
        uint256 bookingDuration,
        address booker,
        bool isCancelled
    ) {
        require(_bookingId > 0 && _bookingId <= bookingCounter, "Invalid booking ID");
        Booking memory booking = bookings[_bookingId];
        return (
            booking.venueId,
            booking.timeSlot,
            booking.bookingDuration,
            booking.booker,
            booking.isCancelled
        );
    }
    
    function getAllVenues() external view returns (uint256[] memory) {
        uint256[] memory allVenueIds = new uint256[](venueCounter);
        uint256 activeCount = 0;
        
        for (uint256 i = 1; i <= venueCounter; i++) {
            if (venues[i].isActive) {
                allVenueIds[activeCount] = i;
                activeCount++;
            }
        }
        
        return allVenueIds;
    }
    
    function checkTimeSlotAvailability(uint256 _venueId, uint256 _timeSlot) external view validVenue(_venueId) returns (bool) {
        return !venueTimeSlots[_venueId][_timeSlot];
    }
    
    function getUserBookings(address _user) external view returns (uint256[] memory) {
        uint256 userBookingsCount = 0;
        
        // Count user bookings first
        for (uint256 i = 1; i <= bookingCounter; i++) {
            if (bookings[i].booker == _user && !bookings[i].isCancelled) {
                userBookingsCount++;
            }
        }
        
        uint256[] memory userBookingIds = new uint256[](userBookingsCount);
        uint256 index = 0;
        
        // Populate array with booking IDs
        for (uint256 i = 1; i <= bookingCounter; i++) {
            if (bookings[i].booker == _user && !bookings[i].isCancelled) {
                userBookingIds[index] = i;
                index++;
            }
        }
        
        return userBookingIds;
    }
}