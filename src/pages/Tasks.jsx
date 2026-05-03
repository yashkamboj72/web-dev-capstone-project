import { useState, useCallback, memo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { addTask, updateTask, deleteTask, setTaskStatus, setFilterStatus, setFilterPriority, setTaskFilterSubject, setTaskSearch, setTaskSortBy, selectFilteredTasks } from '../store/tasksSlice.js'
import { SUBJECTS_LIST } from '../store/notesSlice.js'
import { useDebounce } from '../hooks/useDebounce.js'
import { format, isPast, isToday, isTomorrow } from 'date-fns'

const PRIORITIES = ['high', 'medium', 'low']
const STATUSES = [
  { key: 'todo', label: 'To Do', color: 'var(--text3)', bg: 'rgba(150,150,180,0.1)' },
  { key: 'in-progress', label: 'In Progress', color: 'var(--yellow)', bg: 'rgba(251,191,36,0.1)' },
  { key: 'done', label: 'Done', color: 'var(--green)', bg: 'rgba(52,211,153,0.1)' },
]
const PRIORITY_COLORS = { high: 'var(--red)', medium: 'var(--yellow)', low: 'var(--green)' }
const PRIORITY_BG = { high: 'rgba(248,113,113,0.1)', medium: 'rgba(251,191,36,0.1)', low: 'rgba(52,211,153,0.1)' }
const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'var(--font-body)' }

function dueDateLabel(dateStr, isDone) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const overdue = isPast(d) && !isDone
  if (isToday(d)) return { label: 'Today', color: overdue ? 'var(--red)' : 'var(--yellow)' }
  if (isTomorrow(d)) return { label: 'Tomorrow', color: 'var(--text2)' }
  if (overdue) return { label: format(d, 'MMM d') + ' ⚠', color: 'var(--red)' }
  return { label: format(d, 'MMM d'), color: 'var(--text3)' }
}

const TaskCard = memo(function TaskCard({ task, onEdit, onDelete, onStatus }) {
  const due = dueDateLabel(task.dueDate, task.status === 'done')
  const status = STATUSES.find(s => s.key === task.status)

  return (
    <div className="fade-in" style={{ background: 'var(--card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: '16px', display: 'flex', flexDirection: 'column', gap: 10, transition: 'all var(--transition)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: task.status === 'done' ? 'var(--text3)' : 'var(--text)', textDecoration: task.status === 'done' ? 'line-through' : 'none', lineHeight: 1.3, flex: 1 }}>{task.title}</h3>
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          <button onClick={() => onEdit(task)} style={{ background: 'none', color: 'var(--text3)', fontSize: 13 }}>✎</button>
          <button onClick={() => onDelete(task.id)} style={{ background: 'none', color: 'var(--text3)', fontSize: 13 }}>✕</button>
        </div>
      </div>
      {task.description && <p style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{task.description}</p>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 99, background: PRIORITY_BG[task.priority], color: PRIORITY_COLORS[task.priority], fontWeight: 600 }}>{task.priority}</span>
        <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 99, background: 'var(--bg2)', color: 'var(--text3)' }}>{task.subject}</span>
        {due.label && <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 99, background: 'var(--bg2)', color: due.color, fontWeight: 500 }}>📅 {due.label}</span>}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {STATUSES.map(s => (
          <button key={s.key} onClick={() => onStatus(task.id, s.key)} style={{ flex: 1, padding: '6px 4px', borderRadius: 'var(--radius3)', fontSize: 11, fontWeight: 500, background: task.status === s.key ? s.bg : 'var(--bg2)', color: task.status === s.key ? s.color : 'var(--text3)', border: task.status === s.key ? `1px solid ${s.color}40` : '1px solid var(--border)', transition: 'all var(--transition)' }}>
            {s.label}
          </button>
        ))}
      </div>
    </div>
  )
})

function TaskModal({ task, onClose, onSave }) {
  const [form, setForm] = useState(task || { title: '', description: '', subject: 'Mathematics', priority: 'medium', dueDate: '', tags: [] })
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={e => e.stopPropagation()} className="fade-in" style={{ background: 'var(--card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', width: '100%', maxWidth: 480 }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 }}>{task ? 'Edit Task' : 'New Task'}</h2>
          <button onClick={onClose} style={{ background: 'none', color: 'var(--text2)', fontSize: 20 }}>✕</button>
        </div>
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input value={form.title} onChange={e => f('title', e.target.value)} placeholder="Task title..." style={inputStyle} />
          <textarea value={form.description} onChange={e => f('description', e.target.value)} placeholder="Description (optional)..." rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <select value={form.subject} onChange={e => f('subject', e.target.value)} style={inputStyle}>
              {SUBJECTS_LIST.map(s => <option key={s}>{s}</option>)}
            </select>
            <select value={form.priority} onChange={e => f('priority', e.target.value)} style={inputStyle}>
              {PRIORITIES.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 6, display: 'block' }}>Due Date</label>
            <input type="date" value={form.dueDate ? form.dueDate.split('T')[0] : ''} onChange={e => f('dueDate', e.target.value ? new Date(e.target.value).toISOString() : '')} style={{ ...inputStyle, colorScheme: 'dark' }} />
          </div>
        </div>
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '10px 20px', borderRadius: 'var(--radius2)', background: 'var(--bg2)', color: 'var(--text2)', fontSize: 13 }}>Cancel</button>
          <button onClick={() => { if (form.title.trim()) onSave(form) }} style={{ padding: '10px 24px', borderRadius: 'var(--radius2)', background: 'linear-gradient(135deg, var(--accent), var(--green))', color: '#fff', fontSize: 13, fontWeight: 600 }}>
            {task ? 'Update' : 'Add Task'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Tasks() {
  const dispatch = useDispatch()
  const [modal, setModal] = useState(null)
  const [searchVal, setSearchVal] = useState('')
  const debouncedSearch = useDebounce(searchVal, 300)
  const filterStatus = useSelector(s => s.tasks.filterStatus)
  const filterPriority = useSelector(s => s.tasks.filterPriority)
  const filterSubject = useSelector(s => s.tasks.filterSubject)
  const sortBy = useSelector(s => s.tasks.sortBy)
  const tasks = useSelector(selectFilteredTasks)

  const handleSearch = useCallback(v => { setSearchVal(v); dispatch(setTaskSearch(v)) }, [dispatch])

  function handleSave(form) {
    if (modal && modal.id) dispatch(updateTask({ ...form, id: modal.id }))
    else dispatch(addTask(form))
    setModal(null)
  }

  const counts = { total: tasks.length, todo: tasks.filter(t => t.status === 'todo').length, inProgress: tasks.filter(t => t.status === 'in-progress').length, done: tasks.filter(t => t.status === 'done').length }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Status tabs */}
      <div style={{ display: 'flex', gap: 8, background: 'var(--card)', padding: 6, borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
        {[{ key: 'all', label: `All (${counts.total})` }, { key: 'todo', label: `To Do (${counts.todo})` }, { key: 'in-progress', label: `In Progress (${counts.inProgress})` }, { key: 'done', label: `Done (${counts.done})` }].map(s => (
          <button key={s.key} onClick={() => dispatch(setFilterStatus(s.key))} style={{ flex: 1, padding: '8px 12px', borderRadius: 'var(--radius2)', fontSize: 13, fontWeight: filterStatus === s.key ? 600 : 400, background: filterStatus === s.key ? 'var(--accent)' : 'transparent', color: filterStatus === s.key ? '#fff' : 'var(--text2)', transition: 'all var(--transition)' }}>
            {s.label}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <input value={searchVal} onChange={e => handleSearch(e.target.value)} placeholder="🔍 Search tasks..." style={{ ...inputStyle, flex: 1, minWidth: 180 }} />
        <select value={filterPriority} onChange={e => dispatch(setFilterPriority(e.target.value))} style={{ ...inputStyle, width: 'auto' }}>
          <option value="all">All Priorities</option>
          {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
        </select>
        <select value={filterSubject} onChange={e => dispatch(setTaskFilterSubject(e.target.value))} style={{ ...inputStyle, width: 'auto' }}>
          <option value="All">All Subjects</option>
          {SUBJECTS_LIST.map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={sortBy} onChange={e => dispatch(setTaskSortBy(e.target.value))} style={{ ...inputStyle, width: 'auto' }}>
          <option value="dueDate">Sort by Due Date</option>
          <option value="priority">Sort by Priority</option>
          <option value="createdAt">Sort by Created</option>
        </select>
        <button onClick={() => setModal('add')} style={{ padding: '10px 20px', borderRadius: 'var(--radius2)', background: 'linear-gradient(135deg, var(--accent), var(--green))', color: '#fff', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
          + New Task
        </button>
      </div>

      {/* Grid */}
      {tasks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text3)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>◻</div>
          <p style={{ fontSize: 15, fontWeight: 500 }}>No tasks found</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
          {tasks.map((task, i) => (
            <div key={task.id} style={{ animationDelay: `${i * 0.04}s` }}>
              <TaskCard task={task} onEdit={t => setModal(t)} onDelete={id => dispatch(deleteTask(id))} onStatus={(id, s) => dispatch(setTaskStatus({ id, status: s }))} />
            </div>
          ))}
        </div>
      )}

      {modal && <TaskModal task={modal === 'add' ? null : modal} onClose={() => setModal(null)} onSave={handleSave} />}
    </div>
  )
}
