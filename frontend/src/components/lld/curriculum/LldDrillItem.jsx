import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LuCode2, 
  LuLightbulb, 
  LuPlay, 
  LuChevronDown, 
  LuChevronUp, 
  LuCheckCircle2, 
  LuClock, 
  LuHelpCircle, 
  LuEye,
  LuSparkles
} from 'react-icons/lu';
import { formatLearnerTitle } from '../../../utils/lldCurriculumMapper';

export default function LldDrillItem({ drill, index = 0 }) {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!drill) return null;

  const meta = drill.curriculumMeta || {};
  const sections = meta.sections || {};
  const verb = (meta.actionVerb || '').toUpperCase();
  const isCompleted = drill.status === 'done';

  // Conceptual vs Practice
  const isConceptual = verb === 'PREDICT' || verb === 'DEFEND' || meta.levelName?.toLowerCase().includes('concept');
  const activityTypeLabel = isConceptual ? 'Think / Discuss' : 'Practice';
  const targetMinutes = meta.targetTimeMinutes || 15;
  const cleanTitle = formatLearnerTitle(drill.taskName);

  const handleLaunchWorkspace = (e) => {
    e.stopPropagation();
    navigate(`/arena/lld/workspace/${drill.taskId || drill._id}`);
  };

  return (
    <div className={`rounded-xl border transition-all duration-150 overflow-hidden ${
      isCompleted 
        ? 'border-emerald-500/30 bg-emerald-950/10' 
        : 'border-slate-800 bg-[#161b22]/50 hover:bg-[#161b22]/90 hover:border-slate-700'
    }`}>
      {/* Header Row */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
      >
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div className={`mt-0.5 sm:mt-0 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
            isCompleted 
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
              : isConceptual 
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/25' 
              : 'bg-primary/10 text-primary border-primary/25'
          }`}>
            {isCompleted ? (
              <LuCheckCircle2 size={16} />
            ) : isConceptual ? (
              <LuLightbulb size={15} />
            ) : (
              <LuCode2 size={15} />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-[10.5px] font-bold uppercase tracking-wider border ${
                isConceptual 
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/25' 
                  : 'bg-blue-500/10 text-blue-400 border-blue-500/25'
              }`}>
                {activityTypeLabel}
              </span>

              <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                <LuClock size={11} />
                <span>~{targetMinutes} min</span>
              </span>
            </div>

            <h4 className="text-sm font-semibold text-white mt-1 group-hover:text-primary transition-colors truncate">
              {cleanTitle}
            </h4>

            {meta.oneLineSummary && (
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                {meta.oneLineSummary}
              </p>
            )}
          </div>
        </div>

        {/* Action Button & Expand Toggle */}
        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <button
            type="button"
            onClick={handleLaunchWorkspace}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              isConceptual
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                : 'bg-primary hover:bg-primaryHover text-white shadow-xs shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]'
            }`}
            title={isConceptual ? 'Reflect & Explore in Workspace' : 'Start Coding Practice'}
          >
            <LuPlay size={13} className="fill-current" />
            <span>{isConceptual ? 'Reflect' : 'Start Practice'}</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={isExpanded ? 'Collapse' : 'Expand Details'}
          >
            {isExpanded ? <LuChevronUp size={16} /> : <LuChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Expanded Pedagogical Details */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-slate-800/80 bg-[#0d1117]/60 space-y-3 text-xs leading-relaxed">
          {sections.goal && (
            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
              <span className="font-bold text-white block mb-1">What you will do:</span>
              <p>{sections.goal}</p>
            </div>
          )}

          {sections.whyThisMatters && (
            <div className="p-3 rounded-lg bg-blue-950/20 border border-blue-800/40 text-blue-200">
              <div className="flex items-center gap-1.5 font-bold text-blue-400 mb-1">
                <LuLightbulb size={13} />
                <span>Why this matters:</span>
              </div>
              <p>{sections.whyThisMatters}</p>
            </div>
          )}

          {sections.whatToObserve && (
            <div className="p-3 rounded-lg bg-purple-950/20 border border-purple-800/40 text-purple-200">
              <div className="flex items-center gap-1.5 font-bold text-purple-400 mb-1">
                <LuEye size={13} />
                <span>What to observe:</span>
              </div>
              <p>{sections.whatToObserve}</p>
            </div>
          )}

          {sections.thinkAbout && (
            <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-800/40 text-amber-200">
              <div className="flex items-center gap-1.5 font-bold text-amber-400 mb-1">
                <LuHelpCircle size={13} />
                <span>Think about:</span>
              </div>
              <p>{sections.thinkAbout}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
