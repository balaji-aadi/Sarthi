import React from 'react';

/**
 * SarathiLoader
 * Unified, professional, high-fidelity loading state across Sarthi.
 * Replaces mismatched spinners with a consistent executive brand experience.
 */
export const SarathiLoader = ({
  message = 'Loading workspace...',
  size = 'md',
  fullPage = false,
  className = ''
}) => {
  const sizeMap = {
    sm: {
      ring: 'w-6 h-6 border-2',
      inner: 'w-2 h-2',
      text: 'text-xs'
    },
    md: {
      ring: 'w-10 h-10 border-2.5',
      inner: 'w-3.5 h-3.5',
      text: 'text-xs'
    },
    lg: {
      ring: 'w-14 h-14 border-3',
      inner: 'w-5 h-5',
      text: 'text-sm'
    }
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const content = (
    <div className={`flex flex-col items-center justify-center gap-3.5 ${className}`}>
      {/* Orbital Glowing Ring */}
      <div className="relative flex items-center justify-center">
        {/* Outer subtle glow */}
        <div className={`absolute ${currentSize.ring} rounded-full bg-primary/10 dark:bg-primary/20 animate-ping opacity-40`} />

        {/* Precision rotating orbital ring */}
        <div
          className={`${currentSize.ring} rounded-full border-slate-200 dark:border-slate-800 border-t-primary dark:border-t-primary animate-spin`}
        />

        {/* Inner pulsing core mark */}
        <div
          className={`absolute ${currentSize.inner} rounded-full bg-primary shadow-xs animate-pulse`}
        />
      </div>

      {/* Clean, authoritative typography */}
      {message && (
        <p className={`${currentSize.text} font-semibold text-slate-500 dark:text-slate-400 tracking-tight select-none`}>
          {message}
        </p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
        {content}
      </div>
    );
  }

  return (
    <div className="w-full py-12 flex items-center justify-center">
      {content}
    </div>
  );
};

export default SarathiLoader;
