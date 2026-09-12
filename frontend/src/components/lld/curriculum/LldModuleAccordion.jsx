import React, { useState } from 'react';
import { 
  LuFolder, 
  LuFolderOpen, 
  LuChevronDown, 
  LuChevronUp, 
  LuBookOpen, 
  LuCode2, 
  LuCheckCircle2
} from 'react-icons/lu';
import LldUnitAccordion from './LldUnitAccordion';
import { formatLearnerTitle } from '../../../utils/lldCurriculumMapper';

export default function LldModuleAccordion({ module, defaultExpanded = true, index = 0 }) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (!module) return null;

  const lessons = module.lessons || [];
  
  // Calculate aggregate activities across all lessons in this topic
  const allDrills = lessons.flatMap(u => u.drills || []);
  const completedDrills = allDrills.filter(d => d.status === 'done').length;
  const isTopicCompleted = allDrills.length > 0 && completedDrills === allDrills.length;

  const cleanTitle = module.learnerTitle || formatLearnerTitle(module.taskName);

  return (
    <div className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
      isTopicCompleted
        ? 'border-emerald-500/30 bg-[#161b22]/90'
        : 'border-slate-800 bg-[#161b22]/70 hover:border-slate-700'
    }`}>
      {/* Topic Header */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-5 flex items-center justify-between gap-4 cursor-pointer select-none bg-gradient-to-r from-slate-900/40 to-transparent hover:bg-slate-800/40 transition-colors"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
            isTopicCompleted
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
              : 'bg-primary/10 text-primary border-primary/25'
          }`}>
            {isExpanded ? <LuFolderOpen size={18} /> : <LuFolder size={18} />}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                Topic {index + 1}
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-400">
                {lessons.length} {lessons.length === 1 ? 'Lesson' : 'Lessons'}
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-400">
                {allDrills.length} {allDrills.length === 1 ? 'Activity' : 'Activities'}
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-bold text-white mt-0.5 tracking-tight truncate">
              {cleanTitle}
            </h2>
          </div>
        </div>

        {/* Progress & Expand */}
        <div className="flex items-center gap-3 shrink-0">
          {allDrills.length > 0 && (
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">
                {completedDrills}/{allDrills.length}
              </span>
              <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-primary h-full rounded-full transition-all duration-300"
                  style={{ width: `${(completedDrills / allDrills.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          <div className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            {isExpanded ? <LuChevronUp size={20} /> : <LuChevronDown size={20} />}
          </div>
        </div>
      </div>

      {/* Lessons List */}
      {isExpanded && (
        <div className="p-5 pt-2 border-t border-slate-800/80 space-y-4 bg-[#0d1117]/40">
          {lessons.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 italic">
              No lessons defined for this topic yet.
            </div>
          ) : (
            lessons.map((lesson, lIdx) => (
              <LldUnitAccordion 
                key={lesson._id || lesson.taskId} 
                unit={lesson} 
                defaultExpanded={lIdx === 0} 
                index={lIdx}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
