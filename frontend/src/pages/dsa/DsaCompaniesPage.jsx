import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  IoBusinessOutline,
  IoCheckmarkCircleOutline,
  IoRefreshOutline
} from 'react-icons/io5';
import { TaskApi } from '../../services/api/Task.api';
import DsaCompanyView from '../../components/dsa/workspace/DsaCompanyView';
import DsaQuestionDetailDrawer from '../../components/dsa/workspace/DsaQuestionDetailDrawer';
import SarathiLoader from '../../components/common/SarathiLoader';
import { resolveProblemUrl } from '../../utils/dsaUrlHelper';
import toast from 'react-hot-toast';

export const DsaCompaniesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCompanySlug = searchParams.get('company') || null;

  const { currentUser } = useSelector((state) => state.store || {});
  const isAdmin = currentUser?.email === "balajiaadi2000@gmail.com" ||
    currentUser?.userRole?.name?.toLowerCase() === "admin" ||
    currentUser?.role === "admin" ||
    (currentUser?.userRoles && currentUser.userRoles.some(r => r.name?.toLowerCase() === "admin"));

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDrawerTask, setSelectedDrawerTask] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Fetch all tasks across all phases to project company associations and learner state
  const fetchCompanyTasks = async () => {
    setLoading(true);
    try {
      const res = await TaskApi.getAllTasks({});
      const allTasks = res.data?.data || [];
      // Keep tasks with company tags or DSA problems
      const taggedTasks = allTasks.filter(t =>
        Array.isArray(t.companyTags) && t.companyTags.length > 0
      );
      setTasks(taggedTasks);
    } catch (err) {
      console.error("Failed to load company problems:", err);
      toast.error("Failed to load company problems. Please try refreshing.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyTasks();
  }, []);

  // Summary Metrics
  const metrics = useMemo(() => {
    let completedCount = 0;

    tasks.forEach(t => {
      if (t.status === 'done' || t.completedAt) completedCount++;
    });

    const percent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

    return {
      totalCompanies: 48,
      totalProblems: tasks.length,
      completedCount,
      percent
    };
  }, [tasks]);

  const handleStartQuestion = (task) => {
    const urlInfo = resolveProblemUrl(task);
    if (urlInfo.url) {
      window.open(urlInfo.url, '_blank', 'noopener,noreferrer');
    } else {
      toast("No external link configured for this problem.", { icon: "ℹ️" });
    }
  };

  const handleOpenDetails = (task) => {
    setSelectedDrawerTask(task);
    setIsDrawerOpen(true);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-slate-50 dark:bg-[#0A0D14] text-slate-900 dark:text-slate-100 transition-colors">
      {/* Sleek, Integrated Executive Header Banner */}
      <div className="bg-white dark:bg-[#0D111A] border-b border-slate-200/90 dark:border-slate-800 shrink-0 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          {/* Left: Title & Company Count Pill */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center shadow-xs text-base shrink-0">
              <IoBusinessOutline />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white truncate">
                  Company Wise DSA Sheet
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/25 shrink-0">
                  {metrics.totalCompanies} Companies
                </span>
              </div>
              <p className="text-[11.5px] text-slate-500 dark:text-slate-400 font-medium truncate">
                Real DSA interview problems asked by top tech giants & unicorns
              </p>
            </div>
          </div>

          {/* Middle/Right: Search Bar + Summary Metrics */}
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap md:flex-nowrap">
            {/* Inline Quick Search */}
            <div className="relative w-full sm:w-64 md:w-72">
              <input
                type="text"
                placeholder="Search 48+ companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500/40 focus:border-amber-500 transition-all"
              />
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">
                🔍
              </span>
            </div>

            {/* Tagged Count Pill */}
            <div className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-[#141A26] border border-slate-200 dark:border-slate-800 flex items-center gap-1.5 text-xs shrink-0">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Tagged:</span>
              <span className="font-black text-slate-900 dark:text-white">{metrics.totalProblems}</span>
            </div>

            {/* Solved Count Pill */}
            <div className="px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-300 shrink-0">
              <IoCheckmarkCircleOutline className="text-sm font-bold" />
              <span className="font-bold">{metrics.completedCount}</span>
              <span className="text-[10.5px] opacity-80">({metrics.percent}%)</span>
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={fetchCompanyTasks}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer shrink-0"
              title="Refresh company problems"
            >
              <IoRefreshOutline size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-5 lg:p-6">
        {loading ? (
          <div className="py-24 flex items-center justify-center">
            <SarathiLoader message="Loading Company Wise DSA Sheet..." size="lg" />
          </div>
        ) : (
          <DsaCompanyView
            questions={tasks}
            onStartQuestion={handleStartQuestion}
            onOpenDetails={handleOpenDetails}
            isAdmin={isAdmin}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedCompanyId={selectedCompanySlug}
            onSelectCompanyId={(slug) => {
              if (slug) {
                setSearchParams({ company: slug });
              } else {
                setSearchParams({});
              }
            }}
          />
        )}
      </div>

      {/* Detail Drawer (with Linked Notes, LeetCode CTA, reflections, etc.) */}
      <DsaQuestionDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        task={selectedDrawerTask}
        topicName={selectedDrawerTask?.parentTask?.taskName || 'DSA Topic'}
        phaseName="Company Wise DSA Sheet"
        onUpdateStatus={() => {}}
        onStartSolving={(task) => {
          setIsDrawerOpen(false);
          handleStartQuestion(task);
        }}
        isAdmin={isAdmin}
      />
    </div>
  );
};

export default DsaCompaniesPage;
