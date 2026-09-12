import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LuCompass, 
  LuLayers, 
  LuHammer, 
  LuTerminal, 
  LuArrowRight, 
  LuSparkles, 
  LuBookOpen, 
  LuCode2, 
  LuCheckCircle2, 
  LuClock,
  LuPlay
} from 'react-icons/lu';
import { TaskApi } from '../../../services/api/Task.api';

const CHAPTER_STATIC_INFO = [
  {
    key: 'LLDP1',
    chapterNumber: 1,
    title: 'Object-Oriented Design Foundations',
    shortTitle: 'Chapter 1: OOAD & Domain Modeling',
    tagline: 'Master object lifecycle, memory allocation, RAII, and domain entity relationships.',
    colorAccent: 'from-blue-500/20 via-indigo-500/10 to-transparent border-blue-500/30',
    badgeColor: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    targetHours: '~12 hrs',
    highlights: ['Stack vs Heap & RAII', 'Encapsulation & Immutability', 'Entity Lifecycle', 'Composition vs Inheritance'],
    majorProblems: ['Vending Machine', 'Tic Tac Toe', 'Coffee Maker', 'Library Management']
  },
  {
    key: 'LLDP2',
    chapterNumber: 2,
    title: 'Code Smells & SOLID Principles',
    shortTitle: 'Chapter 2: SOLID & Clean Architecture',
    tagline: 'Refactor monolithic anti-patterns and apply SOLID principles to combat tight coupling.',
    colorAccent: 'from-emerald-500/20 via-teal-500/10 to-transparent border-emerald-500/30',
    badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    targetHours: '~14 hrs',
    highlights: ['Single Responsibility (SRP)', 'Open/Closed & Extensibility', 'Liskov Substitution', 'Dependency Inversion (DIP)'],
    majorProblems: ['Multi-Floor Parking Lot', 'Automated Teller Machine (ATM)', 'Car Rental System']
  },
  {
    key: 'LLDP3',
    chapterNumber: 3,
    title: 'Design Pattern Discovery Through Requirement Pain',
    shortTitle: 'Chapter 3: Design Patterns & Evolution',
    tagline: 'Discover GoF patterns naturally by experiencing the architectural pain that demands them.',
    colorAccent: 'from-purple-500/20 via-violet-500/10 to-transparent border-purple-500/30',
    badgeColor: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    targetHours: '~18 hrs',
    highlights: ['State & Strategy Transitions', 'Observer & Event Engines', 'Factory & Builder Paradigms', 'Decorator & Composite'],
    majorProblems: ['Elevator Control System', 'Splitwise Expense Sharing', 'Snake & Ladder Game', 'Multi-Channel Notification Engine']
  },
  {
    key: 'LLDP4',
    chapterNumber: 4,
    title: 'Production LLD Systems & High Concurrency',
    shortTitle: 'Chapter 4: Concurrency & Systems',
    tagline: 'Engineer high-concurrency systems, race-condition safety, and transactional consistency.',
    colorAccent: 'from-amber-500/20 via-orange-500/10 to-transparent border-amber-500/30',
    badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    targetHours: '~20 hrs',
    highlights: ['Mutex & Thread Synchronization', 'Deadlock Avoidance', 'Seat & Resource Locking', 'Dispatch Queues'],
    majorProblems: ['BookMyShow (Seat Locking)', 'Ride-Sharing Dispatch (Cab)', 'Chess Game Engine', 'Food Delivery Platform']
  },
  {
    key: 'LLDP5',
    chapterNumber: 5,
    title: 'System Defense & Senior Interview Simulation',
    shortTitle: 'Chapter 5: Interview Arena & Mocks',
    tagline: 'Simulate 45-minute live senior engineering rounds with explicit trade-off defenses.',
    colorAccent: 'from-rose-500/20 via-pink-500/10 to-transparent border-rose-500/30',
    badgeColor: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    targetHours: '~10 hrs',
    highlights: ['Clarifying Ambiguity (5 min)', 'API & Schema Defense (15 min)', 'Handling Changing Reqs (15 min)', 'Follow-ups & Bottlenecks (10 min)'],
    majorProblems: ['Live Architectural Scenarios', 'Trade-off Justifications', 'Production Hardening']
  }
];

export default function LldTrackHome({ activeBranch }) {
  const navigate = useNavigate();
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadTrackTasks = async () => {
      try {
        setLoading(true);
        const res = await TaskApi.getAllTasks({});
        if (isMounted) {
          setAllTasks(res.data?.data || []);
        }
      } catch (err) {
        console.error('Failed to load LLD tasks:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadTrackTasks();
    return () => { isMounted = false; };
  }, [activeBranch]);

  // Aggregate stats
  const totalTasksCount = allTasks.length;
  const completedTasksCount = allTasks.filter(t => t.status === 'done').length;

  // Find candidate for "Continue Where You Left Off"
  const inProgressTask = allTasks.find(t => 
    (t.status === 'inprogress' || (t.progress > 0 && t.status !== 'done')) &&
    (t.taskType === 'ProblemVersion' || t.taskType === 'CurriculumDrill')
  );
  const firstUnfinishedTask = allTasks.find(t => 
    t.status !== 'done' && 
    (t.taskType === 'ProblemVersion' || t.taskType === 'CurriculumDrill')
  );
  const continueTarget = inProgressTask || firstUnfinishedTask || allTasks[0];

  const handleContinue = () => {
    if (!continueTarget) return;
    if (continueTarget.taskType === 'ProblemVersion' || continueTarget.taskType === 'CurriculumDrill') {
      navigate(`/arena/lld/workspace/${continueTarget.taskId || continueTarget._id}`);
    } else {
      const pKey = continueTarget.projectName?.key?.toLowerCase() || 'lldp1';
      navigate(`/arena/${pKey}`);
    }
  };

  return (
    <div className="min-h-full w-full bg-[#0d1117] text-slate-200 pb-16">
      {/* Hero Header */}
      <div className="relative border-b border-slate-800/80 bg-gradient-to-b from-[#161b22] via-[#0d1117] to-[#0d1117] px-6 py-10 sm:px-10 lg:px-16 overflow-hidden">
        {/* Subtle Background Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-3/4 h-48 bg-primary/10 blur-3xl pointer-events-none rounded-full" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              {/* Mental model progression badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-semibold uppercase tracking-wider mb-3">
                <LuCompass size={13} className="text-primary" />
                <span>LEARN · PRACTICE · BUILD · EVOLVE</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
                Low-Level Design Learning Journey
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
                Master practical object-oriented architecture, SOLID principles, real-world design patterns, and high-concurrency systems through hands-on practice and evolving design challenges.
              </p>
            </div>

            {/* Quick Resume CTA */}
            {continueTarget && (
              <div className="shrink-0">
                <button
                  type="button"
                  onClick={handleContinue}
                  className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-gradient-to-r from-primary to-primaryHover text-white font-bold text-sm shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <LuPlay size={16} className="fill-current" />
                  <span>Continue Learning →</span>
                </button>
                {continueTarget.taskName && (
                  <p className="text-[11px] text-slate-400 text-right mt-1.5 truncate max-w-xs">
                    Next: <span className="text-slate-200 font-medium">{continueTarget.taskName.replace(/^(Version \d+:\s*|Problem \d+\s*—\s*)/i, '')}</span>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Progress Overview Strip */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#161b22]/70 rounded-xl p-3.5 border border-slate-800/60">
              <span className="text-xs text-slate-400 font-medium">Chapters</span>
              <div className="text-xl font-black text-white mt-0.5">5 Chapters</div>
              <span className="text-[11px] text-slate-500">Progressive Stages</span>
            </div>

            <div className="bg-[#161b22]/70 rounded-xl p-3.5 border border-slate-800/60">
              <span className="text-xs text-slate-400 font-medium">Design Challenges</span>
              <div className="text-xl font-black text-amber-400 mt-0.5">15 Systems</div>
              <span className="text-[11px] text-slate-500">79 Evolving Versions</span>
            </div>

            <div className="bg-[#161b22]/70 rounded-xl p-3.5 border border-slate-800/60">
              <span className="text-xs text-slate-400 font-medium">Lessons & Practice</span>
              <div className="text-xl font-black text-indigo-400 mt-0.5">43 Lessons</div>
              <span className="text-[11px] text-slate-500">48 Focused Activities</span>
            </div>

            <div className="bg-[#161b22]/70 rounded-xl p-3.5 border border-slate-800/60">
              <span className="text-xs text-slate-400 font-medium">Your Progress</span>
              <div className="text-xl font-black text-emerald-400 mt-0.5">
                {loading ? '...' : `${completedTasksCount} / ${totalTasksCount || 202}`}
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${totalTasksCount > 0 ? (completedTasksCount / totalTasksCount) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Chapter Progression Cards */}
      <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 mt-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Your Curriculum Journey</h2>
            <p className="text-xs text-slate-400">Select any chapter to explore its topics, lessons, coding practice, and design challenges.</p>
          </div>
        </div>

        <div className="space-y-6">
          {CHAPTER_STATIC_INFO.map((chapter) => {
            const chapterTasks = allTasks.filter(t => {
              const pKey = t.projectName?.key || '';
              return pKey.toUpperCase() === chapter.key.toUpperCase();
            });
            const cCompleted = chapterTasks.filter(t => t.status === 'done').length;
            const cTotal = chapterTasks.length;

            return (
              <div
                key={chapter.key}
                onClick={() => navigate(`/arena/${chapter.key.toLowerCase()}`)}
                className="group relative rounded-2xl border border-slate-800 bg-[#161b22]/80 hover:bg-[#161b22] hover:border-slate-700/80 transition-all duration-200 cursor-pointer shadow-md hover:shadow-xl overflow-hidden p-6 sm:p-7"
              >
                {/* Subtle top gradient accent */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${chapter.colorAccent}`} />

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Left Column: Chapter Header & Description */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${chapter.badgeColor}`}>
                        CHAPTER {chapter.chapterNumber}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                        <LuClock size={13} />
                        <span>{chapter.targetHours}</span>
                      </span>
                      {cTotal > 0 && (
                        <span className="text-xs text-slate-400 font-mono">
                          {cCompleted} / {cTotal} completed
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-primary transition-colors tracking-tight">
                      {chapter.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1.5 leading-relaxed">
                      {chapter.tagline}
                    </p>

                    {/* Highlights tags */}
                    <div className="flex flex-wrap gap-1.5 mt-3.5">
                      {chapter.highlights.map((h, i) => (
                        <span 
                          key={i} 
                          className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-300 font-medium"
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Featured Challenges & CTA */}
                  <div className="lg:w-80 shrink-0 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-800/80 pt-4 lg:pt-0 lg:pl-6">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                        {chapter.chapterNumber === 5 ? 'Interview Focus' : 'Design Challenges'}
                      </span>
                      <div className="space-y-1">
                        {chapter.majorProblems.map((prob, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                            <span className="truncate">{prob}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-end">
                      <span className="inline-flex items-center gap-2 text-xs font-bold text-primary group-hover:translate-x-1 transition-transform">
                        <span>Explore Chapter</span>
                        <LuArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
