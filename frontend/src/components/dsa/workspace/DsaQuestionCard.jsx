import React, { useState, useEffect } from 'react';
import {
  IoCheckmarkCircle,
  IoTimeOutline,
  IoLogoYoutube,
  IoPlay,
  IoPause,
  IoAlertCircle,
  IoInformationCircleOutline,
  IoCheckmarkOutline,
  IoArrowUndoOutline,
  IoEyeOutline
} from 'react-icons/io5';
import { MdEdit } from 'react-icons/md';
import { SiLeetcode } from 'react-icons/si';

import {
  resolveProblemUrl,
  getProblemDifficulty,
  DIFFICULTY_CONFIG
} from '../../../utils/dsaUrlHelper';


const DsaQuestionCard = ({
  task,
  topicName,
  onStartQuestion,
  onOpenDetails,
  onResetToTodo,
  onEditTask,
  isAdmin = false,
  isCurrentActive = false,
  activeTimerState = null,
  onToggleTimer,
  onConfirmCompleted
}) => {
  const [nowMs, setNowMs] = useState(Date.now());

  // Tick every second if currently active
  useEffect(() => {
    if (isCurrentActive && activeTimerState?.isActive) {
      const interval = setInterval(() => setNowMs(Date.now()), 1000);
      return () => clearInterval(interval);
    }
  }, [isCurrentActive, activeTimerState?.isActive]);

  if (!task) return null;

  const rawStatus = task.status || 'todo';
  const status = (rawStatus === 'backlog' || rawStatus === 'hold') ? 'todo' : rawStatus;
  const problemDifficulty = getProblemDifficulty(task);
  const difficultyConfig = problemDifficulty ? DIFFICULTY_CONFIG[problemDifficulty] : null;
  const urlInfo = resolveProblemUrl(task);

  // Compute live elapsed time if active
  let totalElapsedSecs = activeTimerState?.accumulatedTime || 0;
  if (isCurrentActive && activeTimerState?.isActive && activeTimerState?.startTime) {
    totalElapsedSecs += Math.max(0, Math.floor((nowMs - new Date(activeTimerState.startTime).getTime()) / 1000));
  }
  const elapsedM = Math.floor(totalElapsedSecs / 60);
  const elapsedS = totalElapsedSecs % 60;
  const timeDisplay = `${elapsedM < 10 ? '0' : ''}${elapsedM}:${elapsedS < 10 ? '0' : ''}${elapsedS}`;

  const handleCardClick = () => {
    // Clicking card opens the side modal details drawer (with notes, edit, etc.)
    if (onOpenDetails) onOpenDetails(task);
  };

  const handleLeetCodeDirect = (e) => {
    e.stopPropagation();
    if (onStartQuestion) onStartQuestion(task);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative flex items-center justify-between p-3.5 sm:p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
        status === 'done'
          ? 'bg-slate-50/60 dark:bg-slate-900/30 border-slate-200/60 dark:border-slate-800/60 opacity-80 hover:opacity-100 hover:border-slate-300'
          : isCurrentActive
          ? 'bg-primary/[0.03] dark:bg-primary/[0.06] border-primary/50 dark:border-primary/60 shadow-sm ring-1 ring-primary/20'
          : status === 'inprogress'
          ? 'bg-amber-50/30 dark:bg-amber-950/10 border-amber-300 dark:border-amber-800/60 shadow-xs hover:border-amber-400'
          : status === 'hold'
          ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-300 dark:border-slate-700 hover:border-slate-400'
          : status === 'backlog'
          ? 'bg-rose-50/20 dark:bg-rose-950/10 border-rose-200/80 dark:border-rose-900/40 hover:border-rose-300'
          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/70 hover:border-primary/40 hover:shadow-sm'
      }`}
    >
      {/* Left: Status Icon & Title */}
      <div className="flex items-center gap-3 min-w-0 flex-1 pr-3">
        {/* Status Indicator */}
        <div className="shrink-0 flex items-center justify-center">
          {status === 'done' && (
            <span title="Completed">
              <IoCheckmarkCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
            </span>
          )}
          {status === 'inprogress' && (
            <span title="In Progress" className="relative flex items-center justify-center w-5 h-5">
              <span className="animate-ping absolute inline-flex h-3.5 w-3.5 rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
          )}
          {status === 'todo' && (
            <span title="Not Started" className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600 group-hover:border-primary transition-colors" />
          )}
          {status === 'hold' && (
            <span title="On Hold">
              <IoPause className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            </span>
          )}
          {status === 'backlog' && (
            <span title="Needs Attention / Backlog">
              <IoAlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400" />
            </span>
          )}
        </div>

        {/* Title & Metadata */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4
              className={`text-sm sm:text-[14.5px] font-semibold tracking-tight truncate ${
                status === 'done'
                  ? 'text-slate-500 dark:text-slate-400 line-through'
                  : 'text-slate-800 dark:text-slate-100 group-hover:text-primary transition-colors'
              }`}
            >
              {task.taskName}
            </h4>
          </div>

          {/* Sub-row metadata */}
          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            {task.taskId && (
              <span className="font-mono text-[10px] text-slate-400 font-semibold">{task.taskId}</span>
            )}
            {topicName && (
              <>
                <span>·</span>
                <span className="truncate max-w-[160px] text-slate-500 dark:text-slate-400">{topicName}</span>
              </>
            )}
            {task.estimatedHours > 0 && (
              <>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <IoTimeOutline size={12} />
                  {task.estimatedHours}h
                </span>
              </>
            )}
            {task.latestOutcome && (
              <>
                <span>·</span>
                <span className={`text-[10px] font-bold ${
                  task.latestOutcome === 'SOLVED_INDEPENDENT'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : task.latestOutcome === 'SOLVED_WITH_HINTS'
                    ? 'text-amber-600 dark:text-amber-400'
                    : task.latestOutcome === 'SOLVED_WITH_SOLUTION'
                    ? 'text-orange-600 dark:text-orange-400'
                    : 'text-rose-500 dark:text-rose-400'
                }`}>
                  {task.latestOutcome === 'SOLVED_INDEPENDENT' ? 'Independent'
                    : task.latestOutcome === 'SOLVED_WITH_HINTS' ? 'With Hints'
                    : task.latestOutcome === 'SOLVED_WITH_SOLUTION' ? 'With Solution'
                    : 'Unsolved'}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right: Badges & Direct Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Compact Company Badge */}
        {task.companyTags && task.companyTags.length > 0 && (() => {
          const names = task.companyTags
            .map(t => typeof t.company === 'object' ? t.company?.name : t.company)
            .filter(Boolean);

          if (names.length === 0) return null;

          let badgeText = '';
          if (names.length === 1) {
            badgeText = names[0];
          } else if (names.length === 2) {
            badgeText = `${names[0]} · ${names[1]}`;
          } else {
            badgeText = `${names[0]} · ${names[1]} · +${names.length - 2}`;
          }

          return (
            <span
              title={names.join(', ')}
              className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border truncate max-w-[170px] bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
            >
              {badgeText}
            </span>
          );
        })()}

        {/* Difficulty Badge - Only shown when verified/explicitly set */}
        {difficultyConfig && (
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${difficultyConfig.style}`}>
            {difficultyConfig.label}
          </span>
        )}

        {/* YouTube Tutorial or Search Link (Always available on child questions) */}
        <a
          href={task.youtubeUrl || `https://www.youtube.com/results?search_query=${encodeURIComponent(task.taskName + ' leetcode')}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          title={task.youtubeUrl ? "Watch Solution Video" : `Search "${task.taskName}" on YouTube`}
          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
        >
          <IoLogoYoutube size={16} />
        </a>

        {/* Edit problem trigger (Admin Only) */}
        {isAdmin && onEditTask && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEditTask(task);
            }}
            title="Edit Problem"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <MdEdit size={15} />
          </button>
        )}

        {/* Active Focus Controls or Launch Trigger */}
        {isCurrentActive ? (
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Live Timer Pill */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-mono font-black border transition-all ${
                activeTimerState?.isActive
                  ? 'bg-primary/10 text-primary border-primary/20'
                  : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
              }`}
              title={activeTimerState?.isActive ? "Focus Timer Active" : "Focus Timer Paused"}
            >
              <span className={`w-2 h-2 rounded-full shrink-0 ${activeTimerState?.isActive ? 'bg-primary animate-pulse' : 'bg-amber-500'}`} />
              <span>{timeDisplay}</span>
              {!activeTimerState?.isActive && (
                <span className="text-[9px] font-black uppercase text-amber-500 ml-0.5 hidden sm:inline">
                  Paused
                </span>
              )}
            </div>

            {/* Pause / Resume Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onToggleTimer) onToggleTimer();
              }}
              title={activeTimerState?.isActive ? "Pause Focus Timer" : "Resume Focus Timer"}
              className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTimerState?.isActive
                  ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200'
                  : 'bg-primary hover:bg-primaryHover text-white shadow-xs'
              }`}
            >
              {activeTimerState?.isActive ? <IoPause size={14} /> : <IoPlay size={14} />}
            </button>

            {/* Reflect & Finish Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onConfirmCompleted) onConfirmCompleted(task);
              }}
              title="Finish focus session & log reflection"
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs hover:scale-102 active:scale-98 transition-all cursor-pointer"
            >
              <IoCheckmarkOutline size={15} />
              <span className="hidden sm:inline">Reflect</span>
            </button>

            {/* Reset / Undo to To Do Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onResetToTodo) onResetToTodo(task);
              }}
              title="Cancel session & reset problem back to To Do"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            >
              <IoArrowUndoOutline size={15} />
            </button>

            {/* LeetCode External Tab Trigger */}
            <button
              type="button"
              onClick={handleLeetCodeDirect}
              title={`Open on LeetCode (${urlInfo.label})`}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <SiLeetcode className="text-xs" />
            </button>
          </div>
        ) : status === 'inprogress' ? (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleLeetCodeDirect}
              title={`Resume focus timer (${urlInfo.label})`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-primary hover:bg-primaryHover text-white shadow-xs hover:scale-102 active:scale-98 transition-all cursor-pointer"
            >
              <IoPlay className="text-xs" />
              <span>Resume Focus</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onResetToTodo) onResetToTodo(task);
              }}
              title="Move back to To Do"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              <IoArrowUndoOutline size={13} />
              <span className="hidden sm:inline">To Do</span>
            </button>
          </div>
        ) : status === 'done' ? (
          <button
            type="button"
            onClick={handleLeetCodeDirect}
            title={`Start a new solving attempt on LeetCode (${urlInfo.label})`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-primary/40 hover:text-primary shadow-2xs hover:shadow-xs transition-all cursor-pointer active:scale-95"
          >
            <SiLeetcode className="text-sm text-amber-500 shrink-0" />
            <span>Solve Again</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleLeetCodeDirect}
            title={`Solve on LeetCode (${urlInfo.label})`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-primary hover:bg-primaryHover text-white shadow-xs hover:scale-102 active:scale-98 transition-all cursor-pointer"
          >
            <SiLeetcode className="text-sm shrink-0" />
            <span>Solve</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default DsaQuestionCard;
