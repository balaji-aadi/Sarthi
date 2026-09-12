import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LuBookOpen, 
  LuSparkles, 
  LuClock, 
  LuLayers, 
  LuAlertTriangle, 
  LuCheckCircle2, 
  LuHelpCircle,
  LuChevronRight,
  LuArrowRight,
  LuGitCommit,
  LuTerminal,
  LuFlame,
  LuEye,
  LuCheckSquare
} from 'react-icons/lu';
import { getVersionEvolutionPresentation } from '../../../utils/lldPresentationMapper';

export default function LldProblemPanel({ taskData, currentTaskId }) {
  const navigate = useNavigate();
  const [showChoiceModal, setShowChoiceModal] = useState(false);
  const [selectedTargetVersion, setSelectedTargetVersion] = useState(null);

  if (!taskData?.task) return null;

  const { task, parentProblem, parentUnit, versionContext } = taskData;
  const meta = task.curriculumMeta || {};
  const sections = meta.sections || {};
  const isVersioned = task.taskType === 'ProblemVersion' || meta.nodeType === 'problem_version';

  // Extract from raw description markdown
  const desc = task.taskDescription || '';
  const whatChangedMatch = desc.match(/###\s*1\.\s*What Changed\?([\s\S]*?)(?=###|$)/i);
  const whyStrugglesMatch = desc.match(/###\s*2\.\s*Why Does the Previous Design Struggle\?([\s\S]*?)(?=###|$)/i);
  const newReqsMatch = desc.match(/###\s*3\.\s*New Requirements([\s\S]*?)(?=###|$)/i);
  const observableMatch = desc.match(/###\s*4\.\s*Expected Observable Behavior([\s\S]*?)(?=###|$)/i);
  const examplesMatch = desc.match(/###\s*5\.\s*Examples([\s\S]*?)(?=###|$)/i);
  const criteriaMatch = desc.match(/###\s*6\.\s*Acceptance Criteria([\s\S]*?)(?=###|$)/i);

  // Fallback / enrichment via presentation mapper
  const evolutionMeta = isVersioned ? getVersionEvolutionPresentation(task.taskId) : null;

  const whatChanged = whatChangedMatch ? whatChangedMatch[1].trim() : evolutionMeta?.whatChanged || '';
  const whyStruggles = whyStrugglesMatch ? whyStrugglesMatch[1].trim() : evolutionMeta?.whyPreviousStruggles || '';
  const newReqs = newReqsMatch ? newReqsMatch[1].trim() : evolutionMeta?.newRequirements || '';
  const observable = observableMatch ? observableMatch[1].trim() : '';
  const acceptanceCriteria = criteriaMatch ? criteriaMatch[1].trim() : '';

  const handleVersionClick = (targetVer, targetIdx) => {
    if (targetVer.taskId === task.taskId) return;

    // If target is V1 (index 0), navigate directly
    if (targetIdx === 0) {
      navigate(`/arena/lld/workspace/${targetVer.taskId}?mode=fresh`);
      return;
    }

    // For V2+, prompt learner for explicit choice
    setSelectedTargetVersion({ ver: targetVer, idx: targetIdx });
    setShowChoiceModal(true);
  };

  const handleConfirmNavigation = (mode) => {
    if (!selectedTargetVersion) return;
    const { ver, idx } = selectedTargetVersion;
    setShowChoiceModal(false);

    const prevVer = versionContext?.allVersions?.[idx - 1];
    const query = mode === 'continue' && prevVer
      ? `?mode=continue&from=${prevVer.taskId}`
      : `?mode=fresh`;

    navigate(`/arena/lld/workspace/${ver.taskId}${query}`);
  };

  return (
    <div className="h-full flex flex-col bg-[#0e1117] text-slate-200 overflow-y-auto custom-scrollbar p-5 space-y-6">
      {/* 1. Header & Context */}
      <div className="space-y-3 border-b border-[#1e232d] pb-4">
        {parentProblem && (
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-wider">
            <span className="text-amber-400 font-semibold">{parentProblem.taskId}</span>
            <span>/</span>
            <span className="truncate text-slate-300">{parentProblem.taskName}</span>
          </div>
        )}
        {parentUnit && (
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-wider">
            <span className="text-amber-400 font-semibold">{parentUnit.curriculumMeta?.unitCode || parentUnit.taskId}</span>
            <span>/</span>
            <span className="truncate text-slate-300">{parentUnit.taskName}</span>
          </div>
        )}

        <div className="flex items-start justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
            {task.taskName}
          </h1>
          <span className="text-xs font-mono text-slate-400 bg-[#161b22] px-2.5 py-1 rounded border border-[#1e232d] shrink-0">
            {task.taskId}
          </span>
        </div>

        {/* Metadata Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            {isVersioned ? 'Design Challenge Version' : 'Curriculum Drill'}
          </span>

          {meta.actionVerb && (
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#161b22] text-slate-300 border border-[#1e232d]">
              {meta.actionVerb}
            </span>
          )}

          {meta.difficulty && (
            <span className="px-2 py-0.5 rounded text-[11px] font-mono text-slate-400 bg-[#161b22] border border-[#1e232d]">
              {meta.difficulty.toUpperCase()}
            </span>
          )}

          {meta.targetTimeMinutes > 0 && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono text-slate-400 bg-[#161b22] border border-[#1e232d]">
              <LuClock className="w-3 h-3" />
              <span>~{meta.targetTimeMinutes} min</span>
            </span>
          )}
        </div>
      </div>

      {/* 2. Version Evolution Timeline (If Versioned) */}
      {versionContext?.isVersioned && versionContext.allVersions?.length > 0 && (
        <div className="bg-[#161b22] rounded-lg p-3.5 border border-[#1e232d] space-y-2.5">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5 font-semibold text-slate-300">
              <LuGitCommit className="w-3.5 h-3.5 text-amber-400" />
              <span>System Evolution Sequence</span>
            </span>
            <span className="text-amber-400">
              Version {versionContext.currentIndex + 1} of {versionContext.totalVersions}
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto py-1 custom-scrollbar">
            {versionContext.allVersions.map((ver, idx) => {
              const isActive = ver.taskId === task.taskId;
              return (
                <button
                  key={ver.taskId}
                  type="button"
                  onClick={() => handleVersionClick(ver, idx)}
                  className={`px-3 py-1 rounded text-xs font-mono transition-all shrink-0 border ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-sm'
                      : 'bg-[#0e1117] text-slate-400 hover:text-slate-200 hover:bg-[#1e232d] border-[#1e232d]'
                  }`}
                  title={ver.taskName}
                >
                  <span>V{idx + 1}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Problem Version: Architectural Evolution & Requirements */}
      {isVersioned && (
        <div className="space-y-4">
          {/* Section 1: What Changed */}
          {whatChanged && (
            <div className="bg-[#161b22] rounded-lg p-4 border border-[#1e232d] space-y-2">
              <h3 className="text-xs font-mono font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <LuSparkles className="w-3.5 h-3.5" />
                <span>1. What Changed in this Version</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line font-sans">
                {whatChanged}
              </p>
            </div>
          )}

          {/* Section 2: Why Previous Design Struggles */}
          {whyStruggles && (
            <div className="bg-amber-950/20 border border-amber-900/40 rounded-lg p-4 space-y-2">
              <h3 className="text-xs font-mono font-semibold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <LuAlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>2. Why Does the Previous Design Struggle?</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line font-sans">
                {whyStruggles}
              </p>
            </div>
          )}

          {/* Section 3: New Requirements */}
          {newReqs && (
            <div className="bg-[#161b22] rounded-lg p-4 border border-[#1e232d] space-y-2">
              <h3 className="text-xs font-mono font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <LuLayers className="w-3.5 h-3.5 text-amber-400" />
                <span>3. New Requirements & Constraints</span>
              </h3>
              <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line font-sans">
                {newReqs}
              </div>
            </div>
          )}

          {/* Section 4: Architectural Pressure & What to Reconsider */}
          {evolutionMeta?.architecturalPressure && (
            <div className="bg-[#161b22] rounded-lg p-4 border border-[#1e232d] space-y-2">
              <h3 className="text-xs font-mono font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <LuFlame className="w-3.5 h-3.5 text-amber-400" />
                <span>4. Architectural Pressure & Invariants</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {evolutionMeta.architecturalPressure}
              </p>
              {evolutionMeta.reconsiderPrompt && (
                <div className="mt-2 pt-2 border-t border-[#1e232d] text-xs text-slate-400 italic">
                  Reflect: {evolutionMeta.reconsiderPrompt}
                </div>
              )}
            </div>
          )}

          {/* Section 5: What to Observe & Test in main() */}
          {observable ? (
            <div className="bg-[#161b22] rounded-lg p-4 border border-[#1e232d] space-y-2">
              <h3 className="text-xs font-mono font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <LuEye className="w-3.5 h-3.5 text-amber-400" />
                <span>5. Expected Observable Behavior</span>
              </h3>
              <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line font-sans">
                {observable}
              </div>
            </div>
          ) : (
            <div className="bg-[#161b22] rounded-lg p-4 border border-[#1e232d] space-y-2">
              <h3 className="text-xs font-mono font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <LuTerminal className="w-3.5 h-3.5 text-amber-400" />
                <span>5. Verification via main()</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Instantiate your collaborating classes and invoke their methods inside <code className="text-amber-400">main()</code>. Output the state transitions to <code className="text-amber-400">stdout</code> to confirm proper encapsulation and polymorphism.
              </p>
            </div>
          )}

          {/* Section 6: Acceptance Criteria */}
          {acceptanceCriteria && (
            <div className="bg-emerald-950/20 rounded-lg p-4 border border-emerald-900/40 space-y-2">
              <h3 className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <LuCheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>6. Acceptance Criteria</span>
              </h3>
              <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line font-sans">
                {acceptanceCriteria}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Curriculum Drill: Pedagogical Sections */}
      {!isVersioned && (
        <div className="space-y-4">
          {sections.goal && (
            <div className="bg-[#161b22] rounded-lg p-4 border border-[#1e232d] space-y-2">
              <h3 className="text-xs font-mono font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <LuBookOpen className="w-3.5 h-3.5" />
                <span>Exercise Goal</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">{sections.goal}</p>
            </div>
          )}

          {sections.whyThisMatters && (
            <div className="bg-[#161b22] rounded-lg p-4 border border-[#1e232d] space-y-2">
              <h3 className="text-xs font-mono font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <LuLayers className="w-3.5 h-3.5 text-amber-400" />
                <span>Why This Matters in Architecture</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">{sections.whyThisMatters}</p>
            </div>
          )}

          {sections.yourTask && (
            <div className="bg-[#161b22] rounded-lg p-4 border border-[#1e232d] space-y-2">
              <h3 className="text-xs font-mono font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <LuCheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Your Implementation Steps</span>
              </h3>
              <div className="text-xs text-slate-300 whitespace-pre-line leading-relaxed font-mono bg-[#0e1117] p-3 rounded border border-[#1e232d]">
                {sections.yourTask}
              </div>
            </div>
          )}

          {sections.whatToObserve && (
            <div className="bg-[#161b22] rounded-lg p-4 border border-[#1e232d] space-y-2">
              <h3 className="text-xs font-mono font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <LuEye className="w-3.5 h-3.5 text-amber-400" />
                <span>What to Observe</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">{sections.whatToObserve}</p>
            </div>
          )}

          {sections.successCriteria && (
            <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-lg p-4 space-y-2">
              <h3 className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <LuCheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>Success Criteria</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">{sections.successCriteria}</p>
            </div>
          )}

          {sections.thinkAbout && (
            <div className="bg-amber-950/20 border border-amber-900/40 rounded-lg p-4 space-y-2">
              <h3 className="text-xs font-mono font-semibold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <LuHelpCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Think About (Interview Reflection)</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">{sections.thinkAbout}</p>
            </div>
          )}

          {/* Fallback if no structured drill sections */}
          {!sections.goal && desc && (
            <div className="bg-[#161b22] rounded-lg p-4 border border-[#1e232d] text-xs text-slate-300 whitespace-pre-line leading-relaxed font-sans">
              {desc}
            </div>
          )}
        </div>
      )}

      {/* Explicit Version Evolution Choice Modal */}
      {showChoiceModal && selectedTargetVersion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn font-sans">
          <div className="bg-[#161b22] border border-[#1e232d] rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-semibold uppercase tracking-wider">
              <LuGitCommit className="w-4 h-4" />
              <span>Version Progression Choice</span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Switching to Version {selectedTargetVersion.idx + 1}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {selectedTargetVersion.ver.taskName}
              </p>
              <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                In real-world system evolution, requirements change. You can either build on top of your existing implementation from the previous version or start fresh with the standard template.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleConfirmNavigation('fresh')}
                className="p-3.5 rounded-lg bg-[#0e1117] hover:bg-[#1e232d] border border-[#1e232d] text-left transition-all group"
              >
                <div className="text-xs font-mono font-semibold text-slate-200 group-hover:text-white">
                  Start Fresh
                </div>
                <div className="text-[11px] text-slate-400 mt-1 leading-normal">
                  Clean starter template with the baseline interface definitions.
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleConfirmNavigation('continue')}
                className="p-3.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-left transition-all group"
              >
                <div className="text-xs font-mono font-semibold text-amber-300 group-hover:text-amber-200">
                  Continue Code →
                </div>
                <div className="text-[11px] text-slate-400 mt-1 leading-normal">
                  Carry forward your code from V{selectedTargetVersion.idx} and refactor it for new requirements.
                </div>
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowChoiceModal(false)}
                className="text-xs text-slate-400 hover:text-slate-200 px-3 py-1.5"
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
