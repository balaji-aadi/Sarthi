import React, { useMemo, useRef, useState, useLayoutEffect, useEffect } from 'react';
import moment from 'moment';
import { 
    IoCalendarOutline, 
    IoInformationCircleOutline, 
    IoNavigateOutline, 
    IoCheckmarkCircleOutline,
    IoArrowForwardOutline
} from 'react-icons/io5';

const TimelineBoard = ({ tasks = [], isLoading, onTaskClick }) => {
    const containerRef = useRef(null);
    const dayCellRef = useRef(null);
    const [perDay, setPerDay] = useState(60);

    // Filter: Only show CHILD tasks (those that have a parentTask defined)
    const childTasks = useMemo(() => {
        return tasks.filter(t => t.parentTask);
    }, [tasks]);

    // 1. Determine date range
    const { startDate, endDate, days } = useMemo(() => {
        if (!childTasks.length) return { startDate: moment(), endDate: moment().add(30, 'days'), days: [] };

        const dates = childTasks.flatMap(t => [
            t.taskStartDate ? moment(t.taskStartDate) : moment(t.createdAt),
            t.taskDueDate ? moment(t.taskDueDate) : moment().add(1, 'day')
        ]);
        
        const min = moment.min(dates).subtract(5, 'days'); // Pad left
        const max = moment.max(dates).add(10, 'days'); // Pad right
        
        const dayList = [];
        let current = min.clone();
        while (current.isBefore(max)) {
            dayList.push(current.clone());
            current.add(1, 'day');
        }

        return { startDate: min, endDate: max, days: dayList };
    }, [childTasks]);

    const getTaskColor = (task) => {
        switch (task.status) {
            case 'done': return 'from-emerald-500 to-teal-600 text-white border-emerald-600/30';
            case 'inprogress': return 'from-indigo-500 to-violet-600 text-white border-indigo-600/30';
            case 'hold': return 'from-amber-500 to-orange-600 text-white border-amber-600/30';
            case 'todo': return 'from-slate-400 to-slate-500 text-white border-slate-500/30';
            case 'backlog': return 'from-rose-400 to-pink-500 text-white border-rose-500/30';
            default: return 'from-blue-500 to-indigo-600 text-white border-blue-600/30';
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

    useLayoutEffect(() => {
      if (dayCellRef.current) {
        const w = dayCellRef.current.offsetWidth;
        if (w && w !== perDay) {
          setPerDay(w);
        }
      }
    }, [days, perDay]);

    // Position Gantt Chart bars absolutely inside relative timeline track
    const getTaskStyle = (task) => {
        const start = task.taskStartDate ? moment(task.taskStartDate) : moment(task.createdAt);
        const end = task.taskDueDate ? moment(task.taskDueDate) : moment().add(1, 'day');

        const idx = days.findIndex(d => d.isSame(start, 'day'));
        const idxEnd = days.findIndex(d => d.isSame(end, 'day'));
        
        const left = idx >= 0 ? idx * perDay : 0;
        const dur = (idxEnd >= idx ? idxEnd - idx + 1 : 1);

        return {
            position: 'absolute',
            left: `${left + 4}px`, // Padding to prevent overlaps with borders
            width: `${(dur * perDay) - 8}px`,
            minWidth: '42px',
            top: '50%',
            transform: 'translateY(-50%)'
        };
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

    // Auto-scroll on mount to focus around "Today" or first active task
    const scrollToFocus = () => {
        if (containerRef.current && days.length > 0) {
            const todayIdx = days.findIndex(d => d.isSame(moment(), 'day'));
            if (todayIdx >= 0) {
                const scrollLeft = Math.max(0, (todayIdx * perDay) - 180);
                containerRef.current.scrollTo({ left: scrollLeft, behavior: 'smooth' });
            } else {
                // Scroll to the first task's start date
                const sortedTasks = [...childTasks].sort((a, b) => {
                    const aStart = a.taskStartDate ? new Date(a.taskStartDate) : new Date(a.createdAt);
                    const bStart = b.taskStartDate ? new Date(b.taskStartDate) : new Date(b.createdAt);
                    return aStart - bStart;
                });
                
                if (sortedTasks.length > 0) {
                    const firstStart = sortedTasks[0].taskStartDate ? moment(sortedTasks[0].taskStartDate) : moment(sortedTasks[0].createdAt);
                    const firstIdx = days.findIndex(d => d.isSame(firstStart, 'day'));
                    if (firstIdx >= 0) {
                        const scrollLeft = Math.max(0, (firstIdx * perDay) - 180);
                        containerRef.current.scrollTo({ left: scrollLeft, behavior: 'smooth' });
                    }
                }
            }
        }
    };

    useEffect(() => {
        // Run with a short delay to ensure DOM coordinates are set
        const timer = setTimeout(() => {
            scrollToFocus();
        }, 300);
        return () => clearTimeout(timer);
    }, [days, perDay]);

    if (isLoading) return <div className="p-8 text-center text-textSub italic animate-pulse">Gathering timeline data...</div>;

    return (
        <div className="flex flex-col lg:flex-row gap-6 w-full items-stretch">
            
            {/* Left/Agenda Side Panel: Today's focus, banner and quick links */}
            <div className="w-full lg:w-[320px] xl:w-[360px] flex-shrink-0 flex flex-col gap-4">
                
                {/* Guide & Utility Header */}
                <div className="bg-gradient-to-r from-indigo-50/60 to-violet-50/40 dark:from-indigo-950/20 dark:to-violet-950/10 rounded-2xl border border-indigo-100/40 p-4 flex flex-col gap-3">
                    <div className="flex gap-2.5">
                        <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 shrink-0">
                            <IoInformationCircleOutline size={18} />
                        </div>
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 mt-1.5">Gantt Roadmap</h3>
                    </div>
                    <p className="text-[11px] font-semibold text-slate-500 leading-relaxed">
                        Trace schedule durations over time. Visual bars connect start dates to due dates across columns.
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
                                        className={`p-3 rounded-xl border border-slate-100 hover:border-indigo-200 shadow-sm hover:shadow transition-all cursor-pointer flex flex-col gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold`}
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
                                    className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/60 hover:bg-indigo-50/50 border border-slate-100 hover:border-indigo-100 rounded-xl p-3 transition-all cursor-pointer group mt-auto"
                                >
                                    <div className="flex flex-col items-start gap-1 flex-grow">
                                        <span className="text-[8px] font-black uppercase tracking-widest text-indigo-600">Next Upcoming Milestone</span>
                                        <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 truncate max-w-[200px] group-hover:text-indigo-600 transition-colors">{nextTask.taskName}</span>
                                    </div>
                                    <div className="text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all">
                                        <IoArrowForwardOutline size={14} />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Side Panel: Main Gantt Grid */}
            <div className="flex-grow min-w-0 flex flex-col bg-white dark:bg-slate-950 rounded-3xl border border-slate-100 shadow-sm overflow-hidden relative">
                
                {/* Timeline Navigation */}
                <div className="p-5 flex items-center justify-between border-b border-slate-100 bg-white dark:bg-slate-950 z-20">
                    <div className="flex items-center gap-4">
                        <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-widest">Timeline Roadmap</h2>
                        {days.length > 0 && (
                            <button 
                                onClick={scrollToFocus}
                                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm hover:shadow transition-all"
                            >
                                <IoNavigateOutline size={12} />
                                <span>Center Today</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Horizontal Scroll Grid Container */}
                <div 
                    ref={containerRef}
                    className="overflow-auto relative custom-scrollbar flex-grow"
                >
                    <div style={{ width: `${(days.length * perDay) + 288}px` }} className="relative">
                         
                         {/* Header: Months/Days */}
                         <div className="flex border-b border-slate-100 sticky top-0 bg-white dark:bg-slate-950 z-30 shadow-sm">
                             <div className="w-72 flex-shrink-0 p-4 font-bold text-xs uppercase tracking-widest text-slate-500 bg-slate-50/50 dark:bg-slate-900 border-r border-slate-100">Task Name</div>
                             <div className="flex" style={{ width: `${days.length * perDay}px` }}>
                                 {days.map((day, i) => {
                                     const isToday = day.isSame(moment(), 'day');
                                     const isWeekend = day.day() === 0 || day.day() === 6;
                                     return (
                                         <div
                                           key={i}
                                           ref={i === 0 ? dayCellRef : null}
                                           className={`flex-shrink-0 border-r border-slate-100/60 text-center py-2.5 transition-colors ${
                                               isToday 
                                               ? 'bg-indigo-500/5 ring-1 ring-inset ring-indigo-500/20' 
                                               : isWeekend 
                                                   ? 'bg-slate-50/60 dark:bg-slate-900/30' 
                                                   : ''
                                           }`}
                                           style={{ width: `${perDay}px` }}
                                         >
                                            <div className={`text-[11px] font-black ${isToday ? 'text-indigo-600' : 'text-slate-700 dark:text-slate-300'}`}>{day.format('DD')}</div>
                                            <div className={`text-[9px] font-bold uppercase ${isToday ? 'text-indigo-600' : 'text-slate-400'}`}>{day.format('ddd')}</div>
                                         </div>
                                     );
                                 })}
                             </div>
                         </div>

                         {/* Body: Tasks */}
                         <div className="divide-y divide-slate-100/60 bg-white dark:bg-slate-900/10">
                             {childTasks.length > 0 ? childTasks.map(task => (
                                 <div key={task._id} className="flex hover:bg-indigo-500/[0.01] relative group min-h-[48px]">
                                     {/* Sidelined Sticky Task Info */}
                                     <div className="w-72 flex-shrink-0 p-3 pr-4 text-sm font-semibold text-slate-700 dark:text-slate-200 truncate border-r border-slate-100 bg-white dark:bg-slate-950 sticky left-0 z-20 flex items-center gap-2">
                                         <div className={`w-1.5 h-6 rounded-full shrink-0 ${
                                             task.taskPriority === 'high' ? 'bg-rose-500' : 
                                             task.taskPriority === 'medium' ? 'bg-amber-500' : 
                                             'bg-indigo-500'
                                         }`}></div>
                                         <div className="truncate flex flex-col">
                                             <span className="truncate text-slate-800 dark:text-slate-200 font-bold hover:text-indigo-600 cursor-pointer text-xs" onClick={() => onTaskClick?.(task)}>{task.taskName}</span>
                                             <span className="text-[10px] text-slate-400 font-bold">#{task.taskId || task._id.slice(-4)}</span>
                                         </div>
                                     </div>

                                     {/* Row Timeline Track */}
                                     <div className="flex-1 relative py-3 min-h-[48px]">
                                         {/* Background Grid Lines */}
                                         <div className="absolute inset-0 flex pointer-events-none">
                                             {days.map((day, i) => (
                                                 <div 
                                                    key={i} 
                                                    className={`flex-shrink-0 border-r border-slate-100/30 ${day.isSame(moment(), 'day') ? 'bg-indigo-50/[0.02]' : ''}`}
                                                    style={{ width: `${perDay}px` }}
                                                 ></div>
                                             ))}
                                         </div>

                                         {/* Task Gantt Bar */}
                                         <div 
                                            className={`absolute h-8 bg-gradient-to-r ${getTaskColor(task)} rounded-lg shadow-sm border cursor-pointer transition-all duration-300 hover:shadow hover:scale-[1.01] z-10 flex items-center overflow-hidden`}
                                            style={getTaskStyle(task)}
                                            title={`${task.taskName}\nStatus: ${task.status}\nPriority: ${task.taskPriority}\nRange: ${moment(task.taskStartDate || task.createdAt).format('MMM D')} - ${moment(task.taskDueDate).format('MMM D')}`}
                                            onClick={() => onTaskClick?.(task)}
                                         >
                                             <div className="flex items-center gap-2 px-2.5 w-full">
                                                 {task.assignee && (
                                                     <div className="w-4.5 h-4.5 rounded-full bg-white/20 border border-white/20 flex items-center justify-center text-[8px] font-black text-white shrink-0 shadow-inner uppercase">
                                                         {task.assignee.firstName?.[0]}
                                                     </div>
                                                 )}
                                                 <span className="text-white text-[10px] font-extrabold truncate leading-none pt-0.5">{task.taskName}</span>
                                             </div>
                                             
                                             {/* Live pulsing progress indicator for active items */}
                                             {task.status === 'inprogress' && (
                                                 <div className="absolute bottom-0 left-0 h-[3px] bg-white/50 w-[70%] animate-pulse"></div>
                                             )}
                                         </div>
                                     </div>
                                 </div>
                             )) : (
                                 <div className="p-20 text-center flex flex-col items-center justify-center gap-3">
                                     <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 border border-slate-100">
                                         <IoCalendarOutline size={28} />
                                     </div>
                                     <p className="text-slate-500 font-semibold italic text-xs">No active child timeline tracks mapped.</p>
                                 </div>
                             )}
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TimelineBoard;
