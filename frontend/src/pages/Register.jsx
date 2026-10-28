import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api/authApi';
import LiveBackground from '../components/LiveBackground';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      const data = await register(formData);
      localStorage.setItem('task_token', data.token);
      localStorage.setItem('task_user', JSON.stringify(data));
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        (err.code === 'ERR_NETWORK'
          ? 'Cannot connect to backend server. Please verify backend is running on port 8080.'
          : 'Registration failed. Please check your details.')
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
            START WITH INTENTION
          </p>
          <h1>
            Create your<br />
            <em>daily rhythm.</em>
          </h1>
          <p>
            Organize the work ahead, build reliable routines, and make progress one task at a time.
          </p>

          <div className="pitch-feature-list">
            <div className="pitch-feature-item">
              <span>✓</span> Shape routines around your priorities
            </div>
            <div className="pitch-feature-item">
              <span>✓</span> Break important work into clear tasks
            </div>
            <div className="pitch-feature-item">
              <span>✓</span> Keep momentum with visible progress
            </div>
          </div>
        </div>

        <small>Small steps, consistent progress.</small>
      </section>

      <section className="auth-right">
        <div className="auth-form-card">
          <form className="auth-form" onSubmit={handleSubmit}>
            <div>
              <p className="kicker">GET STARTED</p>
              <h2>Create your account</h2>
              <p className="muted">Start with one small step.</p>
            </div>

            <label>
              Full name
              <input
                type="text"
                name="name"
                required
                maxLength="100"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Suraj Kumar"
                autoFocus
              />
            </label>

            <label>
              Email address
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="suraj@example.com"
              />
            </label>

            <label>
              Password
              <input
                type="password"
                name="password"
                required
                minLength="8"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 8 characters"
              />
            </label>

            {error && <div className="error">⚠️ {error}</div>}

            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Creating account…' : 'Create account →'}
            </button>

            <p className="muted center auth-footer">
              Already registered? <Link to="/login">Sign in</Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
