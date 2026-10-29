import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import TaskItem from '../components/TaskItem';
import TaskForm from '../components/TaskForm';
import LiveBackground from '../components/LiveBackground';
import Toast from '../components/Toast';
import { getTasks, createTask, updateTask, deleteTask } from '../api/taskApi';

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('NEWEST');
  const [toast, setToast] = useState(null);
  const [chartRange, setChartRange] = useState(7);
  const [activeChartPoint, setActiveChartPoint] = useState(null);

  const searchInputRef = useRef(null);
  const toastTimerRef = useRef(null);
  const navigate = useNavigate();
  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('task_user') || '{}');
    } catch {
      return {};
    }
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  useEffect(() => () => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await getTasks();
      setTasks(data);
      setError('');
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('task_token');
        localStorage.removeItem('task_user');
        navigate('/login');
      } else {
        setError(
          err.response?.data?.message ||
          (err.code === 'ERR_NETWORK'
            ? 'Cannot connect to backend server. Make sure the backend is running on port 8080.'
            : 'Could not load tasks.')
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') {
        return;
      }

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setEditingTask(null);
        setShowForm(true);
      } else if (e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSaveTask = async (taskFormData) => {
    try {
      if (editingTask) {
        await updateTask(editingTask.id, taskFormData);
        showToast('Task updated successfully!', 'success');
      } else {
        await createTask(taskFormData);
        showToast('New task created!', 'success');
      }
      setShowForm(false);
      setEditingTask(null);
      setError('');
      await loadTasks();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save task.');
      showToast('Failed to save task', 'error');
    }
  };

  const handleDeleteTask = async (task) => {
    if (!window.confirm(`Delete "${task.title}"?`)) {
      return;
    }
    try {
      await deleteTask(task.id);
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
      showToast('Task deleted', 'info');
    } catch (err) {
      setError('Could not delete task.');
      showToast('Failed to delete task', 'error');
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      await updateTask(task.id, {
        title: task.title,
        description: task.description,
        status: newStatus,
        dueDate: task.dueDate,
      });
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
      );
      showToast(
        newStatus === 'DONE' ? 'Task completed! Great job! 🎉' : `Status updated to ${newStatus.replace('_', ' ')}`,
        'success'
      );
    } catch (err) {
      setError('Could not update task status.');
      showToast('Could not update status', 'error');
    }
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(tasks, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `tasks_export_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Exported tasks to JSON file', 'info');
  };

  const isTaskOverdue = (t) => {
    if (!t.dueDate || t.status === 'DONE') return false;
    const today = new Date().toISOString().slice(0, 10);
    return t.dueDate < today;
  };

  const totalCount = tasks.length;
  const todoCount = tasks.filter((t) => t.status === 'TODO').length;
  const inProgressCount = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const doneCount = tasks.filter((t) => t.status === 'DONE').length;
  const overdueCount = tasks.filter(isTaskOverdue).length;

  const completionRate = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  const chartData = Array.from({ length: chartRange }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (chartRange - 1 - index));
    const dateKey = date.toISOString().slice(0, 10);
    const created = tasks.filter((task) => task.createdAt?.slice(0, 10) === dateKey);
    const due = tasks.filter((task) => task.dueDate === dateKey);

    return {
      dateKey,
      label: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      created: created.length,
      completed: created.filter((task) => task.status === 'DONE').length,
      due: due.length,
    };
  });

  const chartMax = Math.max(
    1,
    ...chartData.flatMap((point) => [point.created, point.completed, point.due])
  );
  const chartWidth = 760;
  const chartHeight = 230;
  const chartPadding = { top: 24, right: 18, bottom: 34, left: 34 };
  const chartInnerWidth = chartWidth - chartPadding.left - chartPadding.right;
  const chartInnerHeight = chartHeight - chartPadding.top - chartPadding.bottom;
  const chartX = (index) =>
    chartPadding.left + (index / Math.max(chartData.length - 1, 1)) * chartInnerWidth;
  const chartY = (value) =>
    chartPadding.top + chartInnerHeight - (value / chartMax) * chartInnerHeight;
  const chartLine = (key) =>
    chartData
      .map((point, index) => `${chartX(index)},${chartY(point[key])}`)
      .join(' ');

  let filteredTasks = tasks.filter((t) => {
    if (statusFilter === 'OVERDUE') {
      if (!isTaskOverdue(t)) return false;
    } else if (statusFilter !== 'ALL') {
      if (t.status !== statusFilter) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = (t.description || '').toLowerCase().includes(q);
      return matchTitle || matchDesc;
    }

    return true;
  });

  filteredTasks.sort((a, b) => {
    if (sortBy === 'DUE_ASC') {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    } else if (sortBy === 'DUE_DESC') {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return b.dueDate.localeCompare(a.dueDate);
    } else if (sortBy === 'TITLE_ASC') {
      return a.title.localeCompare(b.title);
    } else {
      return (b.id || 0) - (a.id || 0);
    }
  });

  return (
    <div className="app-wrapper">
      <LiveBackground isDark={document.documentElement.getAttribute('data-theme') === 'dark'} />
      <Navbar
        user={user}
        onNewTask={() => {
          setEditingTask(null);
          setShowForm(true);
        }}
      />

      <main className="dashboard">
        <div className="heading">
          <div className="heading-text">
            <p className="kicker">WORKSPACE OVERVIEW</p>
            <h1>
              Good things take <em>focus.</em>
            </h1>
            <p className="muted">
              Organize your priorities, track progress, and conquer your day.
            </p>
          </div>
          <div className="heading-actions">
            <button
              type="button"
              className="btn secondary"
              onClick={handleExportJSON}
              title="Download tasks as JSON file"
            >
              📥 Export
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                setEditingTask(null);
                setShowForm(true);
              }}
            >
              ＋ New task <span style={{ opacity: 0.7, fontSize: 11 }}>(N)</span>
            </button>
          </div>
        </div>

        {error && <div className="error">⚠️ {error}</div>}

        {totalCount > 0 && (
          <div className="productivity-card">
            <div className="productivity-info">
              <div className="productivity-metric">{completionRate}%</div>
              <div className="productivity-labels">
                <small>Overall Completion</small>
                <span>
                  {doneCount} of {totalCount} tasks completed
                </span>
              </div>
            </div>
            <div className="progress-track" title={`${completionRate}% completed`}>
              <div
                className="progress-fill"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        )}

        <section className="stats">
          <div
            className="stat-panel stat-all"
            style={{ cursor: 'pointer' }}
            onClick={() => setStatusFilter('ALL')}
          >
            <small>All Tasks</small>
            <strong>{totalCount}</strong>
          </div>
          <div
            className="stat-panel stat-todo"
            style={{ cursor: 'pointer' }}
            onClick={() => setStatusFilter('TODO')}
          >
            <small>To Do</small>
            <strong>{todoCount}</strong>
          </div>
          <div
            className="stat-panel stat-progress"
            style={{ cursor: 'pointer' }}
            onClick={() => setStatusFilter('IN_PROGRESS')}
          >
            <small>In Progress</small>
            <strong>{inProgressCount}</strong>
          </div>
          <div
            className="stat-panel stat-done"
            style={{ cursor: 'pointer' }}
            onClick={() => setStatusFilter('DONE')}
          >
            <small>Completed</small>
            <strong>{doneCount}</strong>
          </div>
          <div
            className="stat-panel stat-overdue"
            style={{ cursor: 'pointer' }}
            onClick={() => setStatusFilter('OVERDUE')}
          >
            <small>Overdue</small>
            <strong style={{ color: overdueCount > 0 ? 'var(--danger)' : 'inherit' }}>
              {overdueCount}
            </strong>
          </div>
        </section>

        <section className="activity-card">
          <div className="activity-header">
            <div>
              <p className="kicker">TASK RHYTHM</p>
              <h2>Track your momentum</h2>
              <p className="muted">See how your routines and priorities move through each day.</p>
            </div>
            <div className="range-switcher" aria-label="Activity range">
              {[7, 14, 30].map((range) => (
                <button
                  type="button"
                  key={range}
                  className={chartRange === range ? 'active' : ''}
                  onClick={() => {
                    setChartRange(range);
                    setActiveChartPoint(null);
                  }}
                >
                  {range}d
                </button>
              ))}
            </div>
          </div>

          <div className="activity-legend">
            <span><i className="legend-dot created" />Created</span>
            <span><i className="legend-dot completed" />Completed</span>
            <span><i className="legend-dot due" />Scheduled</span>
          </div>

          <div className="activity-chart">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} role="img" aria-label="Task activity graph">
              {[0, 0.5, 1].map((step) => {
                const y = chartPadding.top + chartInnerHeight * step;
                return (
                  <line
                    key={step}
                    x1={chartPadding.left}
                    x2={chartWidth - chartPadding.right}
                    y1={y}
                    y2={y}
                    className="chart-grid-line"
                  />
                );
              })}
              <polyline points={chartLine('created')} className="chart-line created" />
              <polyline points={chartLine('completed')} className="chart-line completed" />
              <polyline points={chartLine('due')} className="chart-line due" />
              {chartData.map((point, index) => {
                const x = chartX(index);
                const isActive = activeChartPoint === index;
                return (
                  <g key={point.dateKey}>
                    <rect
                      x={x - 18}
                      y={chartPadding.top}
                      width="36"
                      height={chartInnerHeight}
                      className="chart-hit-area"
                      onMouseEnter={() => setActiveChartPoint(index)}
                      onMouseLeave={() => setActiveChartPoint(null)}
                    />
                    {['created', 'completed', 'due'].map((key) => (
                      <circle
                        key={key}
                        cx={x}
                        cy={chartY(point[key])}
                        r={isActive ? 5 : 3.5}
                        className={`chart-point ${key}`}
                      />
                    ))}
                    {(index === 0 || index === chartData.length - 1 || index % Math.ceil(chartData.length / 4) === 0) && (
                      <text x={x} y={chartHeight - 10} textAnchor="middle" className="chart-label">
                        {point.label}
                      </text>
                    )}
                    {isActive && (
                      <g className="chart-tooltip" pointerEvents="none">
                        <rect
                          x={Math.min(Math.max(x - 66, 4), chartWidth - 140)}
                          y="6"
                          width="132"
                          height="58"
                          rx="8"
                        />
                        <text x={Math.min(Math.max(x, 70), chartWidth - 70)} y="25" textAnchor="middle">
                          {point.label}
                        </text>
                        <text x={Math.min(Math.max(x, 70), chartWidth - 70)} y="43" textAnchor="middle">
                          {point.created} created · {point.completed} done
                        </text>
                        <text x={Math.min(Math.max(x, 70), chartWidth - 70)} y="57" textAnchor="middle">
                          {point.due} scheduled
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </section>

        <div className="content">
          <section className="panel">
            <div className="controls-bar">
              <div className="controls-row-top">
                <div className="search-box">
                  <span className="search-icon">🔍</span>
                  <input
                    ref={searchInputRef}
                    type="text"
                    className="search-input"
                    placeholder="Search tasks by title or notes…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <span className="kbd-shortcut">/</span>
                </div>

                <div className="controls-right-actions">
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>
                    Sort by:
                  </label>
                  <select
                    aria-label="Sort tasks"
                    className="sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="NEWEST">Newest first</option>
                    <option value="DUE_ASC">Due date (Earliest)</option>
                    <option value="DUE_DESC">Due date (Latest)</option>
                    <option value="TITLE_ASC">Title (A to Z)</option>
                  </select>
                </div>
              </div>

              <div className="filter-tabs">
                <button
                  type="button"
                  className={`filter-tab ${statusFilter === 'ALL' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('ALL')}
                >
                  All <span className="filter-count">{totalCount}</span>
                </button>
                <button
                  type="button"
                  className={`filter-tab ${statusFilter === 'TODO' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('TODO')}
                >
                  To do <span className="filter-count">{todoCount}</span>
                </button>
                <button
                  type="button"
                  className={`filter-tab ${statusFilter === 'IN_PROGRESS' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('IN_PROGRESS')}
                >
                  In progress <span className="filter-count">{inProgressCount}</span>
                </button>
                <button
                  type="button"
                  className={`filter-tab ${statusFilter === 'DONE' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('DONE')}
                >
                  Completed <span className="filter-count">{doneCount}</span>
                </button>
                {overdueCount > 0 && (
                  <button
                    type="button"
                    className={`filter-tab ${statusFilter === 'OVERDUE' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('OVERDUE')}
                    style={{ color: 'var(--danger)' }}
                  >
                    ⚠️ Overdue <span className="filter-count">{overdueCount}</span>
                  </button>
                )}
              </div>
            </div>

            {loading ? (
              <div className="empty">
                <p>Loading your tasks…</p>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="empty">
                <span className="empty-icon">✨</span>
                <h3>
                  {searchQuery || statusFilter !== 'ALL'
                    ? 'No matching tasks found'
                    : 'A clean slate for great work'}
                </h3>
                <p>
                  {searchQuery || statusFilter !== 'ALL'
                    ? 'Try adjusting your search query or switching the status filter.'
                    : 'Get started by creating your first task. Every great journey starts with a single step.'}
                </p>
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('ALL');
                    setEditingTask(null);
                    setShowForm(true);
                  }}
                >
                  ＋ Add a task
                </button>
              </div>
            ) : (
              filteredTasks.map((t) => (
                <TaskItem
                  key={t.id}
                  task={t}
                  onStatusChange={handleStatusChange}
                  onEdit={(taskToEdit) => {
                    setEditingTask(taskToEdit);
                    setShowForm(true);
                  }}
                  onDelete={handleDeleteTask}
                />
              ))
            )}
          </section>

          {showForm && (
            <TaskForm
              task={editingTask}
              onSave={handleSaveTask}
              onCancel={() => {
                setShowForm(false);
                setEditingTask(null);
              }}
            />
          )}
        </div>

        <footer>
          <span>TaskFlow · Plan your day with intention</span>
          <span>Keep focused. Make steady progress.</span>
        </footer>
      </main>

      <div className="toast-container">
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
}
