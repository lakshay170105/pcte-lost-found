import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginSignup from './LoginSignup';
import Lost from './components/Lost';
import Found from './components/Found';
import Dashboard from './components/UserDashboard';
import AdminPanel from './components/AdminPanel';
import Navbar from './Navbar';
import Home from './components/Home';
import RequireAuth from './components/RequireAuth';
import Footer from './components/Footer';
import About from './components/About';
import Contact from './components/Contact';
import Feedback from './components/Feedback';
import ItemFeed from './components/ItemFeed';
import socket from './socket.js';

function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    try {
      const savedUser = JSON.parse(localStorage.getItem('loggedInUser'));
      const adminFlag = localStorage.getItem('isAdmin') === 'true';
      if (savedUser) setUser(savedUser);
      if (adminFlag) setIsAdmin(true);
      // Join personal socket room on restore
      if (savedUser?.id) socket.emit('join:user', savedUser.id);
    } catch {
      // corrupted localStorage — clear it
      localStorage.clear();
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('token');
    setUser(null);
    setIsAdmin(false);
  };

  const isLoggedIn = !!user || isAdmin;

  return (
    <Router>
      <Navbar isLoggedIn={isLoggedIn} isAdmin={isAdmin} onLogout={handleLogout} />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home isLoggedIn={isLoggedIn} />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/feed" element={<ItemFeed currentUser={user} />} />
        <Route path="/login" element={
          isLoggedIn ? <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace /> : <LoginSignup setUser={setUser} setIsAdmin={setIsAdmin} />
        } />

        {/* User-only routes */}
        <Route path="/lost" element={
          <RequireAuth isAllowed={!!user && !isAdmin}>
            <Lost user={user} />
          </RequireAuth>
        } />
        <Route path="/found" element={
          <RequireAuth isAllowed={!!user && !isAdmin}>
            <Found user={user} />
          </RequireAuth>
        } />
        <Route path="/dashboard" element={
          <RequireAuth isAllowed={!!user && !isAdmin}>
            <Dashboard />
          </RequireAuth>
        } />

        {/* Admin-only route */}
        <Route path="/admin" element={
          <RequireAuth isAdmin={true}>
            <AdminPanel />
          </RequireAuth>
        } />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
