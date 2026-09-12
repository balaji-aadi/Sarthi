import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  LuArrowLeft, 
  LuLayers, 
  LuAlertCircle, 
  LuRefreshCw,
  LuBookOpen,
  LuCpu
} from 'react-icons/lu';
import LldWorkspace from '../../components/lld/workspace/LldWorkspace';
import LldNotesDrawer from '../../components/lld/notes/LldNotesDrawer';
import { TaskApi } from '../../services/api/Task.api';

export default function LldWorkspacePage() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.store);

  const [taskData, setTaskData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isNotesOpen, setIsNotesOpen] = useState(false);

  const fetchWorkspaceContext = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await TaskApi.getLldWorkspace(taskId);
      if (res.data?.success && res.data.data) {
        setTaskData(res.data.data);
      } else {
        setError(res.data?.message || 'Failed to load LLD task context');
      }
    } catch (err) {
      console.error('Error fetching LLD workspace:', err);
      setError(err.response?.data?.message || 'Failed to load task. Please verify taskId and connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (taskId) {
      fetchWorkspaceContext();
    }
  }, [taskId]);

  // Loading State
  if (loading) {
    return (
      <div className="lld-environment h-screen w-full flex flex-col items-center justify-center bg-[#0e1117] text-slate-300 space-y-4 font-mono">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400">Loading LLD Workspace & Environment...</p>
        <span className="text-[11px] text-slate-600">{taskId}</span>
      </div>
    );
  }

  // Error State
  if (error || !taskData) {
    return (
      <div className="lld-environment h-screen w-full flex flex-col items-center justify-center bg-[#0e1117] text-slate-200 p-6 space-y-4 font-sans">
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-full text-rose-400">
          <LuAlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-white font-mono">Task Not Found</h2>
        <p className="text-xs text-slate-400 max-w-md text-center">{error}</p>
        <div className="flex items-center space-x-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-[#161b22] hover:bg-[#1e232d] text-xs font-mono text-slate-300 border border-[#1e232d] transition-colors"
          >
            <LuArrowLeft className="w-3.5 h-3.5" />
            <span>Go Back</span>
          </button>
          <button
            type="button"
            onClick={fetchWorkspaceContext}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-xs font-mono font-semibold text-slate-950 transition-colors"
          >
            <LuRefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="lld-environment h-screen w-full flex flex-col bg-[#0e1117] overflow-hidden">
      {/* Top Workspace Header Bar */}
      <header className="h-12 px-4 bg-[#161b22] border-b border-[#1e232d] flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-[#1e232d] transition-colors"
            title="Go Back"
          >
            <LuArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 text-xs font-mono">
            <button
              type="button"
              onClick={() => navigate('/arena/lld')}
              className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
            >
              <LuLayers className="w-3.5 h-3.5" />
              <span>LLD</span>
            </button>
            <span className="text-slate-600">/</span>
            {taskData.task?.projectName?.key && (
              <>
                <button
                  type="button"
                  onClick={() => navigate(`/arena/${taskData.task.projectName.key.toLowerCase()}`)}
                  className="text-slate-400 hover:text-slate-200 text-xs cursor-pointer"
                >
                  {taskData.task.projectName.key}
                </button>
                <span className="text-slate-600">/</span>
              </>
            )}
            <span className="text-amber-400/80 font-medium">
              {taskData.task?.taskId}
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-300 font-medium truncate max-w-[160px] sm:max-w-xs md:max-w-sm font-sans text-xs">
              {taskData.task?.taskName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Direct Program Badge */}
          <span 
            className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#0e1117] text-slate-400 border border-[#1e232d]"
            title="Standard output / exit code evaluation. Exit 0 does not equal automatic problem completion."
          >
            <LuCpu className="w-3 h-3 text-amber-400" />
            <span>DIRECT_PROGRAM</span>
          </span>

          {/* Personal Study Notes Button */}
          <button
            type="button"
            onClick={() => setIsNotesOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono text-slate-300 hover:text-white bg-[#0e1117] hover:bg-[#1e232d] border border-[#1e232d] transition-colors"
            title="Open Personal Architecture Notes"
          >
            <LuBookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Notes</span>
          </button>
        </div>
      </header>

      {/* Main Dual-Pane Workspace */}
      <main className="flex-1 flex overflow-hidden">
        <LldWorkspace
          taskData={taskData}
          taskId={taskId}
          userId={currentUser?._id}
        />
      </main>

      {/* Slide-Over Personal Notes Drawer */}
      <LldNotesDrawer
        isOpen={isNotesOpen}
        onClose={() => setIsNotesOpen(false)}
        taskId={taskId}
        lessonTitle={taskData.task?.taskName}
      />
    </div>
  );
}
