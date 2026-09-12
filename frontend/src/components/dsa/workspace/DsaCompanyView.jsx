import React, { useState, useMemo } from 'react';
import {
  IoArrowBackOutline,
  IoSearchOutline,
  IoBusinessOutline,
  IoMenuOutline,
  IoCheckmarkCircleOutline,
  IoCodeSlashOutline,
  IoAddOutline
} from 'react-icons/io5';
import DsaQuestionCard from './DsaQuestionCard';
import CompanyBrandLogo from '../common/CompanyBrandLogo';
import { COMPANY_METADATA, normalizeCompanySlug, getCompanyMetadata } from '../../../data/companyMetadata';

const DsaCompanyView = ({
  questions = [],
  activeQuestionId = null,
  activeTimerState = null,
  onToggleTimer,
  onConfirmCompleted,
  onResetToTodo,
  onStartQuestion,
  onOpenDetails,
  onEditTask,
  isAdmin = false,
  searchTerm = '',
  onSearchChange,
  selectedCompanyId: propSelectedCompanyId,
  onSelectCompanyId
}) => {
  const [internalSelectedCompanyId, setInternalSelectedCompanyId] = useState(null);
  const selectedCompanyId = propSelectedCompanyId !== undefined ? propSelectedCompanyId : internalSelectedCompanyId;
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'todo' | 'inprogress' | 'done'

  const handleSelectCompany = (id) => {
    setInternalSelectedCompanyId(id);
    if (onSelectCompanyId) onSelectCompanyId(id);
  };

  // Build comprehensive company list merging all metadata entries + database questions
  const companyAggregations = useMemo(() => {
    const compMap = new Map();

    // 1. Seed all 48 companies from COMPANY_METADATA
    Object.entries(COMPANY_METADATA).forEach(([slug, meta]) => {
      compMap.set(slug, {
        id: slug,
        slug: slug,
        name: meta.name,
        tagline: meta.tagline,
        baselineCount: meta.baselineCount,
        category: meta.category,
        logoUrl: '',
        questions: [],
        completedCount: 0,
        inProgressCount: 0
      });
    });

    // 2. Associate actual database questions
    (questions || []).forEach(q => {
      if (!Array.isArray(q.companyTags) || q.companyTags.length === 0) return;

      q.companyTags.forEach(tag => {
        const comp = tag.company;
        if (!comp) return;

        const name = typeof comp === 'object' ? comp.name : comp;
        const slug = normalizeCompanySlug(typeof comp === 'object' ? (comp.slug || comp.name) : comp);
        if (!slug) return;

        if (!compMap.has(slug)) {
          const meta = getCompanyMetadata(name);
          compMap.set(slug, {
            id: slug,
            slug: slug,
            name: name,
            tagline: meta.tagline,
            baselineCount: meta.baselineCount,
            category: meta.category,
            logoUrl: typeof comp === 'object' ? comp.logoUrl : '',
            questions: [],
            completedCount: 0,
            inProgressCount: 0
          });
        }

        const compData = compMap.get(slug);
        // Avoid duplicate question insertion
        if (!compData.questions.some(item => item.question._id === q._id)) {
          compData.questions.push({ question: q });

          if (q.status === 'done' || q.completedAt) compData.completedCount++;
          else if (q.status === 'inprogress') compData.inProgressCount++;
        }
      });
    });

    // 3. Sort companies by:
    // (a) companies with tagged questions first (descending count)
    // (b) then established baseline count descending
    return Array.from(compMap.values()).sort((a, b) => {
      if (b.questions.length !== a.questions.length) {
        return b.questions.length - a.questions.length;
      }
      if (b.baselineCount !== a.baselineCount) {
        return b.baselineCount - a.baselineCount;
      }
      return a.name.localeCompare(b.name);
    });
  }, [questions]);

  // Selected company object
  const activeCompany = useMemo(() => {
    if (!selectedCompanyId) return null;
    return companyAggregations.find(c => c.id === selectedCompanyId || c.slug === selectedCompanyId) || null;
  }, [selectedCompanyId, companyAggregations]);

  // Filtered companies in overview mode
  const filteredCompanies = useMemo(() => {
    if (!searchTerm) return companyAggregations;
    const term = searchTerm.toLowerCase();
    return companyAggregations.filter(c =>
      c.name.toLowerCase().includes(term) ||
      (c.tagline && c.tagline.toLowerCase().includes(term)) ||
      c.questions.some(item =>
        item.question.taskName?.toLowerCase().includes(term) ||
        item.question.taskId?.toLowerCase().includes(term)
      )
    );
  }, [companyAggregations, searchTerm]);

  // Filtered questions in drill-down mode
  const drillDownQuestions = useMemo(() => {
    if (!activeCompany) return [];

    return activeCompany.questions.filter(({ question }) => {
      // Status filter
      if (statusFilter === 'done' && question.status !== 'done' && !question.completedAt) return false;
      if (statusFilter === 'inprogress' && question.status !== 'inprogress') return false;
      if (statusFilter === 'todo' && (question.status === 'done' || question.status === 'inprogress' || question.completedAt)) return false;

      // Search term
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchName = question.taskName?.toLowerCase().includes(term);
        const matchId = question.taskId?.toLowerCase().includes(term);
        if (!matchName && !matchId) return false;
      }

      return true;
    });
  }, [activeCompany, statusFilter, searchTerm]);

  // If drilling down into a company
  if (activeCompany) {
    const totalTagged = activeCompany.questions.length;
    const compPercent = totalTagged > 0
      ? Math.round((activeCompany.completedCount / totalTagged) * 100)
      : 0;

    return (
      <div className="space-y-6">
        {/* Navigation Breadcrumb & Back Button */}
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => {
              handleSelectCompany(null);
              setStatusFilter('all');
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-amber-500 dark:hover:text-amber-400 hover:border-amber-500/40 shadow-xs transition-all cursor-pointer"
          >
            <IoArrowBackOutline className="text-sm" />
            <span>Back to All Companies</span>
          </button>

          <span className="text-xs font-semibold text-slate-400">
            {activeCompany.category || "Target Company"}
          </span>
        </div>

        {/* Company Header Card */}
        <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4 min-w-0">
            <CompanyBrandLogo
              companyName={activeCompany.name}
              logoUrl={activeCompany.logoUrl}
              size="lg"
              showContainer
            />
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {activeCompany.name}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 uppercase tracking-wider">
                  Target Sheet
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
                {activeCompany.tagline}
              </p>
            </div>
          </div>

          {/* Progress / Completion Metrics */}
          <div className="flex flex-col sm:items-end gap-2 shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-base font-black text-slate-900 dark:text-white">
                  {activeCompany.completedCount} <span className="text-slate-400 text-xs font-medium">/ {totalTagged}</span>
                </div>
                <div className="text-[11px] font-semibold text-slate-400">
                  {totalTagged > 0 ? `${compPercent}% Completed` : '0 Questions Available'}
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black text-sm border border-amber-500/20">
                {totalTagged > 0 ? `${compPercent}%` : '0Q'}
              </div>
            </div>

            {totalTagged > 0 && (
              <div className="w-40 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${compPercent}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Status Filter Bar & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${statusFilter === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
            >
              All ({totalTagged})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('inprogress')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${statusFilter === 'inprogress'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
            >
              In Progress ({activeCompany.inProgressCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('todo')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${statusFilter === 'todo'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
            >
              To Do ({Math.max(totalTagged - activeCompany.completedCount - activeCompany.inProgressCount, 0)})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('done')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${statusFilter === 'done'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
            >
              Completed ({activeCompany.completedCount})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none" />
            <input
              type="text"
              placeholder={`Search ${activeCompany.name} questions...`}
              value={searchTerm}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
            />
          </div>
        </div>

        {/* Questions List */}
        {totalTagged === 0 ? (
          <div className="py-16 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4 p-8">
            <div className="mx-auto flex justify-center">
              <CompanyBrandLogo companyName={activeCompany.name} logoUrl={activeCompany.logoUrl} size="lg" showContainer />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-black text-slate-900 dark:text-white">
                0 Questions Tagged for {activeCompany.name} Yet
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                Problems for {activeCompany.name} are currently being curated and tagged. Once tagged in Studio, they will immediately appear here.
              </p>
            </div>
            <div>
              <button
                type="button"
                onClick={() => handleSelectCompany(null)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
              >
                <IoArrowBackOutline />
                <span>Browse Other Companies</span>
              </button>
            </div>
          </div>
        ) : drillDownQuestions.length === 0 ? (
          <div className="py-16 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3 p-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto text-xl">
              <IoCodeSlashOutline />
            </div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white">
              No questions match filter
            </h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Try clearing your search term or adjusting status filter.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {drillDownQuestions.map(({ question }) => (
              <DsaQuestionCard
                key={question._id}
                task={question}
                isActiveSolving={activeQuestionId === question._id}
                timerState={activeQuestionId === question._id ? activeTimerState : null}
                onToggleTimer={onToggleTimer}
                onConfirmCompleted={onConfirmCompleted}
                onResetToTodo={onResetToTodo}
                onStartSolving={onStartQuestion}
                onOpenDetails={onOpenDetails}
                onEditTask={isAdmin ? onEditTask : null}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // OVERVIEW 4-COLUMN RESPONSIVE GRID (Matching Reference Screenshots)
  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* 4-Column Card Grid */}
      {filteredCompanies.length === 0 ? (
        <div className="py-20 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
          <IoBusinessOutline className="text-4xl text-slate-400 mx-auto" />
          <p className="text-base font-bold text-slate-800 dark:text-slate-200">
            No companies found matching "{searchTerm}"
          </p>
          <p className="text-xs text-slate-400">
            Try a different search keyword or clear the search field.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4">
          {filteredCompanies.map(comp => {
            const displayCount = comp.questions.length;
            const isSelected = selectedCompanyId === comp.id || selectedCompanyId === comp.slug;

            return (
              <div
                key={comp.id}
                onClick={() => handleSelectCompany(comp.id)}
                className={`group relative p-4 sm:p-4.5 rounded-2xl transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3 select-none ${isSelected
                  ? 'bg-slate-900 border-2 border-amber-500 ring-2 ring-amber-500/40 shadow-lg shadow-amber-500/10'
                  : 'bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-slate-800/90 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md'
                  }`}
              >
                {/* Top Row: Authentic Vector Brand Logo + Company Name */}
                <div className="flex items-center gap-3 min-w-0">
                  <CompanyBrandLogo
                    companyName={comp.name}
                    logoUrl={comp.logoUrl}
                    size="md"
                    showContainer
                    className="shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm sm:text-[14.5px] font-black text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors truncate">
                      {comp.name}
                    </h3>
                    <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 truncate block">
                      {comp.category}
                    </span>
                  </div>
                </div>

                {/* Middle: Authentic Placement Tagline */}
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed font-normal min-h-[34px]">
                  {comp.tagline}
                </p>

                {/* Bottom Footer: Question Count + Compact Solved Pill */}
                <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <div className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${displayCount > 0 ? 'text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white' : 'text-slate-400 dark:text-slate-500'}`}>
                    <IoMenuOutline className="text-sm" />
                    <span>{displayCount} {displayCount === 1 ? 'Question' : 'Questions'}</span>
                  </div>

                  {/* Compact, balanced solved indicator */}
                  {comp.completedCount > 0 && (
                    <span className="inline-flex items-center gap-1 px-1 py-0.5 rounded-md text-[8px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                      <IoCheckmarkCircleOutline size={12} />
                      <span>{comp.completedCount} solved</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DsaCompanyView;
