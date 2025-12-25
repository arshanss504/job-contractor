import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(parseInt(userId), password);
      navigate('/dashboard');
    } catch (err) {
      setError('Login failed. Please check your user ID and password.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', margin: '0 20px' }}>
        <div className="text-center mb-4">
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Sign In</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Enter your user ID to continue
          </p>
        </div>
        <form className="flex flex-col gap-4" style={{ marginTop: '2rem' }} onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="userId" className="label">
              User ID
            </label>
            <input
              id="userId"
              type="number"
              required
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="input"
              placeholder="Enter your user ID"
            />
          </div>
          <div className="input-group">
            <label htmlFor="password" className="label">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="Enter your password"
            />
          </div>
          {error && (
            <div style={{
              color: '#d32f2f',
              backgroundColor: '#ffebee',
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center',
              border: '1px solid #ffcdd2'
            }}>{error}</div>
          )}
          <button
            type="submit"
            className="btn btn-primary w-full"
            style={{ padding: '0.75rem' }}
          >
            Sign In
          </button>
          <div className="text-center" style={{ marginTop: '1rem' }}>
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="btn btn-outline"
              style={{ border: 'none', fontSize: '0.9rem' }}
            >
              Don't have an account? Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
