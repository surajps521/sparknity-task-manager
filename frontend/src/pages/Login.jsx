import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../api/authApi';
import LiveBackground from '../components/LiveBackground';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDemoFill = () => {
    setFormData({
      email: 'suraj.demo@test.com',
      password: 'Password123!',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(formData);
      localStorage.setItem('task_token', data.token);
      localStorage.setItem('task_user', JSON.stringify(data));
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        (err.code === 'ERR_NETWORK'
          ? 'Cannot connect to backend server. Please verify backend is running on port 8080.'
          : 'Invalid email or password.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth">
      <LiveBackground isDark={true} />

      <section className="pitch">
        <div className="logo" style={{ color: 'white' }}>
          <span>✓</span> TaskFlow
        </div>

        <div className="pitch-content">
          <p className="kicker" style={{ color: '#a5b4fc' }}>
            A LITTLE MORE CLARITY
          </p>
          <h1>
            Make room for<br />
            <em>great work.</em>
          </h1>
          <p>
            One intuitive workspace for all your tasks, priorities, and daily wins.
          </p>

          <div className="pitch-feature-list">
            <div className="pitch-feature-item">
              <span>✓</span> Secure stateless JWT authentication
            </div>
            <div className="pitch-feature-item">
              <span>✓</span> User-scoped task privacy & PostgreSQL persistence
            </div>
            <div className="pitch-feature-item">
              <span>✓</span> Interactive search, due date tracking & status filtering
            </div>
          </div>
        </div>

        <small>Plan thoughtfully. Execute flawlessly. · Sparknity Internship</small>
      </section>

      <section className="auth-right">
        <div className="auth-form-card">
          <form className="auth-form" onSubmit={handleSubmit}>
            <div>
              <p className="kicker">WELCOME BACK</p>
              <h2>Sign in to your space</h2>
              <p className="muted">Pick up right where you left off.</p>
            </div>

            <label>
              Email address
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                autoFocus
              />
            </label>

            <label>
              Password
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
              />
            </label>

            {error && <div className="error">⚠️ {error}</div>}

            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>

            <div className="demo-helper">
              <span>Quick demo test?</span>
              <button
                type="button"
                className="btn secondary small"
                onClick={handleDemoFill}
              >
                Autofill demo user
              </button>
            </div>

            <p className="muted center auth-footer">
              New to TaskFlow? <Link to="/register">Create an account</Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
