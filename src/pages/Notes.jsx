import { useState, useMemo, useCallback, memo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { addNote, updateNote, deleteNote, togglePin, setSearchQuery, setFilterSubject, setSortBy, selectFilteredNotes, SUBJECTS_LIST, COLORS_LIST } from '../store/notesSlice.js'
import { useDebounce } from '../hooks/useDebounce.js'
import { format } from 'date-fns'

const NoteCard = memo(function NoteCard({ note, onEdit, onDelete, onPin }) {
  return (
    <div className="fade-in" style={{ background: 'var(--card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'all var(--transition)', position: 'relative' }}>
      <div style={{ height: 4, background: note.color }} />
      <div style={{ padding: '16px', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--text)', lineHeight: 1.3, flex: 1 }}>{note.title}</h3>
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            <button onClick={() => onPin(note.id)} style={{ background: 'none', color: note.pinned ? '#fbbf24' : 'var(--text3)', fontSize: 14, padding: 2, transition: 'color var(--transition)' }} title="Pin note">📌</button>
            <button onClick={() => onEdit(note)} style={{ background: 'none', color: 'var(--text3)', fontSize: 14, padding: 2 }}>✎</button>
            <button onClick={() => onDelete(note.id)} style={{ background: 'none', color: 'var(--text3)', fontSize: 14, padding: 2 }}>✕</button>
          </div>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 10, fontWeight: 500 }}>{note.subject}</p>
        <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' }}>
          {note.content}
        </p>
      </div>
      <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {note.tags?.slice(0, 3).map(tag => (
            <span key={tag} style={{ fontSize: 10, padding: '2px 7px', borderRadius: 99, background: 'var(--bg2)', color: 'var(--text3)', border: '1px solid var(--border)' }}>#{tag}</span>
          ))}
        </div>
        <span style={{ fontSize: 11, color: 'var(--text3)', flexShrink: 0 }}>{format(new Date(note.updatedAt), 'MMM d')}</span>
      </div>
    </div>
  )
})

function NoteModal({ note, onClose, onSave }) {
  const [form, setForm] = useState(note || { title: '', content: '', subject: 'Mathematics', color: COLORS_LIST[0], tags: [] })
  const [tagInput, setTagInput] = useState('')

  function handleChange(k, v) { setForm(f => ({ ...f, [k]: v })) }

  function addTag(e) {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault()
      const t = tagInput.trim().replace(/^#/, '')
      if (t && !form.tags.includes(t)) setForm(f => ({ ...f, tags: [...f.tags, t] }))
      setTagInput('')
    }
  }

  function removeTag(t) { setForm(f => ({ ...f, tags: f.tags.filter(x => x !== t) })) }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={e => e.stopPropagation()} className="fade-in" style={{ background: 'var(--card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', width: '100%', maxWidth: 560, maxHeight: '90vh', overflow: 'auto' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 }}>{note ? 'Edit Note' : 'New Note'}</h2>
          <button onClick={onClose} style={{ background: 'none', color: 'var(--text2)', fontSize: 20 }}>✕</button>
        </div>
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input value={form.title} onChange={e => handleChange('title', e.target.value)} placeholder="Note title..." style={inputStyle} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <select value={form.subject} onChange={e => handleChange('subject', e.target.value)} style={inputStyle}>
              {SUBJECTS_LIST.map(s => <option key={s}>{s}</option>)}
            </select>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'var(--bg2)', borderRadius: 'var(--radius2)', padding: '8px 12px', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: 12, color: 'var(--text3)' }}>Color:</span>
              {COLORS_LIST.map(c => (
                <button key={c} onClick={() => handleChange('color', c)} style={{ width: 20, height: 20, borderRadius: '50%', background: c, border: form.color === c ? '3px solid white' : '2px solid transparent', transition: 'border var(--transition)' }} />
              ))}
            </div>
          </div>
          <textarea value={form.content} onChange={e => handleChange('content', e.target.value)} placeholder="Write your notes here..." rows={10} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.7 }} />
          <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
              {form.tags.map(t => (
                <span key={t} style={{ fontSize: 12, padding: '3px 10px', borderRadius: 99, background: 'rgba(124,106,247,0.15)', color: 'var(--accent3)', border: '1px solid rgba(124,106,247,0.25)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  #{t} <button onClick={() => removeTag(t)} style={{ background: 'none', color: 'inherit', fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
                </span>
              ))}
            </div>
            <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={addTag} placeholder="Add tags (press Enter)..." style={inputStyle} />
          </div>
        </div>
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '10px 20px', borderRadius: 'var(--radius2)', background: 'var(--bg2)', color: 'var(--text2)', fontSize: 13 }}>Cancel</button>
          <button onClick={() => { if (form.title.trim()) onSave(form) }} style={{ padding: '10px 24px', borderRadius: 'var(--radius2)', background: 'linear-gradient(135deg, var(--accent), var(--pink))', color: '#fff', fontSize: 13, fontWeight: 600 }}>
            {note ? 'Update Note' : 'Save Note'}
          </button>
        </div>
      </div>
    </div>
  )
}

const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: 'var(--radius2)', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'var(--font-body)' }

export default function Notes() {
  const dispatch = useDispatch()
  const [modal, setModal] = useState(null) // null | 'add' | noteObj
  const [searchVal, setSearchVal] = useState('')
  const debouncedSearch = useDebounce(searchVal, 300)
  const filterSubject = useSelector(s => s.notes.filterSubject)
  const sortBy = useSelector(s => s.notes.sortBy)
  const filteredNotes = useSelector(selectFilteredNotes)

  const handleSearch = useCallback(v => {
    setSearchVal(v)
    dispatch(setSearchQuery(v))
  }, [dispatch])

  useMemo(() => { dispatch(setSearchQuery(debouncedSearch)) }, [debouncedSearch, dispatch])

  function handleSave(form) {
    if (modal && modal.id) dispatch(updateNote({ ...form, id: modal.id }))
    else dispatch(addNote(form))
    setModal(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <input value={searchVal} onChange={e => handleSearch(e.target.value)} placeholder="🔍 Search notes..." style={{ ...inputStyle, flex: 1, minWidth: 200 }} />
        <select value={filterSubject} onChange={e => dispatch(setFilterSubject(e.target.value))} style={{ ...inputStyle, width: 'auto' }}>
          <option value="All">All Subjects</option>
          {SUBJECTS_LIST.map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={sortBy} onChange={e => dispatch(setSortBy(e.target.value))} style={{ ...inputStyle, width: 'auto' }}>
          <option value="updatedAt">Recently Updated</option>
          <option value="createdAt">Date Created</option>
          <option value="title">Title A-Z</option>
        </select>
        <button onClick={() => setModal('add')} style={{ padding: '10px 20px', borderRadius: 'var(--radius2)', background: 'linear-gradient(135deg, var(--accent), var(--pink))', color: '#fff', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
          + New Note
        </button>
      </div>

      {/* Count */}
      <p style={{ fontSize: 12, color: 'var(--text3)' }}>{filteredNotes.length} note{filteredNotes.length !== 1 ? 's' : ''}</p>

      {/* Grid */}
      {filteredNotes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text3)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>◈</div>
          <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 6 }}>No notes found</p>
          <p style={{ fontSize: 13 }}>Create your first note to get started</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {filteredNotes.map((note, i) => (
            <div key={note.id} style={{ animationDelay: `${i * 0.05}s` }}>
              <NoteCard note={note} onEdit={n => setModal(n)} onDelete={id => dispatch(deleteNote(id))} onPin={id => dispatch(togglePin(id))} />
            </div>
          ))}
        </div>
      )}

      {modal && <NoteModal note={modal === 'add' ? null : modal} onClose={() => setModal(null)} onSave={handleSave} />}
    </div>
  )
}
