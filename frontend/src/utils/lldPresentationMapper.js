/**
 * SARTHI LLD PRESENTATION MAPPER
 * 
 * Transformation and classification engine that maps the 202 read-only
 * MongoDB curriculum tasks into developer-first learning views.
 * 
 * STRICT CONTENT OWNERSHIP INVARIANT:
 * - MongoDB tasks remain untouched source data.
 * - Newly authored pedagogical definitions exist in lldPresentationDefinitions.js.
 * - This file contains strictly mapping, classification, and navigation logic.
 * - Zero database mutations.
 */

import manifestData from '../data/lld202Manifest.json';
import { LANGUAGE_META, TOPIC_EDUCATIONAL_DEFINITIONS } from '../data/lldPresentationDefinitions';

// Build lookup indices from manifest
const manifestByTaskId = new Map(manifestData.map(item => [item.taskId, item]));
const manifestByParentId = new Map();
for (const item of manifestData) {
  if (item.parentId) {
    if (!manifestByParentId.has(item.parentId)) {
      manifestByParentId.set(item.parentId, []);
    }
    manifestByParentId.get(item.parentId).push(item);
  }
}

/**
 * Retrieves the fully mapped presentation model for any Lesson.
 * Combines MongoDB source fields with language-specific models.
 */
export function getLessonPresentation(lessonIdOrTask, activeLanguage = 'cpp') {
  const taskId = typeof lessonIdOrTask === 'string' ? lessonIdOrTask : lessonIdOrTask?.taskId;
  
  // Lookup in manifest by taskId or taskName
  let manifestRecord = manifestByTaskId.get(taskId);
  if (!manifestRecord && typeof lessonIdOrTask === 'object' && lessonIdOrTask.taskName) {
    manifestRecord = manifestData.find(m => m.taskName === lessonIdOrTask.taskName);
  }

  // Fallback to default first lesson if not found
  if (!manifestRecord) {
    manifestRecord = manifestData.find(m => m.taskType === 'CurriculumUnit') || manifestData[0];
  }

  const parsed = manifestRecord.parsedSections || {};
  const lang = ['cpp', 'java', 'python'].includes(activeLanguage) ? activeLanguage : 'cpp';
  const langMeta = LANGUAGE_META[lang];

  // Derive child drills
  const childDrills = manifestByParentId.get(manifestRecord.taskId) || [];
  const primaryDrill = childDrills[0] || null;

  // Clean title without internal curriculum prefixes
  const cleanTitle = manifestRecord.taskName
    .replace(/^Unit\s+[\d\.]+\s*:\s*/i, '')
    .replace(/^Module\s+[\d\.]+\s*:\s*/i, '')
    .trim();

  // What You Will Learn: prefer source concept topics if present
  let whatYouWillLearn = [];
  if (manifestRecord.conceptTopics && manifestRecord.conceptTopics.length > 0) {
    whatYouWillLearn = manifestRecord.conceptTopics.map(t => `Master ${t.toLowerCase()} and its architectural boundaries.`);
  } else if (parsed.whatIsIt) {
    whatYouWillLearn = [
      parsed.whatIsIt.slice(0, 140) + '...',
      `Understand how ${langMeta.label} enforces state invariants using ${langMeta.ownershipPrimitive}.`,
      `Prevent production regressions using ${langMeta.cleanupMechanism}.`
    ];
  } else {
    whatYouWillLearn = [
      `Understand the architectural foundation of ${cleanTitle}.`,
      `Analyze why unconstrained state mutations break domain invariants.`,
      `Implement idiomatic class structures in ${langMeta.label}.`
    ];
  }

  // Why This Matters: prefer source data, fallback to presentation enrichment
  const whyThisMatters = parsed.whyThisMatters ||
    `In enterprise software, an object model lacking explicit boundaries inevitably leads to resource leaks, race conditions, or fragile base classes. Before applying design patterns, you must establish clear ownership and invariant guarantees in ${langMeta.label}.`;

  // Core Concept: prefer source data
  const coreConcept = parsed.whatIsIt || parsed.conceptNotes ||
    `Every domain entity must have a well-defined lifecycle and single reason to change. In ${langMeta.label}, this is governed by ${langMeta.memoryModel} and expressed through ${langMeta.abstractionPrimitive}.`;

  // Language-Specific Model lookup from definitions dictionary
  const langModel = resolveLanguageModel(manifestRecord.taskId, cleanTitle, lang);

  // Key Invariants / What to Observe
  const whatToObserve = parsed.invariants ||
    `Notice that when using ${langMeta.cleanupMechanism}, resource release is guaranteed by the runtime rather than relying on manual cleanup calls from callers.`;

  // Think About It: interview defense scenario
  const thinkAboutIt = parsed.thinkAbout ||
    `"How does your design guarantee invariant protection when multiple client threads invoke methods concurrently in ${langMeta.label}?"`;

  return {
    taskId: manifestRecord.taskId,
    taskName: manifestRecord.taskName,
    title: cleanTitle,
    topic: manifestRecord.parentTaskName || `Topic ${manifestRecord.phase}`,
    phase: manifestRecord.phase,
    targetMinutes: manifestRecord.targetMinutes,
    difficulty: manifestRecord.difficulty,
    contentCompleteness: manifestRecord.contentCompleteness,
    whatYouWillLearn,
    whyThisMatters,
    coreConcept,
    languageMeta: langMeta,
    langModelTitle: langModel.title,
    langModelExplanation: langModel.explanation,
    codeLang: langModel.lang,
    codeSnippet: langModel.code,
    whatToObserve,
    thinkAboutIt,
    primaryDrill: primaryDrill ? {
      taskId: primaryDrill.taskId,
      taskName: primaryDrill.taskName.replace(/^Drill\s+[\d\.]+\s*:\s*/i, ''),
      description: primaryDrill.parsedSections?.yourTask || primaryDrill.sourceRawDescription?.slice(0, 200) + '...'
    } : null,
    sourceDescription: manifestRecord.sourceRawDescription
  };
}

/**
 * Returns the evolutionary version presentation for any Design Challenge version.
 */
export function getVersionEvolutionPresentation(versionTaskIdOrObj) {
  const taskId = typeof versionTaskIdOrObj === 'string' ? versionTaskIdOrObj : versionTaskIdOrObj?.taskId;
  const manifestRecord = manifestByTaskId.get(taskId) || manifestData.find(m => m.taskType === 'ProblemVersion');
  if (!manifestRecord) return null;

  const parsed = manifestRecord.parsedSections || {};
  const parent = manifestByTaskId.get(manifestRecord.parentId) || null;

  return {
    taskId: manifestRecord.taskId,
    taskName: manifestRecord.taskName,
    challengeTaskId: parent ? parent.taskId : null,
    challengeName: parent ? parent.taskName : 'Design Challenge',
    phase: manifestRecord.phase,
    whatChanged: parsed.whatChanged || 'Initial baseline requirement or incremental capability extension.',
    whyPreviousStruggles: parsed.whyPreviousStruggles || 'Procedural switch statements or tight coupling struggle to scale when new variants are added.',
    newRequirements: parsed.newRequirements || manifestRecord.sourceRawDescription?.slice(0, 300) || 'Implement the required class structures and invariants.',
    architecturalPressure: parsed.architecturalPressure || 'Ensure compliance with the Open-Closed Principle and maintain domain invariants.',
    reconsiderPrompt: 'Consider whether composition or a behavioral design pattern allows this new requirement to be integrated without rewriting existing classes.',
    targetMinutes: manifestRecord.targetMinutes || 30,
    difficulty: manifestRecord.difficulty || 'medium'
  };
}

/**
 * Resolves the appropriate educational definition for a given task and language.
 */
function resolveLanguageModel(taskId, lessonTitle, lang) {
  const normalized = (taskId + ' ' + lessonTitle).toLowerCase();

  if (normalized.includes('1.1') || normalized.includes('lifetime') || normalized.includes('scope')) {
    return TOPIC_EDUCATIONAL_DEFINITIONS.lifetime_and_scope[lang];
  }

  if (normalized.includes('1.2') || normalized.includes('invariant') || normalized.includes('immutable') || normalized.includes('protecting')) {
    return TOPIC_EDUCATIONAL_DEFINITIONS.encapsulation_and_invariants[lang];
  }

  return TOPIC_EDUCATIONAL_DEFINITIONS.default_polymorphism[lang];
}

/**
 * Returns sequence navigation (previous & next lesson) across all 43 curriculum units.
 */
export function getLessonNav(currentTaskId) {
  const allUnits = manifestData.filter(m => m.taskType === 'CurriculumUnit' || m.presentationType === 'ARENA_STAGE_LESSON');
  const idx = allUnits.findIndex(m => m.taskId === currentTaskId);

  return {
    previous: idx > 0 ? allUnits[idx - 1] : null,
    next: idx >= 0 && idx < allUnits.length - 1 ? allUnits[idx + 1] : null
  };
}
