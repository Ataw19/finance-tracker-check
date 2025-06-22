import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Welcome from './HalamanLogin';
import Dashboard from './HalamanUtama'; // Ganti jika nama file lain
import HalamanHutang from './HalamanHutang';
import Register from './HalamanRegister'; // Ganti jika nama file lain
import LupaSandi from './HalamanLupasandi';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/register" element={<Register/>} />
        <Route path="/lupasandi" element={<LupaSandi/>} />
        <Route path="/app" element={<Dashboard />} />
        <Route path="/hutang" element={<HalamanHutang />} />
      </Routes>
    </Router>
  );
};

export default App;