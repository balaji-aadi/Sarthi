import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LuArrowLeft,
  LuHammer,
  LuBookOpen,
  LuSearch,
  LuPlay,
  LuClock,
  LuCheckCircle2,
  LuSparkles
} from 'react-icons/lu';
import LldModuleAccordion from './LldModuleAccordion';
import LldMajorProblemCard from './LldMajorProblemCard';
import { mapLldTasksToLearnerHierarchy, formatLearnerTitle } from '../../../utils/lldCurriculumMapper';

const ALL_CHAPTERS = [
  { key: 'LLDP1', num: 1, title: 'Chapter 1: Object-Oriented Design Foundations' },
  { key: 'LLDP2', num: 2, title: 'Chapter 2: SOLID & Clean Architecture' },
  { key: 'LLDP3', num: 3, title: 'Chapter 3: Design Patterns & Evolution' },
  { key: 'LLDP4', num: 4, title: 'Chapter 4: Concurrency & Production Systems' },
  { key: 'LLDP5', num: 5, title: 'Chapter 5: System Defense & Interview Arena' }
];

export default function LldPhaseView({ project, tasks = [], loading = false }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewFilter, setViewFilter] = useState('all'); // 'all' | 'learn' | 'challenges'

  const currentKey = (project?.key || 'LLDP1').toUpperCase();
  const currentChapter = ALL_CHAPTERS.find(p => p.key === currentKey) || ALL_CHAPTERS[0];

  // Derive learner hierarchy using authoritative mapper
  const { topics, designChallenges, totalLessonsCount, totalPracticesCount } = useMemo(() => {
    return mapLldTasksToLearnerHierarchy(tasks);
  }, [tasks]);

  // Determine current position (first uncompleted lesson)
  const allLessons = useMemo(() => topics.flatMap(t => t.lessons || []), [topics]);
  const currentLessonIdx = allLessons.findIndex(l => {
    const drills = l.drills || [];
    return drills.some(d => d.status !== 'done') || drills.length === 0;
  });
  const currentLesson = currentLessonIdx >= 0 ? allLessons[currentLessonIdx] : allLessons[0];
  const currentTopic = topics.find(t => t.lessons?.some(l => l._id === currentLesson?._id)) || topics[0];

  // Completed count
  const completedLessonsCount = allLessons.filter(l => {
    const drills = l.drills || [];
    return drills.length > 0 && drills.every(d => d.status === 'done');
  }).length;

  // Apply search query
  const filteredTopics = useMemo(() => {
    if (!searchQuery.trim()) return topics;
    const q = searchQuery.toLowerCase();
    return topics.filter(t => {
      const matchTopic = t.taskName?.toLowerCase().includes(q) || t.learnerTitle?.toLowerCase().includes(q);
      const matchLesson = t.lessons?.some(l =>
        l.taskName?.toLowerCase().includes(q) ||
        l.learnerTitle?.toLowerCase().includes(q) ||
        l.drills?.some(d => d.taskName?.toLowerCase().includes(q))
      );
      return matchTopic || matchLesson;
    });
  }, [topics, searchQuery]);

  const filteredChallenges = useMemo(() => {
    if (!searchQuery.trim()) return designChallenges;
    const q = searchQuery.toLowerCase();
    return designChallenges.filter(p =>
      p.taskName?.toLowerCase().includes(q) ||
      p.learnerTitle?.toLowerCase().includes(q) ||
      p.versions?.some(v => v.taskName?.toLowerCase().includes(q))
    );
  }, [designChallenges, searchQuery]);

  const cleanChapterName = project?.name
    ? project.name.replace(/^LLD Phase \d+:\s*/i, '')
    : currentChapter.title.replace(/^Chapter \d+:\s*/i, '');

  return (
    <div className="min-h-full w-full bg-[#0d1117] text-slate-200 pb-20">
      {/* Top Header Bar */}
      <div className="border-b border-slate-800/80 bg-gradient-to-b from-[#161b22] to-[#0d1117] px-6 py-6 sm:px-10 lg:px-16">
        <div className="">
          {/* Back Navigation & Chapter Switcher */}
          <div className="flex items-center justify-between gap-4 mb-4">
            <button
              type="button"
              onClick={() => navigate('/arena/lld')}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <LuArrowLeft size={14} />
              <span>Back to Chapters Overview</span>
            </button>

            {/* Chapter Switcher Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {ALL_CHAPTERS.map((c) => {
                const isActive = c.key === currentKey;
                return (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => navigate(`/arena/${c.key.toLowerCase()}`)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${isActive
                      ? 'bg-primary text-white border-primary shadow-xs shadow-primary/30'
                      : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                  >
                    Chapter {c.num}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chapter Title & Stats */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/15 text-primary border border-primary/30">
                  Chapter {currentChapter.num}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {completedLessonsCount} of {totalLessonsCount} Lessons Completed
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {cleanChapterName}
              </h1>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64 shrink-0">
              <LuSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search lessons & challenges..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary/60"
              />
            </div>
          </div>

          {/* Contextual "What Should I Do Next?" Hero Banner */}
          {currentLesson && (
            <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-primary/15 via-[#1a2133] to-[#161b22] border border-primary/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-primary/5">
              <div className="min-w-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 mb-1">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span>Your Current Position</span>
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white truncate">
                  {currentTopic ? `${currentTopic.learnerTitle} → ` : ''}{currentLesson.learnerTitle}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Understand core principles and immediately test them in coding practice.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate(`/arena/lld/chapter/${currentChapter.num}/lesson/${currentLesson.taskId || currentLesson._id}`)}
                className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primaryHover text-white text-xs sm:text-sm font-bold shadow-md shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <LuPlay size={14} className="fill-current" />
                <span>Continue Lesson →</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-6 sm:px-10 lg:px-16 mt-10 space-y-12">
        {/* Part 1: Learn & Practice */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <LuBookOpen size={18} className="text-indigo-400" />
                <span>Learn & Practice</span>
              </h2>
              <p className="text-xs text-slate-400">
                Explore foundational topics sequentially. Each lesson leads directly into coding practice.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {filteredTopics.length} Topics · {totalLessonsCount} Lessons
            </span>
          </div>

          {filteredTopics.length === 0 ? (
            <div className="p-10 text-center rounded-2xl border border-slate-800 bg-[#161b22]/50 text-slate-400 text-sm">
              No matching lessons found for "{searchQuery}".
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTopics.map((topic, idx) => {
                const hasCurrentLesson = topic.lessons?.some(l => l._id === currentLesson?._id);
                return (
                  <LldModuleAccordion
                    key={topic._id || topic.taskId}
                    module={topic}
                    defaultExpanded={hasCurrentLesson || idx === 0}
                    index={idx}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Part 2: Design Challenges (Build Real Systems) */}
        {filteredChallenges.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <LuHammer size={18} className="text-amber-400" />
                  <span>Design Challenges</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Build complete systems and evolve your design version by version as requirements become complex.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {filteredChallenges.length} {filteredChallenges.length === 1 ? 'Challenge' : 'Challenges'}
              </span>
            </div>

            <div className="space-y-6">
              {filteredChallenges.map((prob, idx) => (
                <LldMajorProblemCard key={prob._id || prob.taskId} problem={prob} index={idx} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
