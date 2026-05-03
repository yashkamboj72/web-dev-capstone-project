import { NavLink, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { toggleSidebar } from '../store/uiSlice.js'

const NAV = [
  { to: '/dashboard', icon: '⬡', label: 'Dashboard' },
  { to: '/notes', icon: '◈', label: 'Notes' },
  { to: '/tasks', icon: '◻', label: 'Tasks' },
  { to: '/analytics', icon: '◉', label: 'Analytics' },
]

export default function Sidebar() {
  const open = useSelector(s => s.ui.sidebarOpen)
  const dispatch = useDispatch()
  const notes = useSelector(s => s.notes.items)
  const tasks = useSelector(s => s.tasks.items)
  const pending = tasks.filter(t => t.status !== 'done').length

  return (
    <aside style={{
      position: 'fixed', left: 0, top: 0, bottom: 0,
      width: open ? '260px' : '72px',
      background: 'var(--bg2)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      transition: 'width 0.3s ease',
      zIndex: 100,
      overflow: 'hidden',
    }}>
      {/* Logo */}
      <div style={{ padding: open ? '24px 20px 20px' : '24px 16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px', justifyContent: open ? 'flex-start' : 'center' }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, var(--accent), var(--pink))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>✦</div>
        {open && <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: 'var(--text)' }}>StudyFlow</div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 1 }}>Smart Study Manager</div>
        </div>}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {NAV.map(({ to, icon, label }) => (
          <NavLink key={to} to={to} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 12,
            padding: open ? '11px 14px' : '11px',
            borderRadius: 'var(--radius2)',
            justifyContent: open ? 'flex-start' : 'center',
            color: isActive ? 'var(--accent3)' : 'var(--text2)',
            background: isActive ? 'rgba(124,106,247,0.15)' : 'transparent',
            border: isActive ? '1px solid rgba(124,106,247,0.25)' : '1px solid transparent',
            fontSize: 13, fontWeight: isActive ? 600 : 400,
            transition: 'all var(--transition)',
            textDecoration: 'none',
          })}>
            <span style={{ fontSize: 18, lineHeight: 1, flexShrink: 0 }}>{icon}</span>
            {open && <span>{label}</span>}
            {open && label === 'Tasks' && pending > 0 && (
              <span style={{ marginLeft: 'auto', background: 'var(--accent)', color: '#fff', borderRadius: 99, fontSize: 10, fontWeight: 700, padding: '2px 7px' }}>{pending}</span>
            )}
            {open && label === 'Notes' && (
              <span style={{ marginLeft: 'auto', color: 'var(--text3)', fontSize: 11 }}>{notes.length}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border)' }}>
        <button onClick={() => dispatch(toggleSidebar())} style={{
          width: '100%', padding: '10px', borderRadius: 'var(--radius2)',
          background: 'var(--card)', color: 'var(--text2)',
          fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: open ? 'flex-start' : 'center', gap: 10,
          transition: 'all var(--transition)',
        }}>
          <span>{open ? '◂' : '▸'}</span>
          {open && <span style={{ fontSize: 12 }}>Collapse</span>}
        </button>
      </div>
    </aside>
  )
}
