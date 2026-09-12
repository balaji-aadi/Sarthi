import React from 'react';
import { useSelector } from 'react-redux';
import {
  IoClose,
  IoTimeOutline,
  IoCheckmarkCircle,
  IoCheckmarkCircleOutline,
  IoPauseOutline,
  IoPlayOutline,
  IoSyncOutline,
  IoCalendarOutline,
  IoOpenOutline,
  IoBriefcaseOutline,
  IoLayersOutline
} from 'react-icons/io5';
import { SiLeetcode } from 'react-icons/si';
import moment from 'moment';
import {
  resolveProblemUrl,
  getProblemDifficulty,
  DIFFICULTY_CONFIG
} from '../../../utils/dsaUrlHelper';
import CompanyBrandLogo from '../common/CompanyBrandLogo';
import TaskLinkedNotes from '../../common/TaskLinkedNotes';

const getStatusBadge = (status) => {
  switch (status) {
    case 'done':
      return { label: 'Completed', style: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200' };
    case 'inprogress':
      return { label: 'In Progress', style: 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200' };
    case 'hold':
      return { label: 'On Hold', style: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300' };
    case 'backlog':
      return { label: 'Backlog / Attention', style: 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200' };
    default:
      return { label: 'To Do', style: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200' };
  }
};

const DsaQuestionDetailDrawer = ({
  isOpen,
  onClose,
  task,
  topicName,
  phaseName,
  onUpdateStatus,
  onStartSolving,
  isAdmin: propIsAdmin
}) => {
  const { currentUser } = useSelector((state) => state.store || {});
  const isAdmin = propIsAdmin !== undefined ? propIsAdmin : (
    currentUser?.email === "balajiaadi2000@gmail.com" ||
    currentUser?.userRole?.name?.toLowerCase() === "admin" ||
    currentUser?.role === "admin" ||
    (currentUser?.userRoles && currentUser.userRoles.some(r => r.name?.toLowerCase() === "admin"))
  );

  if (!isOpen || !task) return null;

  const statusBadge = getStatusBadge(task.status);
  const problemDifficulty = getProblemDifficulty(task);
  const difficultyConfig = problemDifficulty ? DIFFICULTY_CONFIG[problemDifficulty] : null;
  const urlInfo = resolveProblemUrl(task);
  const isCompleted = task.status === 'done' ||
    Boolean(task.completedAt) ||
    (Array.isArray(task.solveHistory) && task.solveHistory.some(s => s.outcome && s.outcome !== 'UNSOLVED'));


  return (
    <div style={{ marginTop: "0rem" }} className="fixed inset-0 z-[1000] flex justify-end ">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col animate-in slide-in-from-right duration-300 z-10">
        {/* Drawer Header */}
        <div className="px-5 sm:px-6 py-5 border-b border-slate-200/80 dark:border-slate-800 flex items-start justify-between gap-4 bg-white dark:bg-slate-900 shrink-0">
          <div className="min-w-0 space-y-1.5 flex-1">
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex-wrap">
              <span className="shrink-0">{phaseName || 'DSA'}</span>
              <span className="text-slate-300 dark:text-slate-600 shrink-0">›</span>
              <span className="text-slate-600 dark:text-slate-300 font-semibold truncate max-w-[240px] sm:max-w-[320px]">
                {topicName || 'Topic'}
              </span>
              {task.taskId && (
                <span className="font-mono text-primary font-bold bg-primary/10 dark:bg-primary/20 px-2 py-0.5 rounded text-[10px] shrink-0 tracking-normal">
                  {task.taskId}
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-snug break-words">
              {task.taskName}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 -mr-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
            title="Close Drawer"
          >
            <IoClose size={22} />
          </button>
        </div>

        {/* Drawer Scrollable Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-6 space-y-6">
          {/* Status & Difficulty Badges & CTA */}
          <div className="flex flex-col gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${statusBadge.style}`}>
                  {statusBadge.label}
                </span>
                {difficultyConfig ? (
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border uppercase tracking-wider ${difficultyConfig.style}`}>
                    {difficultyConfig.label}
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                    Difficulty: Not specified
                  </span>
                )}
                {task.patternRef && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    <IoLayersOutline size={13} />
                    <span>Pattern: {typeof task.patternRef === 'object' ? task.patternRef.name : task.patternRef}</span>
                  </span>
                )}
              </div>

              {/* Launch on LeetCode button */}
              <button
                type="button"
                onClick={() => onStartSolving(task)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-bold bg-primary hover:bg-primaryHover shadow-md shadow-primary/20 transition-all hover:scale-102 active:scale-98 cursor-pointer"
                title={isCompleted ? "Start a new solving attempt & focus session" : "Start solving on LeetCode"}
              >
                <SiLeetcode className="text-sm" />
                <span>{isCompleted ? 'Solve Again' : 'Solve'}</span>
                <IoOpenOutline size={13} />
              </button>
            </div>

            {/* Latest Solve Reflection Banner (if previously attempted) */}
            {task.latestOutcome && (
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">Latest Reflection:</span>
                <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${task.latestOutcome === 'SOLVED_INDEPENDENT'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                  : task.latestOutcome === 'SOLVED_WITH_HINTS'
                    ? 'bg-amber-50 text-amber-700 border-amber-200 dark:border-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                    : task.latestOutcome === 'SOLVED_WITH_SOLUTION'
                      ? 'bg-orange-50 text-orange-700 border-orange-200 dark:border-orange-950/40 dark:text-orange-300 dark:border-orange-800'
                      : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                  }`}>
                  <span>{task.latestOutcome.replace(/_/g, ' ')}</span>
                  {task.latestConfidence && (
                    <span className="opacity-80 font-normal">({task.latestConfidence} Confidence)</span>
                  )}
                </span>
              </div>
            )}
          </div>

          {/* Description / Problem Statement */}
          {task.taskDescription && task.taskDescription !== '<p><br></p>' && (
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                Description / Details
              </label>
              <div
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700 text-xs sm:text-sm text-slate-700 dark:text-slate-300 prose prose-slate dark:prose-invert max-w-none leading-relaxed"
                dangerouslySetInnerHTML={{ __html: task.taskDescription }}
              />
            </div>
          )}

          {/* Additional Notes (if present in DSA task) */}
          {task.additionalNotes && task.additionalNotes !== '<p><br></p>' && (
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                Practice Notes & Approach
              </label>
              <div
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700 text-xs sm:text-sm text-slate-700 dark:text-slate-300 prose prose-slate dark:prose-invert max-w-none leading-relaxed"
                dangerouslySetInnerHTML={{ __html: task.additionalNotes }}
              />
            </div>
          )}

          {/* Linked Notes & Document Center */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <TaskLinkedNotes
              taskId={task._id}
              taskName={task.taskName}
              isAdmin={isAdmin}
            />
          </div>

          {/* Target Companies Section */}
          {task.companyTags && task.companyTags.length > 0 && (
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <IoBriefcaseOutline size={13} />
                <span>Target Companies ({task.companyTags.length})</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {task.companyTags.map((tag, idx) => {
                  const companyObj = typeof tag.company === "object" ? tag.company : null;
                  const companyName = companyObj?.name || (typeof tag.company === "string" ? tag.company : "Company");
                  const companyLogo = companyObj?.logoUrl;

                  return (
                    <div
                      key={tag._id || idx}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-semibold shadow-2xs"
                    >
                      <CompanyBrandLogo
                        companyName={companyName}
                        logoUrl={companyLogo}
                        size="xs"
                      />
                      <span className="font-bold text-slate-800 dark:text-slate-100">{companyName}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Solve & Reflection History Section (Append-only learning record) */}
          {task.solveHistory && task.solveHistory.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                  Solve & Reflection History ({task.solveHistory.length})
                </label>
                <span className="text-[10px] text-slate-400">Append-only record</span>
              </div>
              <div className="space-y-2.5">
                {task.solveHistory.map((attempt, index) => {
                  return (
                    <div
                      key={attempt._id || index}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black font-mono text-slate-400 dark:text-slate-500 uppercase">
                            Attempt #{index + 1}
                          </span>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${attempt.outcome === 'SOLVED_INDEPENDENT'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                            : attempt.outcome === 'SOLVED_WITH_HINTS'
                              ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                              : attempt.outcome === 'SOLVED_WITH_SOLUTION'
                                ? 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800'
                                : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                            }`}>
                            {attempt.outcome ? attempt.outcome.replace(/_/g, ' ') : 'Attempt'}
                          </span>
                          {attempt.confidence && (
                            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                              · {attempt.confidence} Confidence
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 shrink-0">
                          {attempt.durationMinutes > 0 && (
                            <span>{attempt.durationMinutes}m focus</span>
                          )}
                          {attempt.attemptedAt && (
                            <span>· {moment(attempt.attemptedAt).format('MMM DD, YYYY')}</span>
                          )}
                        </div>
                      </div>
                      {attempt.notes && (
                        <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed italic bg-white dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                          "{attempt.notes}"
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : isCompleted ? (
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                Solve & Reflection History
              </label>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60 space-y-1.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600">
                    Historical Completion
                  </span>
                  {task.completedAt && (
                    <span className="text-[10px] font-mono text-slate-400">
                      Completed {moment(task.completedAt).format('MMM DD, YYYY')}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                  Completed prior to reflection tracking — learning outcome and confidence not recorded.
                </p>
              </div>
            </div>
          ) : null}

          {/* Revision Logs Section */}
          {task.revisionLogs && task.revisionLogs.length > 0 && (
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                Revision History ({task.revisionLogs.length})
              </label>
              <div className="space-y-2">
                {task.revisionLogs.map((rev, index) => (
                  <div
                    key={rev._id || index}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">
                        Revision #{task.revisionLogs.length - index}
                      </span>
                      {rev.notes && (
                        <p className="text-slate-500 dark:text-slate-400 text-[11px] whitespace-pre-wrap">
                          {rev.notes}
                        </p>
                      )}
                    </div>
                    {rev.revisionDate && (
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">
                        {moment(rev.revisionDate).format('MMM DD, YYYY')}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Time & Practice Target Metadata */}
          <div className="p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 space-y-3 text-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="flex items-center gap-1.5">
                <IoTimeOutline size={14} /> Focus Session Target
              </span>
              <span className="font-bold text-slate-700 dark:text-slate-200">
                {task.estimatedHours ? `${Math.round(task.estimatedHours * 60)} mins` : '30 mins'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DsaQuestionDetailDrawer;
