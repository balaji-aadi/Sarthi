import React, { useState, useEffect, useMemo } from 'react';
import {
  IoClose,
  IoTimeOutline,
  IoPlayOutline,
  IoPauseOutline,
  IoCheckmarkCircleOutline,
  IoBulbOutline,
  IoLockClosedOutline,
  IoCodeSlashOutline,
  IoDocumentTextOutline,
  IoPencilOutline,
  IoSparklesOutline,
  IoShieldCheckmarkOutline,
  IoChevronForwardOutline,
  IoChevronBackOutline,
  IoRefreshOutline
} from 'react-icons/io5';
import { TaskApi } from '../../services/api/Task.api';
import toast from 'react-hot-toast';
import CurriculumContentRenderer from './CurriculumContentRenderer';

const DEFAULT_CPP_BOILERPLATE = `// C++ Foundations for Low Level Design
// Implement your modular, extensible class architecture below

#include <iostream>
#include <string>
#include <vector>
#include <memory>
#include <unordered_map>
#include <stdexcept>

// 1. Core Domain Interfaces & Entities

// 2. State / Strategy Implementations

// 3. Main Controller / System Facade

int main() {
    std::cout << "Starting LLD test execution..." << std::endl;
    // Instantiate your system and execute test scenarios
    return 0;
}
`;

export default function MajorProblemWorkspace({ isOpen, onClose, problem, initialMode = 'learning' }) {
  if (!isOpen || !problem) return null;

  const [mode, setMode] = useState(initialMode); // 'learning' | 'interview'
  const [activeTab, setActiveTab] = useState('problem'); // 'problem' | 'design' | 'code' | 'tests' | 'review'
  const [versions, setVersions] = useState([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [activeVersionIndex, setActiveVersionIndex] = useState(0);

  // Progressive Hints (Learning Mode only)
  const [unlockedHintIndex, setUnlockedHintIndex] = useState(-1); // -1 = none unlocked

  // Interview Mode Timer
  const targetMinutes = problem.curriculumMeta?.targetTimeMinutes || 75;
  const [secondsRemaining, setSecondsRemaining] = useState(targetMinutes * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Code & Design Scratchpad (persisted in local state per problem)
  const storagePrefix = `sarthi_lld_workspace_${problem._id}`;
  const [code, setCode] = useState(() => {
    return localStorage.getItem(`${storagePrefix}_code`) || DEFAULT_CPP_BOILERPLATE;
  });
  const [designNotes, setDesignNotes] = useState(() => {
    return localStorage.getItem(`${storagePrefix}_design`) || '';
  });

  // Zero-Spoiler Gate for Review
  const [hasAttempted, setHasAttempted] = useState(() => {
    return localStorage.getItem(`${storagePrefix}_attempted`) === 'true';
  });

  const getVersionNumber = (t, defaultIdx = 0) => {
    if (!t) return defaultIdx + 1;
    if (t.curriculumMeta?.versionNumber) return t.curriculumMeta.versionNumber;
    const fromId = t.taskId?.match(/-V(\d+)$/i)?.[1];
    if (fromId) return parseInt(fromId, 10);
    const fromTitle = t.taskName?.match(/Version\s*(\d+)/i)?.[1];
    if (fromTitle) return parseInt(fromTitle, 10);
    return defaultIdx + 1;
  };

  // Fetch Problem Versions
  useEffect(() => {
    const fetchVersions = async () => {
      setLoadingVersions(true);
      try {
        const res = await TaskApi.getAllTasks({ filter: { parentTask: problem._id } });
        const list = res.data?.data || [];
        // Sort strictly by version number
        list.sort((a, b) => {
          return getVersionNumber(a) - getVersionNumber(b);
        });
        setVersions(list);
      } catch (err) {
        console.error("Failed to load problem versions", err);
      } finally {
        setLoadingVersions(false);
      }
    };
    if (problem?._id) {
      fetchVersions();
    }
  }, [problem?._id]);

  // Timer Effect for Interview Mode
  useEffect(() => {
    let interval = null;
    if (mode === 'interview' && isTimerRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsTimerRunning(false);
            toast.error("Interview Time is up! Proceed to Design Defense and Evaluation.");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [mode, isTimerRunning, secondsRemaining]);

  // Reset timer if target minutes change or mode changes
  const handleModeChange = (newMode) => {
    setMode(newMode);
    if (newMode === 'interview') {
      setIsTimerRunning(true);
    } else {
      setIsTimerRunning(false);
    }
  };

  const handleSaveWorkspace = () => {
    localStorage.setItem(`${storagePrefix}_code`, code);
    localStorage.setItem(`${storagePrefix}_design`, designNotes);
    toast.success("Design & Code scratchpad saved!");
  };

  const handleRevealReview = () => {
    setHasAttempted(true);
    localStorage.setItem(`${storagePrefix}_attempted`, 'true');
    toast.success("Review unlocked! Review the architectural trade-offs and patterns.");
  };

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Progressive Hints content (conceptually progressive guidance)
  const progressiveHints = [
    {
      title: "Hint 1: Domain Entities & Core Responsibilities",
      content: "Identify each physical or domain concept as an isolated entity. Segregate transactional state (in-flight balance, selected item, dispenser lock) from invariant catalog data (item metadata, price list)."
    },
    {
      title: "Hint 2: State Lifecycle & Invariant Protection",
      content: "Model system state transitions explicitly. Avoid monolithic boolean flags like `isDispensing` or `hasMoney`. Instead, represent distinct lifecycle stages where invalid operations (e.g. refunding during dispense) are structurally impossible."
    },
    {
      title: "Hint 3: Decoupling Operations via Dynamic Dispatch & Interface Contracts",
      content: "Ensure payment mechanisms, notification handlers, and allocation algorithms can be extended independently without modifying core coordinators. Program strictly to interface contracts rather than concrete implementations."
    },
    {
      title: "Hint 4: Concurrency & Transaction Boundary",
      content: "Guard shared resources (inventory quantities, total cash reservoir) using atomic checks or synchronization barriers to avoid race conditions during concurrent user requests."
    }
  ];

  const currentVersion = versions[activeVersionIndex];

  return (
    <div className="fixed inset-0 z-[2000] bg-slate-900/80 backdrop-blur-md flex items-center justify-center overflow-hidden animate-in fade-in duration-200">
      <div className="w-full h-full bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">

        {/* Top Header Bar */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 flex flex-wrap items-center justify-between gap-3 shrink-0">

          {/* Left: Problem Title & Info */}
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-base shrink-0">
              🎯
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                  MAJOR LLD PROBLEM
                </span>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                  Target: {targetMinutes} min · {problem.curriculumMeta?.difficulty || 'Medium'}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100 truncate mt-0.5">
                {problem.taskName}
              </h2>
            </div>
          </div>

          {/* Center: Mode Selector & Timer */}
          <div className="flex items-center gap-3">
            {/* Mode Switcher */}
            <div className="bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl flex items-center gap-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => handleModeChange('learning')}
                className={`px-3 py-1.5 rounded-lg transition-all ${mode === 'learning'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
              >
                ● Learning Mode
              </button>
              <button
                type="button"
                onClick={() => handleModeChange('interview')}
                className={`px-3 py-1.5 rounded-lg transition-all ${mode === 'interview'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
              >
                ○ Interview Mode
              </button>
            </div>

            {/* Timer for Interview Mode */}
            {mode === 'interview' && (
              <div className="flex items-center gap-2 px-3 py-1 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl">
                <IoTimeOutline className="text-rose-500 text-base" />
                <span className="text-sm font-mono font-black text-rose-600 dark:text-rose-400">
                  {formatTimer(secondsRemaining)}
                </span>
                <button
                  type="button"
                  onClick={() => setIsTimerRunning(prev => !prev)}
                  className="text-rose-600 hover:text-rose-700 p-0.5"
                  title={isTimerRunning ? "Pause Timer" : "Start Timer"}
                >
                  {isTimerRunning ? <IoPauseOutline size={16} /> : <IoPlayOutline size={16} />}
                </button>
              </div>
            )}
          </div>

          {/* Right: Actions & Close */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleSaveWorkspace}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5"
              title="Save Design & Code"
            >
              <span>Save</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              title="Close Workspace"
            >
              <IoClose size={22} />
            </button>
          </div>
        </div>

        {/* Evolving Versions Stepper */}
        {versions.length > 0 && (
          <div className="px-4 sm:px-6 py-2.5 bg-slate-100/60 dark:bg-slate-800/40 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between gap-4 overflow-x-auto custom-scrollbar shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 shrink-0">
                Evolving Versions:
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                {versions.map((ver, idx) => {
                  const isCurrent = idx === activeVersionIndex;
                  return (
                    <button
                      key={ver._id}
                      type="button"
                      onClick={() => setActiveVersionIndex(idx)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${isCurrent
                        ? 'bg-primary text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 border border-slate-200/80 dark:border-slate-700'
                        }`}
                    >
                      <span>V{getVersionNumber(ver, idx)}</span>
                      {idx < versions.length - 1 && <span className="opacity-40 ml-1">→</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {currentVersion && (
              <div className="text-xs font-bold text-slate-600 dark:text-slate-300 truncate max-w-sm">
                <span className="text-slate-400 mr-1.5">Current Target:</span>
                {currentVersion.taskName}
              </div>
            )}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="px-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-6 bg-white dark:bg-slate-900 shrink-0">
          {[
            { id: 'problem', label: 'Problem Specification', icon: <IoDocumentTextOutline /> },
            { id: 'design', label: 'Class Design (Scratchpad)', icon: <IoPencilOutline /> },
            { id: 'code', label: 'C++ Code Implementation', icon: <IoCodeSlashOutline /> },
            { id: 'tests', label: 'Test Scenarios', icon: <IoShieldCheckmarkOutline /> },
            { id: 'review', label: 'Architectural Review', icon: <IoSparklesOutline /> },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-1 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all relative ${activeTab === tab.id
                ? 'text-primary'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
            >
              <span className="text-sm">{tab.icon}</span>
              <span>{tab.label}</span>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        {/* Workspace Body Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-950/50">

          {/* TAB 1: Problem Specification */}
          {activeTab === 'problem' && (
            <div className="space-y-6">

              {/* Progressive Hints Section (Learning Mode Only) */}
              {mode === 'learning' ? (
                <div className="p-4 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs uppercase tracking-wider">
                      <IoBulbOutline size={16} />
                      <span>Progressive Hints (Zero-Spoiler Guidance)</span>
                    </div>
                    <span className="text-[10px] text-amber-700 dark:text-amber-400">
                      {unlockedHintIndex + 1} of {progressiveHints.length} Unlocked
                    </span>
                  </div>

                  {/* Hint Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {progressiveHints.map((hint, idx) => {
                      const isUnlocked = idx <= unlockedHintIndex;
                      const canUnlock = idx === unlockedHintIndex + 1;
                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={!isUnlocked && !canUnlock}
                          onClick={() => {
                            if (canUnlock) {
                              setUnlockedHintIndex(idx);
                              toast.success(`Unlocked Hint ${idx + 1}`);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${isUnlocked
                            ? 'bg-amber-500 text-white shadow-xs'
                            : canUnlock
                              ? 'bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-300 border border-amber-300 hover:bg-amber-100 cursor-pointer'
                              : 'opacity-40 bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                            }`}
                        >
                          <span>Hint {idx + 1}</span>
                          {!isUnlocked && <IoLockClosedOutline size={12} />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Display Active Unlocked Hints */}
                  {unlockedHintIndex >= 0 && (
                    <div className="space-y-2 pt-2 border-t border-amber-200/50 dark:border-amber-800/40">
                      {progressiveHints.slice(0, unlockedHintIndex + 1).map((hint, i) => (
                        <div key={i} className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-amber-100 dark:border-amber-900/30 text-xs text-slate-700 dark:text-slate-300">
                          <p className="font-bold text-amber-800 dark:text-amber-400 mb-1">{hint.title}</p>
                          <p className="leading-relaxed">{hint.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <IoLockClosedOutline />
                  <span>Hints are disabled in <strong>Interview Mode</strong> to simulate live interview conditions.</span>
                </div>
              )}

              {/* Version Requirements if viewing an evolving version */}
              {currentVersion && (
                <div className="p-4 bg-sky-50/60 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900/40 rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-sky-700 dark:text-sky-300">
                      Active Stage: Version {getVersionNumber(currentVersion, activeVersionIndex)}
                    </span>
                    <span className="text-xs font-bold text-sky-700 dark:text-sky-400">
                      {currentVersion.curriculumMeta?.targetTimeMinutes || 30} min target
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-3">
                    {currentVersion.taskName}
                  </h3>
                  <CurriculumContentRenderer
                    content={currentVersion.taskDescription}
                    nodeType="version"
                    title={currentVersion.taskName}
                    taskId={currentVersion.taskId}
                  />
                </div>
              )}

              {/* Main Problem Specification Body */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
                  Full Problem Specification
                </h3>
                <CurriculumContentRenderer
                  content={problem.taskDescription}
                  nodeType="problem"
                  title={problem.taskName}
                />
              </div>
            </div>
          )}

          {/* TAB 2: Class Design Scratchpad */}
          {activeTab === 'design' && (
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    Domain Modeling & Interface Contract Scratchpad
                  </h3>
                  <p className="text-xs text-slate-400">
                    Draft your entities, classes, invariants, and sequence contracts before coding.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSaveWorkspace}
                  className="px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90"
                >
                  Save Design
                </button>
              </div>

              <textarea
                value={designNotes}
                onChange={(e) => setDesignNotes(e.target.value)}
                placeholder={`### 1. Domain Entities & States
- VendingMachine (Context)
- State (Interface): ReadyState, DispenseState, RefundState...
- Item, Inventory, CashRegister

### 2. Operations & Contracts
- selectItem(code) -> void
- insertMoney(amount) -> void
- dispense() -> Item
- refund() -> int`}
                rows={18}
                className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 leading-relaxed custom-scrollbar"
              />
            </div>
          )}

          {/* TAB 3: C++ Code Implementation */}
          {activeTab === 'code' && (
            <div className="h-full flex flex-col space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-mono text-xs font-bold border border-indigo-200 dark:border-indigo-800">
                    C++ 20
                  </span>
                  <span className="text-xs text-slate-400">
                    Production Object-Oriented Implementation Workspace
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCode(DEFAULT_CPP_BOILERPLATE)}
                    className="px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  >
                    Reset Template
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveWorkspace}
                    className="px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90"
                  >
                    Save Code
                  </button>
                </div>
              </div>

              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={22}
                className="flex-1 w-full p-4 bg-slate-900 text-slate-100 rounded-2xl font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 leading-relaxed custom-scrollbar resize-none border border-slate-800"
                spellCheck={false}
              />
            </div>
          )}

          {/* TAB 4: Test Scenarios */}
          {activeTab === 'tests' && (
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2">
                  Validation Checklist & Scenarios
                </h3>
                <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-start gap-2.5">
                    <input type="checkbox" className="mt-0.5 rounded text-primary" />
                    <span><strong>Happy Path:</strong> User inserts exact amount, selects available item, item dispenses cleanly, balance resets.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <input type="checkbox" className="mt-0.5 rounded text-primary" />
                    <span><strong>Insufficient Balance:</strong> User selects item without inserting enough money. System holds balance and refuses dispense.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <input type="checkbox" className="mt-0.5 rounded text-primary" />
                    <span><strong>Out of Stock:</strong> User selects item with 0 quantity. Error reported; money remains uncharged.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <input type="checkbox" className="mt-0.5 rounded text-primary" />
                    <span><strong>Change Dispensation:</strong> User inserts excess money. Item dispenses with exact change returned.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <input type="checkbox" className="mt-0.5 rounded text-primary" />
                    <span><strong>Mid-Transaction Cancellation:</strong> User cancels request before dispense. Full refund returned.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Architectural Review (Zero-Spoiler Enforced) */}
          {activeTab === 'review' && (
            <div className="max-w-4xl mx-auto space-y-6">
              {!hasAttempted ? (
                <div className="text-center py-12 px-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto text-xl border border-amber-200 dark:border-amber-800">
                    <IoLockClosedOutline />
                  </div>
                  <h3 className="text-base font-black text-slate-800 dark:text-slate-100">
                    Zero-Spoiler Rule Active
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                    To maximize real design skill growth, solution architecture, design pattern names, and reference trade-offs remain locked until you have formulated and attempted your design.
                  </p>
                  <button
                    type="button"
                    onClick={handleRevealReview}
                    className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-md shadow-primary/20 transition-all active:scale-95"
                  >
                    I Have Attempted My Solution — Unlock Review
                  </button>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                      <IoCheckmarkCircleOutline size={18} />
                      <span>Review Unlocked: Reference Architecture & Pattern Analysis</span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-100">
                      Standard Design Patterns Applied
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                        <strong className="text-slate-800 dark:text-slate-200 block mb-1">State Pattern</strong>
                        <p className="text-slate-500 dark:text-slate-400">Encapsulates machine states (NoMoney, HasMoney, Dispensing, SoldOut) into dedicated classes implementing a common State interface.</p>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                        <strong className="text-slate-800 dark:text-slate-200 block mb-1">Strategy Pattern</strong>
                        <p className="text-slate-500 dark:text-slate-400">Abstracts payment calculation and discount/pricing algorithms into interchangeable policy objects.</p>
                      </div>
                    </div>

                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-100 pt-3">
                      Key Architectural Trade-offs
                    </h3>
                    <ul className="list-disc list-inside text-xs text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed">
                      <li><strong>State Machine vs Switch-Case:</strong> The State pattern increases class count but eliminates cascading conditional branches and prevents illegal transitions at runtime.</li>
                      <li><strong>Inventory Lock Boundaries:</strong> Dispense operations lock inventory briefly during hardware physical ejection to prevent double-dispense without blocking other query operations.</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
