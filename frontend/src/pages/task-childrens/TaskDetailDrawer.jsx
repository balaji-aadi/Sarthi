import React, { useEffect, useState, useRef, useMemo } from 'react';
import { IoClose, IoFlagSharp, IoCalendarOutline, IoTimeOutline, IoPersonOutline, IoAttachOutline, IoGitNetworkSharp, IoCheckmarkCircleOutline, IoTrashOutline, IoArrowDown, IoArrowUp, IoOpenOutline, IoDocumentTextOutline } from 'react-icons/io5';
import { MdEdit } from 'react-icons/md';
import { LuCode2 } from 'react-icons/lu';
import moment from 'moment';
window.moment = moment;
import { TaskApi } from '../../services/api/Task.api';
import { NoteApi } from '../../services/api/Note.api';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { server } from '../../services/config';
import DsaCodingArenaModal from '../../components/dsa/DsaCodingArenaModal';
import { FaCode } from "react-icons/fa";
import ReactQuill from 'react-quill';
import { getCurriculumNodeType, getActionVerbStyle, formatLevelLabel, getCurriculumDrawerHierarchy, getSafePrerequisites, getCurriculumSortKey, isLldTask, isDsaBranch, isHldBranch } from '../../utils/curriculumHelper';
import CurriculumContentRenderer from '../../components/lld/CurriculumContentRenderer';
import TaskLinkedNotes from '../../components/common/TaskLinkedNotes';

const hasAdditionalNotes = (notes) => {
    if (!notes) return false;
    if (typeof notes !== 'string') return false;
    const stripped = notes.replace(/<[^>]*>?/gm, '');
    const decoded = stripped
        .replace(/&nbsp;/gi, '')
        .replace(/&amp;/gi, '')
        .trim();
    return decoded.length > 0;
};

const getYoutubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

const decodeHtmlEntities = (str) => {
    if (!str) return "";
    const txt = document.createElement("textarea");
    txt.innerHTML = str;
    return txt.value;
};

const isHtmlNote = (content) => {
    if (!content) return false;
    const lower = content.toLowerCase();
    return lower.includes("<!doctype html>") ||
        lower.includes("&lt;!doctype html&gt;") ||
        lower.includes("<html") ||
        lower.includes("&lt;html") ||
        lower.includes("<style") ||
        lower.includes("&lt;style") ||
        lower.includes("<body") ||
        lower.includes("&lt;body");
};

const TaskDetailDrawer = ({ isOpen, onClose, task: initialTask, onTaskUpdate, canEdit, onStartMajorProblem }) => {
    const [task, setTask] = useState(initialTask);
    const [showCodingModal, setShowCodingModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [subtasks, setSubtasks] = useState([]);
    const [activeTab, setActiveTab] = useState('subtasks'); // 'subtasks', 'activity', 'attachments'
    const { currentUser, activeBranch } = useSelector(state => state.store);
    const taskNotesRef = useRef(null);
    const isAdmin = currentUser?.userRole?.name?.toLowerCase() === 'admin' ||
        currentUser?.role === 'admin' ||
        currentUser?.email === 'balajiaadi2000@gmail.com' ||
        (currentUser?.userRoles && currentUser.userRoles.some(r => r.name?.toLowerCase() === 'admin'));
    const [notes, setNotes] = useState([]);

    const isTaskLld = isLldTask(task);
    const isTaskDsa = Boolean(
        (task?.taskId && /^DSA/i.test(task.taskId)) ||
        (task?.projectName && typeof task.projectName === 'object' && /^DSA/i.test(task.projectName.name || task.projectName.key)) ||
        (!isTaskLld && !isHldBranch(activeBranch) && isDsaBranch(activeBranch))
    );
    const displayStatus = (isTaskDsa && (task?.status === 'backlog' || task?.status === 'hold')) ? 'todo' : task?.status;

    const linkedNotes = useMemo(() => {
        if (!notes || !Array.isArray(notes)) return [];
        return notes.filter(n => {
            const isLinked = (n.taskId === task?._id) || (n.taskIds && n.taskIds.includes(task?._id));
            if (isLinked) return true;
            if (task?.parentTask) {
                const parentId = typeof task.parentTask === 'object' ? task.parentTask?._id : task.parentTask;
                if (n.taskId === parentId || (n.taskIds && n.taskIds.includes(parentId))) return true;
            }
            return false;
        });
    }, [notes, task]);

    const sortedSubtasks = useMemo(() => {
        if (!subtasks || !Array.isArray(subtasks)) return [];
        return [...subtasks].sort((a, b) => {
            const keyA = getCurriculumSortKey(a.taskId || '');
            const keyB = getCurriculumSortKey(b.taskId || '');
            return keyA.localeCompare(keyB, undefined, { numeric: true });
        });
    }, [subtasks]);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [isReaderOpen, setIsReaderOpen] = useState(false);
    const [activeReaderNoteId, setActiveReaderNoteId] = useState(null);
    const [readerSearchTerm, setReaderSearchTerm] = useState("");
    const [isEditingNote, setIsEditingNote] = useState(false);
    const [editedTitle, setEditedTitle] = useState("");
    const [editedContent, setEditedContent] = useState("");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isBilingual, setIsBilingual] = useState(false);
    const [bilingualTaskId, setBilingualTaskId] = useState("");
    const [editedEnContent, setEditedEnContent] = useState("");
    const [editedHiContent, setEditedHiContent] = useState("");
    const [isTranslating, setIsTranslating] = useState(false);
    const [editorMode, setEditorMode] = useState("rich"); // "rich" or "code"
    const activeNote = notes.find(n => n._id === activeReaderNoteId);
    // Zen Reading Mode State
    const [isReadingModeActive, setIsReadingModeActive] = useState(false);
    const [showPersonalTracking, setShowPersonalTracking] = useState(false);
    const lastScrollTopRef = useRef(0);
    const accumulatedScrollRef = useRef(0);
    const transitionLockRef = useRef(false);
    const [iframeScrollInfo, setIframeScrollInfo] = useState({ isAtBottom: false, canScroll: false });
    const iframeRef = useRef(null);

    useEffect(() => {
        setIsReadingModeActive(false);
        transitionLockRef.current = false;
        lastScrollTopRef.current = 0;
        accumulatedScrollRef.current = 0;
    }, [activeReaderNoteId]);

    const handleExitReadingMode = () => {
        transitionLockRef.current = true;
        accumulatedScrollRef.current = 0;
        setIsReadingModeActive(false);
        // Lock transitions for 1200ms so any scroll events fired during header/sidebar expansion are completely ignored
        setTimeout(() => {
            transitionLockRef.current = false;
            accumulatedScrollRef.current = 0;
        }, 1200);
    };

    useEffect(() => {
        const handleMessage = (e) => {
            if (e.data?.type === 'iframeScroll') {
                const { scrollTop, scrollHeight, clientHeight } = e.data;
                const parentHeight = window.innerHeight;

                // Track scroll state for FAB
                setIframeScrollInfo({
                    isAtBottom: Math.ceil(scrollTop + clientHeight) >= scrollHeight - 50,
                    canScroll: scrollHeight > clientHeight + 100
                });

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

                // Only automatically ENTER reading mode when scrolling down.
                // Once in reading mode, NEVER automatically exit via scroll. User must click "End Read" / "Exit Full Screen".
                if (!isReadingModeActive && isScrollingDown && scrollTop > 150) {
                    transitionLockRef.current = true;
                    accumulatedScrollRef.current = 0;
                    setIsReadingModeActive(true);
                    setTimeout(() => { transitionLockRef.current = false; }, 800);
                }
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [isReadingModeActive]);

    const handleReaderScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        const parentHeight = window.innerHeight;

        setIframeScrollInfo({
            isAtBottom: Math.ceil(scrollTop + clientHeight) >= scrollHeight - 50,
            canScroll: scrollHeight > clientHeight + 100
        });

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

        // Only automatically ENTER reading mode when scrolling down.
        // Once in reading mode, NEVER automatically exit via scroll. User must click "End Read" / "Exit Full Screen".
        if (!isReadingModeActive && isScrollingDown && scrollTop > 150) {
            transitionLockRef.current = true;
            accumulatedScrollRef.current = 0;
            setIsReadingModeActive(true);
            setTimeout(() => { transitionLockRef.current = false; }, 800);
        }
    };

    const handleFloatingScroll = () => {
        if (iframeScrollInfo.isAtBottom) {
            // Scroll to top
            if (iframeRef.current) {
                iframeRef.current.contentWindow.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                document.querySelector('.note-reader-container')?.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } else {
            // Scroll to bottom
            if (iframeRef.current) {
                const height = iframeRef.current.contentDocument?.documentElement?.scrollHeight || 9999;
                iframeRef.current.contentWindow.scrollTo({ top: height, behavior: 'smooth' });
            } else {
                const container = document.querySelector('.note-reader-container');
                if (container) container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
            }
        }
    };
    const handleTranslateToHindi = async (englishText) => {
        if (!englishText || englishText.trim() === "" || englishText === "<p><br></p>") {
            toast.error("Please enter some English content first");
            return null;
        }
        setIsTranslating(true);
        const loadingToast = toast.loading("Translating to Hindi...");
        try {
            const res = await NoteApi.aiEnhance({ content: englishText, action: "translate-hi" });
            const translated = res.data?.data?.enhancedContent || res.data?.enhancedContent;
            if (translated) {
                toast.success("Translation completed!");
                return translated;
            } else {
                toast.error("Translation returned empty content");
                return null;
            }
        } catch (err) {
            console.error("Translation failed:", err);
            toast.error("Failed to translate note");
            return null;
        } finally {
            toast.dismiss(loadingToast);
            setIsTranslating(false);
        }
    };

    const getCleanSnippet = (content, limit = 100) => {
        if (!content) return "No content";
        let clean = decodeHtmlEntities(content);
        clean = clean.replace(/<style[\s\S]*?<\/style>/gi, ' ');
        clean = clean.replace(/<script[\s\S]*?<\/script>/gi, ' ');
        clean = clean.replace(/<div[^>]*class="note-root"[\s\S]*?<div[^>]*class="lang-en-[^"]*"[^>]*>/gi, ' ');
        clean = clean.replace(/<[^>]*>?/gm, ' ');
        clean = clean.replace(/&nbsp;/gi, ' ').replace(/\s+/g, ' ').trim();
        return clean.slice(0, limit) + (clean.length > limit ? "..." : "");
    };

    const parseNotePreview = (content) => {
        if (!content) return { text: "No content", links: [] };
        let clean = decodeHtmlEntities(content);
        clean = clean.replace(/<style[\s\S]*?<\/style>/gi, ' ');
        clean = clean.replace(/<script[\s\S]*?<\/script>/gi, ' ');
        clean = clean.replace(/<div[^>]*class="note-root"[\s\S]*?<div[^>]*class="lang-en-[^"]*"[^>]*>/gi, ' ');

        // Extract URLs before removing tags
        const urlRegex = /(https?:\/\/[^\s<"']+)/gi;
        const matches = clean.match(urlRegex) || [];
        const uniqueLinks = Array.from(new Set(matches)).slice(0, 3).map(url => {
            let label = "Resource";
            const lower = url.toLowerCase();
            if (lower.includes("eraser.io")) {
                label = "Eraser.io Diagram";
            } else if (lower.includes("excalidraw.com")) {
                label = "Excalidraw";
            } else if (lower.includes("leetcode.com")) {
                label = "LeetCode";
            } else if (lower.includes("youtube.com") || lower.includes("youtu.be")) {
                label = "Video Tutorial";
            } else if (lower.includes("github.com")) {
                label = "GitHub";
            } else {
                try {
                    const parsed = new URL(url);
                    label = parsed.hostname.replace(/^www\./, '');
                } catch (e) {
                    label = "Resource Link";
                }
            }
            return { url, label };
        });

        // Strip HTML tags with space to preserve separation
        clean = clean.replace(/<[^>]+>/g, ' ');
        // Strip raw URLs from prose snippet
        clean = clean.replace(urlRegex, ' ');
        clean = clean.replace(/&nbsp;/gi, ' ').replace(/\s+/g, ' ').trim();

        return {
            text: clean ? (clean.slice(0, 110) + (clean.length > 110 ? "..." : "")) : "",
            links: uniqueLinks
        };
    };

    const extractBilingual = (html, noteId) => {
        if (!html) return { isBilingual: false, en: "", hi: "" };
        const enMarker = `class="lang-en-`;
        const hiMarker = `class="lang-hi-`;
        const enIdx = html.indexOf(enMarker);
        const hiIdx = html.indexOf(hiMarker);
        if (enIdx === -1 || hiIdx === -1) {
            return { isBilingual: false, en: html, hi: "" };
        }
        const taskIdMatch = html.substring(enIdx).match(/class="lang-en-([^"]+)"/);
        const taskId = taskIdMatch ? taskIdMatch[1] : noteId;
        const enTagEnd = html.indexOf('>', enIdx) + 1;
        const hiDivStart = html.lastIndexOf('<div', hiIdx);
        const enContentEnd = html.lastIndexOf('</div>', hiDivStart);
        const hiTagEnd = html.indexOf('>', hiIdx) + 1;
        const outerDivEnd = html.lastIndexOf('</div>');
        const hiContentEnd = html.lastIndexOf('</div>', outerDivEnd - 1);
        if (enTagEnd > 0 && enContentEnd > enTagEnd && hiTagEnd > 0 && hiContentEnd > hiTagEnd) {
            return {
                isBilingual: true,
                taskId,
                en: html.substring(enTagEnd, enContentEnd).trim(),
                hi: html.substring(hiTagEnd, hiContentEnd).trim()
            };
        }
        return { isBilingual: false, en: html, hi: "" };
    };

    const rebuildBilingualNote = (taskId, enContent, hiContent) => {
        return `<div class="note-root"><input type="radio" id="lang-en-${taskId}" name="lang-${taskId}" checked style="display: none;" /><input type="radio" id="lang-hi-${taskId}" name="lang-${taskId}" style="display: none;" /><div style="display: flex; gap: 8px; margin-bottom: 14px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;"><label for="lang-en-${taskId}" id="lbl-en-${taskId}" style="padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; background: #e2e8f0; color: #475569; border: 1px solid #cbd5e1; user-select: none; transition: all 0.2s;">🇬🇧 English</label><label for="lang-hi-${taskId}" id="lbl-hi-${taskId}" style="padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; background: #f1f5f9; color: #94a3b8; border: 1px solid #e2e8f0; user-select: none; transition: all 0.2s;">🇮🇳 हिन्दी (Hindi)</label></div><style>#lang-en-${taskId}:checked ~ div #lbl-en-${taskId} { background-color: #3b82f6 !important; color: white !important; border-color: #3b82f6 !important; } #lang-hi-${taskId}:checked ~ div #lbl-hi-${taskId} { background-color: #3b82f6 !important; color: white !important; border-color: #3b82f6 !important; } #lang-en-${taskId}:checked ~ .lang-en-${taskId} { display: block !important; } #lang-en-${taskId}:checked ~ .lang-hi-${taskId} { display: none !important; } #lang-hi-${taskId}:checked ~ .lang-en-${taskId} { display: none !important; } #lang-hi-${taskId}:checked ~ .lang-hi-${taskId} { display: block !important; }</style><div class="lang-en-${taskId}" style="display: block;">${enContent}</div><div class="lang-hi-${taskId}" style="display: none;">${hiContent}</div></div>`;
    };

    useEffect(() => {
        if (initialTask) {
            setTask(initialTask);
        }
    }, [initialTask]);

    const fetchNotes = async (currTaskId = task?._id, parentId = null) => {
        const targetTaskId = currTaskId || initialTask?._id;
        if (!targetTaskId) return;
        try {
            const ids = [targetTaskId];
            const actualParentId = parentId || (task?.parentTask ? (typeof task.parentTask === 'object' ? task.parentTask?._id : task.parentTask) : null);
            if (actualParentId) {
                ids.push(actualParentId);
            }
            const res = await NoteApi.getNotes({ taskIds: ids.join(',') });
            setNotes(res.data?.data || []);
        } catch (error) {
            console.error("Failed to fetch notes in details drawer:", error);
        }
    };

    const handleCreateNote = async () => {
        if (!isAdmin) {
            toast.error("Only administrators can create notes.");
            return;
        }
        try {
            const defaultTitle = `Note for ${task?.taskName || 'Task'}`;
            const defaultContent = `<div style="font-family: sans-serif;">
  <h3 style="color: #0f172a; font-size: 15px; font-weight: 800; margin-top: 0; margin-bottom: 6px;">🧠 Key Revision Lesson</h3>
  <p style="color: #334155; font-size: 13px; line-height: 1.5; margin: 0 0 10px 0;">
    Type your notes here...
  </p>
</div>`;
            const noteData = {
                title: defaultTitle,
                content: defaultContent,
                color: "#fef08a",
                position: { x: 100, y: 100 },
                size: { width: 380, height: 350 },
                taskId: task?._id
            };
            const res = await NoteApi.createNote(noteData);
            const createdNote = res.data?.data || res.data;
            if (createdNote && createdNote._id) {
                toast.success("Note created successfully!");
                await fetchNotes();
                setActiveReaderNoteId(createdNote._id);
                setIsReaderOpen(true);
            } else {
                toast.error("Failed to create note");
            }
        } catch (error) {
            console.error("Error creating note:", error);
            toast.error("Error creating note");
        }
    };

    const handleSaveNote = async () => {
        try {
            const finalContent = isBilingual
                ? rebuildBilingualNote(bilingualTaskId, editedEnContent, editedHiContent)
                : editedContent;
            const res = await NoteApi.updateNote(activeReaderNoteId, {
                title: editedTitle,
                content: finalContent
            });
            if (res.data?.success) {
                toast.success("Note saved successfully!");
                setIsEditingNote(false);
                await fetchNotes();
            } else {
                toast.error("Failed to save note");
            }
        } catch (error) {
            console.error("Error saving note:", error);
            toast.error("Error saving note");
        }
    };

    const handleDeleteNote = async (noteId) => {
        try {
            const res = await NoteApi.deleteNote(noteId);
            if (res.data?.success) {
                toast.success("Note deleted successfully!");
                setIsEditingNote(false);
                setActiveReaderNoteId(null);
                await fetchNotes();
            } else {
                toast.error("Failed to delete note");
            }
        } catch (error) {
            console.error("Error deleting note:", error);
            toast.error("Error deleting note");
        }
    };

    useEffect(() => {
        if (isOpen && initialTask?._id) {
            fetchTaskDetails(initialTask._id);
            fetchSubtasks(initialTask._id);
            const initialParentId = initialTask.parentTask ? (typeof initialTask.parentTask === 'object' ? initialTask.parentTask?._id : initialTask.parentTask) : null;
            fetchNotes(initialTask._id, initialParentId);
        }
    }, [isOpen, initialTask?._id]);

    const fetchTaskDetails = async (taskId) => {
        setLoading(true);
        try {
            console.log("Fetching task details for:", taskId);
            const res = await TaskApi.getTaskById(taskId);
            console.log("Task details response:", res.data);
            const taskData = res.data?.data;
            setTask(taskData);
            if (taskData) {
                const parentId = taskData.parentTask ? (typeof taskData.parentTask === 'object' ? taskData.parentTask?._id : taskData.parentTask) : null;
                fetchNotes(taskData._id, parentId);
                setActiveTab(parentId ? 'attachments' : 'subtasks');
            }
        } catch (error) {
            console.error("Failed to fetch task details", error);
            console.error("Error response data:", error.response?.data);
            toast.error("Failed to fetch task details");
        } finally {
            setLoading(false);
        }
    };

    const handleNavigateToParent = (parentId) => {
        if (!parentId) return;
        setIsReaderOpen(false);
        setActiveReaderNoteId(null);
        fetchTaskDetails(parentId);
        fetchSubtasks(parentId);
    };

    const fetchSubtasks = async (parentId) => {
        try {
            const res = await TaskApi.getAllTasks({ filter: { parentTask: parentId } });
            const list = res.data?.data || [];
            list.sort((a, b) => {
                const keyA = getCurriculumSortKey(a.taskId || '');
                const keyB = getCurriculumSortKey(b.taskId || '');
                return keyA.localeCompare(keyB, undefined, { numeric: true });
            });
            setSubtasks(list);
        } catch (error) {
            console.error("Failed to fetch subtasks", error);
        }
    };

    if (!isOpen) return null;

    const priorityColors = {
        high: "bg-red-500/10 text-red-600 border-red-200/50 shadow-[0_0_15px_rgba(239,68,68,0.1)]",
        medium: "bg-amber-500/10 text-amber-600 border-amber-200/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]",
        low: "bg-emerald-500/10 text-emerald-600 border-emerald-200/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
    };

    const statusColors = {
        todo: "bg-slate-500/10 text-slate-600 border-slate-200/50",
        inprogress: "bg-vermilion-50 text-primary border-vermilion-200/50",
        review: "bg-purple-500/10 text-purple-600 border-purple-200/50",
        done: "bg-green-500/10 text-green-600 border-green-200/50",
        hold: "bg-orange-500/10 text-orange-600 border-orange-200/50",
        backlog: "bg-gray-500/10 text-gray-600 border-gray-200/50"
    };

    return (
        <div className={`fixed inset-0 z-[1000] flex justify-end transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

            {/* Drawer Content */}
            <div className={`relative w-full max-w-6xl bg-white shadow-2xl h-full flex flex-col transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-white sticky top-0 z-[70] shadow-sm">
                    <div className="flex items-center gap-3 min-w-0 justify-between w-full">
                        <span className="text-sm font-mono font-bold text-textSub bg-slate-50 px-2 py-1 rounded border border-borderLight shadow-sm shrink-0">
                            {task?.taskId || `#${task?._id?.slice(-4)}`}
                        </span>
                        <h2 className="text-lg font-bold text-textMain truncate tracking-tight">{task?.taskName}</h2>
                        <div className="flex items-center justify-between gap-2 shrink-0">
                            {isTaskLld ? (
                                <button
                                    type="button"
                                    onClick={() => taskNotesRef.current?.openReader()}
                                    className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-300 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold shadow-xs border border-amber-200 dark:border-amber-800/80 cursor-pointer"
                                    title="View Linked Solution / Notes"
                                >
                                    <span className="text-amber-500 font-bold text-sm">💡</span>
                                    <span className="hidden sm:inline text-sm font-semibold">Solution</span>
                                </button>
                            ) : (
                                task?.parentTask && (
                                    <button
                                        onClick={() => setShowCodingModal(true)}
                                        className="px-2.5 py-1.5 bg-slate-50 text-textSub rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold shadow-sm group cursor-pointer"
                                        title="Open Code Workspace"
                                    >
                                        <span className="text-emerald-500 font-black text-sm tracking-tighter"><FaCode /></span>
                                        <span className="hidden sm:inline text-sm font-semibold">Code</span>
                                    </button>
                                )
                            )}
                            {canEdit && isAdmin && (
                                <button
                                    onClick={() => onTaskUpdate(task)}
                                    className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-all flex items-center gap-1 text-sm font-bold"
                                >
                                    <MdEdit size={20} />
                                    <span className="hidden sm:inline">Edit</span>
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className="text-slate-500 hover:text-red-500 rounded-lg transition-all shadow-lg"
                                title="Close"
                            >
                                <IoClose size={24} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                        <div className="md:col-span-2 space-y-8">
                            {/* Explicit Curriculum Hierarchy Header */}
                            {isLldTask(task) && task?.curriculumMeta && (() => {
                                const hier = getCurriculumDrawerHierarchy(task);
                                if (!hier) return null;
                                return (
                                    <div className="space-y-3 mb-6 pb-5 border-b border-slate-200/70 dark:border-slate-800">
                                        {/* Explicit 3-Tier Hierarchy */}
                                        <div className="space-y-3">
                                            {/* Tier 1: Phase */}
                                            <div>
                                                <div className="text-[10px] font-mono font-black uppercase tracking-widest text-primary">
                                                    {hier.phaseTag}
                                                </div>
                                                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                    {hier.phaseTitle}
                                                </div>
                                            </div>

                                            {/* Tier 2: Unit */}
                                            <div>
                                                <div className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                                    {hier.unitTag}
                                                </div>
                                                <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                                    {hier.unitTitle}
                                                </div>
                                            </div>

                                            {/* Tier 3: Drill / Item */}
                                            <div className="pt-0.5">
                                                <div className="text-[11px] font-mono font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-0.5">
                                                    {hier.itemTag}
                                                </div>
                                                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-snug">
                                                    {hier.itemTitle}
                                                </h1>
                                            </div>
                                        </div>

                                        {/* Compact Metadata Row: BUILD · Level A · 15 min · Easy */}
                                        <div className="flex flex-wrap items-center gap-2 pt-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                                            {hier.actionVerb && (
                                                <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${getActionVerbStyle(hier.actionVerb)}`}>
                                                    {hier.actionVerb}
                                                </span>
                                            )}
                                            {hier.level && (
                                                <>
                                                    <span className="text-slate-300 dark:text-slate-600">·</span>
                                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                        {hier.level}
                                                    </span>
                                                </>
                                            )}
                                            {hier.targetTime && (
                                                <>
                                                    <span className="text-slate-300 dark:text-slate-600">·</span>
                                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                        {hier.targetTime}
                                                    </span>
                                                </>
                                            )}
                                            {hier.difficulty && (
                                                <>
                                                    <span className="text-slate-300 dark:text-slate-600">·</span>
                                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 capitalize">
                                                        {hier.difficulty}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Major Problem Launch Actions Banner */}
                            {task?.curriculumMeta?.nodeType === 'major_problem' && (
                                <div className="p-4 mb-6 bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-2xl space-y-3 shadow-xs">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-500 text-white shadow-xs">
                                                🎯 MAJOR LLD PROBLEM
                                            </span>
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                                Target: {task.curriculumMeta?.targetTimeMinutes || 75} min · {task.curriculumMeta?.difficulty || 'Medium'}
                                            </span>
                                        </div>
                                        <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                                            {task.subtaskStats?.total || 5} Evolving Problem Versions
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2.5 pt-1">
                                        <button
                                            type="button"
                                            onClick={() => onStartMajorProblem && onStartMajorProblem(task, 'learning')}
                                            className="flex-1 min-w-[180px] py-2.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-md shadow-primary/20 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                                        >
                                            <span>Start Problem (Learning Mode)</span>
                                            <span className="text-sm">→</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onStartMajorProblem && onStartMajorProblem(task, 'interview')}
                                            className="py-2.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-md shadow-rose-500/20 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                                        >
                                            <span>Interview Mode (Timed)</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Learning Content / Description */}
                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-[11px] font-black text-textSub uppercase tracking-[0.2em]">
                                        {task?.curriculumMeta ? "Curriculum Learning Content" : "Description"}
                                    </h3>
                                    <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent ml-4" />
                                </div>
                                {task?.curriculumMeta ? (
                                    <>
                                        {/* For Drills: Display the Concept Notes from the parent Learning Unit directly at the top so theory is always accessible before practicing */}
                                        {task?.curriculumMeta?.nodeType === 'drill' && task?.parentTask && (() => {
                                            const parentDesc = typeof task.parentTask === 'object' ? task.parentTask.taskDescription : '';
                                            if (!parentDesc) return null;
                                            const match = parentDesc.match(/(### Concept Notes:[\s\S]*?)(?=### 1\. What Are We Trying To Solve\?|$)/i);
                                            const conceptNotesText = match ? match[1].trim() : null;
                                            if (!conceptNotesText) return null;

                                            return (
                                                <div className="mb-6 space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                                                            <span className="text-sm">💡</span>
                                                            <span>Theory Layer · {typeof task.parentTask === 'object' ? (task.parentTask.taskName?.split(':')[0] || 'Unit') : 'Unit'}</span>
                                                        </span>
                                                        <button
                                                            onClick={() => handleNavigateToParent(typeof task.parentTask === 'object' ? task.parentTask._id : task.parentTask)}
                                                            className="text-xs text-primary hover:underline font-bold flex items-center gap-1 cursor-pointer"
                                                            title="Open full Learning Unit"
                                                        >
                                                            <span>View Full Unit</span>
                                                            <span>→</span>
                                                        </button>
                                                    </div>
                                                    <CurriculumContentRenderer
                                                        content={conceptNotesText}
                                                        nodeType="unit"
                                                        title={typeof task.parentTask === 'object' ? task.parentTask.taskName : 'Concept Notes'}
                                                        taskId={typeof task.parentTask === 'object' ? task.parentTask.taskId : ''}
                                                    />
                                                </div>
                                            );
                                        })()}

                                        <CurriculumContentRenderer
                                            content={task.taskDescription}
                                            nodeType={task.curriculumMeta.nodeType}
                                            title={task.taskName}
                                            taskId={task.taskId}
                                        />
                                    </>
                                ) : (
                                    <div
                                        className="text-textMain text-sm leading-relaxed bg-white dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm quill-content w-full max-w-full break-words overflow-hidden"
                                        dangerouslySetInnerHTML={{
                                            __html: (() => {
                                                let html = task?.taskDescription || "<p class='italic text-slate-400'>No description provided.</p>";
                                                for (let i = 0; i < 3; i++) {
                                                    html = html.replace(/&lt;/g, '<')
                                                        .replace(/&gt;/g, '>')
                                                        .replace(/&amp;/g, '&')
                                                        .replace(/&quot;/g, '"')
                                                        .replace(/&#39;/g, "'");
                                                    if (!html.includes('&')) break;
                                                }
                                                return html.replace(/(?<!href=")(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
                                            })()
                                        }}
                                    />
                                )}

                                {task?.youtubeUrl && getYoutubeId(task.youtubeUrl) && (
                                    <div className="mt-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-[11px] font-black text-textSub uppercase tracking-[0.2em]">YouTube Video</h3>
                                            <div className="h-px flex-1 bg-gradient-to-r from-red-500/30 to-transparent ml-4" />
                                        </div>
                                        <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm">
                                            <iframe
                                                src={`https://www.youtube.com/embed/${getYoutubeId(task.youtubeUrl)}`}
                                                title="YouTube video player"
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                allowFullScreen
                                                className="absolute inset-0 w-full h-full"
                                            ></iframe>
                                        </div>
                                    </div>
                                )}

                                {/* Collapsed Personal Tracking for Curriculum Tasks (Rule 9) */}
                                {task?.curriculumMeta && (
                                    <div className="mt-8 pt-5 border-t border-slate-200/60 dark:border-slate-800">
                                        <button
                                            type="button"
                                            onClick={() => setShowPersonalTracking(prev => !prev)}
                                            className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors py-2 px-1 rounded cursor-pointer select-none"
                                        >
                                            <span>PERSONAL TRACKING</span>
                                            <span className="text-xs font-bold text-slate-400">
                                                {showPersonalTracking ? '▾' : '▸'}
                                            </span>
                                        </button>
                                        {showPersonalTracking && (
                                            <div className="mt-3 p-5 bg-slate-50/80 dark:bg-slate-900/40 rounded-2xl border border-slate-200/80 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 animate-in fade-in duration-200">
                                                <div>
                                                    <label className="text-[10px] font-black text-textSub uppercase mb-2 block tracking-widest">Status</label>
                                                    <span className={`px-3 py-1.5 rounded-xl font-black text-[11px] uppercase tracking-wider border inline-block ${statusColors[displayStatus] || 'bg-slate-100'}`}>
                                                        {displayStatus}
                                                    </span>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-black text-textSub uppercase mb-2 block tracking-widest">Priority</label>
                                                    <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black tracking-wider uppercase border w-fit ${priorityColors[task?.taskPriority] || 'bg-slate-100'}`}>
                                                        <IoFlagSharp className="text-xs" /> {task?.taskPriority}
                                                    </span>
                                                </div>
                                                {!isTaskDsa && (
                                                    <div>
                                                        <label className="text-[10px] font-black text-textSub uppercase mb-1.5 block tracking-widest">Dates</label>
                                                        <div className="text-xs font-semibold text-textMain space-y-0.5">
                                                            <div><span className="text-textSub font-normal">Start:</span> {task?.taskStartDate ? moment(task.taskStartDate).format("MMM DD, YYYY") : "N/A"}</div>
                                                            <div><span className="text-textSub font-normal">Due:</span> {task?.taskDueDate ? moment(task.taskDueDate).format("MMM DD, YYYY") : "N/A"}</div>
                                                        </div>
                                                    </div>
                                                )}
                                                <div>
                                                    <label className="text-[10px] font-black text-textSub uppercase mb-1.5 block tracking-widest">Estimation</label>
                                                    <span className="text-xs font-bold text-textMain block mt-0.5">
                                                        {task?.estimatedHours ? `${Math.floor(task.estimatedHours)}h ${Math.round((task.estimatedHours % 1) * 60)}m` : "0h 0m"}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {(() => {
                                    const imgFiles = (Array.isArray(task?.attachments) ? task.attachments : [task?.attachments || ""])
                                        .filter(f => f && f.trim() !== "" && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f));

                                    if (imgFiles.length === 0) return null;

                                    // Ensure index boundary
                                    const safeIndex = Math.min(activeImageIndex, imgFiles.length - 1);
                                    const activeFile = imgFiles[safeIndex] || imgFiles[0];
                                    const fileUrl = activeFile.startsWith('http') ? activeFile : `${server}file/get-file/${activeFile}`;
                                    const filename = activeFile.split('/').pop() || `Attachment ${safeIndex + 1}`;

                                    return (
                                        <div className="mt-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-[11px] font-black text-textSub uppercase tracking-[0.2em]">Attachment Images</h3>
                                                <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent ml-4" />
                                            </div>

                                            {/* Slider Viewport */}
                                            <div className="relative group rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm aspect-video bg-slate-50 flex items-center justify-center">
                                                <a href={fileUrl} target="_blank" rel="noreferrer" className="w-full h-full block">
                                                    <img src={fileUrl} className="w-full h-full object-cover" alt={filename} />
                                                </a>

                                                {/* Left & Right Nav Controls (only show if multiple images) */}
                                                {imgFiles.length > 1 && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() => setActiveImageIndex(prev => (prev - 1 + imgFiles.length) % imgFiles.length)}
                                                            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow-md active:scale-95 transition-all select-none cursor-pointer"
                                                        >
                                                            ◀
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setActiveImageIndex(prev => (prev + 1) % imgFiles.length)}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow-md active:scale-95 transition-all select-none cursor-pointer"
                                                        >
                                                            ▶
                                                        </button>

                                                        {/* Count Indicator */}
                                                        <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-xs rounded-lg text-[9px] font-black text-white tracking-wider select-none">
                                                            {safeIndex + 1} / {imgFiles.length}
                                                        </div>
                                                    </>
                                                )}
                                            </div>

                                            {/* Indicators tray */}
                                            {imgFiles.length > 1 && (
                                                <div className="flex items-center justify-center gap-1.5 mt-2.5">
                                                    {imgFiles.map((_, index) => (
                                                        <button
                                                            key={index}
                                                            type="button"
                                                            onClick={() => setActiveImageIndex(index)}
                                                            className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${safeIndex === index ? "bg-primary w-3" : "bg-slate-300 hover:bg-slate-400"
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}

                                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <TaskLinkedNotes
                                        ref={taskNotesRef}
                                        taskId={task?._id}
                                        parentTaskId={typeof task?.parentTask === 'object' ? task?.parentTask?._id : task?.parentTask}
                                        taskName={task?.taskName}
                                        isAdmin={isAdmin}
                                    />
                                </div>
                            </section>

                            {/* Subtasks / Attachments Section */}
                            <section>
                                {!task?.parentTask && (
                                    <div className="border-b border-borderLight mb-4 flex gap-6">
                                        <button
                                            onClick={() => setActiveTab('subtasks')}
                                            className={`pb-3 px-1 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'subtasks' ? 'text-primary' : 'text-textSub hover:text-textMain'}`}
                                        >
                                            Subtasks
                                            {activeTab === 'subtasks' && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full shadow-[0_-2px_10px_rgba(59,130,246,0.3)]" />}
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('attachments')}
                                            className={`pb-3 px-1 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'attachments' ? 'text-primary' : 'text-textSub hover:text-textMain'}`}
                                        >
                                            Attachments
                                            {activeTab === 'attachments' && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full shadow-[0_-2px_10px_rgba(59,130,246,0.3)]" />}
                                        </button>
                                    </div>
                                )}

                                <div className="min-h-[100px]">
                                    {!task?.parentTask && activeTab === 'subtasks' && (
                                        <div className="space-y-4">
                                            {task?.subtaskStats?.total > 0 ? (
                                                <div className="mb-6 bg-primary/5 p-4 rounded-xl border border-primary/10">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-xs font-bold text-primary uppercase tracking-wider">Overall Subtask Progress</span>
                                                        <span className="text-xs font-bold text-textMain">{task.subtaskStats.completed}/{task.subtaskStats.total} Completed</span>
                                                    </div>
                                                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden shadow-inner">
                                                        <div
                                                            className="bg-primary h-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                                            style={{ width: `${(task.subtaskStats.completed / task.subtaskStats.total) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            ) : null}

                                            {sortedSubtasks.length > 0 ? (
                                                <div className="grid grid-cols-1 gap-3">
                                                    {sortedSubtasks.map(sub => (
                                                        <div
                                                            key={sub._id}
                                                            onClick={() => handleNavigateToParent(sub._id)}
                                                            className="group p-3.5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl hover:border-primary/50 hover:shadow-md transition-all flex items-center justify-between cursor-pointer"
                                                        >
                                                            <div className="flex items-center gap-3.5 min-w-0">
                                                                <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${sub.status === 'done' ? 'bg-green-500 shadow-xs shadow-green-500/50' : 'bg-slate-400'}`} />
                                                                <div className="min-w-0">
                                                                    <p className={`text-[15px] sm:text-base font-bold truncate leading-snug mb-1.5 ${sub.status === 'done' ? 'text-textSub/60 line-through' : 'text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors'}`}>
                                                                        {sub.taskName}
                                                                    </p>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200/60 dark:border-slate-700">
                                                                            {sub.taskId || 'N/A'}
                                                                        </span>
                                                                        <span className={`text-[11px] font-black uppercase tracking-wider ${statusColors[sub.status]} px-2 py-0.5 rounded border`}>
                                                                            {sub.status}
                                                                        </span>
                                                                        {sub.curriculumMeta?.targetTimeMinutes && (
                                                                            <span className="text-xs font-semibold text-slate-400">
                                                                                · {sub.curriculumMeta.targetTimeMinutes}m
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                                    <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                                                        <IoGitNetworkSharp className="text-slate-300" size={24} />
                                                    </div>
                                                    <p className="text-sm text-textSub font-bold tracking-tight">No subtasks found.</p>
                                                    <p className="text-xs text-textSub/60 mt-1">This task has no child tasks assigned to it.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Attachments Section */}
                                    {(task?.parentTask || activeTab === 'attachments') && (
                                        <div className="space-y-3">
                                            {task?.parentTask && (
                                                <div className="flex items-center gap-2 mb-3">
                                                    <IoAttachOutline className="text-primary text-sm" />
                                                    <span className="text-xs font-black text-textSub uppercase tracking-wider">Attachments</span>
                                                </div>
                                            )}
                                            <div className="grid grid-cols-2 gap-4">
                                                {task?.attachments?.filter(f => f && f.trim() !== "").map((filename, i) => {
                                                    const fileUrl = filename.startsWith('http') ? filename : `${server}file/get-file/${filename}`;
                                                    const displayName = filename.split('/').pop().includes('-') ? filename.split('/').pop().split('-').slice(1).join('-') : filename.split('/').pop();
                                                    return (
                                                        <div key={i} className="p-3 bg-white border border-borderLight rounded-lg shadow-sm hover:border-primary/30 transition-all flex items-center gap-3">
                                                            <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-slate-50 border border-slate-100 rounded">
                                                                {/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(filename) ? (
                                                                    <img src={fileUrl} className="w-full h-full object-cover rounded shadow-sm" alt={displayName} />
                                                                ) : (
                                                                    <IoAttachOutline size={20} className="text-primary" />
                                                                )}
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <p className="text-xs font-bold text-textMain truncate" title={filename}>{filename.split('-').slice(1).join('-') || filename}</p>
                                                                <a
                                                                    href={fileUrl}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="text-[10px] text-primary hover:underline font-extrabold uppercase tracking-tight flex items-center gap-1 mt-1"
                                                                >
                                                                    Download / View
                                                                </a>
                                                            </div>
                                                        </div>
                                                    );
                                                }) || (
                                                        <p className="text-sm text-textSub col-span-2 text-center py-6">No attachments found.</p>
                                                    )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>

                        {/* Right Sidebar Metadata */}
                        <div className="space-y-6">
                            {/* Learner Information Panel (Clean & Non-Duplicated) */}
                            {(() => {
                                const nodeType = getCurriculumNodeType(task);
                                if (!nodeType) return null;
                                const hier = getCurriculumDrawerHierarchy(task);

                                return (
                                    <div className="bg-slate-50/90 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 space-y-3.5 shadow-xs">
                                        <div className="flex items-center justify-between border-b border-slate-200/70 dark:border-slate-800 pb-2">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                                Learner Info
                                            </span>
                                            <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                                LLD Track
                                            </span>
                                        </div>

                                        <div className="space-y-3 text-xs">
                                            {/* 1. Progress */}
                                            <div>
                                                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block mb-1">Progress</span>
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold capitalize border ${task.status === 'done'
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                                                        : task.status === 'in-progress'
                                                            ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
                                                            : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                                                        }`}>
                                                        {task.status === 'done' ? '✓ Completed' : task.status === 'in-progress' ? '● In Progress' : '○ Not Started'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* 2. Target Time */}
                                            <div>
                                                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block mb-0.5">Target Time</span>
                                                <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-bold">
                                                    <span>⏱</span>
                                                    <span>{hier?.targetTime || '15 min'}</span>
                                                </div>
                                            </div>

                                            {/* 3. Prerequisites */}
                                            <div>
                                                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block mb-0.5">Prerequisites</span>
                                                <div className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                                                    {task?.curriculumMeta?.nodeType === 'drill' && task.parentTask ? (
                                                        <button
                                                            onClick={() => handleNavigateToParent(typeof task.parentTask === 'object' ? task.parentTask._id : task.parentTask)}
                                                            className="text-left text-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer group"
                                                            title="Click to view Learning Unit & Theory"
                                                        >
                                                            <span>📖</span>
                                                            <span className="group-hover:text-primary-600">{getSafePrerequisites(task, hier)}</span>
                                                        </button>
                                                    ) : (
                                                        getSafePrerequisites(task, hier)
                                                    )}
                                                </div>
                                            </div>

                                            {/* 4. Concepts */}
                                            {hier?.conceptTopics?.length > 0 && (
                                                <div className="pt-1">
                                                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block mb-1.5">Core Concepts</span>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {hier.conceptTopics.map((concept, idx) => (
                                                            <span key={idx} className="px-2 py-0.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded text-[11px] font-semibold border border-slate-200 dark:border-slate-700 shadow-2xs">
                                                                {concept}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Status, Priority, Dates (Only for standard/DSA tasks, moved to collapsed section for curriculum tasks) */}
                            {!isLldTask(task) && (
                                <>
                                    {/* Status */}
                                    <div>
                                        <label className="text-[10px] font-black text-textSub uppercase mb-3 block tracking-[0.1em]">Status</label>
                                        <span className={`px-4 py-2 rounded-xl font-black text-[11px] uppercase tracking-widest border transition-all hover:scale-105 duration-300 inline-block ${statusColors[displayStatus] || 'bg-slate-100'}`}>
                                            {displayStatus}
                                        </span>
                                    </div>

                                    {/* Priority */}
                                    <div>
                                        <label className="text-[10px] font-black text-textSub uppercase mb-3 block tracking-[0.1em]">Priority</label>
                                        <span className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-black tracking-widest uppercase border transition-all hover:scale-105 duration-300 ${priorityColors[task?.taskPriority] || 'bg-slate-100'}`}>
                                            <IoFlagSharp className="text-sm" /> {task?.taskPriority}
                                        </span>
                                    </div>

                                    {/* Dates & Estimation */}
                                    <div className="bg-slate-50/50 dark:bg-slate-900/30 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-5">
                                        {!isTaskDsa && (
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                                                        <IoCalendarOutline size={16} className="text-primary" />
                                                    </div>
                                                    <div>
                                                        <label className="text-[9px] font-black text-textSub uppercase block tracking-widest">Start Date</label>
                                                        <span className="text-xs font-bold text-textMain">{task?.taskStartDate ? moment(task.taskStartDate).format("MMM DD, YYYY") : "N/A"}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                                                        <IoCalendarOutline size={16} className="text-orange-500" />
                                                    </div>
                                                    <div>
                                                        <label className="text-[9px] font-black text-textSub uppercase block tracking-widest">Due Date</label>
                                                        <span className="text-xs font-bold text-textMain">{task?.taskDueDate ? moment(task.taskDueDate).format("MMM DD, YYYY") : "N/A"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <div className={`${!isTaskDsa ? 'pt-4 border-t border-slate-200/50 dark:border-slate-700/50' : ''} flex items-center gap-3`}>
                                            <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                                                <IoTimeOutline size={16} className="text-emerald-500" />
                                            </div>
                                            <div>
                                                <label className="text-[9px] font-black text-textSub uppercase block tracking-widest">Estimation</label>
                                                <span className="text-xs font-bold text-textMain">{task?.estimatedHours ? `${Math.floor(task.estimatedHours)}h ${Math.round((task.estimatedHours % 1) * 60)}m` : "0h 0m"}</span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* LeetCode Coding Simulation Modal */}
            <DsaCodingArenaModal
                isOpen={showCodingModal}
                onClose={() => setShowCodingModal(false)}
                task={task}
            />
        </div>
    );
};

export default TaskDetailDrawer;
