import React, { useState, useEffect } from 'react';
import { LuX, LuPlus, LuHighlighter, LuTrash2 } from 'react-icons/lu';

export default function LldNotesDrawer({
  isOpen = false,
  onClose = () => {},
  lessonId = 'global',
  lessonTitle = 'My Study Notes'
}) {
  const storageKey = `sarthi_lld_notes_${lessonId}`;

  const [notes, setNotes] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    // Default initial seed note demonstrating real study practice
    return [
      {
        id: 'initial-1',
        text: 'Object lifetime != pointer lifetime.\nRemember: RAII binds resource lifetime to object lifetime.',
        highlighted: 'RAII binds resource lifetime to object lifetime.',
        timestamp: Date.now()
      }
    ];
  });

  const [inputNote, setInputNote] = useState('');
  const [highlightActive, setHighlightActive] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(notes));
    } catch (e) {}
  }, [notes, storageKey]);

  const handleAddNote = () => {
    if (!inputNote.trim()) return;
    const newNote = {
      id: `note-${Date.now()}`,
      text: inputNote.trim(),
      isHighlighted: highlightActive,
      timestamp: Date.now()
    };
    setNotes((prev) => [newNote, ...prev]);
    setInputNote('');
    setHighlightActive(false);
  };

  const handleDeleteNote = (id) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <>
      {/* Backdrop overlay for mobile */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/40 z-45 md:hidden"
          aria-hidden="true"
        />
      )}

      {/* Slide-Over Drawer */}
      <aside
        className={`lld-notes-drawer ${isOpen ? 'open' : ''}`}
        aria-label="Personal Study Notes"
      >
        {/* Header */}
        <div className="lld-notes-header">
          <div>
            <h2 className="lld-notes-title">Personal Study Notes</h2>
            <p className="text-[11px] text-[var(--lld-text-secondary)] font-mono truncate max-w-[240px]">
              {lessonTitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-black/10 dark:hover:bg-white/10 text-[var(--lld-text-secondary)] hover:text-[var(--lld-text-primary)] transition-colors cursor-pointer"
            title="Close Notes"
            aria-label="Close notes"
          >
            <LuX size={18} />
          </button>
        </div>

        {/* Note List */}
        <div className="lld-notes-body">
          {notes.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <p className="font-['Caveat'] text-lg">No notes recorded yet.</p>
              <p className="text-xs font-mono mt-1">Jot down architectural invariants and insights while reading.</p>
            </div>
          ) : (
            notes.map((note) => (
              <div key={note.id} className="lld-note-item group relative">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    {note.isHighlighted || note.highlighted ? (
                      <span className="lld-highlight">{note.text}</span>
                    ) : (
                      <span>{note.text}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteNote(note.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all cursor-pointer shrink-0"
                    title="Delete note"
                  >
                    <LuTrash2 size={13} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Composer */}
        <div className="lld-notes-composer">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-[var(--lld-text-secondary)] uppercase tracking-wider">
              Add Personal Note
            </span>
            <button
              type="button"
              onClick={() => setHighlightActive(!highlightActive)}
              className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                highlightActive
                  ? 'bg-amber-400/20 border-amber-400/50 text-amber-500 font-semibold'
                  : 'border-[var(--lld-note-border)] text-slate-400 hover:text-slate-300'
              }`}
              title="Toggle yellow highlighter for important principle"
            >
              <LuHighlighter size={12} />
              <span>Highlighter</span>
            </button>
          </div>

          <textarea
            rows={3}
            value={inputNote}
            onChange={(e) => setInputNote(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleAddNote();
              }
            }}
            placeholder="Write key principle or invariant... (Cmd+Enter to save)"
            className="lld-notes-textarea"
          />

          <div className="flex justify-end mt-2">
            <button
              type="button"
              onClick={handleAddNote}
              disabled={!inputNote.trim()}
              className="lld-btn-primary py-1.5 px-3 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <LuPlus size={13} />
              <span>Add Note</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
