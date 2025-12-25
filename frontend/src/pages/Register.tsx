import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [skills, setSkills] = useState('');
  const [education, setEducation] = useState('');
  const [password, setPassword] = useState('');

  const [role, setRole] = useState<UserRole>(UserRole.CONTRACTOR);
  const [error, setError] = useState('');
  const [registeredUserId, setRegisteredUserId] = useState<number | null>(null);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const newUser = await register(name, role, password, email, contactNumber, skills, education);
      setRegisteredUserId(newUser.id);
    } catch (err) {
      setError('Registration failed. Please try again.');
    }
  };

  if (registeredUserId) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="card" style={{ maxWidth: '400px', width: '100%', margin: '0 20px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--primary)' }}>Registration Successful!</h2>
          <p style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>
            Your User ID is:
          </p>
          <div style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            color: 'var(--text-primary)',
            marginBottom: '1.5rem',
            padding: '1rem',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            border: '2px dashed var(--color-tan)'
          }}>
            {registeredUserId}
          </div>
          <p style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>
            Please search this ID to log in next time.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-primary w-full"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', margin: '0 20px' }}>
        <div className="text-center mb-4">
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Register</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Create your account
          </p>
        </div>
        <form className="flex flex-col gap-4" style={{ marginTop: '2rem' }} onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="name" className="label">Full Name</label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="Enter your full name"
            />
          </div>
          <div className="input-group">
            <label htmlFor="email" className="label">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="Enter your email"
            />
          </div>
          <div className="input-group">
            <label htmlFor="contact" className="label">Contact Number</label>
            <input
              id="contact"
              type="text"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              className="input"
              placeholder="Enter your contact number"
            />
          </div>
          <div className="input-group">
            <label htmlFor="password" className="label">Password</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="Create a password"
            />
          </div>
          {role === UserRole.CONTRACTOR && (
            <>
              <div className="input-group">
                <label htmlFor="skills" className="label">Skills (comma separated)</label>
                <input
                  id="skills"
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="input"
                  placeholder="e.g. Python, React, Design"
                />
              </div>
              <div className="input-group">
                <label htmlFor="education" className="label">Education</label>
                <textarea
                  id="education"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  className="input"
                  placeholder="e.g. BS Computer Science"
                  rows={2}
                  style={{ fontFamily: 'inherit' }}
                />
              </div>
            </>
          )}
          <div className="input-group">
            <label htmlFor="role" className="label">
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="input"
              style={{ appearance: 'auto' }}
            >
              <option value={UserRole.CONTRACTOR}>Contractor</option>
              <option value={UserRole.AGENT}>Agent</option>
            </select>
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
            Register
          </button>
          <div className="text-center" style={{ marginTop: '1rem' }}>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="btn btn-outline"
              style={{ border: 'none', fontSize: '0.9rem' }}
            >
              Already have an account? Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
