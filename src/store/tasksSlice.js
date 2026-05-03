import { createSlice } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid'

const sampleTasks = [
  { id: uuidv4(), title: 'Complete Calculus Assignment', description: 'Solve problems from Chapter 4 - Integration by parts', subject: 'Mathematics', priority: 'high', status: 'in-progress', dueDate: new Date(Date.now() + 86400000 * 2).toISOString(), createdAt: new Date(Date.now() - 86400000).toISOString(), tags: ['homework', 'calculus'] },
  { id: uuidv4(), title: 'Physics Lab Report', description: 'Write report on pendulum experiment with data analysis', subject: 'Physics', priority: 'high', status: 'todo', dueDate: new Date(Date.now() + 86400000 * 1).toISOString(), createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), tags: ['lab', 'report'] },
  { id: uuidv4(), title: 'Read CS Chapter 7', description: 'Graph algorithms: BFS, DFS, Dijkstra\'s', subject: 'Computer Science', priority: 'medium', status: 'todo', dueDate: new Date(Date.now() + 86400000 * 4).toISOString(), createdAt: new Date(Date.now() - 86400000).toISOString(), tags: ['reading', 'graphs'] },
  { id: uuidv4(), title: 'Chemistry Quiz Prep', description: 'Review organic reactions and mechanisms', subject: 'Chemistry', priority: 'medium', status: 'in-progress', dueDate: new Date(Date.now() + 86400000 * 3).toISOString(), createdAt: new Date(Date.now() - 3600000 * 5).toISOString(), tags: ['quiz', 'organic'] },
  { id: uuidv4(), title: 'English Essay Draft', description: 'Write first draft of comparative literature essay', subject: 'English', priority: 'low', status: 'done', dueDate: new Date(Date.now() - 86400000).toISOString(), createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), tags: ['essay', 'writing'] },
  { id: uuidv4(), title: 'Biology Flashcards', description: 'Create flashcards for cell biology terminology', subject: 'Biology', priority: 'low', status: 'done', dueDate: new Date(Date.now() + 86400000 * 7).toISOString(), createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), tags: ['flashcards', 'revision'] },
]

function loadFromStorage() {
  try {
    const data = localStorage.getItem('studyflow_tasks')
    return data ? JSON.parse(data) : sampleTasks
  } catch { return sampleTasks }
}

function saveToStorage(tasks) {
  try { localStorage.setItem('studyflow_tasks', JSON.stringify(tasks)) } catch {}
}

const initialState = {
  items: loadFromStorage(),
  filterStatus: 'all',
  filterPriority: 'all',
  filterSubject: 'All',
  searchQuery: '',
  sortBy: 'dueDate',
}

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    addTask(state, action) {
      const task = { id: uuidv4(), ...action.payload, status: 'todo', createdAt: new Date().toISOString() }
      state.items.unshift(task)
      saveToStorage(state.items)
    },
    updateTask(state, action) {
      const idx = state.items.findIndex(t => t.id === action.payload.id)
      if (idx !== -1) state.items[idx] = { ...state.items[idx], ...action.payload }
      saveToStorage(state.items)
    },
    deleteTask(state, action) {
      state.items = state.items.filter(t => t.id !== action.payload)
      saveToStorage(state.items)
    },
    setTaskStatus(state, action) {
      const { id, status } = action.payload
      const task = state.items.find(t => t.id === id)
      if (task) task.status = status
      saveToStorage(state.items)
    },
    setFilterStatus(state, action) { state.filterStatus = action.payload },
    setFilterPriority(state, action) { state.filterPriority = action.payload },
    setTaskFilterSubject(state, action) { state.filterSubject = action.payload },
    setTaskSearch(state, action) { state.searchQuery = action.payload },
    setTaskSortBy(state, action) { state.sortBy = action.payload },
  }
})

export const { addTask, updateTask, deleteTask, setTaskStatus, setFilterStatus, setFilterPriority, setTaskFilterSubject, setTaskSearch, setTaskSortBy } = tasksSlice.actions

export const selectFilteredTasks = (state) => {
  let tasks = [...state.tasks.items]
  const q = state.tasks.searchQuery.toLowerCase()
  if (q) tasks = tasks.filter(t => t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q))
  if (state.tasks.filterStatus !== 'all') tasks = tasks.filter(t => t.status === state.tasks.filterStatus)
  if (state.tasks.filterPriority !== 'all') tasks = tasks.filter(t => t.priority === state.tasks.filterPriority)
  if (state.tasks.filterSubject !== 'All') tasks = tasks.filter(t => t.subject === state.tasks.filterSubject)
  tasks.sort((a, b) => {
    if (state.tasks.sortBy === 'dueDate') return new Date(a.dueDate) - new Date(b.dueDate)
    if (state.tasks.sortBy === 'priority') { const p = { high: 0, medium: 1, low: 2 }; return p[a.priority] - p[b.priority] }
    return new Date(b.createdAt) - new Date(a.createdAt)
  })
  return tasks
}

export default tasksSlice.reducer
