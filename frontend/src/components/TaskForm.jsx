import React, { useEffect, useState } from 'react';

export default function TaskForm({ task, onSave, onCancel }) {
  const [formData, setFormData] = useState(
    task || {
      title: '',
      description: '',
      status: 'TODO',
      dueDate: '',
    }
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const setQuickDate = (daysFromToday) => {
    if (daysFromToday === null) {
      setFormData({ ...formData, dueDate: '' });
      return;
    }
    const d = new Date();
    d.setDate(d.getDate() + daysFromToday);
    const dateStr = d.toISOString().split('T')[0];
    setFormData({ ...formData, dueDate: dateStr });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    onSave({
      ...formData,
      title: formData.title.trim(),
      description: formData.description ? formData.description.trim() : '',
      dueDate: formData.dueDate || null,
    });
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="modal-content" role="dialog" aria-modal="true">
        <div className="modal-header">
          <h2>{task ? 'Edit Task' : 'Create New Task'}</h2>
          <button
            type="button"
            className="modal-close"
            onClick={onCancel}
            aria-label="Close dialog"
          >
            ×
          </button>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <label>
            Task Title <span style={{ color: 'var(--danger)' }}>*</span>
            <input
              type="text"
              name="title"
              required
              maxLength="160"
              placeholder="e.g. Implement JWT authentication"
              value={formData.title}
              onChange={handleChange}
              autoFocus
            />
            <span className="char-count">
              {formData.title.length}/160 characters
            </span>
          </label>

          <label>
            Description (optional)
            <textarea
              name="description"
              maxLength="2000"
              placeholder="Add details, notes, or acceptance criteria…"
              value={formData.description || ''}
              onChange={handleChange}
            />
            <span className="char-count">
              {(formData.description || '').length}/2000 characters
            </span>
          </label>

          <label>
            Status
            <select
              name="status"
              value={formData.status || 'TODO'}
              onChange={handleChange}
            >
              <option value="TODO">To do</option>
              <option value="IN_PROGRESS">In progress</option>
              <option value="DONE">Completed</option>
            </select>
          </label>

          <label>
            Due Date
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate || ''}
              onChange={handleChange}
            />
            <div className="date-shortcuts">
              <button
                type="button"
                className="date-chip"
                onClick={() => setQuickDate(0)}
              >
                Today
              </button>
              <button
                type="button"
                className="date-chip"
                onClick={() => setQuickDate(1)}
              >
                Tomorrow
              </button>
              <button
                type="button"
                className="date-chip"
                onClick={() => setQuickDate(7)}
              >
                Next week
              </button>
              {formData.dueDate && (
                <button
                  type="button"
                  className="date-chip"
                  onClick={() => setQuickDate(null)}
                >
                  Clear date
                </button>
              )}
            </div>
          </label>

          <div className="actions">
            <button
              type="button"
              className="btn secondary"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button type="submit" className="btn">
              {task ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
