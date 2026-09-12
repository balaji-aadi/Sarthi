import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  LuClock, 
  LuArrowLeft, 
  LuArrowRight, 
  LuPlay, 
  LuCopy, 
  LuCheck, 
  LuBookOpen,
  LuHelpCircle,
  LuVideo,
  LuShieldAlert,
  LuFileText
} from 'react-icons/lu';
import LldHeaderBar from '../../components/lld/common/LldHeaderBar';
import LldNotesDrawer from '../../components/lld/notes/LldNotesDrawer';
import { useLldLanguage } from '../../context/LldLanguageContext';
import { TaskApi } from '../../services/api/Task.api';
import { getLessonPresentation, getLessonNav } from '../../utils/lldPresentationMapper';
import '../../styles/lldEnvironment.css';

export default function LldLessonPage() {
  const { lessonId, chapterNum } = useParams();
  const navigate = useNavigate();
  const { language } = useLldLanguage();

  const [dbTask, setDbTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showRawSource, setShowRawSource] = useState(false);

  // Fetch task from DB if valid MongoDB ObjectId or taskId
  useEffect(() => {
    if (!lessonId) return;
    let isMounted = true;

    async function loadTask() {
      try {
        setLoading(true);
        const res = await TaskApi.getTaskById(lessonId);
        if (isMounted && res.data?.data) {
          setDbTask(res.data.data);
        }
      } catch (err) {
        // Fallback to manifest data
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadTask();
    return () => { isMounted = false; };
  }, [lessonId]);

  // Connect to authoritative presentation mapper
  const lessonData = useMemo(() => {
    return getLessonPresentation(dbTask || lessonId, language);
  }, [dbTask, lessonId, language]);

  // Derive sequence navigation
  const nav = useMemo(() => {
    return getLessonNav(lessonData.taskId);
  }, [lessonData.taskId]);

  const handleCopyCode = () => {
    if (!lessonData.codeSnippet) return;
    navigator.clipboard.writeText(lessonData.codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const breadcrumbs = [
    { label: `Chapter ${chapterNum || 1}`, onClick: () => navigate('/arena/lld') },
    { label: lessonData.topic.split(':')[0] || 'Topic' },
    { label: lessonData.title }
  ];

  const primaryPracticeId = lessonData.primaryDrill?.taskId || 'LLDP1-D1.1.1';

  return (
    <div className="lld-environment">
      {/* Header Bar */}
      <LldHeaderBar
        breadcrumbs={breadcrumbs}
        isNotesOpen={isNotesOpen}
        onToggleNotes={() => setIsNotesOpen(!isNotesOpen)}
      />

      {/* Main Reading Container (Clamped strictly at 740px) */}
      <main className="lld-reading-col">
        {/* Back Link */}
        <button
          type="button"
          onClick={() => navigate('/arena/lld')}
          className="flex items-center gap-1.5 text-xs font-medium text-[var(--lld-text-secondary)] hover:text-[var(--lld-text-primary)] mb-6 transition-colors cursor-pointer"
        >
          <LuArrowLeft size={13} />
          <span>Back to Chapter Table of Contents</span>
        </button>

        {/* Lesson Header */}
        <header className="mb-6">
          <span className="lld-title-sm">{lessonData.topic}</span>
          <h1 className="lld-h1">{lessonData.title}</h1>

          {/* Technical Metadata Strip */}
          <div className="lld-meta-strip">
            <div className="lld-meta-item">
              <span className="w-2 h-2 rounded-full bg-[var(--lld-brand)]" />
              <span>Language: <strong className="font-mono text-[var(--lld-text-primary)] uppercase">{language}</strong></span>
            </div>
            <div className="lld-meta-item">
              <LuClock size={13} />
              <span>Study Time: ~{lessonData.targetMinutes} min</span>
            </div>
            <div className="lld-meta-item">
              <LuBookOpen size={13} />
              <span>Format: Technical Architecture Guide</span>
            </div>
            {lessonData.contentCompleteness === 'NEEDS_PEDAGOGICAL_ENRICHMENT' && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                Presentation Layer Enriched
              </span>
            )}
          </div>
        </header>

        {/* Section: What You Will Learn */}
        <section aria-labelledby="section-learn">
          <h2 id="section-learn" className="lld-h2">What You Will Learn</h2>
          <div className="lld-prose">
            <ul>
              {lessonData.whatYouWillLearn.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* Section: Why This Matters */}
        <section aria-labelledby="section-why">
          <h2 id="section-why" className="lld-h2">
            <LuShieldAlert size={16} className="text-[var(--lld-brand)]" />
            <span>Why This Matters in LLD</span>
          </h2>
          <div className="lld-prose">
            <p>{lessonData.whyThisMatters}</p>
          </div>
        </section>

        {/* Section: Core Concept & Mental Model */}
        <section aria-labelledby="section-core">
          <h2 id="section-core" className="lld-h2">Core Concept & Mental Model</h2>
          <div className="lld-prose">
            <p>{lessonData.coreConcept}</p>
          </div>
        </section>

        {/* Section: Language-Specific Explanation */}
        <section aria-labelledby="section-lang">
          <h2 id="section-lang" className="lld-h2">
            <span>{lessonData.langModelTitle}</span>
          </h2>
          <div className="lld-prose">
            <p>{lessonData.langModelExplanation}</p>
          </div>

          {/* Code Example Block */}
          <div className="lld-code-block">
            <div className="lld-code-header">
              <span className="lld-code-header-lang">{lessonData.codeLang}</span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="lld-code-copy-btn"
                title="Copy code to clipboard"
              >
                {copied ? <LuCheck size={13} className="text-emerald-500" /> : <LuCopy size={13} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="lld-code-content">
              <code>{lessonData.codeSnippet}</code>
            </pre>
          </div>
        </section>

        {/* Section: What You Should Observe */}
        <section aria-labelledby="section-observe">
          <h2 id="section-observe" className="lld-h2">What You Should Observe</h2>
          <div className="lld-callout">
            <div className="lld-callout-title">Key Architectural Invariant</div>
            <p className="text-[var(--lld-text-primary)] text-sm leading-relaxed">
              {lessonData.whatToObserve}
            </p>
          </div>
        </section>

        {/* Optional Video Container Slot (Clean technical 16:9 container) */}
        <section aria-labelledby="section-video">
          <div className="lld-video-container">
            <div className="p-4 sm:p-5 flex items-center justify-between border-b border-[var(--lld-border)]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-[var(--lld-brand-subtle)] text-[var(--lld-brand)] flex items-center justify-center">
                  <LuVideo size={15} />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--lld-text-secondary)]">Technical Video Explanation</h3>
                  <p className="text-sm font-semibold text-[var(--lld-text-primary)]">{lessonData.title} ({language.toUpperCase()})</p>
                </div>
              </div>
              <span className="text-xs font-mono text-[var(--lld-text-secondary)]">~{lessonData.targetMinutes} min</span>
            </div>
            <div className="p-8 text-center bg-[var(--lld-code-bg)]">
              <p className="text-xs text-[var(--lld-text-secondary)] font-mono">
                [ Technical architecture video container — pluggable for future CDN stream ]
              </p>
            </div>
          </div>
        </section>

        {/* Section: Think About It (Interview Defense) */}
        <section aria-labelledby="section-think">
          <h2 id="section-think" className="lld-h2">
            <LuHelpCircle size={16} className="text-[var(--lld-brand)]" />
            <span>Think About It (Interview Defense)</span>
          </h2>
          <div className="p-4 rounded-md border border-[var(--lld-border)] bg-[var(--lld-surface)] text-sm leading-relaxed italic text-[var(--lld-text-primary)]">
            "{lessonData.thinkAboutIt}"
          </div>
        </section>

        {/* Section: Practice Exercise & Workspace Bridge */}
        <section aria-labelledby="section-practice">
          <div className="lld-practice-bridge">
            <span className="lld-title-sm text-[var(--lld-brand)]">Hands-On Practice</span>
            <h3 className="text-base font-semibold text-[var(--lld-text-primary)] mt-1 mb-2">
              {lessonData.primaryDrill ? lessonData.primaryDrill.taskName : 'Practice: Reinforce This Concept in Code'}
            </h3>
            <p className="text-sm text-[var(--lld-text-secondary)] mb-4 leading-relaxed">
              {lessonData.primaryDrill ? lessonData.primaryDrill.description : 'Implement the class model in your chosen language and verify that all state invariants hold under execution.'}
            </p>

            <button
              type="button"
              onClick={() => navigate(`/arena/lld/workspace/${primaryPracticeId}`)}
              className="lld-btn-primary"
            >
              <LuPlay size={14} className="fill-current" />
              <span>Open Practice Workspace in {language.toUpperCase()} →</span>
            </button>
          </div>
        </section>

        {/* Expandable Raw Source Inspector (Preserves MongoDB taskDescription faithfully) */}
        {lessonData.sourceDescription && (
          <div className="mt-8 pt-4 border-t border-[var(--lld-border)] text-xs text-[var(--lld-text-secondary)]">
            <button
              type="button"
              onClick={() => setShowRawSource(!showRawSource)}
              className="flex items-center gap-1.5 hover:text-[var(--lld-text-primary)] transition-colors cursor-pointer"
            >
              <LuFileText size={13} />
              <span>{showRawSource ? 'Hide' : 'Inspect'} Original Database Concept Notes ({lessonData.taskId})</span>
            </button>
            {showRawSource && (
              <pre className="mt-3 p-4 rounded bg-[var(--lld-code-bg)] border border-[var(--lld-border)] overflow-x-auto text-[11px] leading-relaxed whitespace-pre-wrap font-mono text-[var(--lld-text-secondary)]">
                {lessonData.sourceDescription}
              </pre>
            )}
          </div>
        )}

        {/* Footer Navigation (Previous & Next Lesson) */}
        <nav className="lld-lesson-nav" aria-label="Lesson Navigation">
          {nav.previous ? (
            <button
              type="button"
              onClick={() => navigate(`/arena/lld/lesson/${nav.previous.taskId}`)}
              className="lld-nav-link"
              title={nav.previous.taskName}
            >
              <LuArrowLeft size={14} />
              <span className="truncate max-w-[200px]">Prev: {nav.previous.taskName.replace(/^Unit\s+[\d\.]+\s*:\s*/i, '')}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/arena/lld')}
              className="lld-nav-link"
            >
              <LuArrowLeft size={14} />
              <span>Table of Contents</span>
            </button>
          )}

          {nav.next ? (
            <button
              type="button"
              onClick={() => navigate(`/arena/lld/lesson/${nav.next.taskId}`)}
              className="lld-nav-link font-semibold text-[var(--lld-brand)]"
              title={nav.next.taskName}
            >
              <span className="truncate max-w-[200px]">Next: {nav.next.taskName.replace(/^Unit\s+[\d\.]+\s*:\s*/i, '')}</span>
              <LuArrowRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate(`/arena/lld/workspace/${primaryPracticeId}`)}
              className="lld-nav-link font-semibold text-[var(--lld-brand)]"
            >
              <span>Start Practice</span>
              <LuArrowRight size={14} />
            </button>
          )}
        </nav>
      </main>

      {/* Personal Notes Slide-Over Drawer */}
      <LldNotesDrawer
        isOpen={isNotesOpen}
        onClose={() => setIsNotesOpen(false)}
        lessonId={lessonData.taskId || 'global'}
        lessonTitle={lessonData.title}
      />
    </div>
  );
}
