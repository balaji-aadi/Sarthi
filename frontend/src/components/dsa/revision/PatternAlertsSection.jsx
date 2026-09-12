import React, { useState } from 'react';
import {
  IoWarningOutline,
  IoAlertCircleOutline,
  IoSparklesOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoPlayOutline,
  IoCheckmarkCircleOutline
} from 'react-icons/io5';

const PatternAlertsSection = ({ alerts = [], onPracticeWeakest, onOpenProblem }) => {
  const [expandedPatterns, setExpandedPatterns] = useState({});

  if (!alerts || alerts.length === 0) {
    return null;
  }

  const toggleExpand = (patternId) => {
    setExpandedPatterns((prev) => ({
      ...prev,
      [patternId]: !prev[patternId]
    }));
  };

  const getStatusBadge = (status, outcome, confidence) => {
    switch (status) {
      case 'UNSOLVED':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            Unsolved
          </span>
        );
      case 'SOLVED_WITH_SOLUTION':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-300 dark:border-orange-800">
            With Solution
          </span>
        );
      case 'SOLVED_WITH_HINTS_LOW':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            With Hints · Low Conf
          </span>
        );
      case 'SOLVED_WITH_HINTS_MED_HIGH':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            With Hints · {confidence}
          </span>
        );
      case 'SOLVED_INDEPENDENT_LOW':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
            Independent · Low Conf
          </span>
        );
      case 'SOLVED_INDEPENDENT':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            Independent · {confidence}
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500">
            {outcome || 'Completed'}
          </span>
        );
    }
  };

  return (
    <div className="space-y-3.5 mb-8 animate-in fade-in slide-in-from-top-3 duration-300">
      {/* Section Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <IoWarningOutline size={15} />
          </span>
          <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
            Pattern Diagnostic Alerts
          </h2>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            {alerts.length} {alerts.length === 1 ? 'Pattern' : 'Patterns'} Need Attention
          </span>
        </div>
      </div>

      {/* Alert Cards */}
      <div className="grid grid-cols-1 gap-3.5">
        {alerts.map((alert) => {
          const isCritical = alert.severity === 'CRITICAL';
          const isExpanded = Boolean(expandedPatterns[alert.patternId]);
          const weakest = alert.weakestProblem;

          return (
            <div
              key={alert.patternId}
              className={`rounded-2xl border transition-all shadow-xs overflow-hidden ${
                isCritical
                  ? 'bg-rose-50/40 dark:bg-rose-950/15 border-rose-200/90 dark:border-rose-900/40'
                  : 'bg-amber-50/40 dark:bg-amber-950/15 border-amber-200/90 dark:border-amber-900/40'
              }`}
            >
              <div className="p-4 sm:p-5 space-y-3">
                {/* Header Row */}
                <div className="flex flex-wrap items-start justify-between gap-2.5">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                          isCritical
                            ? 'bg-rose-500 text-white shadow-xs'
                            : 'bg-amber-500 text-white shadow-xs'
                        }`}
                      >
                        {isCritical ? 'Critical Pattern Alert' : 'Moderate Pattern Warning'}
                      </span>
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        {alert.weakCount} of {alert.evaluatedCount} problems weak
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                      {alert.patternName}
                    </h3>
                  </div>

                  {/* Actions */}
                  {weakest && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => onPracticeWeakest && onPracticeWeakest(weakest)}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-all hover:scale-102 active:scale-98 cursor-pointer ${
                          isCritical
                            ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                            : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                        }`}
                        title={`Practice weakest problem: ${weakest.taskName}`}
                      >
                        <IoPlayOutline size={14} />
                        <span>Practice Weakest: {weakest.taskIdNumber ? `#${weakest.taskIdNumber}` : weakest.taskName}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Factual Evidence Description */}
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  {alert.factualEvidence}
                </p>

                {/* Problem Breakdown Toggle & List */}
                {Array.isArray(alert.evaluatedProblemsList) && alert.evaluatedProblemsList.length > 0 && (
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => toggleExpand(alert.patternId)}
                        className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer transition-colors"
                      >
                        <span>Evaluated Problems ({alert.evaluatedProblemsList.length})</span>
                        {isExpanded ? <IoChevronUpOutline size={14} /> : <IoChevronDownOutline size={14} />}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 animate-in fade-in duration-200">
                        {alert.evaluatedProblemsList.map((p) => {
                          const isWeakest = weakest && weakest.taskId === p.taskId;
                          return (
                            <div
                              key={p.taskId}
                              className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs transition-colors ${
                                isWeakest
                                  ? 'bg-white dark:bg-slate-900 border-rose-300 dark:border-rose-800 ring-1 ring-rose-400/30'
                                  : 'bg-white/70 dark:bg-slate-900/70 border-slate-200/80 dark:border-slate-800'
                              }`}
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  {isWeakest && (
                                    <span className="text-[9px] font-black uppercase text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/60 px-1 py-0.2 rounded">
                                      Weakest
                                    </span>
                                  )}
                                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                                    {p.taskIdNumber ? `#${p.taskIdNumber} ` : ''}{p.taskName}
                                  </span>
                                </div>
                              </div>
                              <div className="shrink-0">
                                {getStatusBadge(p.status, p.outcome, p.confidence)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PatternAlertsSection;
