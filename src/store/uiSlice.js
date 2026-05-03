import { createSlice } from '@reduxjs/toolkit'

function loadTheme() {
  try { return localStorage.getItem('studyflow_theme') || 'dark' } catch { return 'dark' }
}

const uiSlice = createSlice({
  name: 'ui',
  initialState: { theme: loadTheme(), sidebarOpen: true },
  reducers: {
    toggleTheme(state) {
      state.theme = state.theme === 'dark' ? 'light' : 'dark'
      try { localStorage.setItem('studyflow_theme', state.theme) } catch {}
      document.documentElement.setAttribute('data-theme', state.theme)
    },
    toggleSidebar(state) { state.sidebarOpen = !state.sidebarOpen },
    setSidebar(state, action) { state.sidebarOpen = action.payload },
  }
})

export const { toggleTheme, toggleSidebar, setSidebar } = uiSlice.actions
export default uiSlice.reducer
