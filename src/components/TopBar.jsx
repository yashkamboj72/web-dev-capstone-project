import { useDispatch, useSelector } from 'react-redux'
import { toggleTheme } from '../store/uiSlice.js'
import { useLocation } from 'react-router-dom'

const PAGE_TITLES = {
  '/dashboard': { title: 'Dashboard', sub: 'Your study overview' },
  '/notes': { title: 'Notes', sub: 'Organize your knowledge' },
  '/tasks': { title: 'Tasks', sub: 'Track your assignments' },
  '/analytics': { title: 'Analytics', sub: 'Visualize your progress' },
}

export default function TopBar() {
  const dispatch = useDispatch()
  const theme = useSelector(s => s.ui.theme)
  const location = useLocation()
  const { title, sub } = PAGE_TITLES[location.pathname] || { title: 'StudyFlow', sub: '' }
  const tasks = useSelector(s => s.tasks.items)
  const overdue = tasks.filter(t => t.status !== 'done' && new Date(t.dueDate) < new Date()).length

  return (
    <header style={{
      padding: '16px 24px',
      borderBottom: '1px solid var(--border)',
      background: 'var(--bg2)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      position: 'sticky', top: 0, zIndex: 50,
    }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: 'var(--text)', lineHeight: 1.2 }}>{title}</h1>
        <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{sub}</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {overdue > 0 && (
          <div style={{ padding: '6px 12px', borderRadius: 99, background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.3)', fontSize: 12, color: 'var(--red)', fontWeight: 600 }}>
            ⚠ {overdue} overdue
          </div>
        )}
        <button onClick={() => dispatch(toggleTheme())} style={{
          width: 38, height: 38, borderRadius: 10,
          background: 'var(--card)', border: '1px solid var(--border)',
          color: 'var(--text)', fontSize: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all var(--transition)',
        }}>
          {theme === 'dark' ? '☀' : '◑'}
        </button>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, var(--accent), var(--pink))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-display)' }}>
          S
        </div>
      </div>
    </header>
  )
}
