import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from 'recharts'
import { format, subDays, startOfDay } from 'date-fns'

const COLORS = ['#7c6af7', '#34d399', '#f472b6', '#fbbf24', '#22d3ee', '#fb923c', '#f87171', '#a78bfa']

function ChartCard({ title, children, style }) {
  return (
    <div className="fade-in" style={{ background: 'var(--card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: '20px', ...style }}>
      <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 20, color: 'var(--text)' }}>{title}</h3>
      {children}
    </div>
  )
}

const customTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--card2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
      {label && <p style={{ color: 'var(--text3)', marginBottom: 4, fontWeight: 500 }}>{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || 'var(--text)' }}>{p.name}: <strong>{p.value}</strong></p>
      ))}
    </div>
  )
}

export default function Analytics() {
  const notes = useSelector(s => s.notes.items)
  const tasks = useSelector(s => s.tasks.items)

  const subjectTaskData = useMemo(() => {
    const map = {}
    tasks.forEach(t => {
      if (!map[t.subject]) map[t.subject] = { subject: t.subject, todo: 0, 'in-progress': 0, done: 0, total: 0 }
      map[t.subject][t.status]++
      map[t.subject].total++
    })
    return Object.values(map).sort((a, b) => b.total - a.total).slice(0, 7)
  }, [tasks])

  const subjectNoteData = useMemo(() => {
    const map = {}
    notes.forEach(n => { map[n.subject] = (map[n.subject] || 0) + 1 })
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
  }, [notes])

  const priorityData = useMemo(() => {
    const map = { high: 0, medium: 0, low: 0 }
    tasks.forEach(t => map[t.priority]++)
    return [{ name: 'High', value: map.high, color: '#f87171' }, { name: 'Medium', value: map.medium, color: '#fbbf24' }, { name: 'Low', value: map.low, color: '#34d399' }]
  }, [tasks])

  const activityData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = subDays(new Date(), 6 - i)
      const dayStart = startOfDay(d).toISOString()
      const dayEnd = new Date(startOfDay(d).getTime() + 86400000).toISOString()
      const notesCreated = notes.filter(n => n.createdAt >= dayStart && n.createdAt < dayEnd).length
      const tasksDone = tasks.filter(t => t.status === 'done' && t.createdAt >= dayStart && t.createdAt < dayEnd).length
      return { day: format(d, 'EEE'), notes: notesCreated, tasks: tasksDone }
    })
    return days
  }, [notes, tasks])

  const stats = useMemo(() => {
    const done = tasks.filter(t => t.status === 'done').length
    const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0
    const highOverdue = tasks.filter(t => t.priority === 'high' && t.status !== 'done' && new Date(t.dueDate) < new Date()).length
    const pinnedNotes = notes.filter(n => n.pinned).length
    return { done, pct, highOverdue, pinnedNotes, totalSubjects: [...new Set(notes.map(n => n.subject))].length }
  }, [tasks, notes])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Summary row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14 }}>
        {[
          { label: 'Completion Rate', val: `${stats.pct}%`, color: 'var(--accent)' },
          { label: 'Tasks Completed', val: stats.done, color: 'var(--green)' },
          { label: 'High Priority Overdue', val: stats.highOverdue, color: 'var(--red)' },
          { label: 'Pinned Notes', val: stats.pinnedNotes, color: 'var(--yellow)' },
          { label: 'Subjects Covered', val: stats.totalSubjects, color: 'var(--cyan)' },
        ].map(s => (
          <div key={s.label} className="fade-in" style={{ background: 'var(--card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: '18px 16px', borderTop: `3px solid ${s.color}` }}>
            <p style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{s.label}</p>
            <p style={{ fontSize: 28, fontFamily: 'var(--font-display)', fontWeight: 800, color: s.color }}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Weekly Activity */}
      <ChartCard title="Weekly Activity">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={activityData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="day" tick={{ fill: 'var(--text3)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--text3)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip content={customTooltip} />
            <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text2)' }} />
            <Line type="monotone" dataKey="notes" name="Notes" stroke="#7c6af7" strokeWidth={2} dot={{ fill: '#7c6af7', r: 4 }} />
            <Line type="monotone" dataKey="tasks" name="Tasks Done" stroke="#34d399" strokeWidth={2} dot={{ fill: '#34d399', r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        {/* Task by Subject */}
        <ChartCard title="Tasks by Subject">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={subjectTaskData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="subject" tick={{ fill: 'var(--text3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={customTooltip} />
              <Bar dataKey="todo" name="To Do" fill="var(--text3)" radius={[2, 2, 0, 0]} />
              <Bar dataKey="in-progress" name="In Progress" fill="#fbbf24" radius={[2, 2, 0, 0]} />
              <Bar dataKey="done" name="Done" fill="#34d399" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Priority Pie */}
        <ChartCard title="Task Priority">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={priorityData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                {priorityData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip content={customTooltip} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: 8 }}>
            {priorityData.map(p => (
              <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: p.color }} />
                <span style={{ fontSize: 11, color: 'var(--text3)' }}>{p.name} ({p.value})</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Notes by Subject */}
      <ChartCard title="Notes Distribution by Subject">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={subjectNoteData} layout="vertical" margin={{ top: 0, right: 20, left: 30, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
            <XAxis type="number" tick={{ fill: 'var(--text3)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fill: 'var(--text2)', fontSize: 12 }} axisLine={false} tickLine={false} width={100} />
            <Tooltip content={customTooltip} />
            <Bar dataKey="value" name="Notes" radius={[0, 4, 4, 0]}>
              {subjectNoteData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}
