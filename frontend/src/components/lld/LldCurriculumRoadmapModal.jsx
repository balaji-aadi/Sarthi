import React, { useState } from 'react';
import { 
  IoClose, 
  IoCompassOutline, 
  IoCheckmarkCircle, 
  IoGitNetworkOutline, 
  IoLayersOutline, 
  IoRocketOutline, 
  IoBulbOutline,
  IoTerminalOutline
} from 'react-icons/io5';
import { LuTarget, LuSparkles, LuCompass } from 'react-icons/lu';

export const LLD_OUTCOMES = [
  {
    id: 1,
    title: "Break a real-world problem into meaningful objects",
    description: "Deconstruct ambiguous real-world requirements into clean, cohesive domain entities rather than procedural scripts or bloated God classes."
  },
  {
    id: 2,
    title: "Assign responsibilities to the right classes",
    description: "Apply Information Expert, Controller, and Creator principles to ensure every method lives on the class that owns the necessary data."
  },
  {
    id: 3,
    title: "Choose appropriate relationships between objects",
    description: "Differentiate and select with confidence between Composition, Aggregation, Association, Dependency, and Inheritance."
  },
  {
    id: 4,
    title: "Design clean interfaces and abstractions",
    description: "Create narrow, purposeful contracts that hide internal implementation details and decouple callers from concrete classes."
  },
  {
    id: 5,
    title: "Apply SOLID principles when design problems appear",
    description: "Use SRP, OCP, LSP, ISP, and DIP pragmatically as diagnostic tools to fix rigidity, fragility, and tight coupling."
  },
  {
    id: 6,
    title: "Recognize recurring design problems and choose appropriate patterns",
    description: "Identify structural bottlenecks, behavioral divergence, and creational complexity to apply proven GoF patterns naturally."
  },
  {
    id: 7,
    title: "Explain why you chose one design over another",
    description: "Articulate precise trade-offs (e.g. Strategy vs State, Decorator vs Inheritance, Value Object vs Primitive) in engineering discussions."
  },
  {
    id: 8,
    title: "Refactor a design when requirements change",
    description: "Embrace evolving requirements (V1 → V2 → V3) without tearing down existing code, extending functionality cleanly via polymorphism."
  },
  {
    id: 9,
    title: "Design and implement complete LLD systems",
    description: "Build full end-to-end architectures for Parking Lot, Elevator, Splitwise, Rate Limiter, Pub-Sub, Movie Booking, and Cache."
  },
  {
    id: 10,
    title: "Handle state, errors, edge cases, and testing",
    description: "Enforce state machine invariants, defensive bounds checks, custom exception hierarchies, and deterministic unit tests."
  },
  {
    id: 11,
    title: "Reason about concurrency where required",
    description: "Implement thread-safe locks, condition variables, expiring hold managers, and granular mutexes to eliminate race conditions."
  },
  {
    id: 12,
    title: "Communicate and defend your design in an LLD interview",
    description: "Lead 45-60 minute interview rounds with clear scoping, entity diagrams, contract drafts, and proactive complexity justifications."
  }
];

export const LLD_PHASES_ROADMAP = [
  {
    phase: "PHASE 1",
    title: "Object & C++ Foundations",
    badge: "3 Modules · 8 Units · 9 Drills",
    modules: [
      {
        code: "MODULE 1.1",
        title: "Object Lifecycle, Ownership & Dynamic Polymorphism",
        units: [
          {
            code: "UNIT 1.1.1",
            title: "Stack vs Heap Lifetime & Scope Destruction",
            steps: ["Learn object lifetime & RAII", "See tiny C++ example (TrackerBox)", "Understand deterministic destruction", "DRILL: Stack vs Heap Lifetime (LLDP1-D1.1.1)"]
          },
          {
            code: "UNIT 1.1.2",
            title: "Pointers, References & Object Ownership",
            steps: ["Learn member-by-value vs pointer semantics", "See tiny C++ example (Engine & Car)", "Understand sharing vs copy traps", "DRILL: Object Ownership Refactor (LLDP1-D1.1.2)"]
          },
          {
            code: "UNIT 1.1.3",
            title: "Abstraction, Inheritance & Dynamic Polymorphism",
            steps: ["Learn dynamic dispatch & virtual tables", "Learn virtual destructors to prevent memory leaks", "See tiny C++ example (PaymentMethod)", "DRILL: One Pointer → Different Types (LLDP1-D1.1.3)"]
          }
        ]
      },
      {
        code: "MODULE 1.2",
        title: "State Encapsulation, Immutability & Object Relationships",
        units: [
          {
            code: "UNIT 1.2.1",
            title: "Defending State Invariants",
            steps: ["Learn invariant defense & private collections", "DRILL: ShoppingCart Invariants Refactor (LLDP1-D1.2.1)"]
          },
          {
            code: "UNIT 1.2.2",
            title: "Value Objects & Immutability",
            steps: ["Learn primitive obsession & currency guards", "DRILL: Money Value Object Implementation (LLDP1-D1.2.2)"]
          },
          {
            code: "UNIT 1.2.3",
            title: "Composition vs Aggregation vs Association",
            steps: ["Learn lifecycle coupling & UML relationships", "DRILL: University Modeling Drill (LLDP1-D1.2.3)"]
          },
          {
            code: "UNIT 1.2.4",
            title: "Law of Demeter & Tell Don't Ask",
            steps: ["Learn train-wreck chains & encapsulation", "DRILL: Order Delivery Pipeline Refactor (LLDP1-D1.2.4)"]
          },
          {
            code: "UNIT 1.2.5",
            title: "Composition Over Inheritance",
            steps: ["Learn combinatorial explosion of subclasses", "DRILL: Notification Dispatcher Refactor (LLDP1-D1.2.5)"]
          }
        ]
      },
      {
        code: "MODULE 1.3",
        title: "OOAD Responsibility Assignment & First System",
        units: [
          {
            code: "UNIT 1.3.1",
            title: "Information Expert & Controller Assignment",
            steps: ["Learn GRASP principles & clean routing", "DRILL: Digital Wallet Core System (LLDP1-D1.3.1)"]
          }
        ],
        majorProblem: "MAJOR PROBLEM 1: Multi-Floor Parking Lot System (V1 → V2 → V3 → V4)"
      }
    ]
  },
  {
    phase: "PHASE 2",
    title: "SOLID Principles & Clean OOAD",
    badge: "3 Modules · 11 Units · 10 Drills",
    modules: [
      {
        code: "MODULE 2.1",
        title: "Single Responsibility & Interface Segregation",
        units: [
          { code: "UNIT 2.1.1", title: "Single Responsibility Principle (SRP)", steps: ["Isolate change reasons", "DRILL: Report Document Split"] },
          { code: "UNIT 2.1.2", title: "Interface Segregation Principle (ISP)", steps: ["Decompose fat interfaces", "DRILL: Worker Capability Split"] }
        ]
      },
      {
        code: "MODULE 2.2",
        title: "Open-Closed, Liskov & Dependency Inversion",
        units: [
          { code: "UNIT 2.2.1", title: "Open-Closed Principle (OCP)", steps: ["Eliminate switch conditionals", "DRILL: Payment Gateway Extensibility"] },
          { code: "UNIT 2.2.2", title: "Liskov Substitution Principle (LSP)", steps: ["Preconditions, postconditions, Square/Rectangle", "DRILL: Bird Flying Hierarchy Fix"] },
          { code: "UNIT 2.2.3", title: "Dependency Inversion Principle (DIP)", steps: ["Invert high-level coupling to abstractions", "DRILL: Notification Service Decoupling"] }
        ]
      },
      {
        code: "MODULE 2.3",
        title: "Code Smells & Refactoring Catalogs",
        units: [
          { code: "UNIT 2.3.1 - 2.3.6", title: "Refactoring Catalog", steps: ["Long Method, Primitive Obsession, Feature Envy, Shotgun Surgery, Speculative Generality", "DRILL: Audio Streaming Engine Refactor"] }
        ],
        majorProblem: "MAJOR PROBLEMS: Smart Vending Machine & Amazon Locker System"
      }
    ]
  },
  {
    phase: "PHASE 3",
    title: "Design Patterns & Production Systems",
    badge: "5 Modules · 15 Units · 16 Drills",
    modules: [
      {
        code: "MODULE 3.1",
        title: "Behavioral Patterns (Strategy, Observer, State, Command)",
        units: [
          { code: "UNIT 3.1.1 - 3.1.4", title: "Dynamic Behavior & Events", steps: ["Strategy (Shipping), Observer (Stock Ticker), State (Order Workflow), Command (Text Editor Undo/Redo)"] }
        ]
      },
      {
        code: "MODULE 3.2",
        title: "Creational Patterns (Factory Method, Abstract Factory, Builder, Prototype)",
        units: [
          { code: "UNIT 3.2.1 - 3.2.4", title: "Object Creation Mastery", steps: ["Encapsulate instantiation, step-by-step construction, cloning"] }
        ]
      },
      {
        code: "MODULE 3.3",
        title: "Structural Patterns (Decorator, Adapter, Composite, Facade, Proxy, Flyweight)",
        units: [
          { code: "UNIT 3.3.1 - 3.3.6", title: "Object Composition & Wrappers", steps: ["Dynamic wrapper layering, incompatible API adaptation, tree structures, virtual proxies, memory footprint sharing"] }
        ]
      },
      {
        code: "MODULE 3.4 & 3.5",
        title: "Pattern Composites & Anti-Pattern Traps",
        units: [
          { code: "UNIT 3.4.1 - 3.5.2", title: "Production Composites", steps: ["Singleton hidden globals, God Object elimination, Combining Strategy + Factory + Observer"] }
        ],
        majorProblem: "MAJOR PROBLEMS: Uber Dispatch, Hotel Booking, Coffee Machine, Pub-Sub Broker"
      }
    ]
  },
  {
    phase: "PHASE 4",
    title: "Concurrency & Thread-Safety Primitives",
    badge: "2 Modules · 4 Units · 6 Drills",
    modules: [
      {
        code: "MODULE 4.1 & 4.2",
        title: "Locks, Condition Variables & High-Contention Queues",
        units: [
          { code: "UNIT 4.1.1 - 4.2.2", title: "Thread-Safe Primitives", steps: ["std::mutex & std::lock_guard", "Condition Variables & Bounded Blocking Queue", "Expiring Lock Manager (Hold State)", "Deadlock avoidance with std::lock"] }
        ],
        majorProblem: "MAJOR PROBLEM: Concurrent Movie Ticket Booking (Granular Seat Locking)"
      }
    ]
  },
  {
    phase: "PHASE 5",
    title: "High-Speed Interview Execution",
    badge: "4 Modules · 5 Units · 7 Drills",
    modules: [
      {
        code: "MODULE 5.1 - 5.4",
        title: "Interview Rubrics, Scoping & Live Coding",
        units: [
          { code: "UNIT 5.1.1 - 5.4.1", title: "45-Minute Interview Playbook", steps: ["Requirements Clarification (0-5m)", "Domain Skeleton & Entities (5-15m)", "Service Logic & Invariant Defense (15-35m)", "Extensibility & Concurrency (35-45m)"] }
        ],
        majorProblem: "CAPSTONE DRILLS: Live Mock System Design Drills"
      }
    ]
  }
];

/**
 * LldCurriculumRoadmapModal
 * Full-screen modal styled 100% strictly with Sarthi's primary (Vermilion) and secondary (Slate) colors.
 */
export default function LldCurriculumRoadmapModal({ isOpen, onClose, initialTab = 'outcomes' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedPhaseIndex, setSelectedPhaseIndex] = useState(0);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 text-textMain dark:text-slate-100 rounded-2xl shadow-2xl border border-borderLight dark:border-slate-800 w-full max-w-5xl h-[92vh] max-h-[900px] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header - Sarthi Standard Style */}
        <div className="px-6 py-4 border-b border-borderLight dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-vermilion-50 dark:bg-vermilion-950/40 text-primary flex items-center justify-center font-bold border border-vermilion-200 dark:border-vermilion-900/50">
              <IoCompassOutline size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                  Sarthi Curriculum
                </span>
                <span className="text-xs text-textSub">·</span>
                <span className="text-xs text-textSub font-medium">5 Phases · 43 Units · 48 Drills · 15 Systems</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-textMain dark:text-white leading-tight">
                Low-Level Design Roadmap & Target Outcomes
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-textSub hover:text-textMain hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
            title="Close (Esc)"
          >
            <IoClose size={22} />
          </button>
        </div>

        {/* Tab Switcher - Sarthi Primary & Neutral Tabs */}
        <div className="flex border-b border-borderLight dark:border-slate-800 px-6 bg-slate-50/50 dark:bg-slate-900/60 shrink-0">
          <button
            onClick={() => setActiveTab('outcomes')}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'outcomes'
                ? 'border-primary text-primary'
                : 'border-transparent text-textSub hover:text-textMain'
            }`}
          >
            <LuTarget size={15} />
            <span>What You Should Be Able To Do</span>
          </button>

          <button
            onClick={() => setActiveTab('roadmap')}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'roadmap'
                ? 'border-primary text-primary'
                : 'border-transparent text-textSub hover:text-textMain'
            }`}
          >
            <IoGitNetworkOutline size={15} />
            <span>Curriculum Roadmap & Tree</span>
          </button>

          <button
            onClick={() => setActiveTab('engine')}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'engine'
                ? 'border-primary text-primary'
                : 'border-transparent text-textSub hover:text-textMain'
            }`}
          >
            <IoBulbOutline size={15} />
            <span>How You Learn</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          
          {/* TAB 1: EXPECTED FINAL OUTCOMES */}
          {activeTab === 'outcomes' && (
            <div className="space-y-6">
              {/* Mission Statement Hero Box - Sarthi Vermilion Outline */}
              <div className="p-5 rounded-2xl bg-vermilion-50/50 dark:bg-vermilion-950/20 border border-vermilion-200/80 dark:border-vermilion-900/40 space-y-3">
                <div className="flex items-center gap-2 text-primary text-xs font-black uppercase tracking-widest">
                  <LuSparkles size={15} />
                  <span>The Core Philosophy</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-textMain dark:text-white">
                  After Completing This LLD Journey, You Should Be Able To...
                </h3>
                
                <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-borderLight dark:border-slate-700 space-y-2">
                  <p className="text-sm font-medium text-textSub dark:text-slate-300">
                    The learner should understand that the goal is not: <span className="line-through text-red-500 font-bold">"I memorized 23 design patterns."</span>
                  </p>
                  <p className="text-sm font-bold text-textMain dark:text-white">
                    The expected outcome is that you can decompose problems, assign responsibilities to the right classes, defend state invariants, and build maintainable production code.
                  </p>
                </div>
              </div>

              {/* 12 Competencies Grid - Clean Sarthi Surface Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {LLD_OUTCOMES.map((item) => (
                  <div 
                    key={item.id}
                    className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-borderLight dark:border-slate-700 hover:border-primary/40 transition-all flex items-start gap-3 shadow-2xs"
                  >
                    <span className="w-6 h-6 rounded-lg bg-vermilion-50 dark:bg-vermilion-950/50 text-primary font-black text-xs flex items-center justify-center shrink-0 mt-0.5 border border-vermilion-200 dark:border-vermilion-900/40">
                      {item.id}
                    </span>
                    <div className="space-y-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-textMain dark:text-white leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-xs text-textSub dark:text-slate-400 leading-relaxed font-normal">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Concluding Signature Banner */}
              <div className="p-4 rounded-xl bg-slate-900 text-white text-center space-y-1 border border-slate-800">
                <p className="text-[11px] uppercase tracking-widest text-slate-400 font-bold">
                  Final Takeaway
                </p>
                <p className="text-sm sm:text-base font-bold text-vermilion-300">
                  "The goal is not to memorize designs. The goal is to learn how to design."
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: FULL CURRICULUM ROADMAP & TREE */}
          {activeTab === 'roadmap' && (
            <div className="space-y-6">
              {/* Phase Switcher Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
                {LLD_PHASES_ROADMAP.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedPhaseIndex(idx)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all cursor-pointer ${
                      selectedPhaseIndex === idx
                        ? 'bg-primary text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-textSub hover:text-textMain hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {p.phase}
                  </button>
                ))}
              </div>

              {/* Current Phase Title Card */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-borderLight dark:border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-primary">
                    {LLD_PHASES_ROADMAP[selectedPhaseIndex].phase}
                  </span>
                  <h3 className="text-base font-bold text-textMain dark:text-white">
                    {LLD_PHASES_ROADMAP[selectedPhaseIndex].title}
                  </h3>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-white dark:bg-slate-700 text-textSub dark:text-slate-300 border border-borderLight dark:border-slate-600">
                  {LLD_PHASES_ROADMAP[selectedPhaseIndex].badge}
                </span>
              </div>

              {/* Hierarchical Tree Cards */}
              <div className="space-y-4">
                {LLD_PHASES_ROADMAP[selectedPhaseIndex].modules.map((mod, mIdx) => (
                  <div key={mIdx} className="p-5 rounded-xl bg-white dark:bg-slate-800 border border-borderLight dark:border-slate-700 shadow-2xs space-y-4">
                    {/* Module Title */}
                    <div className="flex items-center gap-2.5 pb-3 border-b border-borderLight dark:border-slate-700">
                      <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200">
                        {mod.code}
                      </span>
                      <h4 className="text-sm sm:text-base font-bold text-textMain dark:text-white">
                        {mod.title}
                      </h4>
                    </div>

                    {/* Units Inside Module */}
                    <div className="space-y-3 pl-3 sm:pl-4 border-l-2 border-slate-200 dark:border-slate-700">
                      {mod.units.map((unit, uIdx) => (
                        <div key={uIdx} className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-850 border border-borderLight dark:border-slate-700 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-bold text-primary">
                              {unit.code}
                            </span>
                            <span className="text-[10px] font-bold text-textSub">
                              Teaching Node + Drill
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm font-bold text-textMain dark:text-slate-200">
                            {unit.title}
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                            {unit.steps.map((step, sIdx) => (
                              <div key={sIdx} className="flex items-center gap-2 text-[11px] text-textSub dark:text-slate-400 font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                <span>{step}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Major Problem Callout */}
                    {mod.majorProblem && (
                      <div className="p-3 rounded-lg bg-vermilion-50 dark:bg-vermilion-950/30 border border-vermilion-200 dark:border-vermilion-900/50 flex items-center gap-2 text-xs font-bold text-primary">
                        <IoRocketOutline className="text-sm shrink-0" />
                        <span>{mod.majorProblem}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Reference Diagram Code Snippet */}
              <div className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs space-y-2 border border-slate-800">
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider border-b border-slate-800 pb-2">
                  <IoTerminalOutline className="text-sm" />
                  <span>Curriculum Tree Structure</span>
                </div>
                <pre className="overflow-x-auto whitespace-pre leading-relaxed custom-scrollbar text-slate-300 text-[11px] sm:text-xs">
{`PHASE 1
│
└── MODULE 1.1
      │
      ├── UNIT 1.1.1
      │     ├── Learn object lifetime
      │     ├── See tiny C++ example (TrackerBox)
      │     ├── Understand it
      │     └── DRILL: Stack vs Heap Lifetime
      │
      ├── UNIT 1.1.2
      │     ├── Learn pointers/references/ownership
      │     └── DRILL: Object Ownership Refactor
      │
      └── UNIT 1.1.3
            ├── Learn abstraction
            ├── Learn inheritance
            ├── Learn polymorphism
            └── DRILL: One Pointer → Different Types`}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: THE PEDAGOGICAL ENGINE */}
          {activeTab === 'engine' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-borderLight dark:border-slate-700 space-y-1">
                <h3 className="text-sm font-bold text-textMain dark:text-white">
                  The Sarthi 3-Step Learning Engine
                </h3>
                <p className="text-xs text-textSub dark:text-slate-400 leading-relaxed">
                  Low-Level Design cannot be absorbed by reading theoretical books or copying boilerplates. Sarthi enforces an active, cognitive discovery loop inside every unit:
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-borderLight dark:border-slate-700 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-vermilion-50 dark:bg-vermilion-950/40 text-primary flex items-center justify-center font-black text-xs shrink-0 border border-vermilion-200 dark:border-vermilion-900/40">
                    1
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs sm:text-sm font-bold text-textMain dark:text-white">
                      Concept Notes / Theory Layer
                    </h4>
                    <p className="text-xs text-textSub dark:text-slate-400 leading-relaxed">
                      Explains <em>What Are We Trying To Solve?</em>, <em>What Is Going Wrong?</em>, and <em>The Simple Idea</em> in straightforward language without confusing jargon.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-borderLight dark:border-slate-700 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-vermilion-50 dark:bg-vermilion-950/40 text-primary flex items-center justify-center font-black text-xs shrink-0 border border-vermilion-200 dark:border-vermilion-900/40">
                    2
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs sm:text-sm font-bold text-textMain dark:text-white">
                      See It With a Tiny C++ Example
                    </h4>
                    <p className="text-xs text-textSub dark:text-slate-400 leading-relaxed">
                      A minimal 5-10 line code snippet isolates the exact mechanism (e.g. <code>TrackerBox("StackBox")</code> vs <code>new TrackerBox("HeapBox")</code>) so you observe behavior before writing code.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-borderLight dark:border-slate-700 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-vermilion-50 dark:bg-vermilion-950/40 text-primary flex items-center justify-center font-black text-xs shrink-0 border border-vermilion-200 dark:border-vermilion-900/40">
                    3
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs sm:text-sm font-bold text-textMain dark:text-white">
                      Isolated Practical Drill
                    </h4>
                    <p className="text-xs text-textSub dark:text-slate-400 leading-relaxed">
                      Step into the drill to defend state invariants, eliminate memory leaks, or refactor tight coupling with acceptance criteria and no spoilers.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-borderLight dark:border-slate-700 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-vermilion-50 dark:bg-vermilion-950/40 text-primary flex items-center justify-center font-black text-xs shrink-0 border border-vermilion-200 dark:border-vermilion-900/40">
                    4
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs sm:text-sm font-bold text-textMain dark:text-white">
                      Evolving Major Systems (V1 → V2 → V3 → V4)
                    </h4>
                    <p className="text-xs text-textSub dark:text-slate-400 leading-relaxed">
                      Real-world system simulations. Start with working V1, and extend the system to handle new requirements and concurrency without breaking existing code.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer - Sarthi Clean Action Bar */}
        <div className="px-6 py-3.5 border-t border-borderLight dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between shrink-0">
          <span className="text-xs text-textSub dark:text-slate-400 font-medium">
            17 Modules · 43 Units · 48 Drills · 15 Major Systems
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
