import { createSlice } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid'

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'English', 'History', 'Economics']
const COLORS = ['#7c6af7', '#34d399', '#f472b6', '#fbbf24', '#22d3ee', '#fb923c', '#f87171', '#a78bfa']

const sampleNotes = [
  { id: uuidv4(), title: 'Introduction to Calculus', content: 'Calculus is the mathematical study of continuous change. Key concepts:\n\n• Derivatives: Rate of change of a function\n• Integrals: Area under a curve\n• Limits: Behavior of functions as they approach a value\n\nThe Fundamental Theorem of Calculus connects derivatives and integrals.', subject: 'Mathematics', color: '#7c6af7', tags: ['calculus', 'derivatives', 'integrals'], pinned: true, createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: uuidv4(), title: "Newton's Laws of Motion", content: "Newton's three laws:\n\n1. An object at rest stays at rest unless acted upon by a force\n2. F = ma (Force = mass × acceleration)\n3. For every action, there is an equal and opposite reaction\n\nApplications: Rocket propulsion, car braking, sports physics.", subject: 'Physics', color: '#22d3ee', tags: ['newton', 'forces', 'motion'], pinned: false, createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: uuidv4(), title: 'Organic Chemistry Basics', content: 'Organic chemistry studies carbon compounds.\n\nKey functional groups:\n• Alcohols (-OH)\n• Carboxylic acids (-COOH)\n• Aldehydes (-CHO)\n• Ketones (C=O)\n\nIsomerism: Same molecular formula, different structures.', subject: 'Chemistry', color: '#34d399', tags: ['organic', 'functional groups'], pinned: false, createdAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: new Date(Date.now() - 86400000).toISOString() },
  { id: uuidv4(), title: 'Data Structures Overview', content: 'Core data structures every CS student must know:\n\n• Arrays: Fixed-size, O(1) access\n• Linked Lists: Dynamic, O(n) access\n• Stacks: LIFO principle\n• Queues: FIFO principle\n• Trees: Hierarchical, binary search tree\n• Hash Maps: O(1) average lookup\n• Graphs: Vertices and edges', subject: 'Computer Science', color: '#f472b6', tags: ['DSA', 'arrays', 'trees', 'graphs'], pinned: true, createdAt: new Date(Date.now() - 3600000).toISOString(), updatedAt: new Date(Date.now() - 3600000).toISOString() },
]

function loadFromStorage() {
  try {
    const data = localStorage.getItem('studyflow_notes')
    return data ? JSON.parse(data) : sampleNotes
  } catch { return sampleNotes }
}

function saveToStorage(notes) {
  try { localStorage.setItem('studyflow_notes', JSON.stringify(notes)) } catch {}
}

const initialState = {
  items: loadFromStorage(),
  searchQuery: '',
  filterSubject: 'All',
  sortBy: 'updatedAt',
}

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    addNote(state, action) {
      const note = { id: uuidv4(), ...action.payload, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), pinned: false }
      state.items.unshift(note)
      saveToStorage(state.items)
    },
    updateNote(state, action) {
      const idx = state.items.findIndex(n => n.id === action.payload.id)
      if (idx !== -1) { state.items[idx] = { ...state.items[idx], ...action.payload, updatedAt: new Date().toISOString() } }
      saveToStorage(state.items)
    },
    deleteNote(state, action) {
      state.items = state.items.filter(n => n.id !== action.payload)
      saveToStorage(state.items)
    },
    togglePin(state, action) {
      const note = state.items.find(n => n.id === action.payload)
      if (note) note.pinned = !note.pinned
      saveToStorage(state.items)
    },
    setSearchQuery(state, action) { state.searchQuery = action.payload },
    setFilterSubject(state, action) { state.filterSubject = action.payload },
    setSortBy(state, action) { state.sortBy = action.payload },
  }
})

export const { addNote, updateNote, deleteNote, togglePin, setSearchQuery, setFilterSubject, setSortBy } = notesSlice.actions
export const SUBJECTS_LIST = SUBJECTS
export const COLORS_LIST = COLORS

export const selectFilteredNotes = (state) => {
  let notes = [...state.notes.items]
  const q = state.notes.searchQuery.toLowerCase()
  if (q) notes = notes.filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || n.tags?.some(t => t.toLowerCase().includes(q)))
  if (state.notes.filterSubject !== 'All') notes = notes.filter(n => n.subject === state.notes.filterSubject)
  notes.sort((a, b) => {
    if (a.pinned !== b.pinned) return b.pinned - a.pinned
    return new Date(b[state.notes.sortBy]) - new Date(a[state.notes.sortBy])
  })
  return notes
}

export default notesSlice.reducer
