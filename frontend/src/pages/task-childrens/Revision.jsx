import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { TaskApi } from '../../services/api/Task.api';
import { FocusApi } from '../../services/api/Focus.api';
import { setDailyRevision } from '../../store/slices/storeSlice';
import { resolveProblemUrl, DIFFICULTY_CONFIG, getProblemDifficulty } from '../../utils/dsaUrlHelper';
import { getScopedItem, setScopedItem, removeScopedItem } from '../../utils/userStorage';
import DsaQuestionDetailDrawer from '../../components/dsa/workspace/DsaQuestionDetailDrawer';
import DsaCompletionModal from '../../components/dsa/workspace/DsaCompletionModal';
import PatternAlertsSection from '../../components/dsa/revision/PatternAlertsSection';
import SarathiLoader from '../../components/common/SarathiLoader';
import toast from 'react-hot-toast';
import moment from 'moment';
import {
  IoRefreshOutline,
  IoCheckmarkCircle,
  IoCheckmarkCircleOutline,
  IoTimeOutline,
  IoBookOutline,
  IoPlayOutline,
  IoSparklesOutline,
  IoBulbOutline,
  IoHelpBuoyOutline,
  IoAlertCircleOutline,
  IoCalendarOutline,
  IoChevronDown,
  IoChevronUp,
  IoArrowForward,
  IoLayersOutline,
  IoCloseOutline,
  IoWarningOutline
} from 'react-icons/io5';
import { SiLeetcode } from 'react-icons/si';

const OUTCOME_CONFIG = {
  SOLVED_INDEPENDENT: {
    label: 'Independent Solve',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60',
    icon: IoSparklesOutline
  },
  SOLVED_WITH_HINTS: {
    label: 'Solved With Hints',
    badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60',
    icon: IoBulbOutline
  },
  SOLVED_WITH_SOLUTION: {
    label: 'Solved With Solution',
    badge: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800/60',
    icon: IoHelpBuoyOutline
  },
  UNSOLVED: {
    label: 'Unsolved Attempt',
    badge: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60',
    icon: IoAlertCircleOutline
  },
  LEGACY_COMPLETION: {
    label: 'Previously Completed',
    badge: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    icon: IoCheckmarkCircleOutline
  }
};

const CONFIDENCE_BADGE = {
  HIGH: 'bg-emerald-100/70 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200',
  MEDIUM: 'bg-amber-100/70 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200',
  LOW: 'bg-rose-100/70 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200',
  UNKNOWN: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
};

const Revision = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser, activeBranch } = useSelector((state) => state.store);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [revisionData, setRevisionData] = useState(null);
  const [showRemaining, setShowRemaining] = useState(false);

  // Drawer (Review action - read-only)
  const [selectedDrawerTask, setSelectedDrawerTask] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Active Focus Session State
  const [activeFocusTask, setActiveFocusTask] = useState(null);
  const [switchConfirmation, setSwitchConfirmation] = useState(null);

  // Completion Modal State
  const [activeSolvingTask, setActiveSolvingTask] = useState(null);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [timerState, setTimerState] = useState(null);

  // Server-confirmed revision completion state
  const [lastCompletedRevision, setLastCompletedRevision] = useState(null);

  // Phase 4: Pattern Weakness Diagnostic Alerts
  const [patternAlerts, setPatternAlerts] = useState([]);

  // Helper to inspect active focus session from storage
  const getActiveFocusSession = useCallback(() => {
    try {
      const bindingStr = getScopedItem('focus_timer_task_binding');
      const stateStr = getScopedItem('focus_timer_state');
      if (bindingStr && stateStr) {
        const binding = typeof bindingStr === 'string' ? JSON.parse(bindingStr) : bindingStr;
        const state = typeof stateStr === 'string' ? JSON.parse(stateStr) : stateStr;
        if (binding?.taskId && state) {
          return { binding, state };
        }
      }
    } catch {
      // ignore parsing errors
    }
    return null;
  }, []);

  // Sync active focus session on mount or storage events
  const syncActiveSession = useCallback(() => {
    const session = getActiveFocusSession();
    if (session) {
      setActiveFocusTask(prev => {
        if (prev && (prev.taskId === session.binding.taskId || prev._id === session.binding.taskId)) {
          return prev;
        }
        return {
          taskId: session.binding.taskId,
          _id: session.binding.taskId,
          taskName: session.binding.taskName,
          taskIdNumber: session.binding.taskIdString,
          leetcodeUrl: session.binding.leetcodeUrl
        };
      });
      setTimerState(session.state);
    } else {
      setActiveFocusTask(null);
      setTimerState(null);
    }
  }, [getActiveFocusSession]);

  useEffect(() => {
    syncActiveSession();
    const handleStorageChange = () => syncActiveSession();
    window.addEventListener('focus_timer_updated', handleStorageChange);
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('focus_timer_updated', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [syncActiveSession]);

  // Fetch Revision Queue
  const fetchDailyRevision = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const tzOffset = new Date().getTimezoneOffset();
      const res = await TaskApi.getDailyRevision(tzOffset);
      const data = res.data?.data;
      setRevisionData(data);
      dispatch(setDailyRevision(data));

      // Phase 4: Fetch deterministic pattern alerts
      try {
        const alertsRes = await TaskApi.getPatternAlerts();
        setPatternAlerts(alertsRes.data?.data?.activeAlerts || []);
      } catch (aErr) {
        console.warn('Failed to load pattern alerts:', aErr);
      }

      if (isManualRefresh) {
        toast.success('Revision schedule is up to date');
      }
    } catch (err) {
      console.error('Failed to load revision queue:', err);
      toast.error('Could not load today’s revision queue');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDailyRevision();
  }, [currentUser?._id, activeBranch?._id]);

  // Handle Review action (strictly read-only drawer)
  const handleReviewTask = async (taskItem) => {
    try {
      const res = await TaskApi.getTaskById(taskItem.taskId);
      setSelectedDrawerTask(res.data?.data || taskItem);
    } catch {
      setSelectedDrawerTask(taskItem);
    }
    setIsDrawerOpen(true);
  };

  // Helper to begin focus session on a given task
  const startFocusSessionForTask = (taskItem) => {
    const targetTaskId = (taskItem.taskId || taskItem._id).toString();
    const durationMins = 30;

    const sessionState = {
      taskId: targetTaskId,
      taskName: taskItem.taskName,
      startTime: Date.now(),
      isActive: true,
      initialDuration: durationMins * 60,
      type: 'Revision'
    };
    const focusTimerBinding = {
      taskId: targetTaskId,
      taskName: taskItem.taskName,
      taskIdString: taskItem.taskIdNumber,
      estimatedHours: durationMins / 60,
      isBacklog: false,
      taskType: 'Revision'
    };

    const newTimerState = {
      timeLeft: durationMins * 60,
      isActive: true,
      startTime: new Date().toISOString(),
      accumulatedTime: 0,
      selectedDuration: durationMins,
      currentTheme: { name: 'Vermilion', color: '#E34234', bg: 'rgba(227, 66, 52, 0.05)', shadow: 'rgba(227, 66, 52, 0.4)' },
      customHeading: taskItem.taskName,
      isCustomSessionActive: false,
      autoExtensions: 0
    };

    setScopedItem('focus_timer_task_binding', focusTimerBinding);
    setScopedItem('focus_timer_state', newTimerState);
    window.dispatchEvent(new Event('focus_timer_updated'));
    window.dispatchEvent(new Event('storage'));

    setActiveFocusTask(taskItem);
    setTimerState(newTimerState);

    // Launch problem URL (LeetCode / Arena)
    const url = taskItem.leetcodeUrl || `https://leetcode.com/problemset/all/?search=${encodeURIComponent(taskItem.taskName || '')}`;
    window.open(url, '_blank', 'noopener,noreferrer');

    toast.success(`Focus session started for "${taskItem.taskName}". Click "I'm Done" when finished.`, { icon: '⏱️' });
  };

  // Handle Solve Again action with strict Focus Session guard
  const handleSolveAgain = (taskItem) => {
    const activeSession = getActiveFocusSession();
    const targetTaskId = (taskItem.taskId || taskItem._id).toString();

    if (activeSession) {
      const activeTaskId = (activeSession.binding.taskId || '').toString();

      if (activeTaskId === targetTaskId) {
        // Active on the EXACT same problem: simply resume! Never open reflection or reset timer.
        toast(`Resuming active session for "${taskItem.taskName}"`, { icon: '⏱️' });
        const url = taskItem.leetcodeUrl || `https://leetcode.com/problemset/all/?search=${encodeURIComponent(taskItem.taskName || '')}`;
        window.open(url, '_blank', 'noopener,noreferrer');
        setActiveFocusTask(taskItem);
        return;
      } else {
        // Active on a DIFFERENT problem: prompt explicit confirmation modal
        setSwitchConfirmation({
          newProblem: taskItem,
          activeProblemName: activeSession.binding.taskName || 'another problem'
        });
        return;
      }
    }

    // No active session: start clean focus session
    startFocusSessionForTask(taskItem);
  };

  // Explicit confirmation: Switch to new problem and end previous without completion
  const handleConfirmSwitch = (newProblem) => {
    // End/interrupt previous session: no completion, no reflection, no solveHistory entry
    removeScopedItem('focus_timer_task_binding');
    removeScopedItem('focus_timer_state');
    removeScopedItem('focus_timer_retrievable');
    window.dispatchEvent(new Event('focus_timer_updated'));
    window.dispatchEvent(new Event('storage'));

    setSwitchConfirmation(null);
    startFocusSessionForTask(newProblem);
    toast.success(`Switched focus to "${newProblem.taskName}". Previous session ended without completion.`);
  };

  // Cancel switch: leave active session completely untouched
  const handleCancelSwitch = () => {
    setSwitchConfirmation(null);
  };

  // Pause / Resume Focus Timer
  const handleToggleTimer = () => {
    const session = getActiveFocusSession();
    const current = timerState || session?.state;
    if (!current) return;

    if (current.isActive) {
      const startMs = current.startTime ? new Date(current.startTime).getTime() : Date.now();
      const elapsedSecs = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
      const newAccumulated = (current.accumulatedTime || 0) + elapsedSecs;

      const updated = {
        ...current,
        isActive: false,
        startTime: null,
        accumulatedTime: newAccumulated,
        timeLeft: Math.max(0, ((current.selectedDuration || 30) * 60) - newAccumulated)
      };
      setScopedItem('focus_timer_state', updated);
      setTimerState(updated);
      window.dispatchEvent(new Event('focus_timer_updated'));
      window.dispatchEvent(new Event('storage'));
      toast.success('Focus timer paused.', { icon: '⏸️' });
    } else {
      const updated = {
        ...current,
        isActive: true,
        startTime: new Date().toISOString()
      };
      setScopedItem('focus_timer_state', updated);
      setTimerState(updated);
      window.dispatchEvent(new Event('focus_timer_updated'));
      window.dispatchEvent(new Event('storage'));
      toast.success('Focus timer resumed.', { icon: '▶️' });
    }
  };

  // Open Reflection Modal (triggered by "Finish & Reflect" or "I'm Done")
  const handleOpenReflection = (taskToReflect) => {
    const target = taskToReflect || activeSolvingTask || activeFocusTask;
    if (target) {
      setActiveSolvingTask(target);
      setIsCompletionModalOpen(true);
    }
  };

  // Cancel/abandon current focus session
  const handleCancelActiveSession = () => {
    removeScopedItem('focus_timer_task_binding');
    removeScopedItem('focus_timer_state');
    removeScopedItem('focus_timer_retrievable');
    window.dispatchEvent(new Event('focus_timer_updated'));
    window.dispatchEvent(new Event('storage'));
    setActiveFocusTask(null);
    setTimerState(null);
    toast('Focus session ended without completion.', { icon: 'ℹ️' });
  };

  // Handle Reflection submission (Server-Confirmed Lifecycle)
  const handleReflectionComplete = async (payload = {}) => {
    if (!payload || !payload.outcome) {
      // If triggered without reflection answers, open the modal for user reflection
      setIsCompletionModalOpen(true);
      return;
    }
    const { outcome, confidence, notes, durationMinutes } = payload;
    const taskToReflect = activeSolvingTask || activeFocusTask;
    if (!taskToReflect) return;

    const targetId = taskToReflect.taskId || taskToReflect._id;
    const taskName = taskToReflect.taskName;

    try {
      const now = new Date();
      const durMins = Math.max(1, Number(durationMinutes) || (timerState?.selectedDuration || 15));
      const startTime = timerState?.startTime ? new Date(timerState.startTime).toISOString() : new Date(now.getTime() - durMins * 60000).toISOString();
      const endTime = now.toISOString();
      const isSolved = outcome !== 'UNSOLVED';

      const sessionData = {
        task: targetId,
        taskName: taskName,
        taskIdString: taskToReflect.taskIdNumber || taskToReflect.taskId || "",
        duration: durMins,
        startTime,
        endTime,
        type: 'Revision',
        date: now.toISOString(),
        completionState: isSolved ? 'completed' : 'incompleted',
        statusAtCompletion: isSolved ? 'done' : 'inprogress',
        estimatedTimeAtStart: timerState?.selectedDuration || 30,
        isBacklog: false,
        outcome,
        confidence,
        notes,
        branchId: activeBranch?._id || null
      };

      let focusSessionId = null;
      try {
        const focusRes = await FocusApi.createSession(sessionData);
        focusSessionId = focusRes.data?.data?._id || null;
      } catch (fErr) {
        console.warn('Focus session note:', fErr);
      }

      // Record reflection in backend
      const tzOffset = new Date().getTimezoneOffset();
      await TaskApi.recordReflection(targetId, {
        outcome,
        confidence,
        notes,
        durationMinutes,
        focusSessionId,
        timezoneOffset: tzOffset
      });

      // SERVER CONFIRMED: Clear timers now that persistence succeeded
      setIsCompletionModalOpen(false);
      setActiveSolvingTask(null);
      setActiveFocusTask(null);
      setTimerState(null);
      removeScopedItem('focus_timer_task_binding');
      removeScopedItem('focus_timer_state');
      removeScopedItem('focus_timer_retrievable');
      window.dispatchEvent(new Event('focus_timer_updated'));
      window.dispatchEvent(new Event('storage'));

      // Calculate next interval preview
      const nextInterval = outcome === 'SOLVED_INDEPENDENT'
        ? (confidence === 'HIGH' ? 7 : 3)
        : (outcome === 'SOLVED_WITH_HINTS' ? 2 : (outcome === 'SOLVED_WITH_SOLUTION' ? 1 : 1));

      // Display prominent success confirmation
      setLastCompletedRevision({
        taskName,
        outcome,
        confidence,
        intervalDays: nextInterval
      });

      toast.success(`Revision recorded! Spaced schedule updated.`, { icon: '🎉' });

      // Refresh revision queue to immediately reflect server state and update pills
      await fetchDailyRevision(true);
    } catch (err) {
      console.error('Failed to log revision reflection:', err);
      toast.error('Failed to save reflection. Please try again.');
      // Modal stays open so learner does not lose inputs
    }
  };

  if (loading) {
    return <SarathiLoader message="Loading your spaced revision queue..." size="lg" />;
  }

  const {
    totalCompletedProblems = 0,
    totalDueCount = 0,
    recommendedCount = 0,
    remainingDueCount = 0,
    completedTodayCount = 0,
    overdueCount = 0,
    dueTodayExactCount = 0,
    revisedThisWeekCount = 0,
    recommendedQueue = [],
    remainingDueList = [],
    completedTodayList = [],
    upcomingPreview = [],
    status = 'REVISION_DUE'
  } = revisionData || {};

  const remainingToday = Math.max(0, recommendedCount - completedTodayCount);

  return (
    <div className="w-full px-4 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest">
            <IoCalendarOutline className="text-sm" />
            <span>Spaced Revision Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            Today's Revision
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Active recall intervals calculated deterministically from your actual solve outcomes and confidence.
          </p>
        </div>

        {/* Action / Stat Pills */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {recommendedCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>{recommendedCount} Recommended Today</span>
            </div>
          )}

          {remainingDueCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-bold">
              <span>{remainingDueCount} More Due</span>
            </div>
          )}

          {completedTodayCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-xs font-bold">
              <IoCheckmarkCircle className="text-emerald-600 dark:text-emerald-400 text-sm" />
              <span>{completedTodayCount} Completed Today</span>
            </div>
          )}

          <button
            onClick={() => fetchDailyRevision(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all shadow-xs"
            title="Refresh revision schedule"
          >
            <IoRefreshOutline className={`text-sm ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* REVISION PROGRESS VISIBILITY SUMMARY */}
      {totalCompletedProblems > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* 1. Recommended Today Target */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-3.5 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold">Recommended</span>
              <span className="w-2 h-2 rounded-full bg-amber-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{recommendedCount}</span>
              <span className="text-[11px] text-slate-400">daily target</span>
            </div>
          </div>

          {/* 2. Completed Today */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-3.5 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold">Completed Today</span>
              <IoCheckmarkCircle className="text-emerald-500 text-sm" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{completedTodayCount}</span>
              <span className="text-[11px] text-slate-400">revised today</span>
            </div>
          </div>

          {/* 3. Remaining in Today's Target */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-3.5 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold">Remaining Today</span>
              <IoTimeOutline className="text-slate-400 text-sm" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{remainingToday}</span>
              <span className="text-[11px] text-slate-400">in target queue</span>
            </div>
          </div>

          {/* 4. Overdue Items */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-3.5 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold">Overdue</span>
              <span className={`w-2 h-2 rounded-full ${overdueCount > 0 ? 'bg-rose-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-700'}`} />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className={`text-2xl font-black ${overdueCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
                {overdueCount}
              </span>
              <span className="text-[11px] text-slate-400">past due date</span>
            </div>
          </div>

          {/* 5. Revised This Week */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-3.5 flex flex-col justify-between shadow-xs col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold">Revised This Week</span>
              <IoCalendarOutline className="text-primary text-sm" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-primary">{revisedThisWeekCount}</span>
              <span className="text-[11px] text-slate-400">last 7 days</span>
            </div>
          </div>
        </div>
      )}

      {/* PROMINENT SERVER-CONFIRMED REVISION SUCCESS BANNER */}
      {lastCompletedRevision && (
        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-950 dark:text-emerald-100 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300 shadow-sm">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0 text-xl font-black">
              ✓
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                Revision Complete
              </div>
              <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                "{lastCompletedRevision.taskName}" marked as revised today
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Next review scheduled in <strong>{lastCompletedRevision.intervalDays} days</strong> based on your {lastCompletedRevision.outcome ? lastCompletedRevision.outcome.toLowerCase().replace(/_/g, ' ') : 'solve'}.
              </div>
            </div>
          </div>
          <button
            onClick={() => setLastCompletedRevision(null)}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg shrink-0"
            title="Dismiss confirmation"
          >
            <IoCloseOutline size={20} />
          </button>
        </div>
      )}

      {/* ACTIVE FOCUS SESSION BANNER */}
      {activeFocusTask && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse shrink-0" />
            <div className="min-w-0">
              <div className="text-[11px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-200">
                Active Focus Session in Progress
              </div>
              <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                {activeFocusTask.taskName}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Timer running in background. Solve on LeetCode, then click below to record your reflection.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => {
                setActiveSolvingTask(activeFocusTask);
                setIsCompletionModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5"
            >
              I'm Done — Record Reflection
            </button>
            <button
              onClick={handleCancelActiveSession}
              className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 transition-all"
            >
              End Session
            </button>
          </div>
        </div>
      )}

      {/* PHASE 4: PATTERN DIAGNOSTIC ALERTS */}
      <PatternAlertsSection
        alerts={patternAlerts}
        onPracticeWeakest={handleSolveAgain}
        onOpenProblem={handleReviewTask}
      />

      {/* STATE A: 0 Completed Problems (Friendly Onboarding) */}
      {status === 'NO_COMPLETED_PROBLEMS' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-8 sm:p-12 text-center shadow-sm space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto text-2xl">
            <IoBookOutline />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Start Your Revision Journey</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            No problems in revision yet. Solve problems in the curated DSA Roadmap to automatically seed your spaced revision schedule.
          </p>
          <div className="pt-2">
            <Link
              to="/app/dsa"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5"
            >
              <span>Explore DSA Roadmap</span>
              <IoArrowForward />
            </Link>
          </div>
        </div>
      )}

      {/* STATE B: 1-4 Completed Problems & 0 Due Today (All Caught Up) */}
      {status === 'ALL_CAUGHT_UP' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-8 sm:p-10 text-center shadow-sm space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto text-2xl">
            <IoCheckmarkCircleOutline />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">All Caught Up For Today!</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            You have <strong className="text-slate-800 dark:text-slate-200">{totalCompletedProblems} completed problem{totalCompletedProblems > 1 ? 's' : ''}</strong> scheduled for revision. Items activate automatically when their spaced intervals mature.
          </p>

          {upcomingPreview.length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-left">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Upcoming Revisions</h3>
              <div className="space-y-2">
                {upcomingPreview.slice(0, 3).map((item) => (
                  <div
                    key={item.taskId}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{item.taskName}</div>
                      <div className="text-[11px] text-slate-400">{item.topic} • {item.intervalDays}d spacing</div>
                    </div>
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-slate-700">
                      Due {item.dueLocalDateStr}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2">
            <Link
              to="/app/dsa"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all"
            >
              <span>Continue Roadmap Practice</span>
              <IoArrowForward />
            </Link>
          </div>
        </div>
      )}

      {/* STATE C: Recommended Completed for the Day (with more remaining in queue) */}
      {status === 'RECOMMENDED_COMPLETED_MORE_DUE' && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 sm:p-8 text-center max-w-3xl mx-auto space-y-2">
          <div className="flex items-center justify-center gap-2 text-emerald-700 dark:text-emerald-300 font-black text-lg">
            <IoCheckmarkCircle className="text-2xl" />
            <span>Today's recommended revision is complete!</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            You completed {completedTodayCount} items today. You have <strong>{remainingDueCount} more items</strong> due in your extended queue.
          </p>
        </div>
      )}

      {/* STATE D: All Due Completed for the Day */}
      {status === 'ALL_DUE_COMPLETED' && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8 text-center max-w-2xl mx-auto space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 flex items-center justify-center mx-auto text-2xl">
            <IoCheckmarkCircle />
          </div>
          <h2 className="text-xl font-black text-emerald-950 dark:text-emerald-100">All Due Revisions Complete!</h2>
          <p className="text-xs sm:text-sm text-emerald-800 dark:text-emerald-300">
            Great job! You have revised all due problems for today, reinforcing your recall without skipping steps.
          </p>
          <div className="pt-2">
            <Link
              to="/app/dsa"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
            >
              <span>Back to DSA Workspace</span>
              <IoArrowForward />
            </Link>
          </div>
        </div>
      )}

      {/* PRIMARY SECTION: Recommended Today Queue */}
      {recommendedQueue.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Recommended Today ({recommendedQueue.length})
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-medium">Focused daily revision target</span>
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            {recommendedQueue.map((item) => {
              const diffConfig = item.difficulty ? DIFFICULTY_CONFIG[item.difficulty] : null;
              const outcomeMeta = OUTCOME_CONFIG[item.tier] || OUTCOME_CONFIG.LEGACY_COMPLETION;
              const OutcomeIcon = outcomeMeta.icon;

              return (
                <div
                  key={item.taskId}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-4.5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                >
                  {/* Left Side: Metadata & Reason */}
                  <div className="space-y-2 min-w-0 flex-1">
                    {/* Tags row */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500">
                        {item.taskIdNumber ? `#DSA-${item.taskIdNumber}` : '#DSA'}
                      </span>

                      <span className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-bold">
                        {item.topic}
                      </span>

                      {item.patternRef && (
                        <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 text-[11px] font-bold border border-indigo-200/50 dark:border-indigo-800/40">
                          {item.patternRef.name || 'Pattern'}
                        </span>
                      )}

                      {patternAlerts.some(a => a.patternId === item.patternRef?._id || a.patternName === item.topic || a.patternName === item.patternRef?.name) && (
                        <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                          <IoWarningOutline size={11} />
                          <span>Pattern Alert</span>
                        </span>
                      )}

                      {diffConfig && (
                        <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${diffConfig.badge}`}>
                          {item.difficulty}
                        </span>
                      )}

                      {item.isOverdue && item.overdueDays > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-[10px] font-bold uppercase tracking-wider">
                          {item.overdueDays}d overdue
                        </span>
                      )}
                    </div>

                    {/* Problem Title */}
                    <h3
                      onClick={() => handleReviewTask(item)}
                      className="text-base font-bold text-slate-900 dark:text-white hover:text-primary transition-colors cursor-pointer"
                    >
                      {item.taskName}
                    </h3>

                    {/* Historical Outcome, Why Due, and Concrete Dates */}
                    <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      <span className="text-[11px] font-semibold text-slate-400">Previous:</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border ${outcomeMeta.badge}`}>
                        <OutcomeIcon className="text-xs" />
                        <span>{outcomeMeta.label}</span>
                      </span>

                      {item.latestConfidence && item.latestConfidence !== 'UNKNOWN' && (
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${CONFIDENCE_BADGE[item.latestConfidence]}`}>
                          {item.latestConfidence}
                        </span>
                      )}

                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-200 text-[11px] font-medium">
                        <IoTimeOutline className="text-xs" />
                        <span>{item.reason}</span>
                      </span>

                      <span className="text-[11px] text-slate-400">
                        • Last solved: <strong className="text-slate-600 dark:text-slate-300">{item.anchorLocalDateStr || (item.anchorDate ? moment(item.anchorDate).format('MMM D') : '—')}</strong>
                      </span>

                      <span className="text-[11px] text-slate-400">
                        • Due: <strong className={item.isOverdue && item.overdueDays > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-300'}>
                          {item.dueLocalDateStr || (item.dueDate ? moment(item.dueDate).format('MMM D') : 'Today')}
                        </strong>
                      </span>

                      <span
                        className="text-[11px] text-slate-400 cursor-help"
                        title="Spaced Repetition interval: reviews expand (e.g. 7d -> 14d -> 30d) as memory solidifies"
                      >
                        • <strong className="text-slate-600 dark:text-slate-300">{item.intervalDays}d</strong> cycle
                      </span>
                    </div>
                  </div>

                  {/* Right Side: Actions */}
                  <div className="flex items-center gap-2.5 shrink-0 pt-2 md:pt-0">
                    {/* Active Solve Again Button */}
                    <button
                      onClick={() => handleSolveAgain(item)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold shadow-md shadow-primary/20 hover:-translate-y-0.5 transition-all cursor-pointer"
                      title="Start active recall solving attempt on LeetCode"
                    >
                      <IoPlayOutline className="text-sm" />
                      <span>Solve Again</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECONDARY SECTION: Remaining Due Accordion (Transparent Queue) */}
      {remainingDueList.length > 0 && (
        <div className="border border-slate-200/80 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Additional Due Problems ({remainingDueList.length})
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Daily target is capped at 5 problems to prevent cognitive overload. Remaining due items roll forward into subsequent daily queues.
              </p>
            </div>

            {/* Breakdown badges */}
            <div className="flex flex-wrap items-center gap-1.5 shrink-0">
              <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-[11px] font-bold">
                🔴 {remainingDueList.filter(i => i.isOverdue && i.overdueDays > 0).length} Overdue
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[11px] font-bold">
                📅 {remainingDueList.filter(i => !i.isOverdue || i.overdueDays === 0).length} Due Today
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[11px] font-bold">
                📋 {remainingDueList.length} In Backlog
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowRemaining(!showRemaining)}
            className="w-full flex items-center justify-between px-4 sm:px-5 py-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors text-left text-xs font-bold text-slate-600 dark:text-slate-300"
          >
            <span>{showRemaining ? 'Hide extended backlog' : `View ${remainingDueList.length} backlog problems`}</span>
            <div className="flex items-center gap-1.5 text-primary">
              <span>{showRemaining ? 'Collapse' : 'Expand'}</span>
              {showRemaining ? <IoChevronUp /> : <IoChevronDown />}
            </div>
          </button>

          {showRemaining && (
            <div className="px-4 sm:px-5 pb-4 divide-y divide-slate-100 dark:divide-slate-800/60">
              {remainingDueList.map((item) => (
                <div key={item.taskId} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono text-slate-400">#{item.taskIdNumber || 'DSA'}</span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{item.topic}</span>
                      {patternAlerts.some(a => a.patternId === item.patternRef?._id || a.patternName === item.topic || a.patternName === item.patternRef?.name) && (
                        <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                          <IoWarningOutline size={11} />
                          <span>Pattern Alert</span>
                        </span>
                      )}
                      <span className="text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md font-medium">
                        {item.reason}
                      </span>
                      {item.isOverdue && item.overdueDays > 0 ? (
                        <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase">
                          {item.overdueDays}d overdue · Due {item.dueLocalDateStr || (item.dueDate ? moment(item.dueDate).format('MMM D') : 'Today')}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">
                          Due: {item.dueLocalDateStr || (item.dueDate ? moment(item.dueDate).format('MMM D') : 'Today')}
                        </span>
                      )}
                    </div>
                    <div
                      onClick={() => handleReviewTask(item)}
                      className="text-sm font-bold text-slate-900 dark:text-white hover:text-primary cursor-pointer truncate"
                    >
                      {item.taskName}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleSolveAgain(item)}
                      className="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-dark text-white text-xs font-bold shadow-xs cursor-pointer"
                    >
                      Solve Again
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* COMPLETED TODAY SECTION */}
      {completedTodayList.length > 0 && (
        <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
              <IoCheckmarkCircle className="text-emerald-500 text-base" />
              <span>Completed Today ({completedTodayList.length})</span>
            </div>
            <span className="text-xs text-slate-400 font-medium">Server-confirmed revisions</span>
          </div>

          <div className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
            {completedTodayList.map((item) => {
              const diffConfig = item.difficulty ? DIFFICULTY_CONFIG[item.difficulty] : null;
              const outcomeMeta = OUTCOME_CONFIG[item.tier] || OUTCOME_CONFIG.LEGACY_COMPLETION;
              const OutcomeIcon = outcomeMeta.icon;

              return (
                <div key={item.taskId} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-sm truncate">
                        {item.taskName}
                      </span>
                      {diffConfig && (
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${diffConfig.badge}`}>
                          {item.difficulty}
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-md bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold">
                        {item.topic}
                      </span>
                    </div>

                    {/* Outcome & Recalculated Next Review Date */}
                    <div className="flex flex-wrap items-center gap-2 text-slate-500 dark:text-slate-400">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${outcomeMeta.badge}`}>
                        <OutcomeIcon className="text-xs" />
                        <span>{outcomeMeta.label}</span>
                      </span>

                      {item.latestConfidence && item.latestConfidence !== 'UNKNOWN' && (
                        <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${CONFIDENCE_BADGE[item.latestConfidence]}`}>
                          {item.latestConfidence}
                        </span>
                      )}

                      <span className="text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200/50 dark:border-emerald-800/40">
                        Next review: in {item.intervalDays}d · {item.dueLocalDateStr || (item.dueDate ? moment(item.dueDate).format('MMM D') : 'scheduled')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 text-xs">
                      <IoCheckmarkCircle className="text-sm" />
                      <span>Revised today</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* READ-ONLY REVIEW DRAWER */}
      <DsaQuestionDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        task={selectedDrawerTask}
        topicName={selectedDrawerTask?.topic || 'DSA'}
        phaseName="DSA"
        onUpdateStatus={() => { }}
        onStartSolving={() => {
          setIsDrawerOpen(false);
          if (selectedDrawerTask) handleSolveAgain(selectedDrawerTask);
        }}
      />

      {/* ACTIVE FOCUS SESSION SWITCH CONFIRMATION MODAL */}
      {switchConfirmation && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-xs" onClick={handleCancelSwitch} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
              <IoWarningOutline className="text-2xl" />
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Active Focus Session in Progress
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              You currently have an active Focus Session running for <strong>"{switchConfirmation.activeProblemName}"</strong>.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Switching will end the previous session without recording a reflection or completing that revision. What would you like to do?
            </p>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  setSwitchConfirmation(null);
                  toast('Resumed current session', { icon: '⏱️' });
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all"
              >
                Resume Current Session
              </button>

              <button
                onClick={() => handleConfirmSwitch(switchConfirmation.newProblem)}
                className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold shadow-md shadow-primary/20 transition-all"
              >
                Switch to "{switchConfirmation.newProblem.taskName}"
              </button>

              <button
                onClick={handleCancelSwitch}
                className="w-full py-2 px-4 text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACTIVE SOLVE AGAIN REFLECTION MODAL & FLOATING FOCUS TIMER */}
      <DsaCompletionModal
        isOpen={isCompletionModalOpen}
        onClose={() => setIsCompletionModalOpen(false)}
        activeTask={activeSolvingTask || activeFocusTask}
        task={activeSolvingTask || activeFocusTask}
        timerState={timerState}
        onToggleTimer={handleToggleTimer}
        onConfirmCompleted={handleOpenReflection}
        onComplete={handleReflectionComplete}
        onRecordReflection={(_, payload) => handleReflectionComplete(payload)}
        onStillWorking={() => setIsCompletionModalOpen(false)}
        onResetToTodo={handleCancelActiveSession}
        onReopenLeetCode={(task) => {
          const target = task || activeSolvingTask || activeFocusTask;
          const url = target?.leetcodeUrl || `https://leetcode.com/problemset/all/?search=${encodeURIComponent(target?.taskName || '')}`;
          window.open(url, '_blank', 'noopener,noreferrer');
        }}
      />
    </div>
  );
};

export default Revision;
