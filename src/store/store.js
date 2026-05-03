import { configureStore } from '@reduxjs/toolkit'
import notesReducer from './notesSlice.js'
import tasksReducer from './tasksSlice.js'
import uiReducer from './uiSlice.js'

export const store = configureStore({
  reducer: {
    notes: notesReducer,
    tasks: tasksReducer,
    ui: uiReducer,
  },
})
