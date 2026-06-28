import React, { useState, useMemo } from 'react';
import moment from 'moment';
import { 
    IoChevronBack, 
    IoChevronForward, 
    IoInformationCircleOutline, 
    IoCloseOutline, 
    IoCalendarOutline,
    IoCheckmarkCircleOutline,
    IoArrowForwardOutline
} from 'react-icons/io5';

const CalendarBoard = ({ tasks = [], isLoading, onTaskClick }) => {
    const [currentDate, setCurrentDate] = useState(moment());
    
    // For managing "+ X more" daily task list modal
    const [selectedDateTasks, setSelectedDateTasks] = useState(null);
    const [selectedDateLabel, setSelectedDateLabel] = useState("");

    // Filter: Only show CHILD tasks (those that have a parentTask defined)
    const childTasks = useMemo(() => {
        return tasks.filter(t => t.parentTask);
    }, [tasks]);

    const startOfMonth = currentDate.clone().startOf('month');
    const endOfMonth = currentDate.clone().endOf('month');
    const startOfCalendar = startOfMonth.clone().startOf('week');
    const endOfCalendar = endOfMonth.clone().endOf('week');

    const calendarDays = [];
    let day = startOfCalendar.clone();
    while (day.isBefore(endOfCalendar, 'day')) {
        calendarDays.push(day.clone());
        day.add(1, 'day');
    }

    const getTasksForDate = (date) => {
        return childTasks.filter(task => moment(task.taskDueDate).isSame(date, 'day'));
    };

    const nextMonth = () => setCurrentDate(prev => prev.clone().add(1, 'month'));
    const prevMonth = () => setCurrentDate(prev => prev.clone().subtract(1, 'month'));
    const today = () => setCurrentDate(moment());

    // Color code tasks dynamically by status (extremely elegant tints)
    const getTaskStyleClass = (status) => {
        switch (status) {
            case 'done':
                return 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 border-l-2 font-semibold';
            case 'inprogress':
                return 'bg-indigo-50 text-indigo-700 border-indigo-300 hover:bg-indigo-100 border-l-2 font-semibold';
            case 'hold':
                return 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100 border-l-2 font-semibold';
            case 'backlog':
                return 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100 border-l-2 font-semibold';
            case 'todo':
            default:
                return 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100 border-l-2 font-semibold';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'done': return 'Done';
            case 'inprogress': return 'In Progress';
            case 'hold': return 'On Hold';
            case 'backlog': return 'Backlog';
            case 'todo':
            default: return 'To Do';
        }
    };

    // Calculate today's active child tasks and the next upcoming milestone child task
    const { activeTodayTasks, nextTask } = useMemo(() => {
        const todayMoment = moment().startOf('day');
        
        // Active today means: today falls between start and due date inclusive
        const activeToday = childTasks.filter(t => {
            const start = t.taskStartDate ? moment(t.taskStartDate).startOf('day') : moment(t.createdAt).startOf('day');
            const end = t.taskDueDate ? moment(t.taskDueDate).endOf('day') : moment().add(1, 'day').endOf('day');
            return todayMoment.isBetween(start, end, 'day', '[]');
        });

        // Find the next scheduled child task starting in the future
        const futureTasks = childTasks
            .map(t => ({
                ...t,
                startMoment: t.taskStartDate ? moment(t.taskStartDate).startOf('day') : moment(t.createdAt).startOf('day')
            }))
            .filter(t => t.startMoment.isAfter(todayMoment, 'day'))
            .sort((a, b) => a.startMoment - b.startMoment);

        return { 
            activeTodayTasks: activeToday, 
            nextTask: futureTasks[0] || null 
        };
    }, [childTasks]);

    if (isLoading) return <div className="p-8 text-center text-textSub">Loading calendar...</div>;

    return (
        <div className="flex flex-col lg:flex-row gap-6 w-full items-stretch">
            
            {/* Left/Agenda Side Panel: Today's focus, banner and quick links */}
            <div className="w-full lg:w-[320px] xl:w-[360px] flex-shrink-0 flex flex-col gap-4">
                
                {/* Guide & Utility Header */}
                <div className="bg-gradient-to-r from-violet-50/60 to-purple-50/40 dark:from-violet-950/20 dark:to-purple-950/10 rounded-2xl border border-violet-100/40 p-4 flex flex-col gap-3">
                    <div className="flex gap-2.5">
                        <div className="p-2 rounded-xl bg-vermilion-50 text-primary shrink-0">
                            <IoInformationCircleOutline size={18} />
                        </div>
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 mt-1.5">Sprint Planner</h3>
                    </div>
                    <p className="text-[11px] font-semibold text-slate-500 leading-relaxed">
                        Map daily deadline distributions. Tasks are color-coded by lifecyle state 
                        (<span className="text-rose-600 font-bold">Backlogs are Rose</span>, <span className="text-primary font-bold">Active in Vermilion</span>). 
                        Click "+ more" on busy days to check item overlays.
                    </p>
                </div>

                {/* Premium Today's Focus Agenda Section */}
                <div className="bg-white dark:bg-slate-950 border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col gap-3.5 flex-grow">
                    {activeTodayTasks.length > 0 ? (
                        <div className="flex flex-col gap-3 h-full">
                            <div className="flex items-center gap-2">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">Today's Focus Agenda</span>
                            </div>
                            <div className="flex flex-col gap-2 overflow-y-auto max-h-[500px] custom-scrollbar pr-1">
                                {activeTodayTasks.map(task => (
                                    <div 
                                        key={task._id} 
                                        onClick={() => onTaskClick?.(task)}
                                        className={`p-3 rounded-xl border border-transparent shadow-sm hover:shadow transition-all cursor-pointer flex flex-col gap-1.5 ${getTaskStyleClass(task.status)}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-extrabold text-xs truncate leading-snug max-w-[180px]">{task.taskName}</span>
                                            <span className="text-[8px] font-black uppercase tracking-wider bg-white/70 dark:bg-black/10 px-1.5 py-0.5 rounded">
                                                {getStatusLabel(task.status)}
                                            </span>
                                        </div>
                                        <span className="text-[9px] font-bold text-slate-500 leading-none">Due: {moment(task.taskDueDate).format('MMM DD, YYYY')}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4 justify-between h-full py-2">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-slate-100 dark:bg-slate-900 rounded-xl text-slate-500 shrink-0">
                                    <IoCheckmarkCircleOutline size={20} />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">Today is Clear</span>
                                    <p className="text-[11px] font-semibold text-slate-400">
                                        No deadlines or active tasks scheduled for today. You are completely up to date!
                                    </p>
                                </div>
                            </div>
                            {nextTask && (
                                <div 
                                    onClick={() => onTaskClick?.(nextTask)}
                                    className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/60 hover:bg-vermilion-50/30 border border-slate-100 hover:border-vermilion-100 rounded-xl p-3 transition-all cursor-pointer group mt-auto"
                                >
                                    <div className="flex flex-col items-start gap-1 flex-grow">
                                        <span className="text-[8px] font-black uppercase tracking-widest text-primary">Next Upcoming Milestone</span>
                                        <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 truncate max-w-[200px] group-hover:text-primary transition-colors">{nextTask.taskName}</span>
                                    </div>
                                    <div className="text-slate-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all">
                                        <IoArrowForwardOutline size={14} />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Side Panel: Main Calendar Grid */}
            <div className="flex-grow min-w-0 flex flex-col bg-white dark:bg-slate-950 rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                
                {/* Calendar Navigation */}
                <div className="p-5 flex items-center justify-between border-b border-slate-100 bg-white dark:bg-slate-950 z-20">
                    <div className="flex items-center gap-4">
                        <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-widest">{currentDate.format('MMMM YYYY')}</h2>
                        <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900 p-1 rounded-xl border border-slate-100">
                            <button onClick={prevMonth} className="p-1.5 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-lg text-slate-600 transition-colors"><IoChevronBack size={14} /></button>
                            <button onClick={today} className="px-3.5 py-1 text-xs font-black uppercase tracking-wider hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 transition-colors">Today</button>
                            <button onClick={nextMonth} className="p-1.5 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-lg text-slate-600 transition-colors"><IoChevronForward size={14} /></button>
                        </div>
                    </div>
                </div>

                {/* Horizontal Scroll wrapper for responsive calendar support */}
                <div className="overflow-x-auto w-full custom-scrollbar">
                    <div className="min-w-[900px] flex flex-col">
                        
                        {/* Days Header */}
                        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50 dark:bg-slate-900 text-center py-2.5">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                <div key={d} className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{d}</div>
                            ))}
                        </div>

                        {/* Calendar Days Grid */}
                        <div className="grid grid-cols-7 auto-rows-fr">
                            {calendarDays.map((date, idx) => {
                                const isCurrentMonth = date.isSame(currentDate, 'month');
                                const isToday = date.isSame(moment(), 'day');
                                const dayTasks = getTasksForDate(date);
                                
                                // Limit visible tasks inside cell to 2, list remainder under "+ X more"
                                const maxVisible = 2;
                                const visibleTasks = dayTasks.slice(0, maxVisible);
                                const remainderCount = dayTasks.length - maxVisible;

                                return (
                                    <div 
                                        key={idx} 
                                        className={`min-h-[110px] border-b border-r border-slate-100/80 p-2 flex flex-col gap-1 transition-colors hover:bg-indigo-500/[0.01] ${
                                            !isCurrentMonth 
                                            ? 'bg-slate-50/30 text-slate-300 dark:bg-slate-900/10' 
                                            : 'bg-white dark:bg-slate-950'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className={`text-[11px] font-black w-6 h-6 flex items-center justify-center rounded-lg transition-colors ${
                                                isToday 
                                                ? 'bg-indigo-600 text-white shadow-sm' 
                                                : isCurrentMonth 
                                                    ? 'text-slate-700 dark:text-slate-300' 
                                                    : 'text-slate-300'
                                            }`}>
                                                {date.format('D')}
                                            </span>
                                            {dayTasks.length > 0 && (
                                                <span className="text-[9px] font-extrabold text-slate-400 uppercase bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
                                                    {dayTasks.length} task{dayTasks.length > 1 ? 's' : ''}
                                                </span>
                                            )}
                                        </div>
                                        
                                        <div className="flex flex-col gap-1.5 flex-grow overflow-hidden">
                                            {visibleTasks.map(task => (
                                                <div 
                                                    key={task._id} 
                                                    onClick={() => onTaskClick?.(task)}
                                                    className={`text-[10px] px-2 py-1.5 rounded-lg truncate cursor-pointer transition-all border border-transparent shadow-sm leading-tight hover:shadow-md ${getTaskStyleClass(task.status)}`}
                                                    title={`${task.taskName} - ${getStatusLabel(task.status)}`}
                                                >
                                                    {task.taskName}
                                                </div>
                                            ))}
                                            
                                            {remainderCount > 0 && (
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedDateTasks(dayTasks);
                                                        setSelectedDateLabel(date.format('MMMM DD, YYYY'));
                                                    }}
                                                    className="text-[9px] font-black text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 py-1 px-1.5 rounded-lg transition-colors text-left"
                                                >
                                                    + {remainderCount} more items
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                    </div>
                </div>
            </div>

            {/* Daily Task Overlay Modal */}
            {selectedDateTasks && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[85vh]">
                        {/* Modal Header */}
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                                    <IoCalendarOutline size={18} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Tasks Scheduled</span>
                                    <h4 className="text-sm font-black text-slate-800 dark:text-slate-100">{selectedDateLabel}</h4>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSelectedDateTasks(null)}
                                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                            >
                                <IoCloseOutline size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-5 overflow-y-auto flex flex-col gap-3 max-h-[50vh]">
                            {selectedDateTasks.map(task => (
                                <div 
                                    key={task._id}
                                    onClick={() => {
                                        onTaskClick?.(task);
                                        setSelectedDateTasks(null);
                                    }}
                                    className={`p-3 rounded-2xl border border-transparent shadow-sm cursor-pointer transition-all hover:shadow-md hover:scale-[1.01] flex flex-col gap-1.5 ${getTaskStyleClass(task.status)}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-extrabold text-xs leading-snug">{task.taskName}</span>
                                        <span className="text-[9px] font-black uppercase tracking-wider bg-white/60 dark:bg-black/20 px-2 py-0.5 rounded-md">
                                            {getStatusLabel(task.status)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-[9px] font-bold text-slate-500/80">
                                        <span>Priority: <span className="uppercase font-black">{task.taskPriority || 'Medium'}</span></span>
                                        <span>#{task.taskId || task._id.slice(-4)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CalendarBoard;
