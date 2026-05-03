import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useEffect, lazy, Suspense } from 'react'
import Sidebar from './components/Sidebar.jsx'
import TopBar from './components/TopBar.jsx'
import LoadingSpinner from './components/LoadingSpinner.jsx'

const Dashboard = lazy(() => import('./pages/Dashboard.jsx'))
const Notes = lazy(() => import('./pages/Notes.jsx'))
const Tasks = lazy(() => import('./pages/Tasks.jsx'))
const Analytics = lazy(() => import('./pages/Analytics.jsx'))

export default function App() {
  const theme = useSelector(s => s.ui.theme)
  const sidebarOpen = useSelector(s => s.ui.sidebarOpen)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar />
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        marginLeft: sidebarOpen ? '260px' : '72px',
        transition: 'margin-left 0.3s ease',
        minHeight: '100vh',
      }}>
        <TopBar />
        <main style={{ flex: 1, padding: '24px', maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/notes" element={<Notes />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/analytics" element={<Analytics />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  )
}
