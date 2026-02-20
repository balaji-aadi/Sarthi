import React, { useState, useEffect } from 'react';
import { IoChevronDown, IoChevronForward, IoAdd } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import StatusPill from './StatusPill';
import ProgressBar from './ProgressBar';

const TaskTable = ({ tasks = [], isLoading, onProjectChange, onMemberChange, projects = [], members = [], selectedProject, selectedMember }) => {
    const navigate = useNavigate();
    const [expandedGroups, setExpandedGroups] = useState({
        inprogress: true,
        todo: true,
        done: true,
        hold: true
    });

    const toggleGroup = (groupId) => {
        setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
    };

    // Group tasks by status
    const getGroupedTasks = () => {
        const groups = {
            backlog: { id: 'backlog', title: 'Backlog', color: 'bg-slate-400', tasks: [] },
            todo: { id: 'todo', title: 'To Do', color: 'bg-slate-500', tasks: [] },
            inprogress: { id: 'inprogress', title: 'In Progress', color: 'bg-amber-500', tasks: [] },
            hold: { id: 'hold', title: 'On Hold', color: 'bg-orange-500', tasks: [] },
            review: { id: 'review', title: 'Review', color: 'bg-purple-500', tasks: [] },
            done: { id: 'done', title: 'Done', color: 'bg-emerald-500', tasks: [] },
        };

        if (tasks) {
            tasks.forEach(task => {
                const status = task.status || 'todo'; 
                if (groups[status]) {
                    groups[status].tasks.push(task);
                } else {
                    // Fallback for unknown status
                    groups.todo.tasks.push(task);
                }
            });
        }
        return Object.values(groups);
    };

    const groupedTasks = getGroupedTasks();

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const getAssigneeAvatar = (assignee) => {
        if (!assignee) return 'https://ui-avatars.com/api/?name=NA&background=gray';
        const name = `${assignee.firstName || ''} ${assignee.lastName || ''}`;
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim() || 'User')}&background=random`;
    };

    return (
        <div className="bg-surface rounded-2xl shadow-sm border border-borderLight overflow-hidden flex flex-col h-full">
            {/* Toolbar Removed - Handled by DashboardHeader */}
            
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-bgLight border-b border-borderLight text-xs font-semibold text-textSub uppercase tracking-wider">
                <div className="hidden md:block md:col-span-1">ID</div>
                <div className="col-span-12 md:col-span-3 flex items-center gap-1">Task</div>
                <div className="hidden md:block md:col-span-1">Assignee</div>
                <div className="hidden md:block md:col-span-2">Timeline</div>
                <div className="hidden md:block md:col-span-1 text-center">Time Spent</div>
                <div className="hidden md:block md:col-span-1">Priority</div>
                <div className="hidden md:block md:col-span-1">Progress</div>
                <div className="hidden md:block md:col-span-2 text-right">Details</div>
            </div>

            {/* Table Body */}
            <div className="overflow-y-auto flex-1 h-full min-h-[400px]">
                {isLoading ? (
                    <div className="p-8 text-center text-textSub">Loading tasks...</div>
                ) : (
                    groupedTasks.map(group => (
                        <div key={group.id}>
                            {/* Group Header */}
                            <div 
                                className="flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors sticky top-0 bg-surface/95 backdrop-blur-sm z-10 border-b border-borderLight/50"
                                onClick={() => toggleGroup(group.id)}
                            >
                                <span className="text-textSub">{expandedGroups[group.id] ? <IoChevronDown /> : <IoChevronForward />}</span>
                                <span className={`px-2 py-0.5 rounded text-xs font-bold text-white ${group.color}`}>{group.title}</span>
                                <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-xs font-bold">{group.tasks.length}</span>
                                <div className="flex-1 h-px bg-borderLight ml-4"></div>
                            </div>

                            {expandedGroups[group.id] && group.tasks.map(task => {
                                        // Calculate time spent in 'inprogress' status
                                        let totalInProgressTime = 0;
                                        let lastTimestamp = null;
                                        let lastStatus = null;

                                        if (task.activityLogs && task.activityLogs.length > 0) {
                                            const sortedLogs = [...task.activityLogs].sort((a, b) => new Date(a.date) - new Date(b.date));
                                            
                                            sortedLogs.forEach((log) => {
                                                if (lastStatus === "inprogress" && lastTimestamp) {
                                                    totalInProgressTime += (new Date(log.date) - new Date(lastTimestamp));
                                                }
                                                lastTimestamp = log.date;
                                                lastStatus = log.currentStatus;
                                            });

                                            // If currently in progress, add time since last log
                                            if (task.status === "inprogress" && lastTimestamp) {
                                                totalInProgressTime += (new Date() - new Date(lastTimestamp));
                                            }
                                        }

                                        const totalMinutes = Math.round(totalInProgressTime / 60000);
                                        const hours = Math.floor(totalMinutes / 60);
                                        const minutes = totalMinutes % 60;

                                        return (
                                            <div key={task._id} className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-borderLight hover:bg-slate-50 transition-colors items-center group">
                                                <div className="hidden md:block md:col-span-1">
                                                    <span className="font-mono text-xs font-bold text-textSub bg-slate-100 px-1.5 py-0.5 rounded">{task.taskId || '-'}</span>
                                                </div>
                                                <div className="col-span-12 md:col-span-3 flex items-center gap-3">
                                                    <input type="checkbox" className="w-4 h-4 rounded border-borderLight text-primary focus:ring-primary/20" />
                                                    <div className="min-w-0">
                                                        <span 
                                                            className="font-bold text-textMain truncate cursor-pointer hover:text-primary block leading-tight mb-0.5" 
                                                            onClick={() => navigate(`/task/update-task?id=${task._id}`)}
                                                            title={task.taskName}
                                                        >
                                                            {task.taskName}
                                                        </span>
                                                        <span className="text-[10px] text-textSub uppercase font-bold tracking-tighter">{task.projectName?.name || 'Momentum'}</span>
                                                    </div>
                                                </div>
                                                <div className="hidden md:block md:col-span-1">
                                                    <div className="flex items-center gap-2">
                                                        <img 
                                                            src={getAssigneeAvatar(task.assignee)} 
                                                            className="w-7 h-7 rounded-full border border-white ring-1 ring-slate-200" 
                                                            alt="Assignee" 
                                                            title={task.assignee ? `${task.assignee.firstName} ${task.assignee.lastName}` : 'Unassigned'}
                                                        />
                                                        <span className="text-[10px] font-bold text-textMain hidden xl:block uppercase">{task.assignee?.firstName || 'NA'}</span>
                                                    </div>
                                                </div>
                                                <div className="hidden md:block md:col-span-2">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-extrabold text-slate-400 uppercase leading-none mb-1">Start: {formatDate(task.taskStartDate)}</span>
                                                        <span className="text-[10px] font-extrabold text-blue-500 uppercase leading-none">Due: {formatDate(task.taskDueDate)}</span>
                                                    </div>
                                                </div>
                                                <div className="hidden md:block md:col-span-1 text-center font-black text-indigo-600 text-xs tracking-tighter">
                                                    {hours}h {minutes}m
                                                </div>
                                                <div className="hidden md:block md:col-span-1"><StatusPill status={task.taskPriority} /></div>
                                                <div className="hidden md:block md:col-span-1"><ProgressBar progress={task.progress || 0} /></div>
                                                <div className="hidden md:block md:col-span-2 text-right">
                                                    <button 
                                                        onClick={() => navigate(`/task/update-task?id=${task._id}`)}
                                                        className="p-1.5 hover:bg-primary/10 text-primary rounded-lg transition-colors inline-flex items-center gap-1 group/btn"
                                                    >
                                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap">Manage Task</span>
                                                        <IoChevronForward size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                        </div>
                    ))
                )}
                
                {/* Add Task Button */}
                <button 
                    onClick={() => navigate('/task/create-task')}
                    className="flex items-center gap-2 px-6 py-4 text-sm text-textSub hover:text-primary transition-colors w-full border-t border-transparent hover:border-borderLight"
                >
                    <IoAdd /> Add task
                </button>
            </div>
        </div>
    );
};

export default TaskTable;
