import React from 'react';
import {
  IoCompassOutline,
  IoBusinessOutline,
  IoPlay,
  IoAddOutline,
  IoSearchOutline
} from 'react-icons/io5';

const DsaPhaseHeader = ({
  projectName = 'DSA Track',
  completedCount = 0,
  totalCount = 0,
  inProgressCount = 0,
  todoCount,
  activeFilter = 'all',
  onFilterChange,
  searchTerm = '',
  onSearchChange,
  nextQuestion = null,
  onContinueLearning,
  onCreateQuestion,
  isAdmin = false
}) => {
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="bg-white dark:bg-[#0D111A] border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-4">
        {/* Top Row: Phase Title, Stats & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 truncate">
              {projectName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              Structured curriculum, pattern recognition, and algorithmic mastery
            </p>
          </div>

          {/* Action Area: Stats, Add Problem, Continue Learning */}
          <div className="flex items-center gap-3 sm:gap-4 self-start md:self-auto flex-wrap">
            {/* Completion Metric */}
            <div className="text-right pr-2">
              <div className="text-sm sm:text-base font-black text-slate-800 dark:text-slate-100">
                {completedCount} <span className="text-slate-400 font-medium text-xs sm:text-sm">/ {totalCount}</span>
              </div>
              <div className="text-[11px] font-bold text-slate-400">
                {percent}% Solved
              </div>
            </div>

            {/* Create Problem Button (Admin Only) */}
            {isAdmin && onCreateQuestion && (
              <button
                type="button"
                onClick={onCreateQuestion}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-bold shadow-2xs hover:border-primary/40 hover:text-primary transition-all cursor-pointer active:scale-95"
                title="Add a new question to this arena"
              >
                <IoAddOutline className="text-base text-primary" />
                <span>Add Problem</span>
              </button>
            )}

            {/* Continue Learning CTA */}
            {nextQuestion && (
              <button
                type="button"
                onClick={onContinueLearning}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primaryHover text-white text-xs sm:text-sm font-bold shadow-md shadow-primary/20 transition-all hover:scale-102 active:scale-98 cursor-pointer"
                title={`Continue next: ${nextQuestion.taskName}`}
              >
                <IoPlay className="text-xs fill-current" />
                <span>Continue Learning</span>
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              percent === 100
                ? 'bg-emerald-500'
                : 'bg-gradient-to-r from-primary via-orange-500 to-amber-500'
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          {/* Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
            <button
              type="button"
              onClick={() => onFilterChange('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/80'
              }`}
            >
              All ({totalCount})
            </button>

            <button
              type="button"
              onClick={() => onFilterChange('inprogress')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeFilter === 'inprogress'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/80'
              }`}
            >
              In Progress ({inProgressCount})
            </button>

            <button
              type="button"
              onClick={() => onFilterChange('todo')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeFilter === 'todo'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/80'
              }`}
            >
              To Do ({todoCount !== undefined ? todoCount : Math.max(totalCount - completedCount - inProgressCount, 0)})
            </button>

            <button
              type="button"
              onClick={() => onFilterChange('done')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeFilter === 'done'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/80'
              }`}
            >
              Completed ({completedCount})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none" />
            <input
              type="text"
              placeholder="Search questions or patterns..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DsaPhaseHeader;
