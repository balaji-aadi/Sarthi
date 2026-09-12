import React, { useState, useEffect, useMemo } from 'react';
import {
  IoCheckmarkCircle,
  IoClose,
  IoTimeOutline,
  IoOpenOutline,
  IoPlay,
  IoPause,
  IoCheckmarkOutline,
  IoArrowUndoOutline,
  IoSparklesOutline,
  IoBulbOutline,
  IoHelpBuoyOutline,
  IoAlertCircleOutline
} from 'react-icons/io5';
import { SiLeetcode } from 'react-icons/si';
import { Link } from 'react-router-dom';
import { resolveProblemUrl } from '../../../utils/dsaUrlHelper';

const OUTCOMES = [
  {
    id: 'SOLVED_INDEPENDENT',
    label: 'Solved Independently',
    tag: 'Independent',
    desc: 'Clean solve without hints or editorial peeks',
    icon: IoSparklesOutline,
    activeBorder: 'border-emerald-500 dark:border-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 ring-2 ring-emerald-500/20',
    iconColor: 'text-emerald-600 dark:text-emerald-400'
  },
  {
    id: 'SOLVED_WITH_HINTS',
    label: 'Solved with Hints',
    tag: 'With Hints',
    desc: 'Needed an algorithmic nudge or hint',
    icon: IoBulbOutline,
    activeBorder: 'border-amber-500 dark:border-amber-400 bg-amber-50/80 dark:bg-amber-950/40 text-amber-900 dark:text-amber-100 ring-2 ring-amber-500/20',
    iconColor: 'text-amber-600 dark:text-amber-400'
  },
  {
    id: 'SOLVED_WITH_SOLUTION',
    label: 'Solved with Solution',
    tag: 'With Solution',
    desc: 'Learned by walking through the solution',
    icon: IoHelpBuoyOutline,
    activeBorder: 'border-orange-500 dark:border-orange-400 bg-orange-50/80 dark:bg-orange-950/40 text-orange-900 dark:text-orange-100 ring-2 ring-orange-500/20',
    iconColor: 'text-orange-600 dark:text-orange-400'
  },
  {
    id: 'UNSOLVED',
    label: 'Unsolved / Need to Revisit',
    tag: 'Unsolved',
    desc: 'Ran out of time or stuck (stays In Progress)',
    icon: IoAlertCircleOutline,
    activeBorder: 'border-rose-500 dark:border-rose-400 bg-rose-50/80 dark:bg-rose-950/40 text-rose-900 dark:text-rose-100 ring-2 ring-rose-500/20',
    iconColor: 'text-rose-600 dark:text-rose-400'
  }
];

const CONFIDENCES = [
  {
    id: 'HIGH',
    label: 'High Confidence',
    short: 'High',
    desc: 'Crystal clear, can derive anytime',
    activeClass: 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
  },
  {
    id: 'MEDIUM',
    label: 'Medium Confidence',
    short: 'Medium',
    desc: 'Understood core concept, need a bit more practice',
    activeClass: 'bg-amber-500 text-white border-amber-500 shadow-sm'
  },
  {
    id: 'LOW',
    label: 'Low Confidence',
    short: 'Low',
    desc: 'Still shaky, needs dedicated review',
    activeClass: 'bg-rose-500 text-white border-rose-500 shadow-sm'
  }
];

const DsaCompletionModal = ({
  activeTask: propActiveTask,
  task,
  timerState,
  isOpen,
  onClose,
  onRecordReflection,
  onConfirmCompleted,
  onComplete,
  onStillWorking,
  onToggleTimer,
  onResetToTodo,
  onReopenLeetCode
}) => {
  const activeTask = propActiveTask || task;
  const [nowMs, setNowMs] = useState(Date.now());
  const [selectedOutcome, setSelectedOutcome] = useState('SOLVED_INDEPENDENT');
  const [selectedConfidence, setSelectedConfidence] = useState('HIGH');
  const [reflectionNotes, setReflectionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live timer tick every second while active
  useEffect(() => {
    if (timerState?.isActive) {
      const interval = setInterval(() => {
        setNowMs(Date.now());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timerState?.isActive]);

  // Sync default confidence when outcome changes if user hasn't explicitly diverged
  const handleSelectOutcome = (outcomeId) => {
    setSelectedOutcome(outcomeId);
    if (outcomeId === 'SOLVED_INDEPENDENT') {
      setSelectedConfidence('HIGH');
    } else if (outcomeId === 'SOLVED_WITH_HINTS') {
      setSelectedConfidence('MEDIUM');
    } else if (outcomeId === 'SOLVED_WITH_SOLUTION' || outcomeId === 'UNSOLVED') {
      setSelectedConfidence('LOW');
    }
  };

  // Derive total active solving duration in minutes
  const durationMinutes = useMemo(() => {
    if (!timerState) return 0;
    const selectedMins = timerState.selectedDuration || 30;
    
    let totalSecs = timerState.accumulatedTime || 0;
    if (timerState.isActive && timerState.startTime) {
      const startMs = new Date(timerState.startTime).getTime();
      totalSecs += Math.max(0, Math.floor((nowMs - startMs) / 1000));
    }

    if (totalSecs > 0) {
      return Math.max(1, Math.round(totalSecs / 60));
    }

    return selectedMins;
  }, [timerState, nowMs]);

  if (!activeTask) return null;

  // Compute live elapsed time
  let totalElapsedSecs = timerState?.accumulatedTime || 0;
  if (timerState?.isActive && timerState?.startTime) {
    totalElapsedSecs += Math.max(0, Math.floor((nowMs - new Date(timerState.startTime).getTime()) / 1000));
  }

  const elapsedMins = Math.floor(totalElapsedSecs / 60);
  const elapsedSecs = totalElapsedSecs % 60;
  const timeStr = `${elapsedMins < 10 ? '0' : ''}${elapsedMins}:${elapsedSecs < 10 ? '0' : ''}${elapsedSecs}`;
  const isPaused = Boolean(timerState && !timerState.isActive);
  const targetMins = timerState?.selectedDuration || 30;

  const urlInfo = resolveProblemUrl(activeTask);

  const handleSubmitReflection = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const payload = {
        outcome: selectedOutcome,
        confidence: selectedConfidence,
        notes: reflectionNotes.trim(),
        durationMinutes
      };

      if (onRecordReflection) {
        await onRecordReflection(activeTask, payload);
      } else if (onComplete) {
        await onComplete(payload);
      } else if (onConfirmCompleted) {
        await onConfirmCompleted(activeTask);
      }
      setReflectionNotes('');
    } catch (err) {
      console.error('Failed to submit reflection', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAlreadyCompleted = activeTask?.status === 'done' || 
    Boolean(activeTask?.completedAt) || 
    (Array.isArray(activeTask?.solveHistory) && activeTask.solveHistory.some(s => s.outcome && s.outcome !== 'UNSOLVED'));

  const isSolved = selectedOutcome !== 'UNSOLVED';

  const getSubmitButtonLabel = () => {
    if (isSubmitting) return 'Saving Reflection...';
    if (!isSolved) return 'Save Reflection & Keep In Progress';
    if (isAlreadyCompleted) return 'Save Reflection';
    return 'Save Reflection & Mark Completed';
  };

  return (
    <>
      {/* 1. Modal: Solve Session Reflection */}
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={onStillWorking}
          />
          <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 w-full max-w-xl space-y-5 animate-in zoom-in-95 duration-200 my-auto z-10">
            {/* Header: Session Status & Dismiss */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                    Session Reflection
                  </span>
                  <span className="flex items-center gap-1 text-xs font-bold text-slate-500 dark:text-slate-400">
                    <IoTimeOutline size={14} className="text-primary" />
                    <span>{timeStr} focused</span>
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 truncate" title={activeTask.taskName}>
                  {activeTask.taskName}
                </h3>
              </div>

              <button
                type="button"
                onClick={onStillWorking}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                title="Dismiss & Continue Solving"
              >
                <IoClose size={20} />
              </button>
            </div>

            {/* Step 1: Outcome Selector */}
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                1. How did the problem go?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {OUTCOMES.map((item) => {
                  const Icon = item.icon;
                  const isSelected = selectedOutcome === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectOutcome(item.id)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                        isSelected
                          ? item.activeBorder
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/80'
                      }`}
                    >
                      <div className={`shrink-0 mt-0.5 ${isSelected ? item.iconColor : 'text-slate-500 dark:text-slate-400'}`}>
                        <Icon size={18} />
                      </div>
                      <div className="min-w-0">
                        <span className={`text-xs font-bold block leading-tight ${isSelected ? '' : 'text-slate-800 dark:text-slate-100'}`}>
                          {item.label}
                        </span>
                        <span className={`text-[10px] leading-tight block mt-0.5 ${isSelected ? 'opacity-90' : 'text-slate-500 dark:text-slate-400'}`}>
                          {item.desc}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Confidence Rating */}
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                2. How confident are you on this solution?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {CONFIDENCES.map((conf) => {
                  const isSelected = selectedConfidence === conf.id;
                  return (
                    <button
                      key={conf.id}
                      type="button"
                      onClick={() => setSelectedConfidence(conf.id)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                        isSelected
                          ? conf.activeClass
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>{conf.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Key Insight or Gotcha (Optional) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                  3. Key Insight / Edge Case (Optional)
                </label>
                <span className="text-[10px] text-slate-400">Saved to your problem notes</span>
              </div>
              <textarea
                rows={2}
                value={reflectionNotes}
                onChange={(e) => setReflectionNotes(e.target.value)}
                placeholder="e.g., watch out for off-by-one error when high = mid - 1, or monotonic stack condition..."
                className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none"
              />
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSubmitReflection}
                  className={`w-full sm:flex-1 py-2.5 px-4 rounded-xl text-white text-xs sm:text-sm font-bold shadow-md transition-all active:scale-98 cursor-pointer disabled:opacity-50 text-center ${
                    isSolved
                      ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                      : 'bg-primary hover:bg-primaryHover shadow-primary/20'
                  }`}
                >
                  {getSubmitButtonLabel()}
                </button>

                <button
                  type="button"
                  onClick={onStillWorking}
                  className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-bold transition-colors cursor-pointer text-center"
                >
                  Still Solving
                </button>

                {onResetToTodo && (
                  <button
                    type="button"
                    onClick={() => onResetToTodo(activeTask)}
                    className="w-full sm:w-auto py-2.5 px-3 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/60 hover:bg-rose-100 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs sm:text-sm font-bold transition-colors cursor-pointer text-center flex items-center justify-center gap-1"
                    title={isAlreadyCompleted ? "Cancel session without saving (problem remains Completed)" : "Accidental launch? Reset problem back to To Do without saving a session"}
                  >
                    <IoArrowUndoOutline size={14} />
                    <span>{isAlreadyCompleted ? "Cancel Session" : "Reset"}</span>
                  </button>
                )}
              </div>

              {/* Bottom footer links */}
              <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
                <Link
                  to="/focus-timer"
                  className="hover:text-primary transition-colors flex items-center gap-1 font-medium text-[11px]"
                >
                  <IoTimeOutline size={13} />
                  <span>View in Focus Timer</span>
                </Link>

                <button
                  type="button"
                  onClick={() => onReopenLeetCode(activeTask)}
                  className="flex items-center gap-1 hover:text-primary transition-colors font-medium text-[11px] cursor-pointer"
                  title={`Open LeetCode (${urlInfo.label})`}
                >
                  <SiLeetcode className="text-xs" />
                  <span>Open LeetCode</span>
                  <IoOpenOutline size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Floating Focus Timer Controller */}
      {!isOpen && (
        <div className="fixed bottom-6 right-4 sm:right-8 z-50 animate-in slide-in-from-bottom-5 duration-300 max-w-[calc(100vw-2rem)]">
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl text-slate-800 dark:text-slate-100 rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-700/80 p-3 sm:px-4 sm:py-3 flex items-center gap-3 md:gap-4 w-auto">
            {/* Status Indicator Icon */}
            <div className="shrink-0 flex items-center justify-center">
              {isPaused ? (
                <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/80 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-xs" title="Focus Timer Paused">
                  <IoPause size={16} />
                </div>
              ) : (
                <div className="relative w-9 h-9 rounded-xl bg-primary/10 dark:bg-primary/20 border border-primary/25 flex items-center justify-center text-primary shadow-xs" title="Focus Timer Active">
                  <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-primary opacity-40"></span>
                  <IoTimeOutline size={18} className="relative z-10" />
                </div>
              )}
            </div>

            {/* Time & Problem Info */}
            <div className="space-y-0.5 min-w-[120px] max-w-[200px] sm:max-w-[280px]">
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${isPaused ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`} />
                <span className={`text-[9.5px] font-black uppercase tracking-wider block leading-none ${isPaused ? 'text-amber-600 dark:text-amber-400' : 'text-primary'}`}>
                  {isPaused ? 'Focus Paused' : 'Focus Active'}
                </span>
              </div>
              <div className="flex items-baseline gap-1.5 whitespace-nowrap">
                <span className="font-mono text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight leading-none">
                  {timeStr}
                </span>
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                  / {targetMins}m
                </span>
              </div>
              <p className="text-xs font-semibold truncate text-slate-600 dark:text-slate-300" title={activeTask.taskName}>
                {activeTask.taskName}
              </p>
            </div>

            {/* Controls: Pause/Resume, Finish & Reflect, Reset, Open LeetCode, Close */}
            <div className="flex items-center gap-2 shrink-0 pl-3 border-l border-slate-200/90 dark:border-slate-800">
              {/* Pause / Resume Button */}
              <button
                type="button"
                onClick={onToggleTimer}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 whitespace-nowrap ${
                  isPaused
                    ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/25'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60'
                }`}
                title={isPaused ? 'Resume Timer' : 'Pause Timer'}
              >
                {isPaused ? (
                  <>
                    <IoPlay size={13} className="fill-current" />
                    <span>Resume</span>
                  </>
                ) : (
                  <>
                    <IoPause size={13} />
                    <span>Pause</span>
                  </>
                )}
              </button>

              {/* Finish & Reflect Button */}
              <button
                type="button"
                onClick={() => {
                  if (onConfirmCompleted) onConfirmCompleted(activeTask);
                  else if (onComplete) onComplete();
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                title="Finish focus session & open reflection"
              >
                <IoCheckmarkOutline size={15} className="stroke-[2.5]" />
                <span>Finish & Reflect</span>
              </button>

              {/* Secondary Icon Actions */}
              <div className="flex items-center gap-1 pl-1 border-l border-slate-200/80 dark:border-slate-800">
                {/* Reset to To Do / Cancel Button */}
                {onResetToTodo && (
                  <button
                    type="button"
                    onClick={() => onResetToTodo(activeTask)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors cursor-pointer"
                    title={isAlreadyCompleted ? "Cancel focus session (remains Completed)" : "Reset session back to To Do"}
                  >
                    <IoArrowUndoOutline size={15} />
                  </button>
                )}

                {/* Open in LeetCode External */}
                <button
                  type="button"
                  onClick={() => {
                    if (onReopenLeetCode) onReopenLeetCode(activeTask);
                    else if (urlInfo?.url) window.open(urlInfo.url, '_blank');
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title={`Open LeetCode (${urlInfo.label})`}
                >
                  <SiLeetcode size={14} />
                </button>

                {/* Dismiss Widget */}
                <button
                  type="button"
                  onClick={onClose || onStillWorking}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Minimize Widget"
                >
                  <IoClose size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DsaCompletionModal;
