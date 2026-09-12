import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LuBookOpen, 
  LuClock, 
  LuCheckCircle2, 
  LuPlay,
  LuArrowRight,
  LuSparkles
} from 'react-icons/lu';
import { formatLearnerTitle } from '../../../utils/lldCurriculumMapper';
import LldLessonModal from './LldLessonModal';

export default function LldUnitAccordion({ unit, index = 0, isCurrent = false }) {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!unit) return null;

  const meta = unit.curriculumMeta || {};
  const drills = unit.drills || [];
  const targetMinutes = meta.targetTimeMinutes || 20;
  const primaryDrill = drills[0];

  const cleanTitle = unit.learnerTitle || formatLearnerTitle(unit.taskName);

  // Completion calculation
  const completedDrills = drills.filter(d => d.status === 'done').length;
  const isLessonCompleted = drills.length > 0 && completedDrills === drills.length;

  const handleStartPractice = (e) => {
    e.stopPropagation();
    if (!primaryDrill) return;
    navigate(`/arena/lld/workspace/${primaryDrill.taskId || primaryDrill._id}`);
  };

  const handleOpenLesson = (e) => {
    e?.stopPropagation();
    navigate(`/arena/lld/lesson/${unit.taskId || unit._id}`);
  };

  return (
    <div 
      onClick={handleOpenLesson}
      className={`group p-4 rounded-xl border transition-all duration-150 cursor-pointer select-none flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        isCurrent
          ? 'border-primary/60 bg-primary/5 shadow-md shadow-primary/10 ring-1 ring-primary/30'
          : isLessonCompleted
          ? 'border-emerald-500/30 bg-emerald-950/10 hover:bg-emerald-950/20'
          : 'border-slate-800/80 bg-[#161b22]/50 hover:bg-[#161b22]/90 hover:border-slate-700'
      }`}
    >
      <div className="flex items-start sm:items-center gap-3.5 min-w-0">
        {/* Status Icon */}
        <div className={`mt-0.5 sm:mt-0 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
          isLessonCompleted
            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
            : isCurrent
            ? 'bg-primary/20 text-primary border-primary/40'
            : 'bg-slate-800 text-slate-400 border-slate-700'
        }`}>
          {isLessonCompleted ? (
            <LuCheckCircle2 size={16} />
          ) : isCurrent ? (
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
          ) : (
            <LuBookOpen size={14} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${
              isCurrent ? 'text-primary' : 'text-slate-400'
            }`}>
              Lesson {index + 1}
            </span>

            {isCurrent && (
              <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-primary/20 text-primary border border-primary/30">
                Current
              </span>
            )}

            <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
              <LuClock size={11} />
              <span>~{targetMinutes} min</span>
            </span>
          </div>

          <h3 className="text-sm sm:text-base font-semibold text-white group-hover:text-primary transition-colors truncate">
            {cleanTitle}
          </h3>
        </div>
      </div>

      {/* Action CTAs */}
      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
        <button
          type="button"
          onClick={handleOpenLesson}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          Read Lesson
        </button>

        {primaryDrill && (
          <button
            type="button"
            onClick={handleStartPractice}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primaryHover text-white text-xs font-bold shadow-xs shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            title="Start Practice in LLD Workspace"
          >
            <LuPlay size={12} className="fill-current" />
            <span>Start Practice →</span>
          </button>
        )}
      </div>
    </div>
  );
}
