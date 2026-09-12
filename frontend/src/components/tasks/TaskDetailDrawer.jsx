
import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { TaskApi } from '../../services/api/Task.api';
import { NoteApi } from '../../services/api/Note.api';
import { SprintApi } from '../../services/api/Sprint.api';
import { ProjectApi } from '../../services/api/Project.api';
import { CommonApi } from '../../services/api/Common.api';
import { server } from '../../services/config';
import DsaCodingArenaModal from '../dsa/DsaCodingArenaModal';
import { LuCode2 } from 'react-icons/lu';
import ReactQuill from 'react-quill';
import { IoRepeatOutline, IoTrophyOutline, IoTrashOutline } from 'react-icons/io5';
import { getActionVerbStyle, formatLevelLabel, getCurriculumDrawerHierarchy, getCurriculumSortKey, isLldTask } from '../../utils/curriculumHelper';
import CurriculumContentRenderer from '../lld/CurriculumContentRenderer';
import TaskLinkedNotes from '../common/TaskLinkedNotes';

import moment from 'moment';
import {
    IoClose,
    IoCheckmarkCircleOutline,
    IoCalendarOutline,
    IoFlagOutline,
    IoPersonOutline,
    IoDocumentTextOutline,
    IoChatbubbleEllipsesOutline,
    IoListOutline,
    IoTimeOutline
} from 'react-icons/io5';

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

const TaskDetailDrawer = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();

    // Get taskId from query params
    const taskId = searchParams.get('taskId');
    const { currentUser } = useSelector(state => state.store);
    const [showCodingModal, setShowCodingModal] = useState(false);

    // Role Permissions
    const isAdmin = currentUser?.userRole?.name?.toLowerCase() === 'admin' ||
                    currentUser?.role === 'admin' ||
                    currentUser?.email === 'balajiaadi2000@gmail.com' ||
                    (currentUser?.userRoles && currentUser.userRoles.some(r => r.name?.toLowerCase() === 'admin'));
    const isManager = currentUser?.userRole?.name === 'projectmanager';
    const isHR = currentUser?.userRole?.name === 'hr';
    const canEditDates = isAdmin || isManager || isHR;

    const [task, setTask] = useState(null);
    const [subtasks, setSubtasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newSubtaskName, setNewSubtaskName] = useState('');
    const [showAddSubtask, setShowAddSubtask] = useState(false);
    const [creatingSubtask, setCreatingSubtask] = useState(false);
    const [sprints, setSprints] = useState([]);
    const [milestones, setMilestones] = useState([]);
    const [notes, setNotes] = useState([]);

    const isLldTask = Boolean(
        task?.curriculumMeta ||
        task?.subject === 'LLD' ||
        task?.taskType === 'LLD' ||
        task?.branch === 'LLD' ||
        (task?.parentTask && typeof task.parentTask === 'object' && task.parentTask.curriculumMeta)
    );

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
    const [showPersonalTracking, setShowPersonalTracking] = useState(false);

    const getCleanSnippet = (content, limit = 100) => {
        if (!content) return "No content";
        let clean = decodeHtmlEntities(content);
        clean = clean.replace(/<style[\s\S]*?<\/style>/gi, '');
        clean = clean.replace(/<script[\s\S]*?<\/script>/gi, '');
        clean = clean.replace(/<div[^>]*class="note-root"[\s\S]*?<div[^>]*class="lang-en-[^"]*"[^>]*>/gi, '');
        clean = clean.replace(/<[^>]*>?/gm, '');
        clean = clean.replace(/&nbsp;/gi, ' ').replace(/\s+/g, ' ').trim();
        return clean.slice(0, limit) + (clean.length > limit ? "..." : "");
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

    const fetchNotes = async (currTaskId = task?._id || taskId, parentId = null) => {
        const targetTaskId = currTaskId || taskId;
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
        if (!taskId) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await TaskApi.task(taskId);
                const taskData = res.data?.data?.[0] || res.data?.data;
                setTask(taskData);

                const parentId = taskData?.parentTask ? (typeof taskData.parentTask === 'object' ? taskData.parentTask?._id : taskData.parentTask) : null;
                const noteIdsToQuery = [taskData?._id || taskId];
                if (parentId) {
                    noteIdsToQuery.push(parentId);
                }

                if (taskData?.projectName) {
                    const [sRes, mRes, nRes] = await Promise.all([
                        SprintApi.getSprintsByProject(taskData.projectName),
                        ProjectApi.getAllmileStones(taskData.projectName),
                        NoteApi.getNotes({ taskIds: noteIdsToQuery.join(',') })
                    ]);
                    setSprints(sRes.data?.data || []);
                    setMilestones(mRes.data?.data?.milestones || []);
                    setNotes(nRes.data?.data || []);
                } else {
                    const nRes = await NoteApi.getNotes({ taskIds: noteIdsToQuery.join(',') });
                    setNotes(nRes.data?.data || []);
                }

                const subRes = await TaskApi.getAllTasks({ filter: { parentTask: taskId } });
                const list = subRes.data?.data || [];
                list.sort((a, b) => {
                    const keyA = getCurriculumSortKey(a.taskId || '');
                    const keyB = getCurriculumSortKey(b.taskId || '');
                    return keyA.localeCompare(keyB, undefined, { numeric: true });
                });
                setSubtasks(list);
            } catch (error) {
                console.error("Failed to fetch task details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [taskId]);

    const handleUpdateTask = async (updates) => {
        try {
            // Optimistic update
            setTask(prev => ({ ...prev, ...updates }));
            await TaskApi.updateTask(taskId, updates);
        } catch (error) {
            console.error("Failed to update task", error);
            // Revert logic could be added here
        }
    };



    const handleAddSubtask = async () => {
        if (!newSubtaskName.trim() || !task) return;
        setCreatingSubtask(true);
        try {
            const payload = {
                taskName: newSubtaskName,
                projectName: task.projectName,
                parentTask: task._id,
                taskPriority: 'medium', // Default
                taskType: 'subtask',
                status: 'todo',
                sprint: task.sprint, // Inherit Sprint
                milestone: task.milestone // Inherit Milestone
            };
            const res = await TaskApi.createTask(payload);
            const newSub = res.data?.data;
            if (newSub) {
                setSubtasks([...subtasks, newSub]);
                setNewSubtaskName('');
                setShowAddSubtask(false); // Optional: keep open for multiple adds
            }
        } catch (error) {
            console.error("Failed to create subtask", error);
        } finally {
            setCreatingSubtask(false);
        }
    };

    const toggleSubtaskStatus = async (subtask) => {
        const newStatus = subtask.status === 'done' ? 'todo' : 'done';
        // Optimistic Update
        const updatedSubtasks = subtasks.map(s =>
            s._id === subtask._id ? { ...s, status: newStatus } : s
        );
        setSubtasks(updatedSubtasks);

        try {
            await TaskApi.updateTask(subtask._id, { status: newStatus });
        } catch (error) {
            console.error("Failed to update subtask status", error);
            // Revert on error
            setSubtasks(subtasks);
        }
    };

    const calculateSubtaskProgress = () => {
        if (subtasks.length === 0) return 0;
        const completed = subtasks.filter(s => s.status === 'done').length;
        return Math.round((completed / subtasks.length) * 100);
    };

    const closeDrawer = () => {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('taskId');
        setSearchParams(newParams);
    };

    if (!taskId) return null;

    return (
        <div className="fixed inset-y-0 right-0 w-[450px] bg-white shadow-2xl z-[1000] transform transition-transform duration-300 ease-in-out border-l border-borderLight flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pt-[3rem] pb-4 px-2 border-b border-slate-100 bg-white sticky top-0 z-[70] shadow-sm">
                <div className="flex items-center gap-3 min-w-0">
                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest border ${task?.status === 'done' ? 'bg-green-500/10 text-green-600 border-green-200' :
                            task?.status === 'inprogress' ? 'bg-blue-500/10 text-blue-600 border-blue-200' :
                                'bg-slate-50 text-slate-500 border-slate-200'
                        }`}>
                        {task?.status || 'Loading...'}
                    </span>
                    <span className="text-xs text-textSub font-mono font-bold bg-slate-50 px-2 py-0.5 rounded border border-borderLight">{task?.taskId}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    {isLldTask ? (
                        linkedNotes.length > 0 && (
                            <button
                                type="button"
                                onClick={() => {
                                    setActiveReaderNoteId(linkedNotes[0]._id);
                                    setIsReaderOpen(true);
                                }}
                                className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold shadow-xs border border-amber-200 cursor-pointer"
                                title="View Linked Solution / Notes"
                            >
                                <span className="text-amber-500 font-bold text-sm">💡</span>
                                <span className="hidden sm:inline text-sm font-semibold">Solution</span>
                            </button>
                        )
                    ) : (
                        task?.parentTask && (
                            <button
                                onClick={() => setShowCodingModal(true)}
                                className="px-2.5 py-1.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-600 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold shadow-sm group cursor-pointer"
                                title="Open Code Workspace"
                            >
                                <span className="text-emerald-500 font-black text-sm tracking-tighter">&lt;/&gt;</span>
                                <span className="hidden sm:inline font-bold">Code</span>
                            </button>
                        )
                    )}
                    <button
                        onClick={closeDrawer}
                        className="p-2.5 bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-500 rounded-xl transition-all shadow-sm flex items-center justify-center border border-slate-200 hover:border-red-200 group"
                        title="Close Drawer"
                    >
                        <IoClose size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center text-textSub p-10">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                        <p className="text-sm font-bold animate-pulse">Loading task details...</p>
                    </div>
                </div>
            ) : task ? (
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
                    {/* Clean Curriculum Hierarchy Header */}
                    {isLldTask(task) && task?.curriculumMeta ? (
                        (() => {
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
                        })()
                    ) : (
                        <>
                            {/* Title */}
                            <div>
                                <h2 className="text-2xl font-black text-textMain tracking-tight mb-1">{task.taskName}</h2>
                                <div className="h-1 w-20 bg-primary/20 rounded-full"></div>
                            </div>

                            {/* Meta Data Grid (Only for non-curriculum tasks) */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-textSub uppercase tracking-widest flex items-center gap-1">
                                        <IoFlagOutline /> Priority
                                    </label>
                                    <div className={`flex items-center gap-2 p-3 bg-slate-50/50 rounded-2xl border ${task.taskPriority === 'high' ? 'border-red-100 text-red-600' :
                                            task.taskPriority === 'medium' ? 'border-amber-100 text-amber-600' :
                                                'border-blue-100 text-blue-600'
                                        }`}>
                                        <div className={`w-2 h-2 rounded-full ${task.taskPriority === 'high' ? 'bg-red-500' :
                                                task.taskPriority === 'medium' ? 'bg-amber-500' :
                                                    'bg-blue-500'
                                            }`}></div>
                                        <span className="text-sm font-bold capitalize">{task.taskPriority || 'Medium'}</span>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-textSub uppercase tracking-widest flex items-center gap-1">
                                        <IoCheckmarkCircleOutline /> Status
                                    </label>
                                    <div className="flex items-center gap-2 p-3 bg-slate-50/50 rounded-2xl border border-slate-100">
                                        <span className="text-sm font-bold capitalize text-textMain">{task.status || 'Todo'}</span>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-textSub uppercase tracking-widest flex items-center gap-1">
                                        <IoCalendarOutline /> Start Date
                                    </label>
                                    {canEditDates ? (
                                        <input
                                            type="date"
                                            defaultValue={task.taskStartDate ? moment(task.taskStartDate).format('YYYY-MM-DD') : ''}
                                            onChange={(e) => handleUpdateTask({ taskStartDate: e.target.value })}
                                            className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-textMain focus:ring-1 focus:ring-primary outline-none cursor-pointer"
                                        />
                                    ) : (
                                        <div className="p-3 bg-slate-50/50 rounded-2xl border border-slate-100">
                                            <span className="text-sm font-bold text-textMain">
                                                {task.taskStartDate ? moment(task.taskStartDate).format('MMM DD, YYYY') : 'Not Started'}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-textSub uppercase tracking-widest flex items-center gap-1">
                                        <IoCalendarOutline /> Due Date
                                    </label>
                                    {canEditDates ? (
                                        <input
                                            type="date"
                                            defaultValue={task.taskDueDate ? moment(task.taskDueDate).format('YYYY-MM-DD') : ''}
                                            onChange={(e) => handleUpdateTask({ taskDueDate: e.target.value })}
                                            className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-textMain focus:ring-1 focus:ring-primary outline-none cursor-pointer"
                                        />
                                    ) : (
                                        <div className="p-3 bg-slate-50/50 rounded-2xl border border-slate-100">
                                            <span className="text-sm font-bold text-textMain">
                                                {task.taskDueDate ? moment(task.taskDueDate).format('MMM DD, YYYY') : 'No Date Set'}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-textSub uppercase tracking-widest flex items-center gap-1">
                                        <IoTimeOutline /> Estimation
                                    </label>
                                    <div className="p-3 bg-slate-50/50 rounded-2xl border border-slate-100">
                                        <span className="text-sm font-bold text-textMain">{task.estimatedHours || 0} Hours</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Description */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black text-textSub uppercase tracking-widest flex items-center gap-1">
                                <IoDocumentTextOutline /> {task?.curriculumMeta ? "Curriculum Learning Content" : "Description"}
                            </label>
                            <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent ml-4" />
                        </div>
                        {task?.curriculumMeta ? (
                            <CurriculumContentRenderer 
                                content={task.taskDescription} 
                                nodeType={task.curriculumMeta.nodeType} 
                                title={task.taskName} 
                            />
                        ) : (
                            <div
                                className="w-full min-h-[120px] p-5 text-sm text-textMain bg-white border border-slate-100 rounded-3xl shadow-sm leading-relaxed quill-content break-words overflow-hidden"
                                dangerouslySetInnerHTML={{
                                    __html: (() => {
                                        let html = task?.taskDescription || "<p class='italic text-slate-400'>No description provided.</p>";
                                        // Robust unescaping
                                        for (let i = 0; i < 3; i++) {
                                            html = html.replace(/&lt;/g, '<')
                                                .replace(/&gt;/g, '>')
                                                .replace(/&amp;/g, '&')
                                                .replace(/&quot;/g, '"')
                                                .replace(/&#39;/g, "'");
                                            if (!html.includes('&')) break;
                                        }
                                        // Auto-link URLs
                                        return html.replace(/(?<!href=")(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">$1</a>');
                                    })()
                                }}
                            />
                        )}
                    </div>

                    {task?.youtubeUrl && getYoutubeId(task.youtubeUrl) && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-black text-textSub uppercase tracking-widest flex items-center gap-1">
                                    YouTube Video
                                </label>
                                <div className="h-px flex-1 bg-gradient-to-r from-red-500/30 to-transparent ml-4" />
                            </div>
                            <div className="relative w-full aspect-video rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
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
                        <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800">
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
                                <div className="mt-3 p-5 bg-slate-50/80 dark:bg-slate-900/40 rounded-2xl border border-slate-200/80 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-5 gap-4 animate-in fade-in duration-200">
                                    <div>
                                        <label className="text-[10px] font-black text-textSub uppercase mb-2 block tracking-widest">Status</label>
                                        <span className="px-3 py-1.5 rounded-xl font-black text-[11px] uppercase tracking-wider border inline-block bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                            {task?.status || 'Todo'}
                                        </span>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-textSub uppercase mb-2 block tracking-widest">Priority</label>
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black tracking-wider uppercase border bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                            <IoFlagOutline className="text-xs" /> {task?.taskPriority || 'Medium'}
                                        </span>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-textSub uppercase mb-1.5 block tracking-widest">Start Date</label>
                                        <span className="text-xs font-semibold text-textMain block">
                                            {task?.taskStartDate ? moment(task.taskStartDate).format("MMM DD, YYYY") : "Not Started"}
                                        </span>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-textSub uppercase mb-1.5 block tracking-widest">Due Date</label>
                                        <span className="text-xs font-semibold text-textMain block">
                                            {task?.taskDueDate ? moment(task.taskDueDate).format("MMM DD, YYYY") : "No Date Set"}
                                        </span>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-textSub uppercase mb-1.5 block tracking-widest">Estimation</label>
                                        <span className="text-xs font-bold text-textMain block">
                                            {task?.estimatedHours || 0} Hours
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
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black text-textSub uppercase tracking-widest flex items-center gap-1">
                                        Attachment Images
                                    </label>
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

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <TaskLinkedNotes
                            taskId={task?._id}
                            parentTaskId={typeof task?.parentTask === 'object' ? task?.parentTask?._id : task?.parentTask}
                            taskName={task?.taskName}
                            isAdmin={isAdmin}
                        />
                    </div>

                    {/* Subtasks Section */}
                    {/* Subtasks Section (Only for Parent Tasks) */}
                    {!task.parentTask && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-semibold text-textMain flex items-center gap-2">
                                    <IoListOutline /> Subtasks
                                </label>
                                <button
                                    onClick={() => setShowAddSubtask(!showAddSubtask)}
                                    className="text-xs text-primary hover:underline font-medium"
                                >
                                    + Add Subtask
                                </button>
                            </div>

                            {/* Progress Bar */}
                            {subtasks.length > 0 && (
                                <div className="w-full bg-slate-100 rounded-full h-1.5 mb-2">
                                    <div
                                        className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
                                        style={{ width: `${calculateSubtaskProgress()}%` }}
                                    ></div>
                                </div>
                            )}

                            <div className="space-y-2">
                                {/* Add Subtask Input */}
                                {showAddSubtask && (
                                    <div className="flex items-center gap-2 p-2 bg-slate-50 border border-borderLight rounded-lg">
                                        <input
                                            type="text"
                                            value={newSubtaskName}
                                            onChange={(e) => setNewSubtaskName(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                                            placeholder="What needs to be done?"
                                            className="flex-1 bg-transparent border-none text-sm focus:ring-0 p-0"
                                            autoFocus
                                        />
                                        <button
                                            onClick={handleAddSubtask}
                                            disabled={creatingSubtask || !newSubtaskName.trim()}
                                            className="text-primary text-xs font-bold disabled:opacity-50"
                                        >
                                            Add
                                        </button>
                                    </div>
                                )}

                                {/* Subtask List */}
                                {sortedSubtasks.length > 0 ? (
                                    sortedSubtasks.map(subtask => (
                                        <div key={subtask._id} className="group flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl border border-transparent hover:border-borderLight transition-all">
                                            <button
                                                onClick={() => toggleSubtaskStatus(subtask)}
                                                className={`text-slate-400 hover:text-green-600 transition-colors ${subtask.status === 'done' ? 'text-green-500' : ''}`}
                                            >
                                                <IoCheckmarkCircleOutline size={22} />
                                            </button>
                                            <span className={`flex-1 text-[15px] sm:text-base font-bold leading-snug ${subtask.status === 'done' ? 'text-textSub line-through' : 'text-textMain'}`}>
                                                {subtask.taskName}
                                            </span>
                                            <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200/60 dark:border-slate-700">
                                                {subtask.taskId || 'N/A'}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    !showAddSubtask && (
                                        <div className="p-4 border border-dashed border-borderLight rounded-lg text-center cursor-pointer hover:bg-slate-50" onClick={() => setShowAddSubtask(true)}>
                                            <p className="text-xs text-textSub">No subtasks yet. Click to add one.</p>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    )}

                    {/* Attachments Section */}
                    <div className="h-px bg-borderLight w-full my-4"></div>
                    <div className="space-y-4">
                        <label className="text-sm font-semibold text-textMain flex items-center gap-2">
                            <IoDocumentTextOutline /> Attachments
                        </label>

                        {task.attachments && (typeof task.attachments === 'string' || (Array.isArray(task.attachments) && task.attachments.length > 0)) ? (
                            <div className="space-y-2">
                                {(Array.isArray(task.attachments) ? task.attachments : [task.attachments]).map((attachment, i) => (
                                    <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 border border-borderLight rounded-lg group">
                                        <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-white rounded border border-borderLight text-primary">
                                            {/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(attachment) ? (
                                                <img src={attachment} className="w-full h-full object-cover rounded shadow-sm" alt="attachment" />
                                            ) : (
                                                <IoDocumentTextOutline size={16} />
                                            )}
                                        </div>
                                        <a
                                            href={attachment}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 text-sm text-blue-600 hover:underline truncate"
                                            title={attachment}
                                        >
                                            {attachment.split('/').pop() || `Attachment ${i + 1}`}
                                        </a>
                                        <button
                                            onClick={() => {
                                                if (Array.isArray(task.attachments)) {
                                                    const newAttachments = task.attachments.filter((_, idx) => idx !== i);
                                                    handleUpdateTask({ attachments: newAttachments });
                                                } else {
                                                    handleUpdateTask({ attachments: "" });
                                                }
                                            }}
                                            className="p-1 hover:bg-slate-200 rounded text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Remove attachment"
                                        >
                                            <IoClose />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="relative border border-dashed border-borderLight rounded-lg p-4 hover:bg-slate-50 transition-colors text-center cursor-pointer">
                                <input
                                    type="file"
                                    onChange={async (e) => {
                                        const file = e.target.files[0];
                                        if (!file) return;

                                        const formData = new FormData();
                                        formData.append("file", file);

                                        // Simple toast or loading state here would be good
                                        try {
                                            const res = await CommonApi.uploadFile(formData);
                                            const fileUrl = res.data?.data?.url || res.data?.url || res.data?.data;
                                            if (fileUrl) {
                                                handleUpdateTask({ attachments: fileUrl });
                                            }
                                        } catch (err) {
                                            console.error("Upload failed", err);
                                        }
                                    }}
                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                />
                                <div className="flex flex-col items-center gap-1 text-textSub">
                                    <span className="text-xs font-medium">Click to upload attachment</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="h-px bg-borderLight w-full my-4"></div>

                    {/* Comments Placeholder */}
                    <div className="space-y-4">
                        <label className="text-sm font-semibold text-textMain flex items-center gap-2">
                            <IoChatbubbleEllipsesOutline /> Comments
                        </label>
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0"></div>
                            <div className="flex-1">
                                <input
                                    type="text"
                                    placeholder="Write a comment..."
                                    className="w-full px-4 py-2 text-sm border border-borderLight rounded-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                />
                            </div>
                        </div>
                    </div>

                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center text-textSub">
                    Task not found.
                </div>
            )}
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
