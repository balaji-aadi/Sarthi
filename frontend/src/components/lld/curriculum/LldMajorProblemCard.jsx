import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LuHammer, 
  LuGitCommit, 
  LuArrowRight, 
  LuAlertTriangle, 
  LuClock, 
  LuCheckCircle2, 
  LuPlay, 
  LuSparkles,
  LuChevronRight,
  LuExternalLink
} from 'react-icons/lu';
import { formatLearnerTitle } from '../../../utils/lldCurriculumMapper';

export default function LldMajorProblemCard({ problem, index = 0 }) {
  const navigate = useNavigate();

  if (!problem) return null;

  const versions = (problem.versions || []).sort((a, b) => 
    (a.taskId || '').localeCompare(b.taskId || '', undefined, { numeric: true })
  );

  // Default selected version: first uncompleted version or V1
  const firstUnfinishedIdx = versions.findIndex(v => v.status !== 'done');
  const defaultIdx = firstUnfinishedIdx >= 0 ? firstUnfinishedIdx : 0;
  const [selectedVersionIdx, setSelectedVersionIdx] = useState(defaultIdx);

  const activeVersion = versions[selectedVersionIdx] || versions[0];
  const targetMinutes = problem.curriculumMeta?.targetTimeMinutes || 75;

  const cleanProblemTitle = problem.learnerTitle || formatLearnerTitle(problem.taskName);

  // Extract pedagogical sections from active version description
  const desc = activeVersion?.taskDescription || '';
  const whatChangedMatch = desc.match(/###\s*1\.\s*What Changed\?([\s\S]*?)(?=###|$)/i);
  const whyStrugglesMatch = desc.match(/###\s*2\.\s*Why Does the Previous Design Struggle\?([\s\S]*?)(?=###|$)/i);
  const newReqsMatch = desc.match(/###\s*3\.\s*New Requirements([\s\S]*?)(?=###|$)/i);
  const observableMatch = desc.match(/###\s*4\.\s*Expected Observable Behavior([\s\S]*?)(?=###|$)/i);

  const whatChangedText = whatChangedMatch ? whatChangedMatch[1].trim() : '';
  const whyStrugglesText = whyStrugglesMatch ? whyStrugglesMatch[1].trim() : '';
  const newReqsText = newReqsMatch ? newReqsMatch[1].trim() : '';
  const observableText = observableMatch ? observableMatch[1].trim() : '';

  // Extract scenario summary from problem description
  const problemDesc = problem.taskDescription || '';
  const scenarioMatch = problemDesc.match(/###\s*1\.\s*Context & Scenario([\s\S]*?)(?=###|$)/i);
  const scenarioText = scenarioMatch ? scenarioMatch[1].trim() : '';

  const completedVersionsCount = versions.filter(v => v.status === 'done').length;
  const isProblemFullyCompleted = versions.length > 0 && completedVersionsCount === versions.length;

  const [showVersionChoiceModal, setShowVersionChoiceModal] = useState(false);
  const [targetVersionToLaunch, setTargetVersionToLaunch] = useState(null);

  const handleLaunchVersion = (v) => {
    const target = v || activeVersion;
    if (!target) return;
    
    // For V1, launch directly
    if (selectedVersionIdx === 0) {
      navigate(`/arena/lld/workspace/${target.taskId || target._id}?mode=fresh`);
      return;
    }

    // For V2+, give the learner an explicit choice
    setTargetVersionToLaunch(target);
    setShowVersionChoiceModal(true);
  };

  const handleConfirmLaunch = (mode) => {
    setShowVersionChoiceModal(false);
    if (!targetVersionToLaunch) return;
    const prevVersion = versions[selectedVersionIdx - 1];
    const query = mode === 'continue' && prevVersion
      ? `?mode=continue&from=${prevVersion.taskId || prevVersion._id}`
      : `?mode=fresh`;
    navigate(`/arena/lld/workspace/${targetVersionToLaunch.taskId || targetVersionToLaunch._id}${query}`);
  };

  return (
    <div className={`rounded-2xl border transition-all duration-200 overflow-hidden shadow-lg ${
      isProblemFullyCompleted
        ? 'border-emerald-500/40 bg-gradient-to-b from-[#161b22] to-[#0d1117]'
        : 'border-amber-500/30 bg-gradient-to-b from-[#1c1917]/70 via-[#161b22] to-[#0d1117] hover:border-amber-500/50'
    }`}>
      {/* Top Banner with Distinct "Design Challenge" Identity */}
      <div className="p-6 border-b border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
                <LuHammer size={12} className="text-amber-400" />
                <span>Design Challenge {index + 1}</span>
              </span>

              <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                <LuClock size={12} />
                <span>~{targetMinutes} min total</span>
              </span>

              <span className="text-xs font-mono text-slate-400">
                {versions.length} Evolving Versions
              </span>

              {versions.length > 0 && (
                <span className={`text-xs font-mono px-2 py-0.5 rounded border ${
                  isProblemFullyCompleted 
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {completedVersionsCount}/{versions.length} versions explored
                </span>
              )}
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {cleanProblemTitle}
            </h3>

            {scenarioText && (
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed line-clamp-2 max-w-3xl">
                {scenarioText}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => handleLaunchVersion(activeVersion)}
            className="self-start sm:self-center shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <LuPlay size={14} className="fill-current" />
            <span>Continue Challenge (Version {selectedVersionIdx + 1}) →</span>
          </button>
        </div>

        {/* Visual Version Evolution Pipeline (Correction #5: No artificial lock!) */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <LuGitCommit size={14} className="text-amber-400" />
              <span>System Evolution Progression</span>
            </span>
            <span className="text-[11px] text-slate-500">
              Click any version to preview requirements and launch
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {versions.map((v, idx) => {
              const isSelected = idx === selectedVersionIdx;
              const isVCompleted = v.status === 'done';
              const isCurrent = idx === defaultIdx;
              const cleanVerTitle = formatLearnerTitle(v.taskName);

              return (
                <React.Fragment key={v._id || v.taskId}>
                  <button
                    type="button"
                    onClick={() => setSelectedVersionIdx(idx)}
                    className={`group relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/30 scale-105'
                        : isVCompleted
                        ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/40'
                        : isCurrent
                        ? 'bg-slate-900 text-amber-300 border-amber-500/40 hover:bg-slate-800'
                        : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {isVCompleted ? (
                      <LuCheckCircle2 size={13} className={isSelected ? 'text-slate-950' : 'text-emerald-400'} />
                    ) : isCurrent ? (
                      <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-slate-950' : 'bg-amber-400 animate-pulse'}`} />
                    ) : (
                      <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-slate-950' : 'bg-slate-600'}`} />
                    )}

                    <span>V{idx + 1}</span>
                    <span className="hidden md:inline font-normal truncate max-w-[130px]">
                      {cleanVerTitle}
                    </span>
                  </button>

                  {idx < versions.length - 1 && (
                    <LuChevronRight size={14} className="text-slate-600 shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Version Detailed Evolution Card */}
      {activeVersion && (
        <div className="p-6 bg-[#0d1117]/80 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                Step {selectedVersionIdx + 1} of {versions.length}
              </span>
              <h4 className="text-base font-bold text-white mt-0.5">
                Version {selectedVersionIdx + 1}: {formatLearnerTitle(activeVersion.taskName)}
              </h4>
            </div>

            <button
              type="button"
              onClick={() => handleLaunchVersion(activeVersion)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              <span>Start Version {selectedVersionIdx + 1} →</span>
              <LuExternalLink size={12} />
            </button>
          </div>

          {/* Pedagogical Evolution Blocks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. What Changed? */}
            <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-800/40 text-xs text-blue-200 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-blue-400">
                <LuSparkles size={14} />
                <span className="uppercase tracking-wider">1. What Changed?</span>
              </div>
              <p className="leading-relaxed">
                {whatChangedText || 'New domain requirements and operational constraints introduced for this iteration.'}
              </p>
            </div>

            {/* 2. Why Previous Design Struggles? */}
            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 text-xs text-amber-200 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-amber-400">
                <LuAlertTriangle size={14} />
                <span className="uppercase tracking-wider">2. Why Previous Design Struggles?</span>
              </div>
              <p className="leading-relaxed">
                {whyStrugglesText || 'The previous design becomes uncomfortable or breaks due to tight coupling and rigid state handling.'}
              </p>
            </div>
          </div>

          {/* 3. New Requirements & Observable Behavior */}
          {(newReqsText || observableText) && (
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-2">
              {newReqsText && (
                <div>
                  <span className="font-bold text-white block mb-1">New Requirements:</span>
                  <p className="whitespace-pre-line text-slate-300 leading-relaxed">{newReqsText}</p>
                </div>
              )}

              {observableText && (
                <div className="pt-2 border-t border-slate-800/80">
                  <span className="font-bold text-emerald-400 block mb-1">Expected Observable Behavior:</span>
                  <p className="text-slate-300 leading-relaxed">{observableText}</p>
                </div>
              )}
            </div>
          )}

          {/* 4. Architectural Pressure & What to Reconsider */}
          {selectedVersionIdx > 0 && (
            <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-800/40 text-xs text-purple-200 space-y-1.5">
              <span className="font-bold text-purple-400 uppercase tracking-wider block">
                Architectural Pressure & What to Reconsider:
              </span>
              <p className="leading-relaxed">
                Notice how adding this requirement challenges your existing class contracts. Reconsider whether composition, a polymorphic strategy, or state pattern allows you to integrate this without rewriting previous classes.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Explicit Version Evolution Choice Dialog */}
      {showVersionChoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#161b22] border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                Version Evolution Workflow
              </span>
              <h3 className="text-lg font-bold text-white mt-1">
                How would you like to start Version {selectedVersionIdx + 1}?
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                You can start with clean starter code, or continue from your Version {selectedVersionIdx} implementation to refactor and evolve your design.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => handleConfirmLaunch('fresh')}
                className="w-full text-left p-3.5 rounded-xl border border-slate-700 hover:border-amber-500/60 bg-slate-900/60 hover:bg-slate-800/80 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white group-hover:text-amber-400">
                    Start Fresh
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    Recommended
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Begin with a clean starter template tailored specifically for Version {selectedVersionIdx + 1}.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleConfirmLaunch('continue')}
                className="w-full text-left p-3.5 rounded-xl border border-slate-700 hover:border-indigo-500/60 bg-slate-900/60 hover:bg-slate-800/80 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white group-hover:text-indigo-400">
                    Continue from Version {selectedVersionIdx} Code
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    Refactor
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Import your previous code snapshot into the workspace so you can refactor it live.
                </p>
              </button>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowVersionChoiceModal(false)}
                className="text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
