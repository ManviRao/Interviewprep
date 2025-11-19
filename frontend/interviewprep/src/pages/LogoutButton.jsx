import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const LogoutButton = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      // Clear all authentication data
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      // localStorage.clear(); // Be careful with this as it clears everything
      
      // Redirect to login page
      navigate('/login');
      console.log('User logged out successfully');
    }
  };

  const isLoggedIn = !!localStorage.getItem("userId");
  const userName = localStorage.getItem("userName");

  // Don't show logout button if not logged in OR if on auth pages
  if (!isLoggedIn) return null;
  
  // List of routes where logout button should NOT appear
  const hideOnRoutes = ['/login', '/signup', '/register'];
  if (hideOnRoutes.includes(location.pathname)) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: 'white',
      padding: '0.5rem 1rem',
      borderRadius: '25px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      zIndex: 1000,
      border: '1px solid #e0e0e0',
      fontFamily: 'Arial, sans-serif'
    }}>
      <span style={{ 
        fontSize: '14px', 
        color: '#333',
        fontWeight: '500'
      }}>
        👋 Hello, <strong>{userName}</strong>
      </span>
      <button 
        onClick={handleLogout}
        style={{
          padding: '0.5rem 1rem',
          background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
          color: 'white',
          border: 'none',
          borderRadius: '20px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold',
          transition: 'all 0.3s ease',
          minWidth: '80px'
        }}
        onMouseOver={(e) => {
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
        }}
        onMouseOut={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = 'none';
        }}
      >
        🚪 Logout
      </button>
    </div>
  );
};

export default LogoutButton;