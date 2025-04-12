import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { Link } from 'react-router-dom';
import { formatEther } from '../utils/contractHelpers';

const containerStyle = {
  width: '100%',
  height: '100%',
  minHeight: '400px',
  borderRadius: '0.5rem'
};

const defaultCenter = {
  lat: 40.7128, // New York
  lng: -74.006
};

const VenueMap = ({ venues, center, zoom = 11 }) => {
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [map, setMap] = useState(null);
  const [mapCenter, setMapCenter] = useState(center || defaultCenter);
  const [userLocation, setUserLocation] = useState(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '', // Fallback to empty string
  });

  const onLoad = useCallback(function callback(map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map) {
    setMap(null);
  }, []);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(userPos);
          if (!center) {
            setMapCenter(userPos);
          }
        },
        (error) => {
          console.error("Error getting user location:", error);
        }
      );
    }
  }, [center]);

  // Update center when prop changes
  useEffect(() => {
    if (center) {
      setMapCenter(center);
    }
  }, [center]);

  // Handle venue click
  const handleVenueClick = (venue) => {
    setSelectedVenue(venue);
  };

  // If the map is not loaded yet, show loading state
  if (loadError) {
    return <div className="bg-red-50 text-red-600 p-4 rounded-lg">Error loading maps</div>;
  }

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-96 bg-gray-50 rounded-lg">
        <div className="spinner"></div>
        <span className="ml-2 text-gray-600">Loading Map...</span>
      </div>
    );
  }

  return (
    <div className="map-container">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          fullscreenControl: false,
          streetViewControl: false,
          mapTypeControl: false,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        }}
      >
        {/* User's location marker */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: '#4f46e5',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            }}
            title="Your Location"
          />
        )}

        {/* Venue markers */}
        {venues && venues.map((venue) => {
          // Parse coordinates
          const position = {
            lat: parseFloat(venue.latitude),
            lng: parseFloat(venue.longitude)
          };

          // Skip invalid coordinates
          if (isNaN(position.lat) || isNaN(position.lng)) {
            return null;
          }

          return (
            <Marker
              key={venue.id}
              position={position}
              onClick={() => handleVenueClick(venue)}
              title={venue.name}
              icon={{
                path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                scale: 6,
                fillColor: '#0061A8',
                fillOpacity: 1,
                strokeWeight: 2,
                strokeColor: '#FFFFFF',
              }}
            />
          );
        })}

        {/* Info Window for selected venue */}
        {selectedVenue && (
          <InfoWindow
            position={{
              lat: parseFloat(selectedVenue.latitude),
              lng: parseFloat(selectedVenue.longitude)
            }}
            onCloseClick={() => setSelectedVenue(null)}
          >
            <div className="p-2 max-w-xs">
              <h3 className="font-semibold text-gray-900">{selectedVenue.name}</h3>
              <p className="text-sm text-gray-600 mb-1">{selectedVenue.sportType}</p>
              <p className="text-sm font-medium text-primary-600 mb-2">
                {parseFloat(formatEther(selectedVenue.hourlyRate)).toFixed(5)} ETH/hour
              </p>
              <Link
                to={`/venues/${selectedVenue.id}`}
                className="text-sm text-white bg-primary-600 px-3 py-1 rounded hover:bg-primary-700 inline-block"
              >
                View Details
              </Link>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};

export default VenueMap;