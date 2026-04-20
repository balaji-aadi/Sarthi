import React, { useState, useEffect } from 'react';
import { IoTimeOutline, IoPlay, IoPause } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

const GlobalTimerWidget = () => {
    const navigate = useNavigate();
    const [timerData, setTimerData] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        const updateTimer = () => {
            const stateStr = localStorage.getItem("focus_timer_state");
            const bindingStr = localStorage.getItem("focus_timer_task_binding");
            
            if (stateStr && bindingStr) {
                const state = JSON.parse(stateStr);
                const binding = JSON.parse(bindingStr);
                
                if (state.isActive) {
                    const start = new Date(state.startTime).getTime();
                    const now = Date.now();
                    const duration = state.selectedDuration * 60;
                    const elapsed = Math.floor((now - start) / 1000);
                    const remaining = Math.max(duration - elapsed, 0);
                    
                    setTimerData({ ...state, ...binding });
                    setTimeLeft(remaining);
                } else {
                    setTimerData(null);
                }
            } else {
                setTimerData(null);
            }
        };

        const interval = setInterval(updateTimer, 1000);
        updateTimer();
        return () => clearInterval(interval);
    }, []);

    if (!timerData || timeLeft <= 0) return null;

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timeStr = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

    return (
        <div 
            onClick={() => navigate('/focus-timer')}
            className="mx-4 mb-4 p-3 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200 cursor-pointer hover:bg-indigo-700 transition-all group animate-in slide-in-from-left duration-300"
        >
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-white/80">
                    <IoTimeOutline size={14} className="animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Focus Active</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></div>
                </div>
            </div>
            
            <div className="flex items-baseline justify-between gap-2">
                <h4 className="text-white font-black text-xl tracking-tighter">{timeStr}</h4>
                <p className="text-white/60 text-[10px] font-bold truncate flex-1 text-right">
                    {timerData.taskName}
                </p>
            </div>

            <div className="mt-2 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-white/40 transition-all duration-1000"
                    style={{ width: `${(timeLeft / (timerData.selectedDuration * 60)) * 100}%` }}
                />
            </div>
        </div>
    );
};

export default GlobalTimerWidget;
