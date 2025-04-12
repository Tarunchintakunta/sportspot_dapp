// App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import VenueListing from './pages/VenueListing';
import VenueDetails from './pages/VenueDetails';
import VenueRegister from './pages/VenueRegister'; // Add this import
import Wallet from './pages/Wallet';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/venues" element={<VenueListing />} />
      <Route path="/venues/register" element={<VenueRegister />} /> {/* Add this BEFORE the :id route */}
      <Route path="/venues/:id" element={<VenueDetails />} />
      <Route path="/wallet" element={<Wallet />} />
      <Route path="*" element={<Home />} />
    </Routes>
  );
}

export default App;