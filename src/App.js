import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Welcome from './HalamanLogin';
import Dashboard from './HalamanUtama'; // Ganti jika nama file lain
import Register from './HalamanRegister'; // Ganti jika nama file lain
import LupaSandi from './HalamanLupasandi';
import Hutang from './HalamanHutang';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/register" element={<Register/>} />
        <Route path="/lupasandi" element={<LupaSandi/>} />
        <Route path="/hutang" element={<Hutang />} />
        <Route path="/Dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
};

export default App;