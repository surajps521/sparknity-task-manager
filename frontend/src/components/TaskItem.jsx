import React from 'react';

export default function TaskItem({ task, onStatusChange, onEdit, onDelete }) {
  const isDone = task.status === 'DONE';

  // Compute due date details and overdue status
  const getDueDetails = () => {
    if (!task.dueDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [year, month, day] = task.dueDate.split('-').map(Number);
    const due = new Date(year, month - 1, day);
    due.setHours(0, 0, 0, 0);

    const diffDays = Math.round((due - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0 && !isDone) {
      return {
        isOverdue: true,
        text: `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'}`,
      };
    } else if (diffDays === 0) {
      return { isOverdue: false, text: 'Due today' };
    } else if (diffDays === 1) {
      return { isOverdue: false, text: 'Due tomorrow' };
    } else {
      return { isOverdue: false, text: `Due ${task.dueDate}` };
    }
  };

  const dueInfo = getDueDetails();

  return (
    <article className={`task ${isDone ? 'task-completed' : ''}`}>
      <button
        type="button"
        className={`check ${isDone ? 'checked' : ''}`}
        aria-label={isDone ? 'Mark as to do' : 'Mark as completed'}
        onClick={() => onStatusChange(task, isDone ? 'TODO' : 'DONE')}
        title={isDone ? 'Mark as to do' : 'Mark as done'}
      >
        {isDone ? '✓' : ''}
      </button>

      <div className="task-main">
        <div className="task-header-row">
          <h3>{task.title}</h3>
          <span className={`status-badge status-${task.status.toLowerCase()}`}>
            {task.status === 'TODO' && '● To do'}
            {task.status === 'IN_PROGRESS' && '◐ In progress'}
            {task.status === 'DONE' && '✔ Completed'}
          </span>
          {dueInfo?.isOverdue && (
            <span className="overdue-badge">⚠️ {dueInfo.text}</span>
          )}
        </div>

        {task.description && <p>{task.description}</p>}

        <div className="task-meta">
          {dueInfo && !dueInfo.isOverdue && (
            <span className="due-date-text">📅 {dueInfo.text}</span>
          )}
          {task.createdAt && (
            <span title="Created time">
              🕒 Added {new Date(task.createdAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      <div className="task-actions">
        <select
          aria-label="Change status"
          className="status-changer"
          value={task.status}
          onChange={(e) => onStatusChange(task, e.target.value)}
        >
          <option value="TODO">To do</option>
          <option value="IN_PROGRESS">In progress</option>
          <option value="DONE">Completed</option>
        </select>

        <button
          type="button"
          className="text-btn"
          onClick={() => onEdit(task)}
          title="Edit task title or details"
        >
          Edit
        </button>

        <button
          type="button"
          className="text-btn danger"
          onClick={() => onDelete(task)}
          title="Delete task"
        >
          Delete
        </button>
      </div>
    </article>
  );
}
