import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NoteApi } from "../services/api/Note.api";
import { useLoading } from "../components/loader/LoaderContext";
import Api from "../services/axiosConfig";
import { serverUrl } from "../services/config";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import ReactQuill from "react-quill";
import "./note-editor.css";
import {
  IoAddOutline,
  IoTrashOutline,
  IoSparklesOutline,
  IoPinOutline,
  IoImageOutline,
  IoColorPaletteOutline,
  IoCheckmarkOutline,
  IoCloseOutline,
  IoRefreshOutline,
  IoHelpCircleOutline,
  IoSearchOutline,
  IoContractOutline,
  IoExpandOutline,
  IoEyeOutline,
  IoCreateOutline
} from "react-icons/io5";

// Custom Quill Toolbar Component
const QuillToolbar = ({ className = "", style = {} }) => (
  <div id="quill-toolbar" className={`flex items-center gap-2 border-y border-slate-100 bg-white py-2.5 px-6 select-none shrink-0 ${className}`} style={style}>

    <span className="ql-formats">
      <button className="ql-bold" />
      <button className="ql-italic" />
      <button className="ql-link" />
    </span>
    <span className="h-6 w-[1px] bg-slate-200 mx-1"></span>
    <span className="ql-formats">
      <button className="ql-list" value="bullet" />
      <button className="ql-list" value="ordered" />
    </span>
    <span className="h-6 w-[1px] bg-slate-200 mx-1"></span>
    <span className="ql-formats">
      <button className="ql-align" value="" />
      <button className="ql-align" value="center" />
      <button className="ql-align" value="right" />
      <button className="ql-align" value="justify" />
    </span>
    <span className="h-6 w-[1px] bg-slate-200 mx-1"></span>
    <span className="ql-formats">
      <button className="ql-image" />
      <button className="ql-video" />
      <button className="ql-clean" />
    </span>
  </div>
);

const editorModules = {
  toolbar: {
    container: "#quill-toolbar"
  }
};

const editorFormats = [
  "font", "size",
  "bold", "italic", "underline", "strike",
  "list", "bullet",
  "link", "image", "video", "align"
];

// Helper to strip HTML tags for note snippet text previews preserving block structures
const stripHtml = (html) => {
  if (!html) return "";
  let text = html;

  // Replace <br> tags with newlines
  text = text.replace(/<br\s*\/?>/gi, "\n");

  // Replace closing block tags (p, div, li, h1-h6) with newlines
  text = text.replace(/<\/(p|div|li|h1|h2|h3|h4|h5|h6)>/gi, "\n");

  // Use DOMParser to decode all HTML entities (like &nbsp;) and strip remaining tags
  const doc = new DOMParser().parseFromString(text, "text/html");
  const parsedText = doc.body.textContent || "";

  // Collapse multiple consecutive newlines into a single newline
  return parsedText.replace(/\n\s*\n+/g, "\n").trim();
};

// Get clean formatted preview text removing repeating title
const getPreviewText = (note) => {
  let stripped = stripHtml(note.content);
  if (note.title && note.title.trim()) {
    const trimmedTitle = note.title.trim().toLowerCase();
    if (stripped.toLowerCase().startsWith(trimmedTitle)) {
      stripped = stripped.substring(note.title.trim().length).trim();
    }
  }
  return stripped;
};


const CANVAS_SIZE = 4000; // 4000px width and height for infinite canvas feel
const COLORS = [
  { name: "Yellow", hex: "#fef08a", text: "text-slate-800" },
  { name: "Blue", hex: "#bfdbfe", text: "text-slate-800" },
  { name: "Green", hex: "#bbf7d0", text: "text-slate-800" },
  { name: "Pink", hex: "#fbcfe8", text: "text-slate-800" },
  { name: "Purple", hex: "#e9d5ff", text: "text-slate-800" },
  { name: "Slate", hex: "#4b5563", text: "text-white" }
];

const CanvasNotes = () => {
  const { handleLoading } = useLoading();
  const currentUser = useSelector((state) => state.store.currentUser);
  const [notes, setNotes] = useState([]);
  const [zoom, setZoom] = useState(1);
  const [activeColorPopover, setActiveColorPopover] = useState(null);
  const [activeAiPopover, setActiveAiPopover] = useState(null);
  const [activeLightboxImage, setActiveLightboxImage] = useState(null);

  // Panning State
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [scrollStart, setScrollStart] = useState({ left: 0, top: 0 });

  // AI Suggestion Drawer State
  const [showAiDrawer, setShowAiDrawer] = useState(false);
  const [requirement, setRequirement] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [isAiSuggesting, setIsAiSuggesting] = useState(false);
  const [noteSearch, setNoteSearch] = useState("");
  const [editingFullNote, setEditingFullNote] = useState(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteTags, setNoteTags] = useState([]);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagVal, setNewTagVal] = useState("");
  const [editorMode, setEditorMode] = useState("view"); // "view" or "edit"
  const [editorContent, setEditorContent] = useState(""); // isolated editor content state

  // Sync state variables when a note is opened in the full editor modal
  useEffect(() => {
    if (editingFullNote) {
      setNoteTitle(editingFullNote.title || "");
      setNoteTags(editingFullNote.tags || []);
      setEditorContent(editingFullNote.content || "");
      setIsAddingTag(false);
      setNewTagVal("");
      setEditorMode("view"); // Default to view mode when opening
    }
  }, [editingFullNote]);


  // Note Custom Dragging State
  const [draggingNoteId, setDraggingNoteId] = useState(null);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [noteStartPos, setNoteStartPos] = useState({ x: 0, y: 0 });

  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRefs = useRef({});
  const updateTimeoutsRef = useRef({});

  useEffect(() => {
    loadNotes();
    // Center the canvas on mount
    setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.scrollLeft = (CANVAS_SIZE - containerRef.current.clientWidth) / 2;
        containerRef.current.scrollTop = (CANVAS_SIZE - containerRef.current.clientHeight) / 2;
      }
    }, 100);

    return () => {
      // Clear pending updates on unmount
      Object.values(updateTimeoutsRef.current).forEach(clearTimeout);
    };
  }, []);

  const loadNotes = async () => {
    handleLoading(true);
    try {
      const res = await NoteApi.getNotes();
      setNotes(res.data?.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load notes");
    } finally {
      handleLoading(false);
    }
  };

  const handleCanvasMouseDown = (e) => {
    // Only pan if clicking direct background/grid elements
    if (
      e.target.classList.contains("grid-background") ||
      e.target.classList.contains("canvas-board")
    ) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      setScrollStart({
        left: containerRef.current.scrollLeft,
        top: containerRef.current.scrollTop
      });
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (!isPanning) return;
    const dx = e.clientX - panStart.x;
    const dy = e.clientY - panStart.y;
    containerRef.current.scrollLeft = scrollStart.left - dx;
    containerRef.current.scrollTop = scrollStart.top - dy;
  };

  const handleCanvasMouseUp = () => {
    setIsPanning(false);
  };

  const handleDoubleClick = (e) => {
    // Spawn note at double-click coordinates
    if (
      e.target.classList.contains("grid-background") ||
      e.target.classList.contains("canvas-board")
    ) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / zoom;
      const y = (e.clientY - rect.top) / zoom;

      // Keep inside bounds
      const safeX = Math.max(20, Math.min(CANVAS_SIZE - 280, x));
      const safeY = Math.max(20, Math.min(CANVAS_SIZE - 220, y));

      handleAddNote({ x: safeX, y: safeY });
    }
  };

  const handleAddNote = async (position = null) => {
    handleLoading(true);
    try {
      let finalPosition = position;
      if (!finalPosition && containerRef.current) {
        // Place note in center of current viewport
        const rect = containerRef.current.getBoundingClientRect();
        const canvasRect = canvasRef.current.getBoundingClientRect();

        const viewportCenterX = rect.left + rect.width / 2;
        const viewportCenterY = rect.top + rect.height / 2;

        finalPosition = {
          x: (viewportCenterX - canvasRect.left) / zoom - 125,
          y: (viewportCenterY - canvasRect.top) / zoom - 90
        };
      }

      const res = await NoteApi.createNote({
        content: "",
        color: "#fef08a",
        position: finalPosition || { x: CANVAS_SIZE / 2, y: CANVAS_SIZE / 2 }
      });

      setNotes((prev) => [res.data.data, ...prev]);
      toast.success("Added new note");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create note");
    } finally {
      handleLoading(false);
    }
  };

  const handleUpdateNotePosition = async (id, position) => {
    try {
      // Local optimistic update first
      setNotes(prev => prev.map(n => n._id === id ? { ...n, position } : n));
      await NoteApi.updateNote(id, { position });
    } catch (err) {
      console.error("Failed to save position:", err);
    }
  };

  const handleUpdateNoteContent = (id, content) => {
    // Optimistic local update
    setNotes(prev => prev.map(n => n._id === id ? { ...n, content } : n));

    // Clear any pending timeout for this note
    if (updateTimeoutsRef.current[id]) {
      clearTimeout(updateTimeoutsRef.current[id]);
    }

    // Debounce the database write (800ms delay)
    updateTimeoutsRef.current[id] = setTimeout(async () => {
      try {
        await NoteApi.updateNote(id, { content });
        delete updateTimeoutsRef.current[id];
      } catch (err) {
        console.error("Failed to update note content:", err);
      }
    }, 800);
  };

  const handleModalContentChange = (val) => {
    // 1. Update lightweight local editor content immediately (no typing lag!)
    setEditorContent(val);

    if (!editingFullNote) return;
    const id = editingFullNote._id;

    // 2. Clear any pending database write timeouts for this note
    if (updateTimeoutsRef.current[id]) {
      clearTimeout(updateTimeoutsRef.current[id]);
    }

    // 3. Debounce the write (800ms delay) to prevent constant re-renders of the board
    updateTimeoutsRef.current[id] = setTimeout(async () => {
      try {
        // Optimistically update the parent notes list so preview board is in sync
        setNotes(prev => prev.map(n => n._id === id ? { ...n, content: val } : n));
        await NoteApi.updateNote(id, { content: val });
        delete updateTimeoutsRef.current[id];
      } catch (err) {
        console.error("Failed to update modal content:", err);
      }
    }, 800);
  };

  const closeFullEditor = () => {
    if (editingFullNote) {
      const id = editingFullNote._id;
      // If there's a pending change, flush it immediately before closing
      if (updateTimeoutsRef.current[id]) {
        clearTimeout(updateTimeoutsRef.current[id]);
        setNotes(prev => prev.map(n => n._id === id ? { ...n, content: editorContent } : n));
        NoteApi.updateNote(id, { content: editorContent }).catch(err => console.error("Final sync failed:", err));
        delete updateTimeoutsRef.current[id];
      }
    }
    setEditingFullNote(null);
  };


  const handleUpdateNoteTitle = (id, title) => {
    // Optimistic local update
    setNotes(prev => prev.map(n => n._id === id ? { ...n, title } : n));

    // Clear any pending timeout for this note title
    if (updateTimeoutsRef.current[`title-${id}`]) {
      clearTimeout(updateTimeoutsRef.current[`title-${id}`]);
    }

    // Debounce the database write (800ms delay)
    updateTimeoutsRef.current[`title-${id}`] = setTimeout(async () => {
      try {
        await NoteApi.updateNote(id, { title });
        delete updateTimeoutsRef.current[`title-${id}`];
      } catch (err) {
        console.error("Failed to update note title:", err);
      }
    }, 800);
  };

  const handleUpdateNoteTags = async (id, tags) => {
    // Optimistic local update
    setNotes(prev => prev.map(n => n._id === id ? { ...n, tags } : n));
    try {
      await NoteApi.updateNote(id, { tags });
    } catch (err) {
      console.error("Failed to update note tags:", err);
      toast.error("Failed to save tags");
    }
  };

  const addTag = () => {
    if (newTagVal && newTagVal.trim()) {
      const cleaned = newTagVal.trim();
      if (!noteTags.includes(cleaned)) {
        const updated = [...noteTags, cleaned];
        setNoteTags(updated);
        handleUpdateNoteTags(editingFullNote._id, updated);
      }
    }
    setIsAddingTag(false);
    setNewTagVal("");
  };

  const handleUpdateNoteColor = async (id, color) => {
    try {
      setNotes(prev => prev.map(n => n._id === id ? { ...n, color } : n));
      await NoteApi.updateNote(id, { color });
      setActiveColorPopover(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update note color");
    }
  };

  const handleToggleNotePin = async (id, isPinned) => {
    try {
      setNotes(prev => prev.map(n => n._id === id ? { ...n, isPinned } : n));
      await NoteApi.updateNote(id, { isPinned });
      toast.success(isPinned ? "Note pinned (drag locked)" : "Note unpinned");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update pin state");
    }
  };

  const handleDeleteNote = async (id) => {
    handleLoading(true);
    try {
      await NoteApi.deleteNote(id);
      setNotes(prev => prev.filter(n => n._id !== id));
      toast.success("Note deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete note");
    } finally {
      handleLoading(false);
    }
  };

  const handleFileChange = async (noteId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size cannot exceed 5MB");
      return;
    }

    handleLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const uploadRes = await Api.post("file/upload-file", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      const filename = uploadRes.data?.data?.filenames?.[0];
      if (filename) {
        const imageUrl = `/api/v1/file/get-file/${encodeURIComponent(filename)}`;
        setNotes(prev => prev.map(n => n._id === noteId ? { ...n, imageUrl } : n));
        await NoteApi.updateNote(noteId, { imageUrl });
        toast.success("Image attached to note");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload image");
    } finally {
      handleLoading(false);
    }
  };

  const handleTriggerFileInput = (noteId) => {
    fileInputRefs.current[noteId]?.click();
  };

  const handleRemoveImage = async (noteId) => {
    handleLoading(true);
    try {
      setNotes(prev => prev.map(n => n._id === noteId ? { ...n, imageUrl: "" } : n));
      await NoteApi.updateNote(noteId, { imageUrl: "" });
      toast.success("Image removed");
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove image");
    } finally {
      handleLoading(false);
    }
  };

  // Note-level AI rewrite action handler
  const handleAiEnhanceNote = async (noteId, currentContent, action) => {
    setActiveAiPopover(null);
    if (!currentContent.trim()) {
      toast.error("Please enter some text in the note first");
      return;
    }

    handleLoading(true);
    try {
      const res = await NoteApi.aiEnhance({ content: currentContent, action });
      const enhancedContent = res.data?.data?.enhancedContent;
      if (enhancedContent) {
        setNotes(prev => prev.map(n => n._id === noteId ? { ...n, content: enhancedContent } : n));
        await NoteApi.updateNote(noteId, { content: enhancedContent });
        toast.success(`Note content ${action}ed!`);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "AI Enhancement failed");
    } finally {
      handleLoading(false);
    }
  };

  // Global AI missing notes analysis
  const handleAiSuggestMissing = async () => {
    if (!requirement.trim()) {
      toast.error("Please specify your feature or project requirement");
      return;
    }

    setIsAiSuggesting(true);
    try {
      const res = await NoteApi.aiSuggest({
        notes: notes,
        requirement: requirement
      });
      setAiSuggestions(res.data?.data);
      toast.success("AI Suggestions generated!");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to generate suggestions");
    } finally {
      setIsAiSuggesting(false);
    }
  };

  const handleAddSuggestedNotes = async () => {
    if (!aiSuggestions?.suggestedNotes) return;
    handleLoading(true);
    try {
      const centerPos = containerRef.current
        ? {
          x: containerRef.current.scrollLeft + containerRef.current.clientWidth / 2 - 125,
          y: containerRef.current.scrollTop + containerRef.current.clientHeight / 2 - 90
        }
        : { x: CANVAS_SIZE / 2, y: CANVAS_SIZE / 2 };

      const createPromises = aiSuggestions.suggestedNotes.map((sNote, idx) => {
        // Offset suggestions nicely relative to center if generated position is blank or generic
        const posX = (sNote.position?.x && sNote.position.x < CANVAS_SIZE)
          ? sNote.position.x
          : centerPos.x + (idx * 280) - 280;
        const posY = (sNote.position?.y && sNote.position.y < CANVAS_SIZE)
          ? sNote.position.y
          : centerPos.y + (idx % 2 === 0 ? 100 : -100);

        return NoteApi.createNote({
          content: sNote.content,
          color: sNote.color || "#fef08a",
          position: { x: posX, y: posY }
        });
      });

      const responses = await Promise.all(createPromises);
      const newCreatedNotes = responses.map(r => r.data.data);

      setNotes(prev => [...newCreatedNotes, ...prev]);
      toast.success(`Stuck ${newCreatedNotes.length} suggested notes on your board!`);

      // Clean up drawer state
      setAiSuggestions(null);
      setRequirement("");
      setShowAiDrawer(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to add suggested notes");
    } finally {
      handleLoading(false);
    }
  };

  const handleClearBoard = async () => {
    if (notes.length === 0) return;
    if (!window.confirm("Are you sure you want to delete all notes on this board? This cannot be undone.")) return;

    handleLoading(true);
    try {
      await Promise.all(notes.map(n => NoteApi.deleteNote(n._id)));
      setNotes([]);
      toast.success("Board cleared successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to clear board fully");
    } finally {
      handleLoading(false);
    }
  };

  const handleResetView = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        left: (CANVAS_SIZE - containerRef.current.clientWidth) / 2,
        top: (CANVAS_SIZE - containerRef.current.clientHeight) / 2,
        behavior: "smooth"
      });
    }
    setZoom(1);
  };

  const handleJumpToNote = (note) => {
    if (containerRef.current && note.position) {
      const viewportWidth = containerRef.current.clientWidth;
      const viewportHeight = containerRef.current.clientHeight;

      const targetScrollLeft = note.position.x * zoom - (viewportWidth / 2) + 125;
      const targetScrollTop = note.position.y * zoom - (viewportHeight / 2) + 90;

      containerRef.current.scrollTo({
        left: Math.max(0, Math.min(CANVAS_SIZE, targetScrollLeft)),
        top: Math.max(0, Math.min(CANVAS_SIZE, targetScrollTop)),
        behavior: "smooth"
      });

      toast.success("Panning viewport to pinned note...", { icon: "📍" });
    }
  };

  const handleNoteDragStart = (note, e) => {
    if (note.isPinned) return;
    e.stopPropagation();
    if (e.button !== 0) return; // Only left click
    setDraggingNoteId(note._id);
    setDragStartPos({ x: e.clientX, y: e.clientY });
    setNoteStartPos({ x: note.position?.x || 100, y: note.position?.y || 100 });
  };

  const handleNoteDragMove = (e) => {
    if (!draggingNoteId) return;
    const dx = (e.clientX - dragStartPos.x) / zoom;
    const dy = (e.clientY - dragStartPos.y) / zoom;

    const newX = Math.max(10, Math.min(CANVAS_SIZE - 280, noteStartPos.x + dx));
    const newY = Math.max(10, Math.min(CANVAS_SIZE - 220, noteStartPos.y + dy));

    setNotes(prev => prev.map(n =>
      n._id === draggingNoteId
        ? { ...n, position: { x: newX, y: newY } }
        : n
    ));
  };

  const handleNoteDragEnd = () => {
    if (!draggingNoteId) return;
    const finalNote = notes.find(n => n._id === draggingNoteId);
    if (finalNote) {
      handleUpdateNotePosition(draggingNoteId, finalNote.position);
    }
    setDraggingNoteId(null);
  };

  const matchingNotes = notes.filter(n =>
    n.content.toLowerCase().includes(noteSearch.toLowerCase())
  );

  const pinnedMatching = matchingNotes.filter(n => n.isPinned);
  const unpinnedMatching = matchingNotes.filter(n => !n.isPinned);

  return (
    <div className="w-full h-full relative bg-slate-100 flex overflow-hidden">
      {/* Infinite Canvas Container */}
      <div
        ref={containerRef}
        className={`flex-1 h-full w-full overflow-auto relative custom-scrollbar select-none ${isPanning ? "cursor-grabbing" : "cursor-grab"
          }`}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={(e) => {
          handleCanvasMouseMove(e);
          handleNoteDragMove(e);
        }}
        onMouseUp={() => {
          handleCanvasMouseUp();
          handleNoteDragEnd();
        }}
        onMouseLeave={() => {
          handleCanvasMouseUp();
          handleNoteDragEnd();
        }}
        onDoubleClick={handleDoubleClick}
      >
        {/* Actual Scrollable Grid Canvas */}
        <div
          ref={canvasRef}
          className="canvas-board relative bg-[#f8fafc]"
          style={{
            width: `${CANVAS_SIZE}px`,
            height: `${CANVAS_SIZE}px`,
            transform: `scale(${zoom})`,
            transformOrigin: "0 0",
            backgroundImage: "radial-gradient(rgba(15, 23, 42, 0.05) 1.5px, transparent 1.5px)",
            backgroundSize: "28px 28px",
          }}
        >
          {/* Render All Sticky Notes */}
          {notes.map((note) => {
            const isDark = note.color === "#4b5563";
            return (
              <div
                key={note._id}
                id={`note-${note._id}`}
                className="absolute rounded-2xl flex flex-col premium-shadow overflow-hidden group/note border border-slate-200/50"
                style={{
                  left: note.position?.x || 100,
                  top: note.position?.y || 100,
                  width: `${note.size?.width || 250}px`,
                  minHeight: `${note.size?.height || 180}px`,
                  height: "auto",
                  backgroundColor: note.color,
                  border: isDark ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(0,0,0,0.08)",
                  zIndex: draggingNoteId === note._id ? 1000 : 10
                }}
              >
                {/* Drag Handle Header Bar */}
                <div
                  onMouseDown={(e) => handleNoteDragStart(note, e)}
                  className={`h-7 px-3 flex items-center justify-between border-b ${draggingNoteId === note._id ? "cursor-grabbing" : "cursor-grab"
                    } ${isDark
                      ? "bg-slate-900/40 border-white/10 text-slate-300"
                      : "bg-black/5 border-black/5 text-slate-600"
                    }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-40"></span>
                    <span className="text-[9px] font-bold tracking-widest uppercase opacity-60">
                      {note.isPinned ? "Locked" : "Sticky"}
                    </span>
                  </div>

                  {/* Pin/Unpin Status Icon */}
                  {note.isPinned && (
                    <IoPinOutline size={12} className="text-rose-500 animate-pulse" />
                  )}
                </div>

                {/* Optional Note Image attachment */}
                {note.imageUrl && (
                  <div className="w-full h-40 relative overflow-hidden bg-slate-950/20 shrink-0 border-b border-black/5">
                    <img
                      src={note.imageUrl.startsWith("http") ? note.imageUrl : `${serverUrl}${note.imageUrl}`}
                      alt="Note Attachment"
                      className="w-full h-full object-cover cursor-zoom-in hover:scale-[1.02] transition-transform duration-200"
                      draggable={false}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveLightboxImage(note.imageUrl.startsWith("http") ? note.imageUrl : `${serverUrl}${note.imageUrl}`);
                      }}
                    />
                    <button
                      onClick={() => handleRemoveImage(note._id)}
                      className="absolute top-1.5 right-1.5 w-5 h-5 bg-black/60 hover:bg-black text-white flex items-center justify-center rounded-full transition-colors"
                      title="Remove image"
                    >
                      <IoCloseOutline size={12} />
                    </button>
                  </div>
                )}

                {/* Textarea editing area */}
                <div className="flex-1 p-3 flex flex-col min-h-0 overflow-hidden">
                  {(() => {
                    const isHtml = /<[a-z][\s\S]*>/i.test(note.content || "");
                    const shouldShowPreview = (note.content && note.content.length > 150) || isHtml || note.title;

                    if (shouldShowPreview) {
                      return (
                        <div className="flex-1 flex flex-col justify-between min-h-0">
                          <div
                            className={`w-full bg-transparent text-[11px] font-mono leading-relaxed p-0 whitespace-pre-wrap select-none overflow-hidden ${isDark ? "text-slate-200" : "text-slate-700"
                              }`}
                            style={{
                              display: "-webkit-box",
                              WebkitLineClamp: 8,
                              WebkitBoxOrient: "vertical",
                              maxHeight: "150px"
                            }}
                          >
                            {note.title && <div className="font-extrabold text-[12px] mb-1 truncate text-slate-900 dark:text-white">{note.title}</div>}
                            {getPreviewText(note)}
                          </div>
                          {note.tags && note.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5 mb-1">
                              {note.tags.slice(0, 3).map(t => (
                                <span key={t} className="text-[8px] px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 font-black tracking-wide">
                                  {t}
                                </span>
                              ))}
                              {note.tags.length > 3 && (
                                <span className="text-[8px] px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 font-black">
                                  +{note.tags.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingFullNote(note);
                            }}
                            className={`mt-2 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black transition-all active:scale-95 border self-start ${isDark
                              ? "bg-white/10 hover:bg-white/20 text-white border-white/10"
                              : "bg-black/5 hover:bg-black/10 text-slate-700 border-black/5"
                              }`}
                            onMouseDown={(e) => e.stopPropagation()}
                          >
                            Read More
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div className="flex-1 flex flex-col justify-between min-h-0">
                        <textarea
                          value={note.content}
                          onChange={(e) => handleUpdateNoteContent(note._id, e.target.value)}
                          onInput={(e) => {
                            e.target.style.height = "auto";
                            e.target.style.height = `${e.target.scrollHeight}px`;
                          }}
                          onPointerDownCapture={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                          ref={(el) => {
                            if (el) {
                              el.style.height = "auto";
                              el.style.height = `${el.scrollHeight}px`;
                            }
                          }}
                          placeholder="Write a note... double-click canvas to spawn more."
                          className={`w-full bg-transparent resize-none focus:outline-none border-none text-[11px] font-medium leading-relaxed p-0 custom-scrollbar ${isDark ? "text-white placeholder:text-slate-500" : "text-slate-800 placeholder:text-slate-400"
                            }`}
                          style={{ height: "auto" }}
                        />
                      </div>
                    );
                  })()}
                </div>

                {/* Toolbar for sticky note options (visible on hover) */}
                <div
                  className={`h-7 px-3 py-1 flex items-center justify-end gap-1.5 opacity-0 group-hover/note:opacity-100 transition-opacity duration-200 border-t ${isDark
                    ? "bg-slate-900/40 border-white/5"
                    : "bg-black/5 border-black/5"
                    }`}
                  onPointerDownCapture={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  {/* Pin button */}
                  <button
                    onClick={() => handleToggleNotePin(note._id, !note.isPinned)}
                    className={`p-1 rounded transition-colors ${note.isPinned
                      ? "text-rose-500 hover:bg-rose-500/10"
                      : isDark ? "text-slate-400 hover:text-white hover:bg-white/10" : "text-slate-500 hover:text-black hover:bg-black/5"
                      }`}
                    title={note.isPinned ? "Unlock movement" : "Lock position"}
                  >
                    <IoPinOutline size={12} />
                  </button>

                  {/* Add Image Button */}
                  <button
                    onClick={() => handleTriggerFileInput(note._id)}
                    className={`p-1 rounded transition-colors ${isDark ? "text-slate-400 hover:text-white hover:bg-white/10" : "text-slate-500 hover:text-black hover:bg-black/5"
                      }`}
                    title="Attach Image"
                  >
                    <IoImageOutline size={12} />
                  </button>
                  <input
                    type="file"
                    ref={(el) => (fileInputRefs.current[note._id] = el)}
                    onChange={(e) => handleFileChange(note._id, e)}
                    accept="image/*"
                    className="hidden"
                  />

                  {/* Color Palette trigger */}
                  <div className="relative">
                    <button
                      onClick={() => setActiveColorPopover(activeColorPopover === note._id ? null : note._id)}
                      className={`p-1 rounded transition-colors ${activeColorPopover === note._id
                        ? "text-primary bg-primary/10"
                        : isDark ? "text-slate-400 hover:text-white hover:bg-white/10" : "text-slate-500 hover:text-black hover:bg-black/5"
                        }`}
                      title="Sticky Color"
                    >
                      <IoColorPaletteOutline size={12} />
                    </button>
                    {activeColorPopover === note._id && (
                      <div className={`absolute bottom-8 right-0 p-1.5 rounded-xl flex gap-1 z-50 border shadow-xl ${isDark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"
                        }`}>
                        {COLORS.map((col) => (
                          <button
                            key={col.hex}
                            onClick={() => handleUpdateNoteColor(note._id, col.hex)}
                            className="w-4 h-4 rounded-full border border-black/10 flex items-center justify-center transition-transform hover:scale-125"
                            style={{ backgroundColor: col.hex }}
                            title={col.name}
                          >
                            {note.color === col.hex && (
                              <IoCheckmarkOutline size={10} className="text-slate-800" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* AI magic rewrite wand */}
                  <div className="relative">
                    <button
                      onClick={() => setActiveAiPopover(activeAiPopover === note._id ? null : note._id)}
                      className={`p-1 rounded transition-colors ${activeAiPopover === note._id
                        ? "text-primary bg-primary/10"
                        : isDark ? "text-slate-400 hover:text-white hover:bg-white/10" : "text-slate-500 hover:text-black hover:bg-black/5"
                        }`}
                      title="AI Enhancement"
                    >
                      <IoSparklesOutline size={12} />
                    </button>
                    {activeAiPopover === note._id && (
                      <div className={`absolute bottom-8 right-0 w-32 p-1 rounded-xl flex flex-col z-50 border shadow-xl ${isDark ? "bg-slate-900 border-slate-700 text-slate-300" : "bg-white border-slate-200 text-slate-700"
                        }`}>
                        {["expand", "summarize", "checklist", "clarify"].map((act) => (
                          <button
                            key={act}
                            onClick={() => handleAiEnhanceNote(note._id, note.content, act)}
                            className={`px-2 py-1 text-[10px] font-bold uppercase text-left rounded-md transition-colors ${isDark ? "hover:bg-white/10" : "hover:bg-slate-100"
                              }`}
                          >
                            {act}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Delete note */}
                  <button
                    onClick={() => handleDeleteNote(note._id)}
                    className="p-1 rounded hover:bg-rose-500/10 text-rose-500 hover:text-rose-600 transition-colors"
                    title="Delete Note"
                  >
                    <IoTrashOutline size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Control Toolbar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[40] bg-white/95 backdrop-blur-md border border-slate-200 px-5 py-3 rounded-full flex items-center gap-4 shadow-xl">
        <button
          onClick={() => handleAddNote()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primaryHover text-white rounded-full text-[10px] font-black tracking-wider transition-all shadow-md active:scale-95 uppercase"
        >
          <IoAddOutline size={16} />
          Add note
        </button>

        <button
          onClick={() => setShowAiDrawer(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primaryHover text-white rounded-full text-[10px] font-black tracking-wider transition-all shadow-md active:scale-95 uppercase"
        >
          <IoSparklesOutline size={14} className="animate-pulse" />
          AI Suggest
        </button>

        <div className="h-4 w-[1px] bg-slate-200"></div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(z => Math.max(0.4, z - 0.15))}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            title="Zoom Out"
          >
            <IoContractOutline size={14} />
          </button>
          <span className="text-[10px] font-black text-slate-600 min-w-[32px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(z => Math.min(2.0, z + 0.15))}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            title="Zoom In"
          >
            <IoExpandOutline size={14} />
          </button>
        </div>

        <div className="h-4 w-[1px] bg-slate-200"></div>

        <button
          onClick={handleResetView}
          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          title="Reset View"
        >
          <IoRefreshOutline size={14} />
        </button>

        <button
          onClick={handleClearBoard}
          className="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          title="Clear Entire Board"
        >
          <IoTrashOutline size={14} />
        </button>
      </div>

      {/* Helper User Guide legend */}
      <div className="absolute top-5 left-5 z-[30] pointer-events-none select-none bg-white/95 backdrop-blur-md border border-slate-200 p-3 rounded-2xl hidden md:block shadow-sm">
        <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
          <IoHelpCircleOutline size={12} />
          Board Guide
        </h4>
        <ul className="text-[9px] font-bold text-slate-500 space-y-1">
          <li>• Double-click background to spawn note</li>
          <li>• Drag note headers to move</li>
          <li>• Click and drag background to pan</li>
          <li>• Scroll mouse wheel to pan vertically</li>
        </ul>
      </div>

      {/* Board Directory & Search Quick Jump Panel */}
      <div className="absolute top-5 right-6 z-[30] bg-white/95 backdrop-blur-md border border-slate-200 p-4 rounded-2xl w-72 shadow-sm max-h-80 flex flex-col overflow-hidden animate-in slide-in-from-top-4 duration-300">
        <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5 shrink-0 select-none">
          <IoSearchOutline size={12} className="text-primary" />
          Board Directory ({notes.length})
        </h4>

        {/* Search Bar Input */}
        <div className="relative mb-3 shrink-0">
          <IoSearchOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
          <input
            type="text"
            placeholder="Search notes content..."
            value={noteSearch}
            onChange={(e) => setNoteSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-9 pr-8 py-1.5 text-[10px] font-bold text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all"
          />
          {noteSearch && (
            <button
              onClick={() => setNoteSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-450 hover:text-slate-650"
            >
              <IoCloseOutline size={12} />
            </button>
          )}
        </div>

        {/* Scrollable list of matching notes */}
        <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
          {matchingNotes.length > 0 ? (
            <>
              {/* Pinned Section */}
              {pinnedMatching.length > 0 && (
                <div className="space-y-1">
                  <div className="text-[8px] font-black text-rose-500 uppercase tracking-wider pl-1">Pinned</div>
                  {pinnedMatching.map(n => (
                    <button
                      key={n._id}
                      onClick={() => handleJumpToNote(n)}
                      className="w-full text-left p-2 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-primary/20 transition-all flex items-center gap-2 group"
                    >
                      <span className="w-2.5 h-2.5 rounded-full border border-black/5 shrink-0" style={{ backgroundColor: n.color }} />
                      <span className="text-[10px] font-bold text-slate-650 truncate group-hover:text-primary transition-colors flex-1">
                        {n.title?.trim() || getPreviewText(n).trim() || "Empty pinned note"}
                      </span>
                      <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest group-hover:text-primary/70 transition-colors">Jump</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Unpinned Section */}
              {unpinnedMatching.length > 0 && (
                <div className="space-y-1">
                  <div className="text-[8px] font-black text-slate-400 uppercase tracking-wider pl-1">Notes</div>
                  {unpinnedMatching.map(n => (
                    <button
                      key={n._id}
                      onClick={() => handleJumpToNote(n)}
                      className="w-full text-left p-2 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-primary/20 transition-all flex items-center gap-2 group"
                    >
                      <span className="w-2.5 h-2.5 rounded-full border border-black/5 shrink-0" style={{ backgroundColor: n.color }} />
                      <span className="text-[10px] font-bold text-slate-650 truncate group-hover:text-primary transition-colors flex-1">
                        {n.title?.trim() || getPreviewText(n).trim() || "Empty note"}
                      </span>
                      <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest group-hover:text-primary/70 transition-colors">Jump</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="py-6 flex flex-col items-center justify-center text-center opacity-40">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">No matching notes</p>
            </div>
          )}
        </div>
      </div>

      {/* Global AI Suggestion Drawer */}
      <AnimatePresence>
        {showAiDrawer && (
          <>
            {/* Dark Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAiDrawer(false)}
              className="fixed inset-0 bg-black z-[100]"
            />

            {/* Sidebar drawer container */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-slate-50 border-l border-slate-200 shadow-2xl z-[100] flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-vermilion-500 to-vermilion-600 flex items-center justify-center text-white">
                    <IoSparklesOutline size={20} className="animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-slate-800 font-black text-base leading-none">AI Board Designer</h3>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1.5">Missing Gaps Analysis</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAiDrawer(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <IoCloseOutline size={20} />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                <div className="bg-white border border-slate-200 p-4 rounded-2xl">
                  <p className="text-slate-600 text-[11px] font-medium leading-relaxed">
                    Tell the AI what project, topic, or feature you are trying to design. The AI will crosscheck with your board, identify missing requirements, and recommend a collection of tasks to add to your board.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Feature Requirement</label>
                  <textarea
                    rows={4}
                    value={requirement}
                    onChange={(e) => setRequirement(e.target.value)}
                    placeholder="e.g., Implementing JWT authentication with local storage tokens and OAuth sign-in flow."
                    className="w-full bg-white border border-slate-200 focus:border-primary rounded-2xl p-4 text-[12px] font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none transition-colors resize-none shadow-inner"
                  />
                </div>

                {/* Suggestions response panel */}
                {aiSuggestions && (
                  <div className="space-y-4 pt-4 border-t border-slate-200">
                    <div className="bg-vermilion-50 border border-vermilion-200 p-4 rounded-2xl">
                      <h4 className="text-[10px] font-black text-primary uppercase tracking-widest mb-1.5">AI Analysis</h4>
                      <p className="text-vermilion-950 text-[11px] font-medium leading-relaxed">
                        {aiSuggestions.recommendation}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h5 className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Suggested Sticky Notes ({aiSuggestions.suggestedNotes?.length})</h5>
                      <div className="space-y-2">
                        {aiSuggestions.suggestedNotes?.map((sNote, idx) => (
                          <div
                            key={idx}
                            className="p-3.5 rounded-xl border border-slate-200 flex items-start gap-3 bg-white"
                            style={{ backgroundColor: `${sNote.color}15` }}
                          >
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0 mt-0.5"
                              style={{ backgroundColor: sNote.color }}
                            />
                            <p className="text-[11px] text-slate-700 font-bold leading-relaxed">{sNote.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-6 border-t border-slate-200 bg-white flex flex-col gap-3 shrink-0">
                {!aiSuggestions ? (
                  <button
                    onClick={handleAiSuggestMissing}
                    disabled={isAiSuggesting || !requirement.trim()}
                    className="w-full py-3.5 bg-primary hover:bg-primaryHover text-white rounded-xl text-[10px] font-black transition-all active:scale-[0.98] shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:bg-primary disabled:active:scale-100"
                  >
                    {isAiSuggesting ? (
                      <>
                        <IoRefreshOutline className="animate-spin" size={16} />
                        ANALYSING BOARD...
                      </>
                    ) : (
                      <>
                        <IoSparklesOutline size={14} />
                        FIND GAPS & RECOMMEND
                      </>
                    )}
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setAiSuggestions(null)}
                      className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-[10px] font-black text-slate-600 transition-colors uppercase"
                    >
                      Clear
                    </button>
                    <button
                      onClick={handleAddSuggestedNotes}
                      className="flex-[2] py-3 bg-primary hover:bg-primaryHover text-white rounded-xl text-[10px] font-black transition-all active:scale-[0.98] shadow-lg shadow-primary/25 uppercase"
                    >
                      Add suggestions
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {/* Image Lightbox Modal */}
      <AnimatePresence>
        {activeLightboxImage && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.9 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveLightboxImage(null)}
              className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[9999] flex items-center justify-center p-4 cursor-zoom-out"
            >
              <motion.img
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                src={activeLightboxImage}
                alt="Enlarged Note Attachment"
                className="max-w-[90vw] max-h-[90vh] object-contain rounded-2xl shadow-2xl border border-white/10"
                onClick={(e) => e.stopPropagation()}
              />
              <button
                onClick={() => setActiveLightboxImage(null)}
                className="absolute top-6 right-6 w-10 h-10 bg-white/10 hover:bg-white/20 border border-white/10 text-white flex items-center justify-center rounded-full transition-all"
              >
                <IoCloseOutline size={24} />
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Full Note Editor Modal */}
      <AnimatePresence>
        {editingFullNote && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={closeFullEditor}
              className="fixed inset-0 bg-slate-900 z-[999] backdrop-blur-sm"
            />

            {/* Modal Container */}
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ scale: 0.95, y: 15, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: 15, opacity: 0 }}
                transition={{ type: "spring", damping: 28, stiffness: 240 }}
                className="relative bg-white rounded-[2.5rem] shadow-2xl w-full h-[92%] overflow-hidden border border-slate-100 flex flex-col pointer-events-auto"
              >
                {/* Header Metadata Panel */}
                <div className="px-10 pt-8 pb-6 bg-white shrink-0 flex flex-col relative select-none">
                  {/* Header Controls (Toggle & Close) */}
                  <div className="absolute top-6 right-8 flex items-center gap-3">
                    {/* Mode Toggle Switch */}
                    <div className="flex bg-slate-100 p-0.5 rounded-xl items-center border border-slate-200/40">
                      <button
                        onClick={() => setEditorMode("view")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] uppercase font-black tracking-wider transition-all ${editorMode === "view"
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-500 hover:text-slate-800"
                          }`}
                      >
                        <IoEyeOutline size={12} />
                        View
                      </button>
                      <button
                        onClick={() => setEditorMode("edit")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] uppercase font-black tracking-wider transition-all ${editorMode === "edit"
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-500 hover:text-slate-800"
                          }`}
                      >
                        <IoCreateOutline size={12} />
                        Edit
                      </button>
                    </div>

                    <button
                      onClick={closeFullEditor}
                      className="w-9 h-9 flex items-center justify-center bg-slate-50 hover:bg-slate-100 rounded-full transition-all border border-slate-200/50 text-slate-500 hover:text-red-500"
                    >
                      <IoCloseOutline size={20} />
                    </button>
                  </div>

                  {/* Title Input Field */}
                  <input
                    type="text"
                    value={noteTitle}
                    onChange={(e) => {
                      setNoteTitle(e.target.value);
                      handleUpdateNoteTitle(editingFullNote._id, e.target.value);
                    }}
                    readOnly={editorMode === "view"}
                    placeholder="Untitled Note"
                    className={`text-4xl font-extrabold text-slate-800 focus:outline-none border-none bg-transparent w-full mb-6 placeholder:text-slate-200 tracking-tight ${editorMode === "view" ? "cursor-default" : ""
                      }`}
                  />

                  {/* Metadata rows */}
                  <div className="space-y-3.5 border-b border-slate-100 pb-6">
                    {/* Created By Row */}
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 text-xs font-bold w-28 select-none uppercase tracking-wider">Created by</span>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-black text-slate-600 uppercase tracking-wide overflow-hidden border border-slate-300/40">
                          {currentUser?.avatar ? (
                            <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            currentUser?.firstName?.[0] || "F"
                          )}
                        </div>
                        <span className="text-xs font-bold text-slate-750">
                          {currentUser ? `${currentUser.firstName} ${currentUser.lastName || ""}`.trim() : "Floyd Lawton"}
                        </span>
                      </div>
                    </div>

                    {/* Last Modified Row */}
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 text-xs font-bold w-28 select-none uppercase tracking-wider">Last Modified</span>
                      <span className="text-xs font-bold text-slate-650">
                        {editingFullNote.updatedAt ? new Date(editingFullNote.updatedAt).toLocaleString("en-US", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true
                        }) : "Just now"}
                      </span>
                    </div>

                    {/* Tags Row */}
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 text-xs font-bold w-28 select-none uppercase tracking-wider">Tags</span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {(noteTags || []).map((tag, idx) => (
                          <span
                            key={tag + idx}
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-600 transition-colors ${editorMode === "edit" ? "hover:border-slate-350" : ""
                              }`}
                          >
                            {tag}
                            {editorMode === "edit" && (
                              <button
                                onClick={() => {
                                  const newTags = noteTags.filter(t => t !== tag);
                                  setNoteTags(newTags);
                                  handleUpdateNoteTags(editingFullNote._id, newTags);
                                }}
                                className="text-slate-400 hover:text-red-500 font-bold ml-1 text-[10px]"
                              >
                                ✕
                              </button>
                            )}
                          </span>
                        ))}
                        {editorMode === "edit" && (
                          <>
                            {isAddingTag ? (
                              <input
                                type="text"
                                value={newTagVal}
                                onChange={(e) => setNewTagVal(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    addTag();
                                  } else if (e.key === "Escape") {
                                    setIsAddingTag(false);
                                    setNewTagVal("");
                                  }
                                }}
                                onBlur={addTag}
                                autoFocus
                                placeholder="Tag name..."
                                className="px-3 py-1 rounded-xl border border-primary text-xs font-bold text-slate-700 bg-white focus:outline-none shadow-sm"
                              />
                            ) : (
                              <button
                                onClick={() => setIsAddingTag(true)}
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-xl border border-dashed border-slate-300 hover:border-slate-400 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors"
                              >
                                + Add new tag
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Editor Container with Custom Toolbar and Quill */}
                <div className="flex-1 bg-white flex flex-col overflow-hidden relative note-editor-wrapper">
                  {/* Custom Toolbar */}
                  <QuillToolbar style={{ display: editorMode === "edit" ? "flex" : "none" }} />

                  {/* React Quill Editor */}
                  <ReactQuill
                    key={editorMode}
                    theme="snow"
                    value={editorContent}
                    onChange={handleModalContentChange}
                    modules={editorModules}
                    formats={editorFormats}
                    readOnly={editorMode === "view"}
                    placeholder={editorMode === "edit" ? "Start typing your note..." : ""}
                    className="flex-1 overflow-hidden"
                  />
                </div>

                {/* Footer Panel */}
                <div className="px-10 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0 select-none">
                  <div className="flex items-center gap-2 text-emerald-600">
                    {editorMode === "edit" ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                        <span className="text-[10px] font-black uppercase tracking-wider">Changes Autosaved</span>
                      </>
                    ) : (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-450"></span>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">View Mode (Read Only)</span>
                      </>
                    )}
                  </div>
                  <button
                    onClick={closeFullEditor}
                    className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black transition-all active:scale-95 shadow-md uppercase tracking-wider"
                  >
                    Done
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CanvasNotes;
