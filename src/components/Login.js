import React, { useState } from 'react';
import { toast } from 'react-toastify';
import '../Login.css';

function Login({ onLoginSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Admin');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const resetForm = () => {
    setName('');
    setEmail('');
    setRole('Admin');
    setPassword('');
    setErrorMsg('');
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    resetForm();
  };

  const handleRegister = () => {
    if (!name || !email || !role || !password) {
      setErrorMsg('Please fill in all fields.');
      return;
    }
    setIsLoading(true);
    setErrorMsg('');

    fetch(`${process.env.REACT_APP_API_BASE_URL}/kpcamera/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, role, password }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          toast.success('Registered successfully! Please sign in.');
          switchMode('login');
        } else {
          setErrorMsg(data.message || 'Registration failed');
        }
      })
      .catch((error) => {
        console.error('Error registering:', error);
        setErrorMsg('Something went wrong. Please try again.');
      })
      .finally(() => setIsLoading(false));
  };

  const handleLogin = () => {
    if (!email || !password) {
      setErrorMsg('Please enter email and password.');
      return;
    }
    setIsLoading(true);
    setErrorMsg('');

    fetch(`${process.env.REACT_APP_API_BASE_URL}/kpcamera/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          const user = { name: data.name, email: data.email, role: data.role };
          localStorage.setItem('user', JSON.stringify(user));
          onLoginSuccess(user);
        } else {
          setErrorMsg(data.message || 'Invalid email or password');
        }
      })
      .catch((error) => {
        console.error('Error logging in:', error);
        setErrorMsg('Something went wrong. Please try again.');
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="login-wrapper kp-auth">
      <div className="kp-blob kp-blob-a"></div>
      <div className="kp-blob kp-blob-b"></div>

      <div className="login-card kp-auth-card">
        <div className="kp-brand">
          <div className="kp-mark">KP</div>
          <span>KP Camera</span>
        </div>

        <h2 className="kp-title">
          {mode === 'login' ? 'Welcome back' : 'Create your account'}
        </h2>
        <p className="kp-subtitle">
          {mode === 'login'
            ? 'Step into the world of Face Recognition'
            : 'Set up admin access to the camera network'}
        </p>

        {mode === 'register' && (
          <>
            <div className="kp-field">
              <label>Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
              />
            </div>
            <div className="kp-field">
              <label>Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="Admin">Admin</option>
                <option value="User">User</option>
              </select>
            </div>
          </>
        )}

        <div className="kp-field">
          <label>Email</label>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
          />
        </div>

        <div className="kp-field">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === 'login' ? 'Enter your password' : 'Create a password'}
          />
        </div>

        {errorMsg && <p className="error-message kp-error">{errorMsg}</p>}

        <button
          className="centered kp-submit"
          disabled={isLoading}
          onClick={mode === 'login' ? handleLogin : handleRegister}
        >
          {isLoading ? (
            <span className="kp-btn-loading">
              <span className="kp-spinner kp-spinner--on-btn" />
              Please wait...
            </span>
          ) : mode === 'login' ? (
            'Sign in'
          ) : (
            'Create account'
          )}
        </button>

        <p className="login-switch kp-foot">
          {mode === 'login' ? (
            <>Don't have an account? <a href="#" onClick={() => switchMode('register')}>Register</a></>
          ) : (
            <>Already have an account? <a href="#" onClick={() => switchMode('login')}>Sign in</a></>
          )}
        </p>
      </div>
    </div>
  );
}

export default Login;