import React, { useState, useEffect } from 'react';
import { IoTimeOutline, IoPlay, IoPause } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import moment from 'moment';
import { getScopedItem, setScopedItem } from '../../utils/userStorage';

const GlobalTimerWidget = () => {
    const navigate = useNavigate();
    const { dailyRevision } = useSelector((state) => state.store);
    const isRevisionLocked = false;
    const [timerData, setTimerData] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        const updateTimer = () => {
            const stateStr = getScopedItem("focus_timer_state");
            const bindingStr = getScopedItem("focus_timer_task_binding");

            if (stateStr) {
                const state = JSON.parse(stateStr);
                const binding = bindingStr ? JSON.parse(bindingStr) : null;
                const isTaskBound = Boolean(binding && (binding.taskId || binding.taskIdString));

                if (state.isActive) {
                    const start = new Date(state.startTime).getTime();
                    const now = Date.now();
                    const duration = (state.selectedDuration || 25) * 60;
                    const elapsed = Math.floor((now - start) / 1000);
                    const totalSpent = (state.accumulatedTime || 0) + elapsed;
                    const remaining = duration - totalSpent;

                    setTimerData({ ...state, ...binding, isPaused: false, isStandalone: !isTaskBound });
                    setTimeLeft(remaining);
                } else if (isTaskBound) {
                    // Only show paused widget if it is bound to a task
                    const duration = (state.selectedDuration || 30) * 60;
                    const remaining = duration - (state.accumulatedTime || 0);
                    setTimerData({ ...state, ...binding, isPaused: true, isStandalone: false });
                    setTimeLeft(remaining);
                } else {
                    // Standalone session paused/inactive: DO NOT SHOW
                    setTimerData(null);
                }
            } else {
                setTimerData(null);
            }
        };

        const interval = setInterval(updateTimer, 1000);
        updateTimer();
        window.addEventListener('focus_timer_updated', updateTimer);
        window.addEventListener('storage', updateTimer);
        return () => {
            clearInterval(interval);
            window.removeEventListener('focus_timer_updated', updateTimer);
            window.removeEventListener('storage', updateTimer);
        };
    }, []);

    const handleResumeTimer = (e) => {
        e.stopPropagation();
        try {
            const stateStr = getScopedItem("focus_timer_state");
            if (stateStr) {
                const state = JSON.parse(stateStr);
                const updated = {
                    ...state,
                    isActive: true,
                    startTime: new Date().toISOString()
                };
                setScopedItem("focus_timer_state", updated);
                window.dispatchEvent(new Event('focus_timer_updated'));
                window.dispatchEvent(new Event('storage'));
                toast.success("Focus timer resumed!", { icon: '▶️' });
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (!timerData) return null;

    const minutes = Math.floor(Math.abs(timeLeft) / 60);
    const seconds = Math.abs(timeLeft) % 60;
    const isOvertime = timeLeft < 0;
    const timeStr = `${isOvertime ? '-' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

    return (
        <div
            onClick={() => {
                if (isRevisionLocked) {
                    toast.error("Complete your Daily Revision to unlock Focus Timer!");
                    return;
                }
                navigate('/focus-timer');
            }}
            className={`mb-4 p-3 rounded-xl shadow-lg cursor-pointer transition-all group animate-in slide-in-from-left duration-300 ${isOvertime
                ? 'bg-rose-600 shadow-rose-200 hover:bg-rose-700'
                : timerData.isPaused
                    ? 'bg-primary shadow-primary/25 hover:bg-primaryHover'
                    : 'bg-primary shadow-primary/25 hover:bg-primaryHover'
                }`}
        >
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-white/90">
                    <IoTimeOutline size={14} className={timerData.isPaused ? "" : "animate-pulse"} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                        {isOvertime ? 'Overtime Active' : timerData.isPaused ? 'Focus Paused' : 'Focus Active'}
                    </span>
                </div>
                <div className="flex items-center gap-1.5">
                    {timerData.isPaused && (
                        <button
                            type="button"
                            onClick={handleResumeTimer}
                            title="Resume Focus Timer"
                            className="flex items-center gap-1 px-2 py-2 rounded-full bg-white/25 hover:bg-white/40 text-white text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs active:scale-95"
                        >
                            <IoPlay size={10} className="fill-current" />
                            {/* <span>Resume</span> */}
                        </button>
                    )}
                    <div className={`w-1.5 h-1.5 rounded-full ${isOvertime ? 'bg-rose-300 animate-ping' : timerData.isPaused ? 'bg-amber-300' : 'bg-emerald-400 animate-ping'}`}></div>
                </div>
            </div>

            <div className="flex items-baseline justify-between gap-2">
                <div className="flex flex-col">
                    <h4 className="text-white font-black text-xl tracking-tighter leading-none">{timeStr}</h4>
                    {timerData.isBacklog && !timerData.taskId?.startsWith('DSA') && (
                        <span className="text-[8px] font-black bg-rose-500/30 text-rose-200 px-1.5 py-0.5 rounded mt-1 uppercase tracking-widest border border-rose-500/20">
                            Backlog: {timerData.dueDate ? moment(timerData.dueDate).format("MMM DD") : "Overdue"}
                        </span>
                    )}
                </div>
                <p className="text-white/80 text-[10px] font-bold truncate flex-1 text-right self-start mt-0.5" title={timerData.taskName}>
                    {timerData.taskName || "Focus Session"}
                </p>
            </div>

            {!isOvertime && (
                <div className="mt-2 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-white/40 transition-all duration-1000"
                        style={{ width: `${Math.max(0, (timeLeft / (timerData.selectedDuration * 60)) * 100)}%` }}
                    />
                </div>
            )}
        </div>
    );
};

export default GlobalTimerWidget;
