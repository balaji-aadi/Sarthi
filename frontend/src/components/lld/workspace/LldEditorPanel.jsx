import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { 
  LuPlay, 
  LuSend, 
  LuRotateCcw, 
  LuCopy, 
  LuCheck, 
  LuCode, 
  LuGitPullRequest,
  LuSparkles
} from 'react-icons/lu';

const LANGUAGE_CONFIG = {
  cpp: { name: 'C++ 17', monacoLang: 'cpp' },
  java: { name: 'Java 17', monacoLang: 'java' },
  python: { name: 'Python 3', monacoLang: 'python' }
};

export default function LldEditorPanel({
  taskData,
  selectedLanguage,
  onLanguageChange,
  code,
  onCodeChange,
  onRun,
  onSubmit,
  isRunning,
  isSubmitting,
  userId
}) {
  const [copied, setCopied] = useState(false);
  const [showCarryForwardPrompt, setShowCarryForwardPrompt] = useState(false);
  const [previousCodeAvailable, setPreviousCodeAvailable] = useState(false);
  const editorRef = useRef(null);

  const { versionContext, starterTemplates, userProgress } = taskData || {};
  const currentTaskId = taskData?.task?.taskId;

  // Check if previous version has saved code
  useEffect(() => {
    if (versionContext?.isVersioned && versionContext.previousVersionCode) {
      const prevCodeForLang = versionContext.previousVersionCode[selectedLanguage];
      if (prevCodeForLang && prevCodeForLang.trim().length > 0) {
        setPreviousCodeAvailable(true);
        // If current code equals the default starter template, show the choice prompt
        const defaultStarter = starterTemplates?.[selectedLanguage] || '';
        if (code === defaultStarter) {
          setShowCarryForwardPrompt(true);
        }
      } else {
        setPreviousCodeAvailable(false);
        setShowCarryForwardPrompt(false);
      }
    } else {
      setPreviousCodeAvailable(false);
      setShowCarryForwardPrompt(false);
    }
  }, [currentTaskId, selectedLanguage, versionContext]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Add Cmd+Enter / Ctrl+Enter shortcut to Run Code
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      if (!isRunning && !isSubmitting) {
        onRun();
      }
    });
  };

  const handleCopyCode = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetToTemplate = () => {
    if (window.confirm('Reset editor to initial template? Any unsaved edits will be cleared.')) {
      const template = starterTemplates?.[selectedLanguage] || '';
      onCodeChange(template);
    }
  };

  const handleApplyPreviousVersionCode = () => {
    if (versionContext?.previousVersionCode?.[selectedLanguage]) {
      onCodeChange(versionContext.previousVersionCode[selectedLanguage]);
      setShowCarryForwardPrompt(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0e1117] text-slate-200">
      {/* Top Editor Toolbar */}
      <div className="h-11 px-4 bg-[#161b22] border-b border-[#1e232d] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-slate-400">
            <LuCode className="w-3.5 h-3.5 text-amber-400" />
            <span>Language:</span>
          </div>

          <select
            value={selectedLanguage}
            onChange={(e) => onLanguageChange(e.target.value)}
            disabled={isRunning || isSubmitting}
            className="bg-[#0e1117] text-xs font-mono text-slate-200 border border-[#1e232d] rounded px-2 py-1 focus:outline-none focus:border-amber-500/50 transition-colors"
          >
            {Object.entries(LANGUAGE_CONFIG).map(([key, cfg]) => (
              <option key={key} value={key}>
                {cfg.name}
              </option>
            ))}
          </select>

          {previousCodeAvailable && !showCarryForwardPrompt && (
            <button
              type="button"
              onClick={() => setShowCarryForwardPrompt(true)}
              className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-amber-400 hover:text-amber-300 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 transition-colors"
              title="Load code from previous version"
            >
              <LuGitPullRequest className="w-3 h-3" />
              <span>Import V{versionContext.currentIndex} Code</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyCode}
            className="p-1.5 rounded hover:bg-[#1e232d] text-slate-400 hover:text-slate-200 transition-colors"
            title="Copy code"
          >
            {copied ? <LuCheck className="w-3.5 h-3.5 text-emerald-400" /> : <LuCopy className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={handleResetToTemplate}
            disabled={isRunning || isSubmitting}
            className="flex items-center gap-1 text-xs font-mono text-slate-400 hover:text-slate-200 px-2 py-1 rounded hover:bg-[#1e232d] transition-colors disabled:opacity-30"
            title="Reset code to starter template"
          >
            <LuRotateCcw className="w-3 h-3" />
            <span className="hidden md:inline">Reset</span>
          </button>

          {/* Run Code Button */}
          <button
            type="button"
            onClick={onRun}
            disabled={isRunning || isSubmitting}
            className="flex items-center gap-1.5 bg-[#1e232d] hover:bg-slate-700 text-slate-200 px-3 py-1 rounded text-xs font-mono font-medium border border-slate-700 shadow-sm transition-all disabled:opacity-40"
            title="Compile & Run program (Cmd+Enter)"
          >
            <LuPlay className={`w-3 h-3 text-amber-400 ${isRunning ? 'animate-spin' : 'fill-amber-400'}`} />
            <span>{isRunning ? 'Running...' : 'Run'}</span>
          </button>

          {/* Submit Code Button */}
          <button
            type="button"
            onClick={onSubmit}
            disabled={isRunning || isSubmitting}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 px-3.5 py-1 rounded text-xs font-mono font-semibold shadow-sm transition-all disabled:opacity-40"
            title="Record attempt snapshot to history"
          >
            <LuSend className="w-3 h-3" />
            <span>{isSubmitting ? 'Submitting...' : 'Submit'}</span>
          </button>
        </div>
      </div>

      {/* Explicit Choice Prompt for Version Code Carry-Forward */}
      {showCarryForwardPrompt && previousCodeAvailable && (
        <div className="bg-[#161b22] border-b border-amber-500/30 px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono shrink-0">
          <div className="flex items-center gap-2 text-slate-300">
            <LuSparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              Saved code found from <strong>Version {versionContext.currentIndex}</strong>. How would you like to initialize Version {versionContext.currentIndex + 1}?
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowCarryForwardPrompt(false)}
              className="px-2.5 py-1 rounded text-slate-400 hover:text-slate-200 hover:bg-[#1e232d] border border-slate-700 transition-colors text-[11px]"
            >
              Start Fresh
            </button>
            <button
              type="button"
              onClick={handleApplyPreviousVersionCode}
              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded shadow-sm transition-colors text-[11px] flex items-center gap-1"
            >
              <span>Continue from V{versionContext.currentIndex}</span>
            </button>
          </div>
        </div>
      )}

      {/* Monaco Code Editor */}
      <div className="flex-1 overflow-hidden bg-[#0e1117]">
        <Editor
          height="100%"
          language={LANGUAGE_CONFIG[selectedLanguage]?.monacoLang || 'cpp'}
          value={code}
          onChange={(newVal) => onCodeChange(newVal || '')}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={{
            fontSize: 13,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
            lineNumbers: 'on',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            insertSpaces: true,
            padding: { top: 12, bottom: 12 },
            cursorBlinking: 'smooth',
            smoothScrolling: true,
            renderLineHighlight: 'line',
            lineDecorationsWidth: 10
          }}
        />
      </div>
    </div>
  );
}
