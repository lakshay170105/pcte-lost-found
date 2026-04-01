import React from 'react';
import { Navigate } from 'react-router-dom';

const RequireAuth = ({ children, isAdmin = false, isAllowed }) => {
  const adminFlag = localStorage.getItem('isAdmin') === 'true';
  const user = localStorage.getItem('loggedInUser');
  const token = localStorage.getItem('token');
  const isUserLoggedIn = !!user && !!token;

  // Explicit isAllowed prop
  if (isAllowed !== undefined) {
    return isAllowed ? children : <Navigate to="/login" replace />;
  }

  // Admin route: needs admin flag + token
  if (isAdmin) {
    return (adminFlag && !!token) ? children : <Navigate to="/login" replace />;
  }

  // User route: needs user data + token, not admin
  if (isUserLoggedIn && !adminFlag) {
    return children;
  }

  return <Navigate to="/login" replace />;
};

export default RequireAuth;
