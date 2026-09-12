import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import DsaPhaseHeader from './DsaPhaseHeader';
import DsaTopicSection from './DsaTopicSection';
import DsaCompanyView from './DsaCompanyView';
import DsaQuestionDetailDrawer from './DsaQuestionDetailDrawer';
import CreateTask from '../../../pages/task-childrens/CreateTask';
import DsaCompletionModal from './DsaCompletionModal';
import { TaskApi } from '../../../services/api/Task.api';
import { FocusApi } from '../../../services/api/Focus.api';
import { getScopedItem, setScopedItem, removeScopedItem } from '../../../utils/userStorage';
import { IoArrowBackOutline } from 'react-icons/io5';
import moment from 'moment';
import toast from 'react-hot-toast';
import { resolveProblemUrl } from '../../../utils/dsaUrlHelper';
import SarathiLoader from '../../common/SarathiLoader';

// Helper to extract trailing problem number from taskId string (e.g. 'DSAP2-1' -> 1, 'DSAP2-14' -> 14)
const getTaskIdNum = (id) => {
  if (!id) return 0;
  const matches = id.match(/\d+/g);
  return matches ? parseInt(matches[matches.length - 1], 10) : 0;
};

const DsaWorkspace = ({
  projectId,
  project,
  tasks = [],
  loading = false,
  onTasksUpdated
}) => {
  const { currentUser } = useSelector((state) => state.store);
  const isAdmin = currentUser?.email === "balajiaadi2000@gmail.com" ||
    currentUser?.userRole?.name?.toLowerCase() === "admin" ||
    currentUser?.role === "admin" ||
    (currentUser?.userRoles && currentUser.userRoles.some(r => r.name?.toLowerCase() === "admin"));

  // Local reactive copy of tasks for optimistic updates
  const [localTasks, setLocalTasks] = useState(tasks || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'inprogress' | 'todo' | 'done'
  const [selectedDrawerTask, setSelectedDrawerTask] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Edit / Create Question full page view state
  const [editTaskId, setEditTaskId] = useState(null);
  const [editTaskData, setEditTaskData] = useState(null);

  // Active solving session & Focus Timer state
  const [activeSolvingTask, setActiveSolvingTask] = useState(null);
  const [timerState, setTimerState] = useState(null);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const hasReturnedFromTabRef = useRef(false);

  // Sync when prop tasks update
  useEffect(() => {
    if (tasks) {
      setLocalTasks(tasks);
    }
  }, [tasks]);

  // Restore existing bound focus timer session on mount or storage update
  const syncActiveTimerFromStorage = useCallback(() => {
    try {
      const bindingStr = getScopedItem("focus_timer_task_binding");
      const stateStr = getScopedItem("focus_timer_state");
      if (bindingStr && stateStr) {
        const binding = JSON.parse(bindingStr);
        const state = JSON.parse(stateStr);
        if (binding?.taskId) {
          const match = (localTasks || []).find(t =>
            t._id === binding.taskId || t._id?.toString() === binding.taskId?.toString()
          );
          if (match) {
            setActiveSolvingTask(match);
          } else {
            setActiveSolvingTask({
              _id: binding.taskId,
              taskName: binding.taskName,
              taskId: binding.taskIdString,
              estimatedHours: binding.estimatedHours,
              taskType: binding.taskType,
              status: 'inprogress'
            });
          }
          setTimerState(state);
          return;
        }
      }
      setActiveSolvingTask(null);
      setTimerState(null);
    } catch (e) {
      console.error("Error restoring focus timer binding", e);
    }
  }, [localTasks]);

  useEffect(() => {
    syncActiveTimerFromStorage();
  }, [syncActiveTimerFromStorage]);

  useEffect(() => {
    const handleTimerChange = () => {
      syncActiveTimerFromStorage();
    };
    window.addEventListener('focus_timer_updated', handleTimerChange);
    window.addEventListener('storage', handleTimerChange);
    return () => {
      window.removeEventListener('focus_timer_updated', handleTimerChange);
      window.removeEventListener('storage', handleTimerChange);
    };
  }, [syncActiveTimerFromStorage]);

  // Window Focus Listener for Lightweight Completion Confirmation
  useEffect(() => {
    const handleWindowFocus = () => {
      if (activeSolvingTask && hasReturnedFromTabRef.current) {
        setIsCompletionModalOpen(true);
        hasReturnedFromTabRef.current = false;
      }
    };

    window.addEventListener('focus', handleWindowFocus);
    return () => window.removeEventListener('focus', handleWindowFocus);
  }, [activeSolvingTask]);

  // 1. Organize hierarchy: Parent Topics & Child Questions with logical first-in-first-visible sorting
  const { parentTopics, questionsByParent, standaloneQuestions, allQuestions } = useMemo(() => {
    const parents = [];
    const qMap = {};
    const standalone = [];
    const allQ = [];

    (localTasks || []).forEach(task => {
      // In DSA module, normalize status: backlog and hold are switched to todo
      const rawStatus = task.status || 'todo';
      const status = (rawStatus === 'backlog' || rawStatus === 'hold') ? 'todo' : rawStatus;
      const normalizedTask = { ...task, status };

      const pid = typeof normalizedTask.parentTask === 'object' ? normalizedTask.parentTask?._id : normalizedTask.parentTask;
      if (!pid) {
        // Parent task / Topic
        parents.push(normalizedTask);
      } else {
        // Child task / Question
        allQ.push(normalizedTask);
        if (!qMap[pid]) qMap[pid] = [];
        qMap[pid].push(normalizedTask);
      }
    });

    // Sort parent topics in ascending order of taskId number (e.g. DSAP2-1 Basic Operations first!)
    parents.sort((a, b) => {
      const diff = getTaskIdNum(a.taskId) - getTaskIdNum(b.taskId);
      if (diff !== 0) return diff;
      return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
    });

    // Sort child questions within each topic ascending by problem number
    Object.keys(qMap).forEach(pid => {
      qMap[pid].sort((a, b) => {
        const diff = getTaskIdNum(a.taskId) - getTaskIdNum(b.taskId);
        if (diff !== 0) return diff;
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      });
    });

    // If there are child tasks whose parent ID wasn't found in parents list
    const parentIdSet = new Set(parents.map(p => p._id?.toString()));
    (localTasks || []).forEach(task => {
      const rawStatus = task.status || 'todo';
      const status = (rawStatus === 'backlog' || rawStatus === 'hold') ? 'todo' : rawStatus;
      const normalizedTask = { ...task, status };
      const pid = typeof normalizedTask.parentTask === 'object' ? normalizedTask.parentTask?._id : normalizedTask.parentTask;
      if (pid && !parentIdSet.has(pid.toString())) {
        standalone.push(normalizedTask);
      }
    });

    standalone.sort((a, b) => {
      const diff = getTaskIdNum(a.taskId) - getTaskIdNum(b.taskId);
      if (diff !== 0) return diff;
      return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
    });

    return {
      parentTopics: parents,
      questionsByParent: qMap,
      standaloneQuestions: standalone,
      allQuestions: allQ.length > 0 ? allQ : localTasks
    };
  }, [localTasks]);

  // 2. Compute dynamic metrics (Only 3 statuses in DSA: todo, inprogress, done)
  const { totalCount, completedCount, inProgressCount, todoCount } = useMemo(() => {
    let completed = 0;
    let inProgress = 0;
    let todo = 0;

    allQuestions.forEach(q => {
      if (q.status === 'done') completed++;
      else if (q.status === 'inprogress') inProgress++;
      else todo++;
    });

    return {
      totalCount: allQuestions.length,
      completedCount: completed,
      inProgressCount: inProgress,
      todoCount: todo
    };
  }, [allQuestions]);

  // 3. Dynamically resolve next question for "Continue Learning"
  const nextQuestion = useMemo(() => {
    if (allQuestions.length === 0) return null;
    const active = allQuestions.find(q => q.status === 'inprogress');
    if (active) return active;
    const todo = allQuestions.find(q => q.status === 'todo');
    if (todo) return todo;
    const incomplete = allQuestions.find(q => q.status !== 'done');
    if (incomplete) return incomplete;
    return null;
  }, [allQuestions]);

  // 4. Start practicing a question (Automatic inprogress transition + Focus Timer start + LeetCode launch)
  const handleStartQuestion = async (question) => {
    if (!question) return;

    setActiveSolvingTask(question);
    hasReturnedFromTabRef.current = true;

    const durationMins = question.estimatedHours ? Math.max(Math.round(question.estimatedHours * 60), 10) : 30;

    // 1. Bind to Sarthi's Focus Timer Storage
    const focusTimerBinding = {
      taskId: question._id,
      taskName: question.taskName,
      taskIdString: question.taskId,
      estimatedHours: question.estimatedHours || (durationMins / 60),
      isBacklog: false,
      taskType: question.taskType || 'Preparation'
    };
    setScopedItem("focus_timer_task_binding", focusTimerBinding);

    const nowIso = new Date().toISOString();
    const newTimerState = {
      timeLeft: durationMins * 60,
      isActive: true,
      startTime: nowIso,
      accumulatedTime: 0,
      selectedDuration: durationMins,
      currentTheme: { name: 'Vermilion', color: '#E34234', bg: 'rgba(227, 66, 52, 0.05)', shadow: 'rgba(227, 66, 52, 0.4)' },
      customHeading: question.taskName,
      isCustomSessionActive: false,
      autoExtensions: 0
    };
    setScopedItem("focus_timer_state", newTimerState);
    setTimerState(newTimerState);
    window.dispatchEvent(new Event('focus_timer_updated'));
    window.dispatchEvent(new Event('storage'));

    // 2. If question is not already inprogress or done, update in backend
    if (question.status !== 'inprogress' && question.status !== 'done') {
      setLocalTasks(prev =>
        prev.map(t => (t._id === question._id ? { ...t, status: 'inprogress' } : t))
      );

      try {
        await TaskApi.updateTask(question._id, { status: 'inprogress' });
        if (onTasksUpdated) onTasksUpdated();
      } catch (err) {
        console.error('Failed to update task status to inprogress', err);
      }
    }

    // 3. Open problem on LeetCode in new tab
    const urlInfo = resolveProblemUrl(question);
    window.open(urlInfo.url, '_blank');
    toast.success(`Focus timer started for "${question.taskName}"`, { icon: '⏱️' });
  };

  // 5. Pause / Resume Focus Timer
  const handleToggleTimer = () => {
    if (!timerState) return;

    if (timerState.isActive) {
      const startMs = timerState.startTime ? new Date(timerState.startTime).getTime() : Date.now();
      const elapsedSecs = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
      const newAccumulated = (timerState.accumulatedTime || 0) + elapsedSecs;

      const updated = {
        ...timerState,
        isActive: false,
        startTime: null,
        accumulatedTime: newAccumulated,
        timeLeft: Math.max(0, (timerState.selectedDuration * 60) - newAccumulated)
      };
      setScopedItem("focus_timer_state", updated);
      setTimerState(updated);
      window.dispatchEvent(new Event('focus_timer_updated'));
      window.dispatchEvent(new Event('storage'));
      toast.success("Focus timer paused.", { icon: '⏸️' });
    } else {
      const updated = {
        ...timerState,
        isActive: true,
        startTime: new Date().toISOString()
      };
      setScopedItem("focus_timer_state", updated);
      setTimerState(updated);
      window.dispatchEvent(new Event('focus_timer_updated'));
      window.dispatchEvent(new Event('storage'));
      toast.success("Focus timer resumed.", { icon: '▶️' });
    }
  };

  // 6. Open Reflection Modal (Finishing focus session)
  const handleOpenReflection = (taskToReflect) => {
    const target = taskToReflect || activeSolvingTask;
    if (target) {
      setActiveSolvingTask(target);
      setIsCompletionModalOpen(true);
    }
  };

  // 7. Record Solve Reflection & transition state (Append-only learning loop)
  const handleRecordReflection = async (taskToReflect, { outcome, confidence, notes, durationMinutes }) => {
    const target = taskToReflect || activeSolvingTask;
    if (!target) return;

    const isSolved = outcome !== 'UNSOLVED';
    const newStatus = isSolved ? 'done' : 'inprogress';

    // 1. Log focus session with FocusApi
    const now = new Date();
    const sessionData = {
      date: moment().format("YYYY-MM-DD"),
      startTime: timerState?.startTime || now.toISOString(),
      endTime: now.toISOString(),
      duration: durationMinutes,
      type: "Focus",
      task: target._id,
      taskName: target.taskName,
      taskIdString: target.taskId,
      statusAtCompletion: newStatus,
      completionState: isSolved ? "completed" : "incompleted",
      estimatedTimeAtStart: timerState?.selectedDuration || (target.estimatedHours ? Math.round(target.estimatedHours * 60) : 30),
      isBacklog: false
    };

    try {
      let focusSessionId = null;
      try {
        const focusRes = await FocusApi.createSession(sessionData);
        focusSessionId = focusRes.data?.data?._id || null;
      } catch (fErr) {
        console.warn("Focus session logging note:", fErr);
      }

      // 2. Persist append-only reflection on task progress
      const refRes = await TaskApi.recordReflection(target._id, {
        outcome,
        confidence,
        notes,
        durationMinutes,
        focusSessionId
      });

      const newAttempt = refRes.data?.data?.latestAttempt || {
        attemptedAt: new Date(),
        durationMinutes,
        outcome,
        confidence,
        notes
      };

      // 3. Update local task state
      setLocalTasks(prev =>
        prev.map(t => {
          if (t._id === target._id) {
            const updatedHistory = Array.isArray(t.solveHistory)
              ? [newAttempt, ...t.solveHistory]
              : [newAttempt];
            return {
              ...t,
              status: newStatus,
              latestOutcome: outcome,
              latestConfidence: confidence,
              solveHistory: updatedHistory
            };
          }
          return t;
        })
      );

      if (selectedDrawerTask && (selectedDrawerTask._id === target._id || selectedDrawerTask._id?.toString() === target._id?.toString())) {
        setSelectedDrawerTask(prev => {
          const updatedHistory = Array.isArray(prev.solveHistory)
            ? [newAttempt, ...prev.solveHistory]
            : [newAttempt];
          return {
            ...prev,
            status: newStatus,
            latestOutcome: outcome,
            latestConfidence: confidence,
            solveHistory: updatedHistory
          };
        });
      }

      // 4. Teardown timer
      setIsCompletionModalOpen(false);
      setActiveSolvingTask(null);
      setTimerState(null);
      removeScopedItem("focus_timer_task_binding");
      removeScopedItem("focus_timer_state");
      removeScopedItem("focus_timer_retrievable");
      window.dispatchEvent(new Event('focus_timer_updated'));
      window.dispatchEvent(new Event('storage'));

      if (isSolved) {
        toast.success(`Reflection saved! Solved (${durationMinutes}m focus logged)`, { icon: '🎉' });
      } else {
        toast.success(`Reflection saved! Kept in progress (${durationMinutes}m focus logged)`, { icon: '📝' });
      }

      if (onTasksUpdated) onTasksUpdated();
    } catch (err) {
      console.error('Failed to log reflection', err);
      toast.error('Failed to save reflection');
    }
  };

  const handleStillWorking = () => {
    setIsCompletionModalOpen(false);
  };


  // 8. Manual status update from drawer
  const handleUpdateStatus = async (taskId, newStatus) => {
    const current = localTasks.find(t => t._id === taskId || t._id?.toString() === taskId?.toString()) || selectedDrawerTask;
    const isCompleted = current?.status === 'done' ||
      Boolean(current?.completedAt) ||
      (Array.isArray(current?.solveHistory) && current.solveHistory.some(s => s.outcome && s.outcome !== 'UNSOLVED'));

    if (newStatus === 'todo' && isCompleted) {
      toast.error("Completed problems cannot be reverted to To Do. Use 'Solve Again' to re-attempt.");
      return;
    }

    if (newStatus === 'done' && activeSolvingTask && activeSolvingTask._id === taskId) {
      handleOpenReflection(activeSolvingTask);
      return;
    }

    setLocalTasks(prev =>
      prev.map(t => (t._id === taskId ? { ...t, status: newStatus } : t))
    );
    if (selectedDrawerTask && (selectedDrawerTask._id === taskId || selectedDrawerTask._id?.toString() === taskId?.toString())) {
      setSelectedDrawerTask(prev => ({ ...prev, status: newStatus }));
    }

    try {
      await TaskApi.updateTask(taskId, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      if (onTasksUpdated) onTasksUpdated();
    } catch (err) {
      console.error('Failed to update status', err);
      toast.error('Failed to update status');
    }
  };

  // 9. Accidental Click / Cancel Session
  const handleResetToTodo = async (taskToReset) => {
    const target = taskToReset || activeSolvingTask;
    if (!target) return;

    const isAlreadyCompleted = target.status === 'done' ||
      Boolean(target.completedAt) ||
      (Array.isArray(target.solveHistory) && target.solveHistory.some(s => s.outcome && s.outcome !== 'UNSOLVED'));

    // Teardown active timer if running for this task
    if (activeSolvingTask && (activeSolvingTask._id === target._id || activeSolvingTask._id?.toString() === target._id?.toString())) {
      setActiveSolvingTask(null);
      setTimerState(null);
      setIsCompletionModalOpen(false);
      removeScopedItem("focus_timer_task_binding");
      removeScopedItem("focus_timer_state");
      removeScopedItem("focus_timer_retrievable");
      window.dispatchEvent(new Event('focus_timer_updated'));
      window.dispatchEvent(new Event('storage'));
    }

    // If problem was already completed, cancelling this re-attempt session must NOT revert it to To Do!
    if (isAlreadyCompleted) {
      setLocalTasks(prev =>
        prev.map(t => (t._id === target._id ? { ...t, status: 'done' } : t))
      );
      if (selectedDrawerTask && (selectedDrawerTask._id === target._id || selectedDrawerTask._id?.toString() === target._id?.toString())) {
        setSelectedDrawerTask(prev => ({ ...prev, status: 'done' }));
      }
      toast.success(`"${target.taskName}" session cancelled. Problem remains Completed.`, { icon: '⏹️' });
      return;
    }

    setLocalTasks(prev =>
      prev.map(t => (t._id === target._id ? { ...t, status: 'todo' } : t))
    );

    if (selectedDrawerTask && (selectedDrawerTask._id === target._id || selectedDrawerTask._id?.toString() === target._id?.toString())) {
      setSelectedDrawerTask(prev => ({ ...prev, status: 'todo' }));
    }

    try {
      await TaskApi.updateTask(target._id, { status: 'todo' });
      toast.success(`"${target.taskName}" reset to To Do. No focus time logged.`, { icon: '↩️' });
      if (onTasksUpdated) onTasksUpdated();
    } catch (err) {
      console.error('Failed to reset task to todo', err);
      toast.error('Failed to reset task to To Do');
    }
  };

  const handleOpenDetails = (task) => {
    setSelectedDrawerTask(task);
    setIsDrawerOpen(true);
  };

  const handleEditFromDrawer = (task) => {
    setIsDrawerOpen(false);
    setEditTaskId(task._id);
    setEditTaskData(task);
  };

  const handleCreateQuestion = (parentTopicId = null) => {
    setEditTaskId('new');
    setEditTaskData({
      projectName: projectId,
      parentTask: parentTopicId || undefined,
      taskType: 'Preparation'
    });
  };

  // 10. Filter questions (Only 3 statuses in DSA: all, inprogress, todo, done)
  const filterQuestion = (q) => {
    if (searchTerm) {
      const qText = searchTerm.toLowerCase();
      const matchName = q.taskName?.toLowerCase().includes(qText);
      const matchId = q.taskId?.toLowerCase().includes(qText);
      if (!matchName && !matchId) return false;
    }

    if (activeFilter === 'done') return q.status === 'done';
    if (activeFilter === 'inprogress') return q.status === 'inprogress';
    if (activeFilter === 'todo') return q.status === 'todo';

    return true;
  };

  const projectName = project?.name || 'DSA Learning Arena';

  return (
    <div className="h-full flex flex-col bg-bgLight dark:bg-[#0A0D14] relative overflow-hidden transition-colors">
      {/* Dynamic Phase Header with Add Problem CTA */}
      <DsaPhaseHeader
        projectName={projectName}
        totalCount={totalCount}
        completedCount={completedCount}
        inProgressCount={inProgressCount}
        todoCount={todoCount}
        nextQuestion={nextQuestion}
        onContinueLearning={() => nextQuestion && handleStartQuestion(nextQuestion)}
        onCreateQuestion={isAdmin ? () => handleCreateQuestion() : null}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        isAdmin={isAdmin}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pt-4">
        <div className="space-y-6">
          {/* Unified Sarathi Brand Loader */}
          {loading && (
            <SarathiLoader message="Loading curriculum topics & questions..." size="md" />
          )}

          {/* Topics Roadmap List */}
          {!loading && (
            <div className="space-y-4">
              {parentTopics.map(topic => {
                const topicQuestions = (questionsByParent[topic._id] || []).filter(filterQuestion);
                if (topicQuestions.length === 0 && (searchTerm || activeFilter !== 'all')) {
                  return null;
                }

                return (
                  <DsaTopicSection
                    key={topic._id}
                    topic={topic}
                    questions={topicQuestions}
                    activeQuestionId={activeSolvingTask?._id}
                    activeTimerState={timerState}
                    onToggleTimer={handleToggleTimer}
                    onConfirmCompleted={handleOpenReflection}
                    onResetToTodo={handleResetToTodo}
                    onStartQuestion={handleStartQuestion}
                    onOpenDetails={handleOpenDetails}
                    onEditTask={isAdmin ? handleEditFromDrawer : null}
                    onCreateQuestion={isAdmin ? handleCreateQuestion : null}
                    defaultExpanded={false}
                    isAdmin={isAdmin}
                  />
                );
              })}

              {/* Standalone questions if any */}
              {standaloneQuestions.filter(filterQuestion).length > 0 && (
                <DsaTopicSection
                  topic={{ taskName: 'Independent Practice Questions' }}
                  questions={standaloneQuestions.filter(filterQuestion)}
                  activeQuestionId={activeSolvingTask?._id}
                  activeTimerState={timerState}
                  onToggleTimer={handleToggleTimer}
                  onConfirmCompleted={handleOpenReflection}
                  onResetToTodo={handleResetToTodo}
                  onStartQuestion={handleStartQuestion}
                  onOpenDetails={handleOpenDetails}
                  onEditTask={isAdmin ? handleEditFromDrawer : null}
                  onCreateQuestion={isAdmin ? handleCreateQuestion : null}
                  defaultExpanded={false}
                  isAdmin={isAdmin}
                />
              )}

              {/* Empty state when no questions match filters */}
              {totalCount > 0 && parentTopics.every(topic => (questionsByParent[topic._id] || []).filter(filterQuestion).length === 0) && (
                <div className="py-12 text-center space-y-2">
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
                    No questions match your current search or filter.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      setActiveFilter('all');
                    }}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    Reset all filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* DSA Question Detail Drawer (Dedicated review: past reflections, solve history, pattern, notes, video) */}
      <DsaQuestionDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        task={selectedDrawerTask}
        topicName={selectedDrawerTask?.parentTask?.taskName || (parentTopics.find(p => p._id === (selectedDrawerTask?.parentTask?._id || selectedDrawerTask?.parentTask))?.taskName) || ''}
        phaseName={project?.name || 'DSA Learning Arena'}
        onUpdateStatus={handleUpdateStatus}
        onStartSolving={(task) => {
          setIsDrawerOpen(false);
          handleStartQuestion(task);
        }}
        isAdmin={isAdmin}
      />

      {/* Full Page View for Create / Update DSA Problem */}
      {editTaskId && (
        <div className="fixed inset-0 z-[100] w-full h-full bg-slate-50 dark:bg-slate-900 overflow-y-auto animate-in fade-in duration-200">
          {/* Top navigation bar */}
          <div className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setEditTaskId(null);
                  setEditTaskData(null);
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-primary transition-colors cursor-pointer"
              >
                <IoArrowBackOutline size={16} />
                <span>Back to DSA Workspace</span>
              </button>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">
                {editTaskId === 'new' ? 'Add New DSA Problem' : `Update Problem: ${editTaskData?.taskName || ''}`}
              </h3>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditTaskId(null);
                setEditTaskData(null);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>

          <div className="max-w-5xl mx-auto p-4 sm:p-8">
            <CreateTask
              modalMode={false}
              isDsa={true}
              task={editTaskData}
              id={editTaskId === 'new' ? null : editTaskId}
              setId={setEditTaskId}
              setTask={setEditTaskData}
              setProjectTasks={(updated) => {
                if (typeof updated === 'function') {
                  setLocalTasks(updated);
                } else if (Array.isArray(updated)) {
                  setLocalTasks(updated);
                }
                if (onTasksUpdated) onTasksUpdated();
              }}
            />
          </div>
        </div>
      )}

      {/* Solve Session Reflection Dialog & Floating Focus Timer Controller */}
      <DsaCompletionModal
        activeTask={activeSolvingTask}
        timerState={timerState}
        isOpen={isCompletionModalOpen}
        onClose={() => {
          setIsCompletionModalOpen(false);
        }}
        onRecordReflection={handleRecordReflection}
        onConfirmCompleted={handleOpenReflection}
        onStillWorking={handleStillWorking}
        onToggleTimer={handleToggleTimer}
        onResetToTodo={handleResetToTodo}
        onReopenLeetCode={(task) => {
          const urlInfo = resolveProblemUrl(task);
          window.open(urlInfo.url, '_blank');
        }}
      />
    </div>
  );
};

export default DsaWorkspace;

