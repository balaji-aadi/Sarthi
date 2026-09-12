import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { LuBookOpen, LuPenTool, LuSun, LuMoon } from 'react-icons/lu';
import { useLldLanguage } from '../../../context/LldLanguageContext';
import { ThemeContext } from '../../../ThemeContext';

export default function LldHeaderBar({
  breadcrumbs = [],
  isNotesOpen = false,
  onToggleNotes = () => {},
  notesCount = 0
}) {
  const navigate = useNavigate();
  const { language, setLanguage, availableLanguages } = useLldLanguage();
  const { theme, toggleTheme } = useContext(ThemeContext) || {};

  return (
    <header className="lld-header-bar">
      {/* Left: Minimal Breadcrumb */}
      <nav className="lld-breadcrumb" aria-label="Breadcrumb">
        <button
          type="button"
          onClick={() => navigate('/arena/lld')}
          className="hover:underline"
        >
          LLD
        </button>

        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={idx}>
            <span className="text-slate-500">/</span>
            {crumb.onClick ? (
              <button
                type="button"
                onClick={crumb.onClick}
                className="hover:underline truncate max-w-[140px] sm:max-w-[200px]"
                title={crumb.label}
              >
                {crumb.label}
              </button>
            ) : (
              <span
                className={`truncate max-w-[160px] sm:max-w-[260px] ${
                  idx === breadcrumbs.length - 1 ? 'lld-breadcrumb-active' : ''
                }`}
                title={crumb.label}
              >
                {crumb.label}
              </span>
            )}
          </React.Fragment>
        ))}
      </nav>

      {/* Right: Technical Controls */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Segmented Language Selector */}
        <div className="lld-lang-selector" role="group" aria-label="Language Selector">
          {availableLanguages.map((lang) => (
            <button
              key={lang.id}
              type="button"
              onClick={() => setLanguage(lang.id)}
              className={`lld-lang-btn ${language === lang.id ? 'active' : ''}`}
              title={`Switch curriculum to ${lang.label}`}
            >
              {lang.label}
            </button>
          ))}
        </div>

        {/* Theme Toggle Button */}
        {toggleTheme && (
          <button
            type="button"
            onClick={toggleTheme}
            className="p-1.5 rounded-md border border-[var(--lld-border)] bg-[var(--lld-surface)] text-[var(--lld-text-secondary)] hover:text-[var(--lld-text-primary)] transition-colors cursor-pointer"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <LuSun size={14} /> : <LuMoon size={14} />}
          </button>
        )}

        {/* Personal Notes Slide-Over Trigger */}
        <button
          type="button"
          onClick={onToggleNotes}
          className={`lld-notes-trigger ${isNotesOpen ? 'active' : ''}`}
          title="Toggle Personal Study Notes"
          aria-expanded={isNotesOpen}
        >
          <LuPenTool size={13} />
          <span className="hidden xs:inline">Notes</span>
          {notesCount > 0 && (
            <span className="text-[10px] font-mono px-1 py-0.2 rounded-full bg-[var(--lld-brand-subtle)] text-[var(--lld-brand)] font-bold">
              {notesCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
