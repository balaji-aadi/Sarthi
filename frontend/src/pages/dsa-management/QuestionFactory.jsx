import React, { useEffect, useState } from 'react';
import {
  LuSparkles, LuRefreshCw, LuPlus, LuCheckCircle, LuAlertTriangle,
  LuXCircle, LuEye, LuCpu, LuShieldCheck, LuLayers, LuFilter, LuPlay
} from 'react-icons/lu';
import toast from 'react-hot-toast';
import { QuestionFactoryApi } from '../../services/api/QuestionFactory.api';
import { ProblemApi } from '../../services/api/Problem.api';
import DraftInspectionModal from '../../components/dsa-cms/DraftInspectionModal';

const PATTERNS_LIST = [
  "Sliding Window",
  "Two Pointers",
  "Fast & Slow Pointers",
  "Prefix Sum",
  "Binary Search",
  "Topological Sort",
  "Monotonic Stack",
  "Dynamic Programming",
  "Breadth-First Search",
  "Depth-First Search",
  "Heap / Priority Queue",
  "Union Find"
];

export default function QuestionFactory() {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [selectedDraft, setSelectedDraft] = useState(null);

  // Form State
  const [pattern, setPattern] = useState("Sliding Window");
  const [difficulty, setDifficulty] = useState("Medium");
  const [directives, setDirectives] = useState("");

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [diffFilter, setDiffFilter] = useState('');

  const fetchDrafts = async () => {
    setLoading(true);
    try {
      const res = await QuestionFactoryApi.getDrafts({
        status: statusFilter || undefined,
        difficulty: diffFilter || undefined
      });
      if (res.data?.success) {
        setDrafts(res.data.data?.drafts || []);
      }
    } catch (err) {
      toast.error("Failed to load drafts queue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, [statusFilter, diffFilter]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    setGenerationStep('Pass 1: Architecting Problem Specification...');

    const timer1 = setTimeout(() => setGenerationStep('Pass 2: Synthesizing Test Strategy & Invariants...'), 3500);
    const timer2 = setTimeout(() => setGenerationStep('Pass 3: Generating Test Inputs & Bounds Audit...'), 7000);
    const timer3 = setTimeout(() => setGenerationStep('Pass 4: Sandboxed Reference Execution & Output Compilation...'), 11000);
    const timer4 = setTimeout(() => setGenerationStep('Pass 5 & 6: Production Judge Self-Test & Quality Signals...'), 15000);

    try {
      const res = await QuestionFactoryApi.generateDraft({
        pattern,
        difficulty,
        directives
      });

      if (res.data?.success) {
        toast.success(`Draft "${res.data.data?.title}" generated and validated!`);
        setDirectives('');
        fetchDrafts();
        setSelectedDraft(res.data.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Problem generation failed.");
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      setGenerating(false);
      setGenerationStep('');
    }
  };

  const getValidationStateBadge = (report = {}) => {
    const state = report.validationState || 'PENDING';
    if (state === 'VALIDATED') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
          <LuCheckCircle className="w-3.5 h-3.5" /> Validated
        </span>
      );
    }
    if (state === 'FAILED') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-300 dark:border-rose-800">
          <LuXCircle className="w-3.5 h-3.5" /> Failed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
        <LuRefreshCw className="w-3.5 h-3.5" /> Pending
      </span>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
              <LuSparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                DSA Question Factory <span className="text-xs px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400 font-mono">v1.0</span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                AI Curriculum Authoring Engine with Sandboxed Reference Truth Generation & CoreJudgeExecutor Self-Test
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 font-medium">
            <LuShieldCheck className="w-3.5 h-3.5" /> CoreJudge Authority Connected
          </span>
        </div>
      </div>

      {/* Generation Form Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <LuCpu className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Problem Generation Pipeline
          </h2>
          <span className="text-xs text-slate-400">Deterministic Truth Engine</span>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Pattern Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Algorithmic Pattern
              </label>
              <select
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
              >
                {PATTERNS_LIST.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Difficulty Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Difficulty Calibration
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Easy', 'Medium', 'Hard'].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition ${
                      difficulty === d
                        ? d === 'Easy' ? 'bg-emerald-600 text-white border-emerald-600' :
                          d === 'Medium' ? 'bg-amber-600 text-white border-amber-600' :
                          'bg-rose-600 text-white border-rose-600'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Pipeline Stage Indicator */}
            <div className="flex flex-col justify-end">
              <button
                type="submit"
                disabled={generating}
                className="w-full py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/30 transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {generating ? (
                  <>
                    <LuRefreshCw className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <LuSparkles className="w-4 h-4" />
                    Generate & Validate Problem
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Directives */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Curriculum Directives & Constraints (Optional)
            </label>
            <textarea
              rows={2}
              value={directives}
              onChange={(e) => setDirectives(e.target.value)}
              placeholder="e.g. Design a problem with a battery backup T parameter that offsets maximum subsegment power; array lengths up to 10^5."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition placeholder:text-slate-400"
            />
          </div>

          {/* Progress Toast during generation */}
          {generating && (
            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center gap-3 animate-pulse text-xs text-indigo-700 dark:text-indigo-300 font-mono">
              <LuRefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
              <span>{generationStep || 'Executing generation & validation pipeline...'}</span>
            </div>
          )}
        </form>
      </div>

      {/* Drafts Review Queue */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <LuLayers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Editorial Review Queue
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Problems awaiting human admin editorial inspection and approval
            </p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
            >
              <option value="">All Statuses</option>
              <option value="Review">Review (Ready)</option>
              <option value="Draft">Draft (Failed/WIP)</option>
              <option value="Published">Published</option>
              <option value="Archived">Archived</option>
            </select>

            <select
              value={diffFilter}
              onChange={(e) => setDiffFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
            >
              <option value="">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            <button
              onClick={fetchDrafts}
              className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
            >
              <LuRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Code & Title</th>
                  <th className="py-3 px-3">Difficulty</th>
                  <th className="py-3 px-3">Validation State</th>
                  <th className="py-3 px-3">Tests Count</th>
                  <th className="py-3 px-3">Judge Self-Test</th>
                  <th className="py-3 px-3">Performance</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {drafts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 text-sm">
                      {loading ? "Loading drafts queue..." : "No generated drafts found. Use the pipeline above to author your first problem!"}
                    </td>
                  </tr>
                ) : (
                  drafts.map((d) => {
                    const report = d.factoryMetadata?.validationReport || {};
                    const isAccepted = report.judgeSelfTestPassed;
                    return (
                      <tr key={d._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4">
                          <div className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-xs">
                            {d.problemCode}
                          </div>
                          <div className="font-semibold text-slate-900 dark:text-white text-sm">
                            {d.title}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded font-medium ${
                            d.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400' :
                            d.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400' :
                            'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                          }`}>
                            {d.difficulty}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          {getValidationStateBadge(report)}
                        </td>
                        <td className="py-3 px-3 font-mono">
                          {(d.visibleTestCases?.length || 0) + (d.hiddenTestCases?.length || 0)} tests
                          <span className="block text-[10px] text-slate-400 font-sans">
                            {d.visibleTestCases?.length || 0} visible / {d.hiddenTestCases?.length || 0} hidden
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1 font-mono font-bold text-xs">
                            {isAccepted ? (
                              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                <LuCheckCircle className="w-3.5 h-3.5" /> {report.judgeVerdict || 'Accepted'}
                              </span>
                            ) : (
                              <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                                <LuXCircle className="w-3.5 h-3.5" /> {report.judgeVerdict || 'Failed'}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {report.judgeExecutionTimeMs || 0}ms
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            report.performanceStatus === 'OPTIMAL' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400' :
                            report.performanceStatus === 'ACCEPTABLE' ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' :
                            report.performanceStatus === 'WARNING' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400' :
                            'bg-slate-100 text-slate-500'
                          }`}>
                            {report.performanceStatus || 'UNTESTED'}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            d.status === 'Published' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400' :
                            d.status === 'Review' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400' :
                            d.status === 'Archived' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400' :
                            'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}>
                            {d.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setSelectedDraft(d)}
                            className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold transition flex items-center gap-1.5 ml-auto text-xs"
                          >
                            <LuEye className="w-3.5 h-3.5" />
                            Inspect & Review
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Deep Inspection Modal */}
      {selectedDraft && (
        <DraftInspectionModal
          draft={selectedDraft}
          onClose={() => setSelectedDraft(null)}
          onRefresh={fetchDrafts}
        />
      )}
    </div>
  );
}
