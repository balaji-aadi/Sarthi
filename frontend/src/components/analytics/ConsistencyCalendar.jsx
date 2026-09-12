import React, { useState } from 'react';
import moment from 'moment';
import { IoCheckmarkCircle, IoFlashOutline, IoChevronBack, IoChevronForward } from 'react-icons/io5';
import DayActivityModal from './DayActivityModal';

const ConsistencyCalendar = ({ stats, period = 'monthly', isEmbedded = false, projectId = null, projectName = null }) => {
    const [currentMonth, setCurrentMonth] = useState(moment());
    const [selectedDateModal, setSelectedDateModal] = useState(null);

    // Generate days for the selected month
    const startOfMonth = moment(currentMonth).startOf('month');
    const endOfMonth = moment(currentMonth).endOf('month');
    const daysInMonth = startOfMonth.daysInMonth();

    // Create an array of days for the grid
    const calendarDays = [];
    const firstDayOfWeek = startOfMonth.day(); // 0 for Sunday, 1 for Monday...

    // Padding for the start of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
        calendarDays.push({ padding: true });
    }

    // Fill in the actual days
    for (let i = 1; i <= daysInMonth; i++) {
        const dateStr = moment(currentMonth).date(i).format('YYYY-MM-DD');
        const isFuture = moment(dateStr).isAfter(moment(), 'day');
        const dayStats = stats.find(s => moment(s.date).format('YYYY-MM-DD') === dateStr);
        calendarDays.push({
            day: i,
            date: dateStr,
            metrics: dayStats?.metrics || { hoursLogged: 0, tasksCompleted: 0, storyPointsDone: 0 },
            isToday: moment().format('YYYY-MM-DD') === dateStr,
            isFuture
        });
    }

    const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    const nextMonth = () => setCurrentMonth(moment(currentMonth).add(1, 'month'));
    const prevMonth = () => setCurrentMonth(moment(currentMonth).subtract(1, 'month'));

    const containerClass = isEmbedded
        ? "w-full text-white relative group"
        : "bg-[#1a1a1a] p-4 sm:p-5 rounded-[2rem] shadow-2xl text-white overflow-hidden relative group";

    return (
        <div className={containerClass}>
            <div className={`flex justify-between items-center mb-4 ${isEmbedded ? 'flex-row-reverse' : ''}`}>
                {!isEmbedded && (
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-500/10 rounded-lg flex items-center justify-center">
                            <IoFlashOutline className="text-amber-400" size={18} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black tracking-tight leading-none">
                                Consistency
                            </h3>
                            <p className="text-[8px] uppercase tracking-widest text-slate-500 font-bold mt-0.5">Performance</p>
                        </div>
                    </div>
                )}
                <div className={`flex items-center gap-2 ${isEmbedded ? 'w-full justify-between' : ''}`}>
                    <button onClick={prevMonth} className="p-1 hover:bg-white/10 rounded-md transition-colors">
                        <IoChevronBack size={14} />
                    </button>
                    <div className="bg-white/5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-400 border border-white/5">
                        {currentMonth.format('MMM YYYY')}
                    </div>
                    <button onClick={nextMonth} className="p-1 hover:bg-white/10 rounded-md transition-colors">
                        <IoChevronForward size={14} />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
                {weekdays.map((d, i) => (
                    <div key={`${d}-${i}`} className="text-center text-[8px] font-black text-slate-600 pb-1">{d}</div>
                ))}
                {calendarDays.map((item, idx) => {
                    const tasks = item.metrics?.tasksCompleted || 0;
                    const hours = item.metrics?.hoursLogged || 0;
                    const accLogs = item.metrics?.accountabilityLogs || 0;
                    const revisions = item.metrics?.revisionsCount || 0;

                    const hasWork = tasks > 0 || hours > 0 || accLogs > 0 || revisions > 0;
                    // Calculate intensity score
                    const activityScore = (tasks * 2) + Math.round(hours * 2) + accLogs + (revisions * 1.5);

                    let bgClass = 'bg-white/5 text-slate-500 hover:bg-white/10'; // Idle

                    if (item.isFuture) {
                        bgClass = 'bg-transparent text-slate-800 opacity-20';
                    } else if (hasWork) {
                        if (activityScore >= 12 || hours >= 5 || tasks >= 6) {
                            // Peak intensity (full primary)
                            bgClass = 'bg-primary text-white shadow-md shadow-primary/40 font-black border border-primary/80';
                        } else if (activityScore >= 6 || hours >= 3 || tasks >= 3) {
                            // High intensity
                            bgClass = 'bg-primary/75 text-white shadow-sm shadow-primary/25 font-bold border border-primary/60';
                        } else if (activityScore >= 3 || hours >= 1 || tasks >= 1 || revisions >= 1) {
                            // Moderate intensity
                            bgClass = 'bg-primary/45 text-white font-semibold border border-primary/40';
                        } else {
                            // Light intensity
                            bgClass = 'bg-primary/25 text-primary-200 font-medium border border-primary/30';
                        }
                    }

                    return (
                        <div
                            key={idx}
                            onClick={() => {
                                if (!item.padding && !item.isFuture) {
                                    setSelectedDateModal(item.date);
                                }
                            }}
                            className={`aspect-square flex items-center justify-center rounded-lg relative z-0 group-hover/day:z-50 hover:z-50 text-[10px] group/day transition-all
                                ${item.padding ? 'opacity-0 pointer-events-none' : item.isFuture ? 'cursor-default' : 'hover:scale-105 cursor-pointer active:scale-95'}
                                ${item.isToday ? 'ring-2 ring-primary ring-offset-1 ring-offset-[#1a1a1a]' : ''}
                                ${bgClass}
                            `}
                        >
                            {!item.padding && (
                                <>
                                    {item.day}
                                    {/* Hover Details */}
                                    {hasWork && (
                                        (() => {
                                            const showBelow = idx < 14;
                                            return (
                                                <div className={`absolute opacity-0 group-hover/day:opacity-100 ${showBelow ? 'top-full mt-2' : 'bottom-full mb-2'} w-36 bg-slate-950/95 p-2.5 rounded-xl text-[8px] font-bold z-[200] pointer-events-none shadow-2xl border border-white/10 backdrop-blur-md transition-all duration-200
                                                    ${idx % 7 === 6 ? 'right-0' : idx % 7 === 0 ? 'left-0' : 'left-1/2 -translate-x-1/2'}
                                                `}>
                                                    <div className="text-center py-0.5 text-primary font-extrabold uppercase tracking-wider text-[7px] border-b border-white/10 mb-1.5 flex items-center justify-center gap-1">
                                                        <span>Activity Log</span>
                                                        {/* <span className="text-slate-400 font-normal">({moment(item.date).format('MMM D')})</span> */}
                                                    </div>
                                                    {hours > 0 && (
                                                        <div className="flex justify-between items-center mb-0.5">
                                                            <span className="text-slate-400 tracking-tighter uppercase font-bold">Focus</span>
                                                            <span className="text-primary-300 font-black">{hours.toFixed(1)}h</span>
                                                        </div>
                                                    )}
                                                    {tasks > 0 && (
                                                        <div className="flex justify-between items-center mb-0.5">
                                                            <span className="text-slate-400 tracking-tighter uppercase font-bold">Tasks</span>
                                                            <span className="text-white font-black">{tasks}</span>
                                                        </div>
                                                    )}
                                                    {revisions > 0 && (
                                                        <div className="flex justify-between items-center mb-0.5">
                                                            <span className="text-slate-400 tracking-tighter uppercase font-bold">Revisions</span>
                                                            <span className="text-primary-200 font-black">{revisions}</span>
                                                        </div>
                                                    )}
                                                    {accLogs > 0 && (
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-slate-400 tracking-tighter uppercase font-bold">Check-ins</span>
                                                            <span className="text-white font-black">{accLogs}</span>
                                                        </div>
                                                    )}
                                                    <div className={`absolute ${showBelow ? 'bottom-full -mb-1 border-b-slate-950 border-t-transparent' : 'top-full -mt-1 border-t-slate-950 border-b-transparent'} border-4 border-transparent
                                                        ${idx % 7 === 6 ? 'right-3' : idx % 7 === 0 ? 'left-3' : 'left-1/2 -translate-x-1/2'}
                                                    `}></div>
                                                </div>
                                            );
                                        })()
                                    )}
                                </>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Monochromatic Primary Intensity Legend */}
            <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[9px] font-bold text-slate-400">
                <span className="text-[8px] uppercase tracking-wider text-slate-500 font-black">Activity</span>
                <div className="flex items-center gap-1.5">
                    <span className="text-[7.5px] text-slate-500 uppercase tracking-wider font-semibold">Less</span>
                    <div className="w-2.5 h-2.5 rounded-sm bg-white/10" title="Idle" />
                    <div className="w-2.5 h-2.5 rounded-sm bg-primary/25 border border-primary/30" title="Light" />
                    <div className="w-2.5 h-2.5 rounded-sm bg-primary/45 border border-primary/40" title="Moderate" />
                    <div className="w-2.5 h-2.5 rounded-sm bg-primary/75 border border-primary/60" title="High" />
                    <div className="w-2.5 h-2.5 rounded-sm bg-primary shadow-sm shadow-primary/40" title="Peak" />
                    <span className="text-[7.5px] text-slate-500 uppercase tracking-wider font-semibold">More</span>
                </div>
            </div>

            {/* Footer Summary - More compact */}
            <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                    <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Streak</p>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-black text-emerald-500">
                            {calendarDays.filter(d => !d.padding && (d.metrics.hoursLogged > 0 || d.metrics.tasksCompleted > 0 || d.metrics.accountabilityLogs > 0 || (d.metrics.revisionsCount || 0) > 0)).length}d
                        </span>
                        <IoCheckmarkCircle className="text-emerald-500" size={12} />
                    </div>
                </div>
                <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                    <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Impact</p>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-black text-amber-500">
                            {(() => {
                                const totalPoints = stats.reduce((acc, s) => acc + (Number(s.metrics?.storyPointsDone) || 0), 0);
                                if (totalPoints > 0) return totalPoints;
                                // Fallback impact score calculated from tasks completed, revisions, and focus hours
                                return stats.reduce((acc, s) => {
                                    const tasks = Number(s.metrics?.tasksCompleted) || 0;
                                    const hours = Number(s.metrics?.hoursLogged) || 0;
                                    const logs = Number(s.metrics?.accountabilityLogs) || 0;
                                    const revs = Number(s.metrics?.revisionsCount) || 0;
                                    return acc + (tasks * 5) + Math.round(hours * 3) + (logs * 2) + (revs * 3);
                                }, 0);
                            })()}
                        </span>
                        <span className="text-[8px] text-amber-500/80 font-black">PTS</span>
                    </div>
                </div>
            </div>

            {/* Day Details Activity Modal */}
            <DayActivityModal
                isOpen={!!selectedDateModal}
                onClose={() => setSelectedDateModal(null)}
                date={selectedDateModal}
                projectId={projectId}
                projectName={projectName}
            />
        </div>
    );
};

export default ConsistencyCalendar;
