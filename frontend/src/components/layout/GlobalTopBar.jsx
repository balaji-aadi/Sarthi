import React, { useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { AnalyticsApi } from '../../services/api/Analytics.api';
import moment from 'moment';
import { IoFlash, IoAlertCircleOutline, IoTrendingUpOutline } from 'react-icons/io5';

const MOCKING_QUOTES = [
  {
    prefix: "You logged ",
    highlight: "0 hours",
    suffix: " of study yesterday. Are you waiting for a miracle? Stop slacking and get to work today!"
  },
  {
    prefix: "Yesterday, ",
    highlight: "nothing worked",
    suffix: ". Drop your phone, close your browser tabs, and build your focus with Sarathi right now!"
  },
  {
    prefix: "Absolute ",
    highlight: "zero study",
    suffix: " time logged yesterday. Your competition isn't resting. Wake up and start shipping!"
  },
  {
    prefix: "Yesterday was a ",
    highlight: "Total blank",
    suffix: ". Are you planning to build the future or just talk about it? Prove yourself today!"
  },
  {
    prefix: "You logged a big ",
    highlight: "0h grind",
    suffix: " yesterday. Sarathi doesn't build itself while you procrastinate. Reset, focus, and grind today!"
  }
];

const MOTIVATIONAL_QUOTES = [
  {
    prefix: "Solid effort yesterday with ",
    highlight: "{TIME}",
    suffix: " logged. Consistency is your secret weapon. Keep the heat on today!"
  },
  {
    prefix: "You logged ",
    highlight: "{TIME}",
    suffix: " of study yesterday! Can you beat your past self and go even further today?"
  },
  {
    prefix: "Yesterday's score was ",
    highlight: "{TIME}",
    suffix: ". Challenge yourself to crush that milestone and exceed your limits today!"
  },
  {
    prefix: "You studied for ",
    highlight: "{TIME}",
    suffix: " yesterday. Your Sarathi streak is burning hot—aim higher today!"
  }
];

const GlobalTopBar = () => {
  const { currentUser, activeBranch } = useSelector((state) => state.store);
  const [stats, setStats] = useState([]);
  const [isBarEnabled, setIsBarEnabled] = useState(localStorage.getItem('sarathi_show_topbar') !== 'false');

  useEffect(() => {
    const handleToggle = () => setIsBarEnabled(localStorage.getItem('sarathi_show_topbar') !== 'false');
    window.addEventListener('topbarToggled', handleToggle);
    return () => window.removeEventListener('topbarToggled', handleToggle);
  }, []);

  useEffect(() => {
    if (currentUser && activeBranch) {
      fetchStats();
    }
  }, [currentUser, activeBranch]);

  const fetchStats = async () => {
    try {
      const res = await AnalyticsApi.getPersonalStats({ period: 'daily' });
      setStats(res.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch consistency stats for TopBar", error);
    }
  };

  // Find yesterday's stats
  const { yesterdayStats, hoursLogged, formattedTime } = useMemo(() => {
    if (!stats || stats.length === 0) {
      return { yesterdayStats: null, hoursLogged: 0, formattedTime: "" };
    }
    
    // Format to match exact date format
    const yesterdayStr = moment().subtract(1, 'days').format('YYYY-MM-DD');
    const matched = stats.find(s => moment(s.date).format('YYYY-MM-DD') === yesterdayStr);
    const hours = matched?.metrics?.hoursLogged || 0;

    // Convert decimal hours (e.g. 1.5) to hours and minutes
    let timeStr = "";
    if (hours > 0) {
      const h = Math.floor(hours);
      const m = Math.round((hours - h) * 60);
      timeStr = h > 0 ? (m > 0 ? `${h}h ${m}m` : `${h}h`) : `${m}m`;
    }

    return {
      yesterdayStats: matched || null,
      hoursLogged: hours,
      formattedTime: timeStr
    };
  }, [stats]);

  // Stable, non-flickering daily quotes mapped to the day of year
  const selectedQuoteSegments = useMemo(() => {
    const dayOfYear = moment().dayOfYear();
    if (hoursLogged <= 0) {
      return MOCKING_QUOTES[dayOfYear % MOCKING_QUOTES.length];
    } else {
      const template = MOTIVATIONAL_QUOTES[dayOfYear % MOTIVATIONAL_QUOTES.length];
      return {
        prefix: template.prefix,
        highlight: template.highlight.replace('{TIME}', formattedTime),
        suffix: template.suffix
      };
    }
  }, [hoursLogged, formattedTime]);

  const currentStreak = useMemo(() => {
    if (!stats || stats.length === 0) return 0;
    
    const dateMap = {};
    stats.forEach(s => {
      const dateStr = moment(s.date).format('YYYY-MM-DD');
      const hasWork = (s.metrics?.tasksCompleted > 0) || (s.metrics?.hoursLogged > 0) || (s.metrics?.accountabilityLogs > 0);
      dateMap[dateStr] = hasWork;
    });

    let streak = 0;
    let checkDate = moment().startOf('day');
    
    const todayStr = checkDate.format('YYYY-MM-DD');
    const yesterdayStr = moment(checkDate).subtract(1, 'days').format('YYYY-MM-DD');

    let startCountingFrom = checkDate;
    if (!dateMap[todayStr] && dateMap[yesterdayStr]) {
        startCountingFrom = moment(checkDate).subtract(1, 'days');
    }

    let currentCheck = startCountingFrom;
    for (let i = 0; i < 365; i++) {
        const str = currentCheck.format('YYYY-MM-DD');
        if (dateMap[str]) {
            streak++;
            currentCheck.subtract(1, 'days');
        } else {
            break;
        }
    }

    return streak;
  }, [stats]);

  if (!currentUser || !isBarEnabled) return null;

  const hasStudied = hoursLogged > 0;

  return (
    <div 
      className={`w-full h-10 flex items-center justify-between text-xs overflow-hidden relative z-[100] shrink-0 font-sans transition-colors duration-500 px-6 border-b ${
        hasStudied 
          ? 'bg-white/95 dark:bg-slate-950/95 border-slate-200/50' 
          : 'bg-rose-50/95 dark:bg-rose-950/20 border-rose-200/50'
      }`}
    >
      {/* Centered Study Progress/Quote section - Fully visible, smaller font */}
      <div className="flex-grow flex items-center justify-center min-w-0 text-center px-4">
          <div className="flex items-center justify-center gap-2 animate-fade-in max-w-full">
              {hasStudied ? (
                <>
                  <div className="p-1 rounded bg-vermilion-50 dark:bg-vermilion-950/20 text-primary shrink-0">
                      <IoTrendingUpOutline size={12} />
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 font-extrabold tracking-tight text-[11px] leading-snug">
                    {selectedQuoteSegments.prefix}
                    <span className="text-primary dark:text-vermilion-400 font-black px-1.5 py-0.5 bg-vermilion-50 dark:bg-vermilion-950/80 rounded border border-vermilion-100 dark:border-vermilion-800/40 mx-0.5 inline-block scale-95 origin-center">
                      {selectedQuoteSegments.highlight}
                    </span>
                    {selectedQuoteSegments.suffix}
                  </p>
                </>
              ) : (
                <>
                  <div className="p-1 rounded bg-red-100 dark:bg-red-950/50 text-red-600 shrink-0 animate-pulse">
                      <IoAlertCircleOutline size={12} />
                  </div>
                  <p className="text-rose-800 dark:text-rose-400 font-extrabold tracking-tight text-[11px] leading-snug">
                    {selectedQuoteSegments.prefix}
                    <span className="text-red-600 dark:text-red-400 font-black px-1.5 py-0.5 bg-red-50 dark:bg-red-950/80 rounded border border-red-100 dark:border-red-800/40 mx-0.5 inline-block scale-95 origin-center animate-pulse">
                      {selectedQuoteSegments.highlight}
                    </span>
                    {selectedQuoteSegments.suffix}
                  </p>
                </>
              )}
          </div>
      </div>

      {/* Streak Section - Compact Premium Pill adjusted for h-10 */}
      <div className={`flex items-center gap-2.5 px-3 py-1 rounded-full shadow-sm hover:shadow transition-all duration-300 group cursor-default border ${
        hasStudied 
          ? 'bg-white dark:bg-slate-900 border-slate-200' 
          : 'bg-rose-100/50 dark:bg-rose-950/40 border-rose-200'
      }`}>
          <div className={`w-5 h-5 rounded-full flex items-center justify-center border group-hover:scale-110 transition-transform ${
            hasStudied 
              ? 'bg-emerald-100 border-emerald-200 text-emerald-600' 
              : 'bg-red-100 border-red-200 text-red-600'
          }`}>
              <IoFlash size={11} />
          </div>
          <div className="flex flex-col justify-center">
              <span className={`font-black text-[9px] leading-none tracking-tighter ${
                hasStudied ? 'text-slate-800 dark:text-slate-200' : 'text-rose-900 dark:text-rose-100'
              }`}>
                  {currentStreak} DAY STREAK
              </span>
              <span className={`uppercase tracking-[0.25em] text-[6.5px] font-black leading-none mt-0.5 ${
                hasStudied ? 'text-emerald-600' : 'text-red-600'
              }`}>
                  {hasStudied ? 'Active' : 'Danger'}
              </span>
          </div>
      </div>

      <div className={`absolute bottom-0 left-0 w-full h-[2.5px] ${
        hasStudied 
          ? 'bg-primary' 
          : 'bg-slate-400'
      }`}></div>

    </div>
  );
};

export default GlobalTopBar;
