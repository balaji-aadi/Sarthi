/**
 * Curriculum & Learning Track Utilities for Sarthi (LLD v2.1 + DSA)
 */

export const LLD_BRANCH_ID = '6a083a77f7e66b83659e7174';
export const DSA_BRANCH_ID = '6a081b6e111c99b633b00d76';

/**
 * Check if a branch is LLD
 */
export const isLldBranch = (branch) => {
  if (!branch) return false;
  const id = typeof branch === 'string' ? branch : (branch._id || branch.id);
  if (id === LLD_BRANCH_ID) return true;
  const str = `${branch.name || ''} ${branch.slug || ''}`.toLowerCase();
  return str.includes('lld') || str.includes('low level design');
};

/**
 * Check if a branch is DSA
 */
export const isDsaBranch = (branch) => {
  if (!branch) return false;
  const id = typeof branch === 'string' ? branch : (branch._id || branch.id);
  if (id === DSA_BRANCH_ID) return true;
  const str = `${branch.name || ''} ${branch.slug || ''}`.toLowerCase();
  return str.includes('dsa') || str.includes('data structures');
};

/**
 * Check if a branch is HLD
 */
export const isHldBranch = (branch) => {
  if (!branch) return false;
  const str = `${branch.name || ''} ${branch.slug || ''}`.toLowerCase();
  return str.includes('hld') || str.includes('high level design') || str.includes('system design');
};

/**
 * Check if a task strictly belongs to the LLD curriculum track
 * Authoritative: Branch ID, Project Key, Project Name, or Task ID prefix.
 * task.curriculumMeta or task.taskType alone NEVER classifies a task as LLD.
 */
export const isLldTask = (task) => {
  if (!task) return false;
  if (task.branchId === LLD_BRANCH_ID) return true;
  const projectKey = (typeof task.projectName === 'object' ? task.projectName?.key : '') || '';
  const projectNameStr = (typeof task.projectName === 'object' ? task.projectName?.name : String(task.projectName || '')) || '';
  const taskIdStr = task.taskId || '';

  if (taskIdStr.toUpperCase().startsWith('LLD')) return true;
  if (projectKey.toUpperCase().startsWith('LLD')) return true;
  if (projectNameStr.toUpperCase().includes('LLD') || projectNameStr.toUpperCase().includes('LOW LEVEL DESIGN')) return true;

  return false;
};

/**
 * Check if a task belongs to DSA
 */
export const isDsaTask = (task) => {
  if (!task) return false;
  if (task.branchId === DSA_BRANCH_ID) return true;
  const projectKey = (typeof task.projectName === 'object' ? task.projectName?.key : '') || '';
  const projectNameStr = (typeof task.projectName === 'object' ? task.projectName?.name : String(task.projectName || '')) || '';
  const taskIdStr = task.taskId || '';

  return (
    taskIdStr.toUpperCase().startsWith('DSA') ||
    projectKey.toUpperCase().includes('DSA') ||
    projectNameStr.toUpperCase().includes('DSA') ||
    projectNameStr.toUpperCase().includes('DATA STRUCTURE')
  );
};

/**
 * Determine the specific curriculum node type for an LLD task
 * Returns: 'module' | 'unit' | 'drill' | 'problem' | 'version' | null
 */
export const getCurriculumNodeType = (task) => {
  if (!task) return null;
  // STRICT ISOLATION: Never treat non-LLD tasks as LLD curriculum nodes
  if (!isLldTask(task)) return null;

  const rawType = task.curriculumMeta?.nodeType || task.taskType;
  if (!rawType) return null;
  const norm = String(rawType).toLowerCase().replace(/[_-]/g, '');
  if (norm.includes('module')) return 'module';
  if (norm.includes('unit')) return 'unit';
  if (norm.includes('drill')) return 'drill';
  if (norm.includes('problem') && !norm.includes('version')) return 'problem';
  if (norm.includes('version')) return 'version';
  return rawType;
};

/**
 * Check if task is any curriculum item
 */
export const isCurriculumItem = (task) => {
  return getCurriculumNodeType(task) !== null;
};

/**
 * Badge style for Action Verbs
 */
export const getActionVerbStyle = (verb) => {
  const v = (verb || '').toUpperCase().trim();
  switch (v) {
    case 'BUILD':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
    case 'REFACTOR':
      return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
    case 'COMPARE':
      return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800';
    case 'EXTEND':
      return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800';
    case 'DEFEND':
      return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800';
    case 'PREDICT':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  }
};

/**
 * Format Level Label
 */
export const formatLevelLabel = (curriculumMeta) => {
  if (!curriculumMeta) return null;
  const lvl = (curriculumMeta.level || '').toUpperCase().trim();
  if (lvl === 'A' || lvl === 'LEVEL A') return 'Level A · Concept Drill';
  if (lvl === 'B' || lvl === 'LEVEL B') return 'Level B · Design Exercise';
  if (lvl === 'C' || lvl === 'LEVEL C') return 'Level C · Synthesis / Mock';
  return curriculumMeta.levelName || curriculumMeta.level || null;
};

/**
 * Format Arena Display Name cleanly
 */
export const formatArenaName = (name) => {
  if (!name) return '';
  const match = name.match(/^(LLD Phase \d+)(?::\s*(.*))?$/i);
  if (match) {
    return {
      short: match[1],
      subtitle: match[2] || ''
    };
  }
  return {
    short: name,
    subtitle: ''
  };
};

/**
 * Resolves clean 3-tier hierarchy and compact metadata row for Curriculum Tasks
 * Tier 1: Phase
 * Tier 2: Unit
 * Tier 3: Drill / Problem
 * Compact Meta: BUILD · Level A · 15 min · Easy
 */
export const getCurriculumDrawerHierarchy = (task) => {
  if (!task || !isLldTask(task)) return null;

  const nodeType = getCurriculumNodeType(task);
  if (!nodeType) return null;

  // Phase Tag & Title
  let phaseTag = 'LLD PHASE 1';
  let phaseTitle = 'Object & C++ Foundations';

  const rawProjectName = typeof task.projectName === 'object' ? task.projectName?.name : task.projectName;
  if (rawProjectName) {
    const pMatch = rawProjectName.match(/^(LLD\s*Phase\s*\d+)(?::\s*(.*))?$/i);
    if (pMatch) {
      phaseTag = pMatch[1].toUpperCase();
      if (pMatch[2]) phaseTitle = pMatch[2].trim();
    }
  } else if (task.taskId) {
    const m = task.taskId.match(/^LLDP(\d+)/i);
    if (m) {
      const pNum = m[1];
      phaseTag = `LLD PHASE ${pNum}`;
      const phaseNames = {
        '1': 'Object & C++ Foundations',
        '2': 'Design Principles & SOLID',
        '3': 'Design Patterns & Idioms',
        '4': 'Concurrency & High-Performance LLD',
        '5': 'Full System Synthesis & Interview Prep'
      };
      if (phaseNames[pNum]) phaseTitle = phaseNames[pNum];
    }
  }

  // Parent Context
  const parentName = typeof task.parentTask === 'object' ? task.parentTask?.taskName : null;
  const parentId = typeof task.parentTask === 'object' ? task.parentTask?.taskId : null;

  let tier1Tag = phaseTag;
  let tier1Title = phaseTitle;
  let tier2Tag = 'UNIT 1.1';
  let tier2Title = 'Learning Unit';
  let tier3Tag = 'TASK';
  let tier3Title = task.taskName || '';
  let actionVerb = task.curriculumMeta?.actionVerb || 'BUILD';
  let level = null; // Default to null; only drills get Level A/B/C
  let isV1 = false;

  // 1. VERSION
  if (nodeType === 'version') {
    const vMatch = (task.taskId || '').match(/P(\d+)-V(\d+)/i) || (task.taskName || '').match(/Version\s*(\d+)/i);
    const probNum = vMatch ? vMatch[1] : '1';
    const verNum = vMatch ? vMatch[2] : '1';
    isV1 = verNum === '1';

    tier2Tag = `MAJOR PROBLEM ${probNum}`;
    tier2Title = parentName ? parentName.replace(/^(Problem|Major Problem)\s*\d*:\s*/i, '').trim() : 'System Design';
    tier3Tag = `VERSION ${verNum}`;
    tier3Title = (task.taskName || '').replace(/^(Version|Problem Version)\s*\d*:\s*/i, '').trim();
    actionVerb = isV1 ? 'SPECIFICATION' : 'EVOLUTION';
    level = null; // No Level A/B/C for versions
  }
  // 2. MAJOR PROBLEM
  else if (nodeType === 'problem') {
    const pMatch = (task.taskId || '').match(/P(\d+)/i);
    const probNum = pMatch ? pMatch[1] : '1';
    tier2Tag = 'SYSTEM DESIGN';
    tier2Title = 'Multi-Stage Evolving System';
    tier3Tag = `MAJOR PROBLEM ${probNum}`;
    tier3Title = (task.taskName || '').replace(/^Major Problem\s*\d*:\s*/i, '').trim();
    actionVerb = 'DESIGN & EVOLVE';
    level = null; // No Level A/B/C for major problems
  }
  // 3. DRILL
  else if (nodeType === 'drill') {
    const drillMatch = (task.taskId || '').match(/D(\d+)\.(\d+)(?:\.(\d+))?/i);
    if (drillMatch) {
      tier2Tag = `UNIT ${drillMatch[1]}.${drillMatch[2]}`;
      tier3Tag = drillMatch[3] ? `DRILL ${drillMatch[1]}.${drillMatch[2]}.${drillMatch[3]}` : `DRILL ${drillMatch[1]}.${drillMatch[2]}`;
    } else {
      tier2Tag = 'UNIT';
      tier3Tag = 'DRILL';
    }
    tier2Title = parentName ? parentName.replace(/^Unit\s*[\d\.]+:\s*/i, '').trim() : 'Concept Unit';
    tier3Title = (task.taskName || '').replace(/\s+Drill$/i, '').trim();
    actionVerb = task.curriculumMeta?.actionVerb || 'BUILD';
    // Level taxonomy is strictly for drills
    level = task.curriculumMeta?.level 
      ? (task.curriculumMeta.level.toUpperCase().startsWith('LEVEL') ? task.curriculumMeta.level : `Level ${task.curriculumMeta.level}`) 
      : 'Level A';
  }
  // 4. UNIT
  else if (nodeType === 'unit') {
    const uMatch = (task.taskId || '').match(/U(\d+)\.(\d+)(?:\.(\d+))?/i);
    if (uMatch) {
      tier2Tag = `MODULE ${uMatch[1]}`;
      tier3Tag = `UNIT ${uMatch[1]}.${uMatch[2]}${uMatch[3] ? `.${uMatch[3]}` : ''}`;
    } else {
      tier2Tag = 'MODULE';
      tier3Tag = 'UNIT';
    }
    tier2Title = parentName ? parentName.replace(/^Module\s*[\d\.]+:\s*/i, '').trim() : 'Curriculum Module';
    tier3Title = (task.taskName || '').replace(/^Unit\s*[\d\.]+:\s*/i, '').trim();
    actionVerb = 'CONCEPT & DISCOVERY';
    level = null;
  }

  const rawTime = task.curriculumMeta?.targetTimeMinutes ? `${task.curriculumMeta.targetTimeMinutes} min` : (nodeType === 'problem' ? '75 min' : nodeType === 'version' ? '30 min' : '15 min');
  const rawDiff = task.curriculumMeta?.difficulty 
    ? (task.curriculumMeta.difficulty.charAt(0).toUpperCase() + task.curriculumMeta.difficulty.slice(1).toLowerCase()) 
    : (nodeType === 'problem' ? 'Medium' : 'Easy');

  return {
    phaseTag: tier1Tag,
    phaseTitle: tier1Title,
    unitTag: tier2Tag,
    unitTitle: tier2Title,
    itemTag: tier3Tag,
    itemTitle: tier3Title,
    actionVerb,
    level,
    targetTime: rawTime,
    difficulty: rawDiff,
    isV1,
    conceptTopics: Array.isArray(task.curriculumMeta?.conceptTopics) ? task.curriculumMeta.conceptTopics : []
  };
};

/**
 * Resolves clean prerequisites, guaranteeing that a task NEVER shows itself as a prerequisite.
 */
export const getSafePrerequisites = (task, hier) => {
  if (!task) return 'Basic C++ syntax & functions';

  const nodeType = getCurriculumNodeType(task);
  const rawPrereqs = task.curriculumMeta?.prerequisites;

  // Filter out any self-references
  if (rawPrereqs) {
    const list = Array.isArray(rawPrereqs) ? rawPrereqs : [rawPrereqs];
    const cleanList = list.filter(p => {
      if (!p) return false;
      const str = String(p).trim().toLowerCase();
      const taskName = (task.taskName || '').trim().toLowerCase();
      const taskId = (task.taskId || '').trim().toLowerCase();
      return str !== taskName && str !== taskId && !str.includes(taskId) && !taskName.includes(str);
    });

    if (cleanList.length > 0) {
      return cleanList.join(', ');
    }
  }

  // Smart Contextual Fallbacks
  if (nodeType === 'version') {
    const vMatch = (task.taskId || '').match(/V(\d+)/i);
    const verNum = vMatch ? parseInt(vMatch[1], 10) : 1;
    if (verNum === 1) {
      return 'Core Phase Foundations & Working Knowledge of OOP';
    }
    return `Version ${verNum - 1} Baseline Implementation`;
  }

  if (nodeType === 'problem') {
    return `${hier?.phaseTag || 'Phase'} Core Modules & Drills`;
  }

  if (nodeType === 'drill') {
    if (hier?.unitTitle && hier.unitTitle !== hier.itemTitle) {
      return `${hier.unitTag}: ${hier.unitTitle}`;
    }
    return 'Basic C++ syntax & functions';
  }

  return 'Basic C++ syntax & standard library';
};

/**
 * Calculates a natural sequence sort key for curriculum tasks so that:
 * - Module comes first (e.g. LLDP1-M1)
 * - Inside subtasks: Unit 1.1.1 comes immediately BEFORE Drill 1.1.1
 * - Drills follow their respective Unit
 * - Problem Versions follow after all Units & Drills
 */
export const getCurriculumSortKey = (taskId) => {
  if (!taskId || typeof taskId !== 'string') return '999';
  const pad = (n) => String(n || 0).padStart(2, '0');

  // Match Module: LLDP1-M1
  const mMatch = taskId.match(/^LLDP(\d+)-M(\d+)$/);
  if (mMatch) {
    return `LLD_${pad(mMatch[1])}_0_M_${pad(mMatch[2])}`;
  }

  // Match Major Problem: LLDP1-P1
  const pMatch = taskId.match(/^LLDP(\d+)-P(\d+)$/);
  if (pMatch) {
    return `LLD_${pad(pMatch[1])}_1_P_${pad(pMatch[2])}`;
  }

  // Match Unit: LLDP1-U1.1.1 -> p=1, m=1, u=1, sub=1
  const uMatch = taskId.match(/^LLDP(\d+)-U(\d+)\.(\d+)(?:\.(\d+))?$/);
  if (uMatch) {
    const [, p, m, u, sub] = uMatch;
    return `LLD_${pad(p)}_M${pad(m)}_U${pad(u)}_${pad(sub)}_0_UNIT`;
  }

  // Match Drill: LLDP1-D1.1.1 -> p=1, m=1, u=1, d=1
  const dMatch = taskId.match(/^LLDP(\d+)-D(\d+)\.(\d+)(?:\.(\d+))?(?:\.(\d+))?$/);
  if (dMatch) {
    const [, p, m, u, d, subD] = dMatch;
    return `LLD_${pad(p)}_M${pad(m)}_U${pad(u)}_${pad(d)}_1_DRILL_${pad(subD || 0)}`;
  }

  // Match Problem Version: LLDP1-P1-V1
  const vMatch = taskId.match(/^LLDP(\d+)-P(\d+)-V(\d+)$/);
  if (vMatch) {
    const [, p, prob, v] = vMatch;
    return `LLD_${pad(p)}_Z_PROBLEM_${pad(prob)}_VERSION_${pad(v)}`;
  }

  return taskId;
};

/**
 * Authoritatively determines the module context ('DSA' | 'LLD' | 'HLD' | 'UNKNOWN')
 * Never defaults unknown modules to LLD.
 */
export const getModuleContext = ({ project, activeBranch, slug } = {}) => {
  // 1. Authoritative Branch Identity
  if (isDsaBranch(activeBranch)) return 'DSA';
  if (isLldBranch(activeBranch)) return 'LLD';
  if (isHldBranch(activeBranch)) return 'HLD';

  // 2. Project Branch & Key Identity
  if (project) {
    if (project.branchId === DSA_BRANCH_ID) return 'DSA';
    if (project.branchId === LLD_BRANCH_ID) return 'LLD';
    const name = (project.name || project.label || '').toUpperCase();
    const key = (project.key || '').toUpperCase();
    if (key.startsWith('DSA') || name.includes('DSA') || name.includes('DATA STRUCTURE')) return 'DSA';
    if (key.startsWith('LLD') || name.includes('LLD') || name.includes('LOW LEVEL DESIGN')) return 'LLD';
    if (key.startsWith('HLD') || name.includes('HLD') || name.includes('HIGH LEVEL DESIGN')) return 'HLD';
  }

  // 3. Fallback Route Slug
  if (slug) {
    const s = String(slug).toLowerCase();
    if (s === 'dsa' || s.startsWith('dsa')) return 'DSA';
    if (s === 'lld' || s.startsWith('lld')) return 'LLD';
    if (s === 'hld' || s.startsWith('hld')) return 'HLD';
  }

  return 'UNKNOWN';
};

export const isDsaArena = (ctx) => getModuleContext(ctx) === 'DSA';
export const isLldArena = (ctx) => getModuleContext(ctx) === 'LLD';
export const isHldArena = (ctx) => getModuleContext(ctx) === 'HLD';


