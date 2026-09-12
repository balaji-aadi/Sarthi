import React, { useState, useEffect, useMemo, useRef, forwardRef, useImperativeHandle } from 'react';
import {
  IoDocumentTextOutline,
  IoClose,
  IoAddOutline,
  IoSearchOutline,
  IoTrashOutline,
  IoArrowDown,
  IoArrowUp
} from 'react-icons/io5';
import { NoteApi } from '../../services/api/Note.api';
import toast from 'react-hot-toast';
import moment from 'moment';
import ReactQuill from 'react-quill';

const decodeHtmlEntities = (str) => {
  if (!str) return "";
  const txt = document.createElement("textarea");
  txt.innerHTML = str;
  return txt.value;
};

const isHtmlNote = (content) => {
  if (!content) return false;
  const lower = content.toLowerCase();
  return (
    lower.includes("<!doctype html") ||
    lower.includes("<html") ||
    lower.includes("&lt;!doctype html") ||
    lower.includes("&lt;html") ||
    lower.includes("<style") ||
    lower.includes("&lt;style") ||
    lower.includes("<body") ||
    lower.includes("&lt;body")
  );
};

const getCleanSnippet = (content, limit = 110) => {
  if (!content) return "No content";
  let clean = decodeHtmlEntities(content);
  clean = clean.replace(/<style[\s\S]*?<\/style>/gi, ' ');
  clean = clean.replace(/<script[\s\S]*?<\/script>/gi, ' ');
  clean = clean.replace(/<div[^>]*class="note-root"[\s\S]*?<div[^>]*class="lang-en-[^"]*"[^>]*>/gi, ' ');
  clean = clean.replace(/<[^>]*>?/gm, ' ');
  clean = clean.replace(/&nbsp;/gi, ' ').replace(/\s+/g, ' ').trim();
  return clean.slice(0, limit) + (clean.length > limit ? "..." : "");
};

export const TaskLinkedNotes = forwardRef(({
  taskId,
  parentTaskId,
  taskName,
  isAdmin = false
}, ref) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isReaderOpen, setIsReaderOpen] = useState(false);
  const [activeReaderNoteId, setActiveReaderNoteId] = useState(null);
  const [readerSearchTerm, setReaderSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editorMode, setEditorMode] = useState("code"); // 'code' or 'rich'
  const [saving, setSaving] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [iframeHeight, setIframeHeight] = useState(650);

  const scrollContainerRef = useRef(null);
  const iframeRef = useRef(null);
  const [canScroll, setCanScroll] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [isReadingModeActive, setIsReadingModeActive] = useState(false);
  const lastScrollTopRef = useRef(0);
  const accumulatedScrollRef = useRef(0);
  const transitionLockRef = useRef(false);
  const [iframeScrollInfo, setIframeScrollInfo] = useState({ isAtBottom: false, canScroll: false });

  useEffect(() => {
    setIsReadingModeActive(false);
    transitionLockRef.current = false;
    lastScrollTopRef.current = 0;
    accumulatedScrollRef.current = 0;
  }, [activeReaderNoteId, isReaderOpen]);

  const handleExitReadingMode = () => {
    transitionLockRef.current = true;
    accumulatedScrollRef.current = 0;
    setIsReadingModeActive(false);
    setTimeout(() => {
      transitionLockRef.current = false;
      accumulatedScrollRef.current = 0;
    }, 1200);
  };

  // Listen for iframe height and scroll messages
  useEffect(() => {
    const handleMessage = (e) => {
      if (!e.data) return;
      if (e.data.type === 'noteIframeHeight' && typeof e.data.height === 'number') {
        setIframeHeight(Math.max(e.data.height + 30, 500));
      }
      if (e.data.type === 'iframeScroll') {
        const { scrollTop, scrollHeight, clientHeight } = e.data;
        const parentHeight = window.innerHeight;
        const atBottom = Math.ceil(scrollTop + clientHeight) >= scrollHeight - 50;
        const hasScroll = scrollHeight > clientHeight + 50;

        setIframeScrollInfo({ isAtBottom: atBottom, canScroll: hasScroll });
        setIsAtBottom(atBottom);
        setCanScroll(hasScroll);

        if (scrollHeight < parentHeight && !isReadingModeActive) {
          return;
        }

        if (transitionLockRef.current) {
          accumulatedScrollRef.current = 0;
          lastScrollTopRef.current = scrollTop;
          return;
        }

        const delta = scrollTop - lastScrollTopRef.current;
        lastScrollTopRef.current = scrollTop;

        if (delta > 0) {
          if (accumulatedScrollRef.current < 0) accumulatedScrollRef.current = 0;
          accumulatedScrollRef.current += delta;
        } else if (delta < 0) {
          if (accumulatedScrollRef.current > 0) accumulatedScrollRef.current = 0;
          accumulatedScrollRef.current += delta;
        }

        const isScrollingDown = accumulatedScrollRef.current > 120;

        // Only automatically ENTER reading mode when scrolling down
        if (!isReadingModeActive && isScrollingDown && scrollTop > 150) {
          transitionLockRef.current = true;
          accumulatedScrollRef.current = 0;
          setIsReadingModeActive(true);
          setTimeout(() => {
            transitionLockRef.current = false;
          }, 800);
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isReadingModeActive]);

  // Expose methods to parent ref
  useImperativeHandle(ref, () => ({
    openReader: (noteId) => {
      if (noteId) {
        setActiveReaderNoteId(noteId);
      } else if (notes.length > 0) {
        setActiveReaderNoteId(notes[0]._id);
      }
      setIsEditing(false);
      setIsReadingModeActive(false);
      setIsReaderOpen(true);
    },
    notesCount: notes.length
  }));

  const handleContainerScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const atBottom = Math.ceil(scrollTop + clientHeight) >= scrollHeight - 50;
    const hasScroll = scrollHeight > clientHeight + 50;

    setCanScroll(hasScroll);
    setIsAtBottom(atBottom);
    setIframeScrollInfo({ isAtBottom: atBottom, canScroll: hasScroll });

    if (scrollHeight < window.innerHeight && !isReadingModeActive) {
      return;
    }

    if (transitionLockRef.current) {
      accumulatedScrollRef.current = 0;
      lastScrollTopRef.current = scrollTop;
      return;
    }

    const delta = scrollTop - lastScrollTopRef.current;
    lastScrollTopRef.current = scrollTop;

    if (delta > 0) {
      if (accumulatedScrollRef.current < 0) accumulatedScrollRef.current = 0;
      accumulatedScrollRef.current += delta;
    } else if (delta < 0) {
      if (accumulatedScrollRef.current > 0) accumulatedScrollRef.current = 0;
      accumulatedScrollRef.current += delta;
    }

    const isScrollingDown = accumulatedScrollRef.current > 120;

    if (!isReadingModeActive && isScrollingDown && scrollTop > 150) {
      transitionLockRef.current = true;
      accumulatedScrollRef.current = 0;
      setIsReadingModeActive(true);
      setTimeout(() => {
        transitionLockRef.current = false;
      }, 800);
    }
  };

  const handleScrollToggle = () => {
    const container = scrollContainerRef.current;
    if (isAtBottom || iframeScrollInfo.isAtBottom) {
      if (iframeRef.current) {
        iframeRef.current.contentWindow?.scrollTo({ top: 0, behavior: 'smooth' });
      }
      if (container) {
        container.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      if (iframeRef.current) {
        const height = iframeRef.current.contentDocument?.documentElement?.scrollHeight || 99999;
        iframeRef.current.contentWindow?.scrollTo({ top: height, behavior: 'smooth' });
      }
      if (container) {
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
      }
    }
  };

  const fetchNotes = async () => {
    if (!taskId && !parentTaskId) return;
    setLoading(true);
    try {
      const res = await NoteApi.getNotes();
      const allNotes = res.data?.data || [];
      const linked = allNotes.filter(n => {
        const isLinked = (taskId && (n.taskId === taskId || (n.taskIds && n.taskIds.includes(taskId))));
        if (isLinked) return true;
        if (parentTaskId && (n.taskId === parentTaskId || (n.taskIds && n.taskIds.includes(parentTaskId)))) return true;
        return false;
      });
      setNotes(linked);
      if (linked.length > 0 && !activeReaderNoteId) {
        setActiveReaderNoteId(linked[0]._id);
      }
    } catch (err) {
      console.error("Failed to fetch linked notes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [taskId]);

  const activeNote = useMemo(() => {
    return notes.find(n => n._id === activeReaderNoteId) || notes[0] || null;
  }, [notes, activeReaderNoteId]);

  const handleCreateNote = async () => {
    if (!isAdmin) {
      toast.error("Only administrators can create notes.");
      return;
    }
    try {
      const defaultTitle = `Note for ${taskName || 'Problem'}`;
      const defaultContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${taskName || 'Problem'} - Master Engineering Notes</title>
  <style>
    :root {
      --bg: #fafafa;
      --text-main: #1e293b;
      --text-muted: #64748b;
      --primary: #2563eb;
      --border: #e2e8f0;
      --code-bg: #1e1e24;
      --code-text: #abb2bf;
    }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      line-height: 1.6;
      color: var(--text-main);
      background: var(--bg);
      padding: 24px;
      margin: 0;
    }
    h1, h2, h3 { color: #0f172a; margin-top: 1.2em; }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      margin-right: 8px;
      background: #e0f2fe;
      color: #0284c7;
    }
    .viz-box {
      background: #f0f7ff;
      border: 1px solid #bae6fd;
      border-radius: 12px;
      padding: 16px;
      font-family: monospace;
      font-size: 13px;
      margin: 16px 0;
      white-space: pre-wrap;
    }
  </style>
</head>
<body>
  <div>
    <span class="badge">LEETCODE</span>
    <span class="badge">EASY</span>
    <span class="badge">MASTER EDITION</span>
  </div>
  <h1>${taskName || 'Problem Notes'}</h1>
  <p style="color: var(--text-muted); font-size: 14px;">
    Complete Technical & Mentorship Guide: Core approach invariants, memory optimizations, and detailed dry runs.
  </p>
  <hr style="border: none; border-top: 1px solid var(--border); margin: 20px 0;" />
  <h2 style="border-left: 4px solid var(--primary); padding-left: 12px;">1. Problem Statement & Core Concept</h2>
  <p>Add your complete breakdown, invariants, and step-by-step logic here.</p>
  <div class="viz-box">
Mechanics Visualization:
- Step 1: Initialize pointers
- Step 2: Traverse and merge alternating elements
  </div>
</body>
</html>`;

      const noteData = {
        title: defaultTitle,
        content: defaultContent,
        color: "#f59e0b",
        position: { x: 100, y: 100 },
        size: { width: 400, height: 360 },
        taskId: taskId
      };

      const res = await NoteApi.createNote(noteData);
      const created = res.data?.data || res.data;
      if (created?._id) {
        toast.success("Note created!");
        await fetchNotes();
        setActiveReaderNoteId(created._id);
        setEditTitle(created.title || defaultTitle);
        setEditContent(created.content || defaultContent);
        setEditorMode(isHtmlNote(created.content) ? "code" : "rich");
        setIsEditing(true);
        setIsReaderOpen(true);
      }
    } catch (err) {
      console.error("Error creating note:", err);
      toast.error("Failed to create note");
    }
  };

  const handleSaveNote = async () => {
    if (!activeReaderNoteId) return;
    setSaving(true);
    try {
      await NoteApi.updateNote(activeReaderNoteId, {
        title: editTitle,
        content: editContent
      });
      toast.success("Note updated successfully!");
      setIsEditing(false);
      await fetchNotes();
    } catch (err) {
      console.error("Failed to update note:", err);
      toast.error("Failed to save note");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = async (id) => {
    if (!id) return;
    try {
      await NoteApi.deleteNote(id);
      toast.success("Note deleted");
      setShowDeleteConfirm(false);
      const remaining = notes.filter(n => n._id !== id);
      setNotes(remaining);
      if (remaining.length > 0) {
        setActiveReaderNoteId(remaining[0]._id);
      } else {
        setIsReaderOpen(false);
      }
    } catch (err) {
      console.error("Failed to delete note:", err);
      toast.error("Failed to delete note");
    }
  };

  const handleTranslateToHindi = async (englishText) => {
    if (!englishText || !englishText.trim()) {
      toast.error("Please enter some content first");
      return null;
    }
    setIsTranslating(true);
    const loadingToast = toast.loading("Translating note to Hindi...");
    try {
      const res = await NoteApi.aiEnhance({ content: englishText, action: "translate-hi" });
      const translated = res.data?.data?.enhancedContent || res.data?.enhancedContent;
      if (translated) {
        toast.success("Translation completed!");
        return translated;
      } else {
        toast.error("Translation returned empty");
        return null;
      }
    } catch (err) {
      console.error("Translation error:", err);
      toast.error("Failed to translate note");
      return null;
    } finally {
      toast.dismiss(loadingToast);
      setIsTranslating(false);
    }
  };

  return (
    <div className="space-y-3 font-sans">
      {/* 1. Header (Matching Image 5) */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
          LINKED NOTES
        </h3>
        {isAdmin && (
          <button
            type="button"
            onClick={handleCreateNote}
            className="text-xs font-bold text-slate-900 dark:text-white hover:text-primary transition-colors cursor-pointer"
          >
            + Add Note
          </button>
        )}
      </div>

      {/* 2. Body State */}
      {loading ? (
        <div className="py-4 text-center text-xs text-slate-400 font-medium">Loading notes...</div>
      ) : notes.length === 0 ? (
        <div className="text-center py-6 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 select-none space-y-1">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">No notes linked</p>
          <p className="text-[11px] text-slate-400/80">
            {isAdmin ? "Click '+ Add Note' to create notes directly for this problem." : "No notes have been added yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Button: OPEN NOTES DOCUMENT CENTER (Matching Image 5) */}
          <button
            type="button"
            onClick={() => {
              if (notes.length > 0) {
                setActiveReaderNoteId(notes[0]._id);
              }
              setIsEditing(false);
              setIsReaderOpen(true);
            }}
            className="w-full py-3.5 px-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl font-black text-xs text-slate-800 dark:text-slate-100 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider transition-all select-none active:scale-[0.99]"
          >
            📖 OPEN NOTES DOCUMENT CENTER
          </button>

          {/* Yellow Left-Bordered Note Cards (Matching Image 5) */}
          <div className="space-y-2.5">
            {notes.map((note) => {
              const snippet = getCleanSnippet(note.content, 130);
              return (
                <div
                  key={note._id}
                  onClick={() => {
                    setActiveReaderNoteId(note._id);
                    setIsEditing(false);
                    setIsReaderOpen(true);
                  }}
                  className="p-4 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200/90 dark:border-slate-800 border-l-4 border-l-yellow-400 dark:border-l-yellow-400 flex flex-col gap-1.5 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer select-none"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="font-black text-xs sm:text-sm text-slate-900 dark:text-white uppercase tracking-wider truncate flex-1">
                      {note.title || "UNTITLED NOTE"}
                    </h4>
                    <span className="text-[10px] font-bold text-slate-400 shrink-0">
                      {note.updatedAt ? moment(note.updatedAt).format("MMM DD, YYYY") : "Recent"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-normal">
                    {snippet}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Document Center Popup Modal (Matching Image 1, 2, 3, 4) */}
      {isReaderOpen && activeNote && (
        <div className={`fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-xs transition-all duration-500 ${isReadingModeActive ? 'p-0' : 'p-2 sm:p-4 md:p-6'}`}>
          <div className={`bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-3xl shadow-2xl w-full h-full overflow-hidden flex flex-col border border-slate-100 dark:border-slate-800 transition-all duration-500 ${isReadingModeActive ? 'rounded-none' : 'rounded-2xl sm:rounded-3xl'}`}>

            {/* Modal Header Bar (Collapses smoothly in Reading Mode) */}
            <div className={`px-6 sm:px-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50 shrink-0 transition-all duration-500 ease-in-out origin-top ${
              isReadingModeActive ? 'max-h-0 py-0 opacity-0 overflow-hidden border-none' : 'max-h-[160px] sm:max-h-[100px] py-4 sm:py-5 opacity-100'
            }`}>
              <div className="min-w-0 pr-4">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white truncate">
                  Document Center: {taskName || 'Linked Problem Notes'}
                </h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                  {notes.length} LINKED NOTE(S)
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <input
                  type="text"
                  placeholder="Search linked notes..."
                  value={readerSearchTerm}
                  onChange={(e) => setReaderSearchTerm(e.target.value)}
                  className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none w-56 sm:w-64 placeholder:text-slate-400 focus:ring-1 focus:ring-primary transition-all"
                />
                <button
                  onClick={() => {
                    setIsReaderOpen(false);
                    setIsEditing(false);
                    setIsReadingModeActive(false);
                    setReaderSearchTerm("");
                  }}
                  className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-600 dark:text-slate-300 hover:text-red-500 rounded-xl transition-all border border-slate-200/60 dark:border-slate-700 cursor-pointer"
                  title="Close Document Center"
                >
                  <IoClose size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body: Split Sidebar & Content */}
            <div className="flex-1 flex overflow-hidden min-h-0 relative">

              {/* Left Column: Notes List (Collapses in Reading Mode) */}
              <div className={`border-r border-slate-100 dark:border-slate-800 flex flex-col bg-slate-50/40 dark:bg-slate-950/20 shrink-0 transition-all duration-500 ease-in-out origin-left ${
                isReadingModeActive ? 'w-0 opacity-0 overflow-hidden border-none' : 'w-72 sm:w-80 opacity-100'
              }`}>
                <div className="flex-1 p-4 space-y-2.5 overflow-y-auto custom-scrollbar">
                  {notes
                    .filter(n => {
                      if (!readerSearchTerm) return true;
                      return (n.title || "").toLowerCase().includes(readerSearchTerm.toLowerCase()) ||
                        (n.content || "").toLowerCase().includes(readerSearchTerm.toLowerCase());
                    })
                    .map((note) => {
                      const isActive = activeNote?._id === note._id;
                      const snippet = getCleanSnippet(note.content, 65);
                      return (
                        <div
                          key={note._id}
                          onClick={() => {
                            setActiveReaderNoteId(note._id);
                            setIsEditing(false);
                          }}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-1 select-none ${isActive
                            ? "border-2 border-red-400/90 dark:border-red-500/80 bg-red-50/20 dark:bg-red-950/20 shadow-xs"
                            : "border border-slate-200 dark:border-slate-800 border-l-4 border-l-yellow-400 bg-white dark:bg-slate-900 hover:border-slate-300 shadow-2xs"
                            }`}
                        >
                          <h5 className={`font-bold text-xs truncate ${isActive ? "text-red-500 dark:text-red-400" : "text-slate-900 dark:text-white"}`}>
                            {note.title || "Untitled Note"}
                          </h5>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-snug">
                            {snippet}
                          </p>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Right Column: Note Reading & Editing Canvas */}
              <div
                ref={scrollContainerRef}
                onScroll={handleContainerScroll}
                className={`flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900 relative flex flex-col transition-all duration-500 ${
                  isReadingModeActive ? 'p-4 sm:p-8 md:p-12' : 'p-6 sm:p-10'
                }`}
              >
                <div className="w-full mx-auto space-y-4 flex-1 flex flex-col">

                  {/* Top Metadata & Sticky Tag (Collapses in Reading Mode) */}
                  <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
                    isReadingModeActive ? 'max-h-0 p-0 opacity-0 border-none' : 'max-h-[320px] sm:max-h-[200px] pb-4 border-b border-slate-100 dark:border-slate-800 opacity-100'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 shrink-0" />
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                        LINKED STICKY NOTE
                      </span>
                    </div>

                    {/* Title Row & Action Buttons */}
                    {isEditing ? (
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl outline-none focus:ring-1 focus:ring-primary"
                        />
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={handleSaveNote}
                            disabled={saving}
                            className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer select-none"
                          >
                            {saving ? "Saving..." : "Save"}
                          </button>
                          <button
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer select-none"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-4 mb-1">
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight break-words flex-1">
                          {activeNote.title || "Untitled Note"}
                        </h1>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => {
                              setEditTitle(activeNote.title || "");
                              setEditContent(decodeHtmlEntities(activeNote.content || ""));
                              setEditorMode(isHtmlNote(activeNote.content) ? "code" : "rich");
                              setIsEditing(true);
                            }}
                            className="px-4 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs cursor-pointer transition-all select-none"
                          >
                            ✏️ Edit
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => setShowDeleteConfirm(true)}
                              className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all cursor-pointer"
                              title="Delete Note"
                            >
                              <IoTrashOutline size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Metadata Subtitle */}
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                      Last Updated: {activeNote.updatedAt ? moment(activeNote.updatedAt).format("MMMM D, YYYY [at] h:mm A") : "Recently"}
                    </p>
                  </div>

                  {/* Note Content / Editor Canvas */}
                  {isEditing ? (
                    <div className="space-y-3 flex-1 flex flex-col">
                      <div className="flex items-center justify-between gap-3 pt-2">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setEditorMode("code")}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              editorMode === "code"
                                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                            }`}
                          >
                            HTML Code Mode
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditorMode("rich")}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              editorMode === "rich"
                                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                            }`}
                          >
                            Rich Text Mode
                          </button>
                        </div>

                        <button
                          type="button"
                          disabled={isTranslating}
                          onClick={async () => {
                            const translation = await handleTranslateToHindi(editContent);
                            if (translation) {
                              setEditContent(translation);
                            }
                          }}
                          className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider flex items-center gap-1.5 cursor-pointer bg-purple-50 dark:bg-purple-950/20 px-3 py-1 rounded-lg border border-purple-200 dark:border-purple-800 transition-all hover:bg-purple-100"
                        >
                          {isTranslating ? "⏳ TRANSLATING..." : "🌐 AUTO-TRANSLATE NOTE TO HINDI"}
                        </button>
                      </div>

                      {editorMode === "code" ? (
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          placeholder="Paste or write HTML/CSS code directly here..."
                          className="w-full flex-1 min-h-[480px] font-mono text-xs p-5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-2xl focus:outline-none focus:ring-1 focus:ring-primary text-slate-800 dark:text-slate-100 leading-relaxed custom-scrollbar"
                        />
                      ) : (
                        <div className="drawer-quill flex-1">
                          <ReactQuill
                            value={editContent}
                            onChange={setEditContent}
                            placeholder="Type notes here..."
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    /* View Mode Canvas (Matching Image 1 & 2) */
                    <div className="flex-1 flex flex-col relative">
                      {isHtmlNote(activeNote.content) ? (
                        <div className="relative w-full flex-1 flex flex-col">
                          <iframe
                            ref={iframeRef}
                            title={activeNote.title || "Note HTML Preview"}
                            srcDoc={`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <base target="_blank" />
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: transparent;
      color: #1e293b;
    }
    img { max-width: 100%; height: auto; }
  </style>
</head>
<body>
  ${decodeHtmlEntities(activeNote.content)}
  <script>
    function notifyState() {
      const height = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight
      );
      window.parent.postMessage({ type: 'noteIframeHeight', height: height }, '*');
      window.parent.postMessage({
        type: 'iframeScroll',
        scrollTop: window.scrollY || document.documentElement.scrollTop,
        scrollHeight: height,
        clientHeight: window.innerHeight || document.documentElement.clientHeight
      }, '*');
    }
    window.addEventListener('load', notifyState);
    window.addEventListener('scroll', notifyState);
    window.addEventListener('resize', notifyState);
    if (window.ResizeObserver) {
      new ResizeObserver(notifyState).observe(document.body);
    }
    setTimeout(notifyState, 100);
    setTimeout(notifyState, 500);
    setTimeout(notifyState, 1500);
  </script>
</body>
</html>`}
                            style={{ height: `${iframeHeight}px`, minHeight: '500px' }}
                            className="w-full border-none bg-transparent overflow-hidden"
                            sandbox="allow-scripts allow-same-origin"
                          />
                        </div>
                      ) : (
                        <div
                          className="prose prose-slate dark:prose-invert max-w-none text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium"
                          dangerouslySetInnerHTML={{ __html: activeNote.content }}
                        />
                      )}

                      {/* Floating Bottom Action Bar (End Read & Scroll Button) in Full Screen/Reading Mode */}
                      {isReadingModeActive && (
                        <div className="fixed bottom-8 sm:bottom-10 left-1/2 -translate-x-1/2 z-[999999] pointer-events-auto flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in zoom-in duration-300">
                          <button
                            onClick={handleExitReadingMode}
                            className="group flex items-center gap-2 px-5 py-3 rounded-full bg-slate-900/80 dark:bg-slate-900/90 hover:bg-slate-900 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-2xl text-white transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer text-xs font-black tracking-wider uppercase select-none"
                            title="Exit Full Screen Reading Mode"
                          >
                            <IoClose className="text-base text-red-400 group-hover:rotate-90 transition-transform duration-300" />
                            <span>End Read</span>
                          </button>

                          {(canScroll || iframeScrollInfo.canScroll) && (
                            <button
                              onClick={handleScrollToggle}
                              className="group flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/30 dark:bg-slate-900/70 hover:bg-white/50 dark:hover:bg-slate-900/90 backdrop-blur-md border border-white/30 dark:border-white/10 shadow-2xl text-slate-800 dark:text-white transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer select-none"
                              title={(isAtBottom || iframeScrollInfo.isAtBottom) ? "Scroll to Top" : "Scroll to Bottom"}
                            >
                              {(isAtBottom || iframeScrollInfo.isAtBottom) ? (
                                <IoArrowUp className="text-lg sm:text-xl opacity-90 group-hover:opacity-100 transition-opacity" />
                              ) : (
                                <IoArrowDown className="text-lg sm:text-xl opacity-90 group-hover:opacity-100 transition-opacity" />
                              )}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-sm p-6 flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/30 text-red-500 flex items-center justify-center text-xl">
              <IoTrashOutline />
            </div>
            <h4 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Delete Note
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Are you sure you want to delete this linked note? This action cannot be undone.
            </p>
            <div className="flex gap-3 w-full pt-2">
              <button
                onClick={() => handleDeleteNote(activeReaderNoteId)}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
              >
                Confirm Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default TaskLinkedNotes;
