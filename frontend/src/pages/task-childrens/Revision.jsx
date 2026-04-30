import React, { useEffect, useState } from 'react';
import { TaskApi } from '../../services/api/Task.api';
import { ProjectApi } from '../../services/api/Project.api';
import { useLoading } from '../../components/loader/LoaderContext';
import moment from 'moment';
import { 
  IoSearchOutline, 
  IoFilterOutline, 
  IoSyncOutline, 
  IoCalendarOutline,
  IoCheckmarkCircleOutline,
  IoListOutline,
  IoChevronForward,
  IoChevronDown,
  IoCloseOutline,
  IoChevronUpOutline,
  IoEyeOutline,
  IoEyeOffOutline
} from 'react-icons/io5';
import toast from 'react-hot-toast';
import InputField from '../../components/InputField';

const Revision = () => {
    const { handleLoading } = useLoading();
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [filteredTasks, setFilteredTasks] = useState([]);
    
    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProject, setSelectedProject] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [selectedParent, setSelectedParent] = useState('all');
    const [showFilters, setShowFilters] = useState(true);
    
    // UI State
    const [expandedTaskId, setExpandedTaskId] = useState(null);
    const [showRevisionModal, setShowRevisionModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [revisionNote, setRevisionNote] = useState('');

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        handleLoading(true);
        try {
            const [tasksRes, projectsRes] = await Promise.all([
                TaskApi.getAllTasks({ filter: { status: 'done' } }),
                ProjectApi.getAllProjects()
            ]);
            
            const allTasks = tasksRes.data?.data || [];
            
            const completedChildTasks = allTasks.filter(t => {
                const isSubtask = t.parentTask;
                const isDone = t.status === 'done';
                return isSubtask && isDone;
            });
            
            setTasks(completedChildTasks);
            setFilteredTasks(completedChildTasks);
            setProjects(projectsRes.data?.data || []);
        } catch (error) {
            console.error("Failed to load revision data", error);
            toast.error("Failed to load tasks");
        } finally {
            handleLoading(false);
        }
    };

    useEffect(() => {
        applyFilters();
    }, [searchTerm, selectedProject, selectedParent, sortBy, tasks]);
    const applyFilters = () => {
        let result = [...tasks];

        if (searchTerm) {
            result = result.filter(t => t.taskName?.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        if (selectedProject !== 'all') {
            result = result.filter(t => {
                const proj = t.projectName;
                const pid = typeof proj === 'object' ? proj?._id : proj;
                return pid === selectedProject;
            });
        }

        if (selectedParent !== 'all') {
            result = result.filter(t => t.parentTask?._id === selectedParent || t.parentTask === selectedParent);
        }

        // Sorting
        result.sort((a, b) => {
            const dateA = getFinishDateRaw(a) || 0;
            const dateB = getFinishDateRaw(b) || 0;
            if (sortBy === 'newest') return new Date(dateB) - new Date(dateA);
            if (sortBy === 'oldest') return new Date(dateA) - new Date(dateB);
            return 0;
        });

        setFilteredTasks(result);
    };

    const getFinishDateRaw = (task) => {
        if (!task.activityLogs || !Array.isArray(task.activityLogs)) return null;
        const logs = [...task.activityLogs].reverse();
        const doneLog = logs.find(log => log.currentStatus === 'done');
        return doneLog ? doneLog.date : null;
    };

    const getFinishDate = (task) => {
        const date = getFinishDateRaw(task);
        return date ? moment(date).format('DD MMM') : 'N/A';
    };

    const handleAddRevision = async () => {
        if (!revisionNote.trim()) {
            toast.error("Please enter a note for the revision");
            return;
        }

        handleLoading(true);
        try {
            await TaskApi.addRevision(selectedTask._id, { notes: revisionNote });
            toast.success("Revision logged successfully");
            setShowRevisionModal(false);
            setRevisionNote('');
            loadInitialData();
        } catch (error) {
            console.error("Failed to add revision", error);
            toast.error("Failed to log revision");
        } finally {
            handleLoading(false);
        }
    };

    const projectOptions = [
        { value: 'all', label: 'All Projects' },
        ...projects.map(p => ({ value: p._id, label: p.key || p.name }))
    ];

    const parentOptions = [
        { value: 'all', label: 'All Parents' },
        ...Array.from(new Set(tasks.map(t => t.parentTask?._id).filter(Boolean)))
            .map(id => {
                const p = tasks.find(t => t.parentTask?._id === id).parentTask;
                return { value: p._id, label: p.taskName };
            })
    ];

    const sortOptions = [
        { value: 'newest', label: 'Newest First' },
        { value: 'oldest', label: 'Oldest First' }
    ];

    return (
        <div className="flex flex-col h-full bg-[#F8FAFC] animate-in fade-in duration-500 overflow-visible">
            {/* Header Area */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 shrink-0 z-50">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                            Revision Hub
                            <span className="bg-primary/10 text-primary text-[9px] font-bold px-2 py-0.5 rounded-full border border-primary/20 tracking-normal">BETA</span>
                        </h1>
                        <p className="text-[11px] font-medium text-slate-400 mt-0.5 tracking-tight">Focus on subtask mastery through strategic review.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end mr-4">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Mastery Count</span>
                            <span className="text-base font-black text-slate-800 leading-none">{filteredTasks.length}</span>
                        </div>
                        <button 
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border ${showFilters ? 'bg-slate-50 text-slate-600 border-slate-200' : 'bg-primary text-white border-primary shadow-lg shadow-primary/20'}`}
                        >
                            {showFilters ? <IoEyeOffOutline size={14} /> : <IoEyeOutline size={14} />}
                            {showFilters ? 'Hide' : 'Filter'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Filter Section - Collapsible */}
            {showFilters && (
                <div className="bg-white border-b border-slate-200 px-6 py-1 animate-in slide-in-from-top duration-300 z-40 relative">
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Search Bar */}
                        <div className="w-64 relative">
                            <IoSearchOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <input 
                                type="text" 
                                placeholder="Find a task..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-4 py-2 text-xs font-bold text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all"
                            />
                        </div>

                        {/* Dropdowns */}
                        <div className="">
                            <InputField 
                                type="select"
                                options={projectOptions}
                                value={selectedProject}
                                onChange={(e) => setSelectedProject(e.target.value)}
                                className="!py-1 !rounded-xl !text-[10px] !font-bold shadow-none"
                                menuPortalTarget={document.body}
                                styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                            />
                        </div>

                        <div className="">
                            <InputField 
                                type="select"
                                options={parentOptions}
                                value={selectedParent}
                                onChange={(e) => setSelectedParent(e.target.value)}
                                className="!py-1 !rounded-xl !text-[10px] !font-bold shadow-none min-w-[140px]"
                                menuPortalTarget={document.body}
                                styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                            />
                        </div>

                        <div className="">
                            <InputField 
                                type="select"
                                options={sortOptions}
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="!py-1 !rounded-xl !text-[10px] !font-bold shadow-none min-w-[120px]"
                                menuPortalTarget={document.body}
                                styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                            />
                        </div>

                        <button 
                            onClick={() => { setSearchTerm(''); setSelectedProject('all'); setSelectedParent('all'); setSortBy('newest'); }}
                            className="p-2 mb-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-100 transition-all shadow-sm"
                            title="Reset"
                        >
                            <IoFilterOutline size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Table Area */}
            <div className="flex-1 pt-1 overflow-visible">
                <div className="bg-white border border-slate-200 shadow-sm h-full flex flex-col overflow-visible">
                    <div className="overflow-x-auto custom-scrollbar flex-1 rounded-[2rem] overflow-visible">
                        <table className="w-full text-left border-collapse min-w-[1100px]">
                            <thead className="sticky top-0 bg-white z-20 border-b border-slate-100">
                                <tr className="bg-white">
                                    <th className="pl-8 pr-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] w-12"></th>
                                    <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Mastery Detail</th>
                                    <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Context (Parent)</th>
                                    <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Key</th>
                                    <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Timeline</th>
                                    <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Rev</th>
                                    <th className="pl-4 pr-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Execution</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredTasks.length > 0 ? filteredTasks.map((task) => (
                                    <React.Fragment key={task._id}>
                                        <tr className={`hover:bg-slate-50/80 transition-all group ${expandedTaskId === task._id ? 'bg-slate-50' : ''}`}>
                                            <td className="pl-8 pr-4 py-4">
                                                <button 
                                                    onClick={() => setExpandedTaskId(expandedTaskId === task._id ? null : task._id)}
                                                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${expandedTaskId === task._id ? 'bg-primary text-white rotate-90 shadow-lg shadow-primary/20' : 'bg-slate-50 text-slate-400 group-hover:bg-white group-hover:text-primary group-hover:shadow-sm'}`}
                                                >
                                                    <IoChevronForward size={12} />
                                                </button>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-[13px] font-black text-slate-700 group-hover:text-primary transition-colors leading-tight mb-0.5">{task.taskName}</span>
                                                    <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">{task.taskId || 'DSA-X'}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-50 rounded-lg w-fit border border-slate-100 group-hover:bg-white group-hover:border-primary/20 transition-all">
                                                    <div className="w-1 h-1 rounded-full bg-slate-300 group-hover:bg-primary transition-colors"></div>
                                                    <span className="text-[10px] font-bold text-slate-500 group-hover:text-slate-700 truncate max-w-[200px]">
                                                        {task.parentTask?.taskName || 'Individual Task'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-[9px] font-black text-primary bg-primary/5 px-2.5 py-0.5 rounded-full border border-primary/10 uppercase tracking-wider">
                                                    {task.projectName?.key || task.projectName || 'MOM'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <div className="flex flex-col items-center">
                                                    <div className="text-[10px] font-black text-slate-700">{getFinishDate(task)}</div>
                                                    <div className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter">Done</div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <div className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-black transition-all ${task.revisionLogs?.length > 0 ? 'bg-green-500 text-white shadow-sm' : 'bg-slate-100 text-slate-400'}`}>
                                                    {task.revisionLogs?.length || 0}
                                                </div>
                                            </td>
                                            <td className="pl-4 pr-8 py-4 text-right">
                                                <button 
                                                    onClick={() => { setSelectedTask(task); setShowRevisionModal(true); }}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-[10px] font-black text-slate-700 hover:bg-primary hover:text-white hover:border-primary transition-all active:scale-95 group/btn"
                                                >
                                                    <IoSyncOutline className="group-hover/btn:animate-spin" size={12} />
                                                    LOG
                                                </button>
                                            </td>
                                        </tr>

                                        {expandedTaskId === task._id && (
                                            <tr className="bg-slate-50/30 animate-in slide-in-from-top-1 duration-200">
                                                <td colSpan="7" className="px-12 py-6">
                                                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                                                        <div className="flex items-center justify-between mb-5 border-b border-slate-50 pb-3">
                                                            <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                                                <IoListOutline size={16} className="text-primary" />
                                                                Logs
                                                            </h4>
                                                        </div>
                                                        
                                                        {task.revisionLogs && task.revisionLogs.length > 0 ? (
                                                            <div className="space-y-2">
                                                                {task.revisionLogs.map((log, lIdx) => (
                                                                    <div key={lIdx} className="bg-slate-50/30 p-3 rounded-xl border border-slate-50 flex items-start gap-3 hover:border-primary/10 transition-all">
                                                                        <div className="shrink-0 w-6 h-6 rounded-full bg-white flex items-center justify-center text-[9px] font-black text-primary border border-slate-100">
                                                                            {lIdx + 1}
                                                                        </div>
                                                                        <div className="flex-1">
                                                                            <div className="flex items-center justify-between mb-1">
                                                                                <span className="text-[10px] font-black text-slate-700">Review</span>
                                                                                <span className="text-[8px] font-bold text-slate-400">
                                                                                    {moment(log.revisionDate).format('DD MMM, YYYY · HH:mm')}
                                                                                </span>
                                                                            </div>
                                                                            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{log.notes || 'Insight not recorded.'}</p>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="py-6 flex flex-col items-center justify-center text-center opacity-30">
                                                                <IoSyncOutline size={24} className="text-slate-300 mb-2" />
                                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em]">No Logs</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                )) : (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-24 text-center">
                                            <div className="flex flex-col items-center justify-center opacity-30">
                                                <IoCheckmarkCircleOutline size={40} className="text-slate-200 mb-4" />
                                                <p className="text-sm font-black text-slate-700 uppercase tracking-widest">Protocol Clear</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Revision Modal */}
            {showRevisionModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-500" onClick={() => setShowRevisionModal(false)}></div>
                    <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
                        <div className="bg-slate-900 px-8 py-10 flex items-center justify-between text-white relative overflow-hidden">
                            <div className="relative z-10 flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-white/10">
                                    <IoSyncOutline size={24} className="text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-black text-xl tracking-tight leading-none">Log Review</h3>
                                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1.5">Cycle Submission</p>
                                </div>
                            </div>
                            <button onClick={() => setShowRevisionModal(false)} className="relative z-10 w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/5">
                                <IoCloseOutline size={24} />
                            </button>
                        </div>

                        <div className="p-8 bg-white">
                            <div className="mb-8">
                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-3 block">Task</span>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary font-black shadow-sm border border-slate-100">
                                        {selectedTask?.taskName?.[0] || 'T'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-800 tracking-tight">{selectedTask?.taskName}</p>
                                        <p className="text-[9px] font-black text-primary uppercase tracking-widest mt-0.5">{selectedTask?.projectName?.key || 'MOM'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <label className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-3 block">Insights</label>
                                    <textarea 
                                        rows="4"
                                        placeholder="Record key findings..."
                                        value={revisionNote}
                                        onChange={(e) => setRevisionNote(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-[13px] font-bold text-slate-700 placeholder:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all resize-none shadow-inner"
                                    ></textarea>
                                </div>

                                <div className="flex items-center gap-4 pt-2">
                                    <button 
                                        onClick={() => setShowRevisionModal(false)}
                                        className="px-6 py-4 rounded-xl text-[10px] font-black text-slate-400 hover:text-slate-600 transition-all"
                                    >
                                        CANCEL
                                    </button>
                                    <button 
                                        onClick={handleAddRevision}
                                        className="flex-1 px-6 py-4 rounded-xl text-[10px] font-black text-white bg-primary hover:bg-primary-dark transition-all active:scale-95 shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                                    >
                                        <IoSyncOutline size={16} />
                                        SUBMIT LOG
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Revision;
