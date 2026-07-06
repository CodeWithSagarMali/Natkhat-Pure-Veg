import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Icon from '../components/Icons';

export const Login = ({ setCurrentTab }) => {
  const { login, register } = useAuth();
  
  const [isRegister, setIsRegister] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [isOtpStep, setIsOtpStep] = useState(false);

  // Form fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('customer'); // For testing/role selection
  
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (isForgot) {
        if (isOtpStep) {
          // Verify OTP
          const res = await fetch('/api/auth/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'OTP verification failed');
          
          setIsOtpStep(false);
          setMessage('OTP verified! Now enter your new password.');
        } else if (newPassword) {
          // Reset password
          const res = await fetch('/api/auth/change-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, newPassword })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Password change failed');
          
          setIsForgot(false);
          setNewPassword('');
          setMessage('Password updated successfully! You can login now.');
        } else {
          // Send OTP
          const res = await fetch('/api/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
          
          setIsOtpStep(true);
          setMessage(data.message);
        }
      } else if (isRegister) {
        // Sign Up
        await register(username, email, password, phone, role);
        setMessage('Registration successful! Please login.');
        setIsRegister(false);
      } else {
        // Sign In
        const user = await login(email, password);
        // Direct to appropriate dashboard tab
        if (user.role === 'admin') setCurrentTab('admin_dashboard');
        else if (user.role === 'manager') setCurrentTab('manager_dashboard');
        else if (user.role === 'cashier') setCurrentTab('cashier_dashboard');
        else if (user.role === 'waiter') setCurrentTab('waiter_dashboard');
        else if (user.role === 'kitchen') setCurrentTab('kitchen_dashboard');
        else if (user.role === 'delivery') setCurrentTab('delivery_dashboard');
        else setCurrentTab('menu');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem 1.5rem', flex: 1, backgroundColor: 'var(--bg-secondary)' }}>
      <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '420px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', backgroundColor: 'var(--color-primary-light)', padding: '0.6rem', borderRadius: '50%', marginBottom: '0.75rem' }}>
            <Icon name="utensils" color="var(--color-primary)" size={28} />
          </div>
          <h2>
            {isForgot ? 'Reset Password' : isRegister ? 'Join Gourmet Veg Oasis' : 'Welcome Back'}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            {isForgot ? 'Recover your account password' : isRegister ? 'Create your account' : 'Sign in to order fresh vegetarian meals'}
          </p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontWeight: 'bold' }}>✕</span> {error}
          </div>
        )}

        {message && (
          <div style={{ backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontWeight: 'bold' }}>✓</span> {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isForgot ? (
            <>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="Enter registered email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  disabled={isOtpStep || newPassword !== ''}
                />
              </div>

              {isOtpStep && (
                <div className="form-group">
                  <label className="form-label">Verification OTP</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    required
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>*Check backend console output for the simulated OTP.</span>
                </div>
              )}

              {!isOtpStep && otp && (
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                  />
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
                {loading ? 'Processing...' : isOtpStep ? 'Verify OTP' : newPassword ? 'Change Password' : 'Send Reset Code'}
              </button>
            </>
          ) : (
            <>
              {isRegister && (
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter your name"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="Enter your email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              {isRegister && (
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter phone number"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Enter password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>

              {isRegister && (
                <div className="form-group">
                  <label className="form-label">Register As (Role Demo)</label>
                  <select
                    className="form-input"
                    value={role}
                    onChange={e => setRole(e.target.value)}
                  >
                    <option value="customer">Customer</option>
                    <option value="waiter">Waiter</option>
                    <option value="cashier">Cashier</option>
                    <option value="kitchen">Kitchen Staff</option>
                    <option value="delivery">Delivery Partner</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
                {loading ? 'Authenticating...' : isRegister ? 'Create Account' : 'Sign In'}
              </button>
            </>
          )}
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {isForgot ? (
            <button onClick={() => { setIsForgot(false); setError(''); setMessage(''); }} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: '600', cursor: 'pointer' }}>
              Back to Login
            </button>
          ) : isRegister ? (
            <p>
              Already have an account?{' '}
              <button onClick={() => { setIsRegister(false); setError(''); setMessage(''); }} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: '600', cursor: 'pointer' }}>
                Sign In
              </button>
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <p>
                New to Oasis?{' '}
                <button onClick={() => { setIsRegister(true); setError(''); setMessage(''); }} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: '600', cursor: 'pointer' }}>
                  Create Account
                </button>
              </p>
              <button onClick={() => { setIsForgot(true); setError(''); setMessage(''); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer' }}>
                Forgot Password?
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
export default Login;
