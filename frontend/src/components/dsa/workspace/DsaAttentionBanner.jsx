import React from 'react';
import { IoAlertCircleOutline, IoPauseCircleOutline, IoArrowForward } from 'react-icons/io5';

const DsaAttentionBanner = ({
  holdCount = 0,
  backlogCount = 0,
  onViewAttention
}) => {
  const total = holdCount + backlogCount;
  if (total === 0) return null;

  return (
    <div className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 rounded-2xl p-3.5 sm:px-5 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 shrink-0">
          <IoAlertCircleOutline size={18} />
        </div>
        <div className="space-y-0.5">
          <p className="font-bold text-slate-800 dark:text-slate-200">
            {total} question{total > 1 ? 's' : ''} need attention
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-[11px]">
            {backlogCount > 0 && <span>{backlogCount} in backlog </span>}
            {backlogCount > 0 && holdCount > 0 && <span>· </span>}
            {holdCount > 0 && <span>{holdCount} on hold</span>}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onViewAttention}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 font-bold hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-colors self-start sm:self-auto cursor-pointer"
      >
        <span>Review questions</span>
        <IoArrowForward size={12} />
      </button>
    </div>
  );
};

export default DsaAttentionBanner;
