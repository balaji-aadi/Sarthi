import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LuX, 
  LuPlay, 
  LuLightbulb, 
  LuEye, 
  LuHelpCircle, 
  LuClock, 
  LuBookOpen, 
  LuCode2, 
  LuTag, 
  LuArrowRight,
  LuCheckCircle2
} from 'react-icons/lu';
import { formatLearnerTitle } from '../../../utils/lldCurriculumMapper';

export default function LldLessonModal({ isOpen, onClose, lesson, onNextLesson }) {
  const navigate = useNavigate();

  if (!isOpen || !lesson) return null;

  const meta = lesson.curriculumMeta || {};
  const conceptTopics = meta.conceptTopics || [];
  const drills = lesson.drills || [];
  const primaryDrill = drills[0]; // Primary associated practice/reflection
  const drillMeta = primaryDrill?.curriculumMeta || {};
  const sections = drillMeta.sections || meta.sections || {};

  const cleanTitle = lesson.learnerTitle || formatLearnerTitle(lesson.taskName);
  const targetMinutes = meta.targetTimeMinutes || 20;

  // Determine if drill is conceptual or coding
  const verb = (drillMeta.actionVerb || '').toUpperCase();
  const isConceptual = verb === 'PREDICT' || verb === 'DEFEND' || drillMeta.levelName?.toLowerCase().includes('concept');

  const handleStartPractice = () => {
    if (!primaryDrill) return;
    onClose();
    navigate(`/arena/lld/workspace/${primaryDrill.taskId || primaryDrill._id}`);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fadeIn">
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl bg-[#111622] border border-slate-700/80 shadow-2xl overflow-hidden text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-[#161b22] to-[#111622] flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/15 text-primary border border-primary/30">
                Lesson
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                <LuClock size={12} />
                <span>~{targetMinutes} min</span>
              </span>
              {drills.length > 0 && (
                <span className="text-xs text-slate-400">
                  {drills.length} {drills.length === 1 ? 'activity' : 'activities'}
                </span>
              )}
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
              {cleanTitle}
            </h2>

            {/* Concept Topic Chips */}
            {conceptTopics.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {conceptTopics.map((topic, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/50 text-[11px] text-slate-300 font-medium"
                  >
                    <LuTag size={10} className="text-slate-400" />
                    <span>{topic}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close lesson"
          >
            <LuX size={20} />
          </button>
        </div>

        {/* Lesson Body — Existing Curriculum Metadata Only */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-5 text-sm leading-relaxed">
          {/* Goal / Objective */}
          {sections.goal && (
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 block">
                Learning Objective
              </span>
              <p className="text-slate-200">{sections.goal}</p>
            </div>
          )}

          {/* Why This Matters */}
          {sections.whyThisMatters && (
            <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-800/40 space-y-1.5 text-blue-200">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
                <LuLightbulb size={14} />
                <span>Why This Matters in Low-Level Design</span>
              </div>
              <p className="leading-relaxed">{sections.whyThisMatters}</p>
            </div>
          )}

          {/* What You Need to Do */}
          {sections.yourTask && (
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                Hands-On Task
              </span>
              <p className="text-slate-300 whitespace-pre-line leading-relaxed">{sections.yourTask}</p>
            </div>
          )}

          {/* What to Observe */}
          {sections.whatToObserve && (
            <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-800/40 space-y-1.5 text-purple-200">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400">
                <LuEye size={14} />
                <span>What to Observe</span>
              </div>
              <p className="leading-relaxed">{sections.whatToObserve}</p>
            </div>
          )}

          {/* Interview / Architecture Reflection */}
          {sections.thinkAbout && (
            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 space-y-1.5 text-amber-200">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                <LuHelpCircle size={14} />
                <span>Think About (Interview Reflection)</span>
              </div>
              <p className="leading-relaxed">{sections.thinkAbout}</p>
            </div>
          )}
        </div>

        {/* Footer with Explicit Contextual Action */}
        <div className="p-5 border-t border-slate-800 bg-[#0d1117] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            {primaryDrill ? (
              <span>Practice: <strong className="text-slate-200">{formatLearnerTitle(primaryDrill.taskName)}</strong></span>
            ) : (
              <span>Review lesson foundations</span>
            )}
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            {onNextLesson && (
              <button
                type="button"
                onClick={onNextLesson}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Next Lesson →
              </button>
            )}

            {primaryDrill && (
              <button
                type="button"
                onClick={handleStartPractice}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primaryHover text-white font-bold text-xs sm:text-sm shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <LuPlay size={14} className="fill-current" />
                <span>{isConceptual ? 'Reflect in Workspace →' : 'Start Practice →'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
