import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import api from '../api';

const EyeIcon = ({ show }: { show: boolean }) => show ? (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
) : (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!email || !password || !confirm) { showToast('Please fill all fields'); return; }
    if (password !== confirm) { showToast('Passwords do not match'); return; }
    if (password.length < 6) { showToast('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', { email, password });
      login(data.token, data.user);
      navigate('/game');
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>User registration</h2>
        <div className="input-group">
          <input type="email" placeholder="Your email" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="input-group">
          <input
            type={showPass ? 'text' : 'password'}
            placeholder="Choose password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ paddingRight: 52 }}
          />
          <button className="eye-btn" onClick={() => setShowPass(p => !p)} type="button"><EyeIcon show={showPass} /></button>
        </div>
        <div className="input-group">
          <input
            type={showConf ? 'text' : 'password'}
            placeholder="Repeat your password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleRegister()}
            style={{ paddingRight: 52 }}
          />
          <button className="eye-btn" onClick={() => setShowConf(p => !p)} type="button"><EyeIcon show={showConf} /></button>
        </div>
        <button className="btn-primary auth-submit" onClick={handleRegister} disabled={loading}>
          {loading ? 'Registering…' : 'Register'}
        </button>
      </div>
    </div>
  );
}
