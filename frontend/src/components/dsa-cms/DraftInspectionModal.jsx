import React, { useState } from 'react';
import {
  LuX, LuCheckCircle, LuAlertTriangle, LuXCircle, LuCpu, LuCode,
  LuFileText, LuShieldCheck, LuPlay, LuLayers, LuSparkles, LuCheck, LuRefreshCw
} from 'react-icons/lu';
import toast from 'react-hot-toast';
import { QuestionFactoryApi } from '../../services/api/QuestionFactory.api';

export default function DraftInspectionModal({ draft, onClose, onRefresh }) {
  const [activeTab, setActiveTab] = useState('problem');
  const [revalidating, setRevalidating] = useState(false);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [selectedLang, setSelectedLang] = useState('python');
  const [copied, setCopied] = useState(false);

  if (!draft) return null;

  const validationReport = draft.factoryMetadata?.validationReport || {};
  const quality = validationReport.qualityReport || {};
  const strategy = draft.factoryMetadata?.testStrategy || {};
  const isJudgePassed = validationReport.judgeSelfTestPassed;

  const hasBlockingFailures = !isJudgePassed ||
    quality.clarity === 'FAIL' ||
    quality.constraintComplexity === 'FAIL' ||
    quality.testCoverage === 'FAIL' ||
    quality.exampleQuality === 'FAIL';

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRevalidate = async () => {
    setRevalidating(true);
    try {
      const res = await QuestionFactoryApi.validateDraft(draft._id);
      if (res.data?.success) {
        toast.success("Draft revalidated successfully!");
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Revalidation failed");
    } finally {
      setRevalidating(false);
    }
  };

  const handleApprove = async () => {
    if (hasBlockingFailures) {
      return toast.error("Cannot approve: problem has blocking validation failures.");
    }
    const notes = prompt("Enter admin approval notes (optional):", "Approved for published question bank");
    if (notes === null) return;

    setApproving(true);
    try {
      const res = await QuestionFactoryApi.approveDraft(draft._id, { adminNotes: notes });
      if (res.data?.success) {
        toast.success(`Published as ${res.data.data?.problemCode || 'Official DSA Problem'}!`);
        if (onRefresh) onRefresh();
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Approval failed");
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    setRejecting(true);
    try {
      const res = await QuestionFactoryApi.rejectDraft(draft._id, { reason });
      if (res.data?.success) {
        toast.success("Draft archived.");
        if (onRefresh) onRefresh();
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Rejection failed");
    } finally {
      setRejecting(false);
    }
  };

  const getSignalBadge = (status) => {
    if (status === 'PASS') {
      return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800"><LuCheckCircle className="w-3.5 h-3.5" /> PASS</span>;
    }
    if (status === 'WARNING') {
      return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-300 dark:border-amber-800"><LuAlertTriangle className="w-3.5 h-3.5" /> WARNING</span>;
    }
    return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-300 dark:border-rose-800"><LuXCircle className="w-3.5 h-3.5" /> FAIL</span>;
  };

  const tabs = [
    { id: 'problem', label: 'Problem Statement', icon: LuFileText },
    { id: 'signature', label: 'Signature & Types', icon: LuLayers },
    { id: 'starter', label: 'Starter Code', icon: LuCode },
    { id: 'reference', label: 'Reference Solution', icon: LuCpu },
    { id: 'strategy', label: 'Test Strategy', icon: LuSparkles },
    { id: 'testcases', label: `Test Suite (${(draft.visibleTestCases?.length || 0) + (draft.hiddenTestCases?.length || 0)})`, icon: LuPlay },
    { id: 'validation', label: 'Validation Audit', icon: LuShieldCheck }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-400">
                {draft.problemCode}
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {draft.title}
              </h2>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                draft.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400' :
                draft.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400' :
                'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400'
              }`}>
                {draft.difficulty}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Slug: <code className="font-mono">{draft.slug}</code> • Status: <strong className="text-indigo-600 dark:text-indigo-400">{draft.status}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <LuX className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800 px-6 bg-slate-50/30 dark:bg-slate-950/20 text-sm">
          {tabs.map(t => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 py-3 px-3.5 border-b-2 font-medium transition whitespace-nowrap ${
                  active
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* TAB 1: Problem Statement */}
          {activeTab === 'problem' && (
            <div className="space-y-6 text-slate-800 dark:text-slate-200">
              <div>
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</h3>
                <div className="prose dark:prose-invert max-w-none text-sm bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 whitespace-pre-wrap font-sans">
                  {draft.descriptionMarkdown}
                </div>
              </div>

              {/* Constraints */}
              <div>
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Constraints</h3>
                <ul className="list-disc list-inside space-y-1 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-mono">
                  {(draft.constraints || []).map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>

              {/* Examples */}
              <div>
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Examples</h3>
                <div className="space-y-3">
                  {(draft.examples || []).map((ex, i) => (
                    <div key={i} className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-sm">
                      <div className="font-semibold text-slate-900 dark:text-white mb-1">Example {i + 1}</div>
                      <div><strong>Input:</strong> <code className="font-mono text-xs">{ex.input}</code></div>
                      <div><strong>Output:</strong> <code className="font-mono text-xs">{ex.output}</code></div>
                      {ex.explanation && (
                        <div className="mt-1 text-slate-600 dark:text-slate-400 text-xs"><strong>Explanation:</strong> {ex.explanation}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Editorial / Hints */}
              {draft.editorialMarkdown && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Editorial Walkthrough</h3>
                  <div className="text-sm bg-indigo-50/50 dark:bg-indigo-950/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/40 text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                    {draft.editorialMarkdown}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Signature */}
          {activeTab === 'signature' && (
            <div className="space-y-6">
              <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-semibold text-slate-500 mb-3">Function Signature</h3>
                <div className="font-mono text-indigo-600 dark:text-indigo-400 font-bold text-base">
                  {draft.functionDefinition?.functionName}({draft.functionDefinition?.parameters?.map(p => `${p.name}: ${p.type}`).join(', ')}) : {draft.functionDefinition?.returnType}
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-semibold text-slate-500 mb-3">Parameters Detail</h3>
                <div className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                  {draft.functionDefinition?.parameters?.map((p, idx) => (
                    <div key={idx} className="py-2 flex items-center justify-between">
                      <div>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">{p.name}</span>
                        <span className="ml-2 text-xs font-mono text-slate-500">({p.type})</span>
                        {p.description && <p className="text-xs text-slate-500 mt-0.5">{p.description}</p>}
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                        required
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-semibold text-slate-500 mb-2">Execution Profile</h3>
                <div className="grid grid-cols-3 gap-4 text-xs font-mono">
                  <div><span className="text-slate-400">Runtime:</span> {draft.executionProfile?.runtimeType || 'FUNCTION'}</div>
                  <div><span className="text-slate-400">Serializer:</span> {draft.executionProfile?.outputSerializer || 'PrimitiveSerializer'}</div>
                  <div><span className="text-slate-400">Comparator:</span> {draft.executionProfile?.comparator || 'ExactMatch'}</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Starter Code */}
          {activeTab === 'starter' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                {['python', 'javascript', 'cpp', 'java'].map(lang => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLang(lang)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                      selectedLang === lang
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>

              {(() => {
                const item = (draft.starterCode || []).find(sc => sc.language?.toLowerCase() === selectedLang);
                const code = item?.code || item?.defaultTemplate || `# No template available for ${selectedLang}`;
                return (
                  <div className="relative">
                    <button
                      onClick={() => handleCopyCode(code)}
                      className="absolute top-3 right-3 px-2 py-1 text-xs font-medium rounded bg-slate-800 text-slate-300 hover:text-white border border-slate-700 flex items-center gap-1"
                    >
                      {copied ? <LuCheck className="w-3.5 h-3.5 text-emerald-400" /> : <LuCode className="w-3.5 h-3.5" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                    <pre className="p-4 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed">
                      {code}
                    </pre>
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB 4: Reference Solution */}
          {activeTab === 'reference' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="px-2.5 py-1 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 font-semibold">
                    Python 3 Optimal Solution
                  </span>
                  <span>Time: <strong>{draft.referenceSolution?.timeComplexity || 'O(n)'}</strong></span>
                  <span>Space: <strong>{draft.referenceSolution?.spaceComplexity || 'O(1)'}</strong></span>
                </div>
                <button
                  onClick={() => handleCopyCode(draft.referenceSolution?.code || '')}
                  className="px-2.5 py-1 text-xs font-medium rounded bg-slate-800 text-slate-300 hover:text-white border border-slate-700 flex items-center gap-1"
                >
                  {copied ? <LuCheck className="w-3.5 h-3.5 text-emerald-400" /> : <LuCode className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy Code'}
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-slate-950 text-emerald-300 font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed">
                {draft.referenceSolution?.code || '# No reference solution available'}
              </pre>

              {draft.factoryMetadata?.testStrategy?.intendedAlgorithm && (
                <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                  <span className="font-semibold text-slate-900 dark:text-white">Algorithm Proof:</span> {draft.factoryMetadata.testStrategy.intendedAlgorithm}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Test Strategy */}
          {activeTab === 'strategy' && (
            <div className="space-y-6">
              <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-sm">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Strategy Summary</h3>
                <p className="text-slate-600 dark:text-slate-400">{strategy.summary || 'Adaptive test strategy designed to stress-test bounds and optimal sliding window complexity.'}</p>
              </div>

              {strategy.targetedMistakes?.length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-sm">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Targeted Student Pitfalls</h3>
                  <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 dark:text-slate-400">
                    {strategy.targetedMistakes.map((m, idx) => (
                      <li key={idx}>{m}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Test Categories Breakdown</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(strategy.categories || []).map((cat, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs">
                      <div className="flex items-center justify-between font-mono font-bold text-slate-900 dark:text-white mb-1">
                        <span>{cat.categoryId}</span>
                        <span className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400">
                          {cat.actualCount || 0} / {cat.targetCount || 3} tests
                        </span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400">{cat.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: Test Cases */}
          {activeTab === 'testcases' && (
            <div className="space-y-6">
              {/* Visible Tests */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Visible Test Cases ({draft.visibleTestCases?.length || 0})
                </h3>
                <div className="space-y-2">
                  {(draft.visibleTestCases || []).map((tc, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs font-mono">
                      <div className="text-slate-500 font-sans font-bold mb-1">Visible Test #{idx + 1}</div>
                      <div><strong className="text-slate-400">Input:</strong> {JSON.stringify(tc.input)}</div>
                      <div><strong className="text-emerald-500">Expected:</strong> {JSON.stringify(tc.expectedOutput)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hidden Tests */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Hidden Test Cases ({draft.hiddenTestCases?.length || 0})
                </h3>
                <div className="space-y-2">
                  {(draft.hiddenTestCases || []).map((tc, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs font-mono">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-slate-500 font-sans font-bold">Hidden Test #{idx + 1}</span>
                        {tc.isPerformanceTest && (
                          <span className="px-2 py-0.5 text-[10px] rounded bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400 font-sans">
                            Performance Scale
                          </span>
                        )}
                      </div>
                      <div className="truncate"><strong className="text-slate-400">Input:</strong> {JSON.stringify(tc.input)}</div>
                      <div><strong className="text-emerald-500">Expected:</strong> {JSON.stringify(tc.expectedOutput)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: Validation Report */}
          {activeTab === 'validation' && (
            <div className="space-y-6">
              {/* Judge Self Test Summary Banner */}
              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                isJudgePassed
                  ? 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800'
                  : 'bg-rose-50/50 border-rose-200 dark:bg-rose-950/20 dark:border-rose-800'
              }`}>
                <div className="flex items-center gap-3">
                  {isJudgePassed ? (
                    <LuCheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <LuXCircle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                  )}
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                      CoreJudgeExecutor Self-Test: {validationReport.judgeVerdict || 'PENDING'}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Execution Time: <strong>{validationReport.judgeExecutionTimeMs || 0}ms</strong> • Performance Status: <strong>{validationReport.performanceStatus || 'UNTESTED'}</strong>
                    </p>
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded font-bold ${
                  validationReport.validationState === 'VALIDATED' ? 'bg-emerald-200 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300' : 'bg-rose-200 text-rose-800 dark:bg-rose-900 dark:text-rose-300'
                }`}>
                  {validationReport.validationState || 'PENDING'}
                </span>
              </div>

              {/* Discrete Quality Signals Table */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Discrete Quality Signals</h3>
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                  <div className="p-3.5 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/30">
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">Clarity Audit</div>
                      <div className="text-xs text-slate-500">Unambiguous problem narrative and explicit parameter coverage</div>
                    </div>
                    {getSignalBadge(quality.clarity)}
                  </div>

                  <div className="p-3.5 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/30">
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">Pattern Alignment</div>
                      <div className="text-xs text-slate-500">Requires targeted algorithmic pattern mechanics</div>
                    </div>
                    {getSignalBadge(quality.patternAlignment)}
                  </div>

                  <div className="p-3.5 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/30">
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">Difficulty Calibration</div>
                      <div className="text-xs text-slate-500">Time/Space complexity matches declared tier ({draft.difficulty})</div>
                    </div>
                    {getSignalBadge(quality.difficultyCalibration)}
                  </div>

                  <div className="p-3.5 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/30">
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">Constraint Complexity</div>
                      <div className="text-xs text-slate-500">Well-bounded constraints penalize sub-optimal algorithms</div>
                    </div>
                    {getSignalBadge(quality.constraintComplexity)}
                  </div>

                  <div className="p-3.5 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/30">
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">Example Quality</div>
                      <div className="text-xs text-slate-500">All examples pass canonical reference solution execution</div>
                    </div>
                    {getSignalBadge(quality.exampleQuality)}
                  </div>

                  <div className="p-3.5 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/30">
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">Test Coverage</div>
                      <div className="text-xs text-slate-500">Edge, boundary, pattern trap, and stress test presence</div>
                    </div>
                    {getSignalBadge(quality.testCoverage)}
                  </div>

                  <div className="p-3.5 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/30">
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">Similarity Detection</div>
                      <div className="text-xs text-slate-500">{quality.similarityDetails || 'No significant overlap detected'}</div>
                    </div>
                    {getSignalBadge(quality.similarity)}
                  </div>
                </div>
              </div>

              {/* Errors List */}
              {validationReport.validationErrors?.length > 0 && (
                <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-xs space-y-1">
                  <h4 className="font-bold text-rose-800 dark:text-rose-400">Validation Errors:</h4>
                  {validationReport.validationErrors.map((err, i) => (
                    <div key={i} className="text-rose-700 dark:text-rose-300">• {err}</div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Action Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleRevalidate}
              disabled={revalidating}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <LuRefreshCw className={`w-3.5 h-3.5 ${revalidating ? 'animate-spin' : ''}`} />
              {revalidating ? 'Re-validating...' : 'Re-Validate'}
            </button>
            <button
              onClick={handleReject}
              disabled={rejecting}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 hover:bg-rose-200 dark:hover:bg-rose-900 transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <LuXCircle className="w-3.5 h-3.5" />
              {rejecting ? 'Archiving...' : 'Reject Draft'}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Close
            </button>
            <button
              onClick={handleApprove}
              disabled={approving || hasBlockingFailures}
              className="px-5 py-2 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-md shadow-indigo-600/20 disabled:opacity-50 flex items-center gap-1.5"
            >
              <LuCheckCircle className="w-4 h-4" />
              {approving ? 'Publishing...' : 'Approve & Publish to Question Bank'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
