import React, { useState } from 'react';
import { IoChevronDown, IoChevronForward, IoLogoYoutube, IoCheckmarkCircleOutline, IoAddOutline } from 'react-icons/io5';
import DsaQuestionCard from './DsaQuestionCard';

const DsaTopicSection = ({
  topic,
  questions = [],
  activeQuestionId,
  activeTimerState,
  onToggleTimer,
  onConfirmCompleted,
  onResetToTodo,
  onStartQuestion,
  onOpenDetails,
  onEditTask,
  onCreateQuestion,
  defaultExpanded = false,
  isAdmin = false
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (!topic && questions.length === 0) return null;

  const topicName = topic?.taskName || 'General Practice';
  const total = questions.length;
  const completed = questions.filter(q => q.status === 'done').length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const hasInProgress = questions.some(q => q.status === 'inprogress');

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-hidden transition-all">
      {/* Topic Header Bar */}
      <div
        onClick={() => setIsExpanded(prev => !prev)}
        className="flex items-center justify-between p-4 sm:px-5 sm:py-4 cursor-pointer hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors select-none"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1 pr-4">
          <button
            type="button"
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-transform"
            aria-label={isExpanded ? 'Collapse topic' : 'Expand topic'}
          >
            {isExpanded ? <IoChevronDown size={18} /> : <IoChevronForward size={18} />}
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight truncate">
                {topicName}
              </h3>
              {hasInProgress && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                  Active
                </span>
              )}
            </div>

            {topic?.taskDescription && (
              <div 
                className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1 prose prose-xs dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: topic.taskDescription.replace(/<[^>]*>?/gm, '').slice(0, 100) }}
              />
            )}
          </div>
        </div>

        {/* Right: Topic Progress Pill & Mini Bar */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200">
              {completed} <span className="text-slate-400 font-normal">/ {total}</span>
            </span>
            <span className="hidden sm:inline-block ml-1.5 text-[11px] font-bold text-slate-400">
              ({percent}%)
            </span>
          </div>

          <div className="w-16 sm:w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shrink-0">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                percent === 100
                  ? 'bg-emerald-500'
                  : percent > 0
                  ? 'bg-primary'
                  : 'bg-transparent'
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Expanded Questions List */}
      {isExpanded && (
        <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-1 space-y-2.5 border-t border-slate-100 dark:border-slate-800/80">
          {questions.length === 0 ? (
            <p className="text-xs text-slate-400 py-3 text-center">No questions in this topic.</p>
          ) : (
            questions.map((question) => {
              const isActive = activeQuestionId === question._id || activeQuestionId === question._id?.toString();
              return (
                <DsaQuestionCard
                  key={question._id}
                  task={question}
                  topicName={topicName}
                  onStartQuestion={onStartQuestion}
                  onOpenDetails={onOpenDetails}
                  onResetToTodo={onResetToTodo}
                  onEditTask={onEditTask}
                  isCurrentActive={isActive}
                  activeTimerState={isActive ? activeTimerState : null}
                  onToggleTimer={onToggleTimer}
                  onConfirmCompleted={onConfirmCompleted}
                  isAdmin={isAdmin}
                />
              );
            })
          )}

          {/* Inline Add Problem to this topic (Admin only) */}
          {isAdmin && onCreateQuestion && topic?._id && (
            <div className="pt-1 flex items-center justify-start">
              <button
                type="button"
                onClick={() => onCreateQuestion(topic._id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-primary hover:bg-primary/5 transition-colors cursor-pointer"
              >
                <IoAddOutline size={15} className="text-primary" />
                <span>Add problem to {topicName}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DsaTopicSection;

