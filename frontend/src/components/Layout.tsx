import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <nav style={{
        backgroundColor: 'var(--color-brown)',
        color: 'var(--color-white)',
        padding: 'var(--spacing-md) var(--spacing-xl)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div className="flex items-center">
          <h1 style={{ margin: 0, color: 'var(--color-white)', fontSize: '1.5rem' }}>
            Job Management
          </h1>
        </div>
        <div className="flex items-center" style={{ gap: 'var(--spacing-md)' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--color-tan)' }}>
            {user?.name} <span style={{ opacity: 0.8 }}>({user?.role})</span>
          </span>
          <button
            onClick={handleLogout}
            className="btn"
            style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              color: 'var(--color-white)',
              border: '1px solid var(--color-tan)'
            }}
          >
            Logout
          </button>
        </div>
      </nav>
      <main className="container" style={{ flex: 1, padding: 'var(--spacing-xl) 0' }}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
