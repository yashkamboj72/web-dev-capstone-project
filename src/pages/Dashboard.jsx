import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { format, isToday, isTomorrow, isPast } from 'date-fns'

function StatCard({ label, value, icon, color, sub }) {
  return (
    <div className="fade-in" style={{ background: 'var(--card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: '20px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: color }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
          <p style={{ fontSize: 32, fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text)', marginTop: 4 }}>{value}</p>
          {sub && <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>{sub}</p>}
        </div>
        <span style={{ fontSize: 28, opacity: 0.7 }}>{icon}</span>
      </div>
    </div>
  )
}

function TaskItem({ task }) {
  const due = new Date(task.dueDate)
  const overdue = isPast(due) && task.status !== 'done'
  const dueTxt = isToday(due) ? 'Today' : isTomorrow(due) ? 'Tomorrow' : format(due, 'MMM d')
  const priorityColors = { high: 'var(--red)', medium: 'var(--yellow)', low: 'var(--green)' }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: priorityColors[task.priority], flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</p>
        <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{task.subject}</p>
      </div>
      <span style={{ fontSize: 11, color: overdue ? 'var(--red)' : 'var(--text3)', fontWeight: overdue ? 600 : 400, flexShrink: 0 }}>{dueTxt}</span>
    </div>
  )
}

export default function Dashboard() {
  const notes = useSelector(s => s.notes.items)
  const tasks = useSelector(s => s.tasks.items)

  const stats = useMemo(() => {
    const done = tasks.filter(t => t.status === 'done').length
    const pending = tasks.filter(t => t.status !== 'done').length
    const overdue = tasks.filter(t => t.status !== 'done' && isPast(new Date(t.dueDate))).length
    const todayDue = tasks.filter(t => t.status !== 'done' && isToday(new Date(t.dueDate))).length
    const subjects = [...new Set(notes.map(n => n.subject))]
    return { done, pending, overdue, todayDue, subjects: subjects.length }
  }, [notes, tasks])

  const upcomingTasks = useMemo(() =>
    tasks.filter(t => t.status !== 'done').sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).slice(0, 5)
  , [tasks])

  const recentNotes = useMemo(() =>
    [...notes].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 4)
  , [notes])

  const subjectStats = useMemo(() => {
    const map = {}
    tasks.forEach(t => { if (!map[t.subject]) map[t.subject] = { total: 0, done: 0 }; map[t.subject].total++; if (t.status === 'done') map[t.subject].done++ })
    return Object.entries(map).map(([name, v]) => ({ name, ...v, pct: Math.round((v.done / v.total) * 100) })).sort((a, b) => b.total - a.total).slice(0, 5)
  }, [tasks])

  const completion = tasks.length ? Math.round((stats.done / tasks.length) * 100) : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Welcome */}
      <div style={{ background: 'linear-gradient(135deg, rgba(124,106,247,0.2), rgba(244,114,182,0.1))', border: '1px solid rgba(124,106,247,0.3)', borderRadius: 'var(--radius)', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: 'var(--text)' }}>Welcome back, Student! 👋</h2>
          <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 6 }}>
            {stats.todayDue > 0 ? `You have ${stats.todayDue} task${stats.todayDue > 1 ? 's' : ''} due today.` : 'No tasks due today — great work!'}
            {stats.overdue > 0 && ` ${stats.overdue} task${stats.overdue > 1 ? 's are' : ' is'} overdue.`}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 36, fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--accent)' }}>{completion}%</div>
          <div style={{ fontSize: 12, color: 'var(--text3)' }}>Overall completion</div>
          <div style={{ marginTop: 8, width: 120, height: 6, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ width: `${completion}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent), var(--green))', borderRadius: 99, transition: 'width 1s ease' }} />
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        <StatCard label="Total Notes" value={notes.length} icon="◈" color="var(--accent)" sub={`${stats.subjects} subjects`} />
        <StatCard label="Tasks Done" value={stats.done} icon="✓" color="var(--green)" sub={`of ${tasks.length} total`} />
        <StatCard label="Pending" value={stats.pending} icon="◻" color="var(--yellow)" sub="tasks remaining" />
        <StatCard label="Overdue" value={stats.overdue} icon="⚠" color="var(--red)" sub={stats.overdue > 0 ? 'needs attention!' : 'all on track'} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Upcoming Tasks */}
        <div style={{ background: 'var(--card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>Upcoming Tasks</h3>
            <Link to="/tasks" style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 500 }}>View all →</Link>
          </div>
          {upcomingTasks.length === 0 ? (
            <p style={{ color: 'var(--text3)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No pending tasks 🎉</p>
          ) : (
            upcomingTasks.map(t => <TaskItem key={t.id} task={t} />)
          )}
        </div>

        {/* Recent Notes */}
        <div style={{ background: 'var(--card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>Recent Notes</h3>
            <Link to="/notes" style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 500 }}>View all →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recentNotes.map(note => (
              <Link to="/notes" key={note.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px', borderRadius: 'var(--radius2)', background: 'var(--bg2)', border: '1px solid var(--border)', transition: 'all var(--transition)' }}>
                <div style={{ width: 6, height: 36, borderRadius: 99, background: note.color, flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{note.title}</p>
                  <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{note.subject}</p>
                </div>
                {note.pinned && <span style={{ marginLeft: 'auto', fontSize: 12 }}>📌</span>}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Subject Progress */}
      <div style={{ background: 'var(--card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: 20 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Subject Progress</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {subjectStats.map(s => (
            <div key={s.name}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{s.name}</span>
                <span style={{ fontSize: 12, color: 'var(--text3)' }}>{s.done}/{s.total} tasks · {s.pct}%</span>
              </div>
              <div style={{ height: 6, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ width: `${s.pct}%`, height: '100%', background: s.pct === 100 ? 'var(--green)' : s.pct > 50 ? 'var(--accent)' : 'var(--yellow)', borderRadius: 99, transition: 'width 1s ease' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
