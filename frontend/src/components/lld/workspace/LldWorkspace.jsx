import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import LldProblemPanel from './LldProblemPanel';
import LldEditorPanel from './LldEditorPanel';
import LldConsolePanel from './LldConsolePanel';
import { TaskApi } from '../../../services/api/Task.api';
import { useLldLanguage } from '../../../context/LldLanguageContext';

export default function LldWorkspace({ taskData, taskId, userId }) {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');
  const fromTaskId = searchParams.get('from');

  const { language: contextLang, setLanguage: setContextLang } = useLldLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState(contextLang || 'cpp');
  const [code, setCode] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [consoleHeight, setConsoleHeight] = useState(260); // default console height in px

  // Keep track of language sync
  const handleLanguageChange = (newLang) => {
    setSelectedLanguage(newLang);
    setContextLang(newLang);
  };

  // Local storage draft key scoped strictly to userId + taskId + language
  const getDraftKey = useCallback((targetTaskId, lang) => {
    const userScope = userId || 'anon';
    return `lld_draft_${userScope}_${targetTaskId}_${lang}`;
  }, [userId]);

  // Load code on language change, task change, or explicit carry-forward choice
  useEffect(() => {
    if (!taskData) return;

    const currentDraftKey = getDraftKey(taskId, selectedLanguage);
    const existingDraft = localStorage.getItem(currentDraftKey);

    // 1. Explicit choice: Continue with previous version code
    if (mode === 'continue' && fromTaskId) {
      const prevDraftKey = getDraftKey(fromTaskId, selectedLanguage);
      const prevDraft = localStorage.getItem(prevDraftKey);
      const prevServerCode = taskData.versionContext?.previousVersionCode?.[selectedLanguage];

      const codeToCarry = prevDraft || prevServerCode;
      if (codeToCarry && codeToCarry.trim().length > 0) {
        setCode(codeToCarry);
        try {
          localStorage.setItem(currentDraftKey, codeToCarry);
        } catch {}
        return;
      }
    }

    // 2. Explicit choice: Start Fresh Template
    if (mode === 'fresh') {
      const template = taskData.starterTemplates?.[selectedLanguage] || '';
      setCode(template);
      return;
    }

    // 3. Standard load: Prioritize existing unsaved local draft
    if (existingDraft && existingDraft.trim().length > 0) {
      setCode(existingDraft);
    } else if (taskData.userProgress?.lastSubmittedCode?.[selectedLanguage]) {
      // 4. Fallback to last submitted code from server
      setCode(taskData.userProgress.lastSubmittedCode[selectedLanguage]);
    } else if (taskData.starterTemplates?.[selectedLanguage]) {
      // 5. Fallback to clean starter template
      setCode(taskData.starterTemplates[selectedLanguage]);
    }
  }, [selectedLanguage, taskId, taskData, mode, fromTaskId, getDraftKey]);

  // Debounced auto-save to localStorage
  const handleCodeChange = (newCode) => {
    setCode(newCode);
    try {
      const draftKey = getDraftKey(taskId, selectedLanguage);
      localStorage.setItem(draftKey, newCode);
    } catch {
      // LocalStorage quota exceeded or disabled
    }
  };

  // Run Code (Direct Program Execution — Ephemeral feedback)
  const handleRun = async () => {
    if (!code || code.trim().length === 0) {
      toast.error('Code editor cannot be empty');
      return;
    }

    setIsRunning(true);
    setExecutionResult(null);

    try {
      const res = await TaskApi.runLldCode({
        language: selectedLanguage,
        code: code,
        executionLimits: {
          timeLimitMs: 5000,
          memoryLimitMb: 256
        }
      });

      if (res.data?.success && res.data.data) {
        const result = res.data.data;
        setExecutionResult(result);

        if (result.status === 'SUCCESS') {
          toast.success(`Program Executed Cleanly (${result.executionTimeMs}ms)`);
        } else if (result.status === 'COMPILE_ERROR') {
          toast.error('Compilation Error — check diagnostics');
        } else if (result.status === 'RUNTIME_ERROR') {
          toast.error('Runtime Error occurred');
        } else {
          toast.error(`Execution Status: ${result.status}`);
        }
      } else {
        toast.error(res.data?.message || 'Execution failed');
      }
    } catch (err) {
      console.error('Run code error:', err);
      toast.error(err.response?.data?.message || 'Failed to execute code. Check server connection.');
      setExecutionResult({
        status: 'PROCESS_ERROR',
        error: err.response?.data?.message || err.message,
        executionTimeMs: 0
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Submit Code (Direct Program Execution + Attempt Snapshot History)
  // INVARIANT: Never marks task completed solely on exit code 0
  const handleSubmit = async () => {
    if (!code || code.trim().length === 0) {
      toast.error('Code editor cannot be empty');
      return;
    }

    setIsSubmitting(true);
    setSubmissionResult(null);

    try {
      const res = await TaskApi.submitLldTask(taskId, {
        language: selectedLanguage,
        code: code
      });

      if (res.data?.success && res.data.data) {
        const data = res.data.data;
        setSubmissionResult(data);
        setExecutionResult(data.execution);

        if (data.execution?.status === 'SUCCESS') {
          toast.success('Attempt snapshot saved to history (Exit 0)');
        } else {
          toast.error(`Attempt recorded with status: ${data.execution?.status}`);
        }
      } else {
        toast.error(res.data?.message || 'Submission failed');
      }
    } catch (err) {
      console.error('Submit error:', err);
      toast.error(err.response?.data?.message || 'Failed to submit solution');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-[#0e1117]">
      {/* Left Pane: Architecture Problem Specification (45% width) */}
      <div className="w-full md:w-[45%] h-1/2 md:h-full border-r border-[#1e232d] flex flex-col overflow-hidden">
        <LldProblemPanel 
          taskData={taskData} 
          currentTaskId={taskId} 
        />
      </div>

      {/* Right Pane: Monaco Code Editor & Console Output (55% width) */}
      <div className="w-full md:w-[55%] h-1/2 md:h-full flex flex-col overflow-hidden bg-[#0e1117]">
        {/* Code Editor Section */}
        <div className="flex-1 overflow-hidden min-h-[280px]">
          <LldEditorPanel
            taskData={taskData}
            selectedLanguage={selectedLanguage}
            onLanguageChange={handleLanguageChange}
            code={code}
            onCodeChange={handleCodeChange}
            onRun={handleRun}
            onSubmit={handleSubmit}
            isRunning={isRunning}
            isSubmitting={isSubmitting}
            userId={userId}
          />
        </div>

        {/* Execution Console Section */}
        <div style={{ height: `${consoleHeight}px` }} className="shrink-0">
          <LldConsolePanel
            result={executionResult}
            isRunning={isRunning}
            isSubmitting={isSubmitting}
            submissionResult={submissionResult}
          />
        </div>
      </div>
    </div>
  );
}
