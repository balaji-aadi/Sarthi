import React, { useState } from 'react';
import { 
  LuTerminal, 
  LuCheckCircle, 
  LuXCircle, 
  LuClock, 
  LuCopy, 
  LuCheck, 
  LuAlertTriangle,
  LuInfo,
  LuHistory
} from 'react-icons/lu';

export default function LldConsolePanel({ 
  result, 
  isRunning, 
  isSubmitting, 
  submissionResult 
}) {
  const [activeTab, setActiveTab] = useState('stdout');
  const [copied, setCopied] = useState(false);

  const activeResult = submissionResult?.execution || result;

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status) => {
    if (isRunning || isSubmitting) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono bg-blue-500/10 text-blue-400 border border-blue-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
          <span>{isSubmitting ? 'Recording Submission...' : 'Executing Direct Program...'}</span>
        </span>
      );
    }

    if (!activeResult) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono text-slate-500 bg-slate-900 border border-slate-800">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
          <span>Ready to execute</span>
        </span>
      );
    }

    switch (activeResult.status) {
      case 'SUCCESS':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/40">
            <LuCheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Execution Successful (Exit 0)</span>
          </span>
        );
      case 'COMPILE_ERROR':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/40">
            <LuXCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>Compilation Error</span>
          </span>
        );
      case 'RUNTIME_ERROR':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/40">
            <LuAlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>Runtime Error</span>
          </span>
        );
      case 'TIME_LIMIT_EXCEEDED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/40">
            <LuClock className="w-3.5 h-3.5 text-amber-400" />
            <span>Time Limit Exceeded (5s)</span>
          </span>
        );
      case 'OUTPUT_LIMIT_EXCEEDED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/40">
            <LuAlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Output Limit Exceeded</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700">
            <span>Status: {activeResult.status}</span>
          </span>
        );
    }
  };

  const stdoutText = activeResult?.stdout || '';
  const stderrText = activeResult?.stderr || activeResult?.error || '';
  const stdoutBytes = new Blob([stdoutText]).size;

  return (
    <div className="h-full flex flex-col bg-[#0e1117] border-t border-[#1e232d] text-slate-200">
      {/* Console Header Bar */}
      <div className="h-10 px-4 bg-[#161b22] border-b border-[#1e232d] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
            <LuTerminal className="w-3.5 h-3.5 text-amber-400" />
            <span>Terminal</span>
          </div>

          <div className="flex items-center gap-1 bg-[#0e1117] p-0.5 rounded border border-[#1e232d]">
            <button
              type="button"
              onClick={() => setActiveTab('stdout')}
              className={`px-2.5 py-0.5 rounded text-xs font-mono transition-all ${
                activeTab === 'stdout'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              stdout {stdoutText ? `(${stdoutBytes}B)` : ''}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('stderr')}
              className={`px-2.5 py-0.5 rounded text-xs font-mono transition-all ${
                activeTab === 'stderr'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              stderr {stderrText ? '(!)' : ''}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {activeResult?.executionTimeMs !== undefined && (
            <span className="flex items-center gap-1 text-xs text-slate-400 font-mono">
              <LuClock className="w-3 h-3 text-slate-500" />
              <span>{activeResult.executionTimeMs} ms</span>
            </span>
          )}

          {getStatusBadge(activeResult?.status)}

          <button
            type="button"
            onClick={() => handleCopy(activeTab === 'stdout' ? stdoutText : stderrText)}
            disabled={!stdoutText && !stderrText}
            className="p-1 rounded hover:bg-[#1e232d] text-slate-400 hover:text-slate-200 disabled:opacity-30 transition-colors"
            title="Copy Output"
          >
            {copied ? <LuCheck className="w-3.5 h-3.5 text-emerald-400" /> : <LuCopy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Invariant Banner when Execution Successful */}
      {activeResult?.status === 'SUCCESS' && (
        <div className="px-4 py-1.5 bg-[#161b22] border-b border-[#1e232d] flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-1.5 text-slate-300">
            <LuInfo className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Exit code 0 confirms program terminated cleanly. Direct Program evaluation does not auto-mark tasks complete.</span>
          </div>
          <span className="text-slate-500 hidden md:inline">No synthetic test harness</span>
        </div>
      )}

      {/* Console Content Body */}
      <div className="flex-1 p-4 overflow-y-auto font-mono text-xs leading-relaxed custom-scrollbar bg-[#0e1117]">
        {isRunning || isSubmitting ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
            <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-mono">
              {isSubmitting ? 'Recording code snapshot and executing in sandbox...' : 'Compiling and executing in isolated container...'}
            </p>
          </div>
        ) : !activeResult ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-1.5">
            <LuTerminal className="w-6 h-6 opacity-30 text-slate-500" />
            <p className="text-xs font-mono text-slate-500">Press "Run" (Cmd+Enter) to execute your program.</p>
            <p className="text-[11px] text-slate-600 font-mono">stdout and stderr streams will appear here.</p>
          </div>
        ) : activeTab === 'stdout' ? (
          stdoutText ? (
            <pre className="text-slate-200 whitespace-pre-wrap selection:bg-amber-950 selection:text-white font-mono">
              {stdoutText}
            </pre>
          ) : (
            <div className="text-slate-500 italic font-mono text-xs">
              (Program finished with 0 bytes on stdout)
            </div>
          )
        ) : (
          stderrText ? (
            <pre className="text-rose-400 whitespace-pre-wrap selection:bg-rose-950 selection:text-white font-mono">
              {stderrText}
            </pre>
          ) : (
            <div className="text-slate-500 italic font-mono text-xs">
              (0 diagnostic errors or warnings on stderr)
            </div>
          )
        )}
      </div>

      {/* Submission Confirmation Bar */}
      {submissionResult && (
        <div className="px-4 py-1.5 bg-[#161b22] border-t border-[#1e232d] flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-1.5 text-slate-300">
            <LuHistory className="w-3.5 h-3.5 text-amber-400" />
            <span>{submissionResult.message}</span>
          </div>
          <span className="text-amber-400 font-semibold text-[11px]">
            Attempt #{submissionResult.userProgress?.submissionsCount || 1} Saved
          </span>
        </div>
      )}
    </div>
  );
}
