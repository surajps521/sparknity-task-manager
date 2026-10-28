import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ user, onNewTask }) {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(
    () => localStorage.getItem('task_theme') || 'dark'
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('task_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleLogout = () => {
    localStorage.removeItem('task_token');
    localStorage.removeItem('task_user');
    navigate('/login');
  };

  const initials = (user?.name || 'U')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="nav">
      <div className="nav-brand">
        <div className="logo">
          <span>✓</span> TaskFlow
        </div>
        <span className="logo-badge">Pro</span>
      </div>

      <div className="nav-actions">
        <button
          type="button"
          className="theme-toggle"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          aria-label="Toggle theme"
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>

        {onNewTask && (
          <button
            type="button"
            className="btn small"
            onClick={onNewTask}
            title="Press 'N' key anytime"
          >
            ＋ New task
          </button>
        )}

        <div className="user-profile-badge">
          <div className="user-avatar">{initials}</div>
          <span>{user?.name || 'User'}</span>
        </div>

        <button
          type="button"
          className="btn secondary small"
          onClick={handleLogout}
          title="Sign out of your session"
        >
          Log out
        </button>
      </div>
    </header>
  );
}
