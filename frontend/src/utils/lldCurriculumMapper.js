/**
 * Authoritative LLD Curriculum Mapper
 * Maps raw backend Task documents into the learner-first hierarchy:
 * 
 * CHAPTER (Phase)
 *   ├── TOPICS (CurriculumModule)
 *   │    └── LESSONS (CurriculumUnit)
 *   │         ├── THINK / DISCUSS (Conceptual Drill)
 *   │         └── PRACTICE (Practical Drill)
 *   └── DESIGN CHALLENGES (MajorProblem)
 *        └── VERSIONS (ProblemVersion: V1 → V2 → ... → Vn)
 */

export const getParentId = (parent) => {
  if (!parent) return null;
  if (typeof parent === 'object') {
    return (parent._id || parent.id || '').toString();
  }
  return String(parent);
};

export const getParentTaskId = (parent) => {
  if (!parent) return null;
  if (typeof parent === 'object') {
    return parent.taskId || null;
  }
  return null;
};

/**
 * Clean learner-friendly title by stripping technical prefixes like
 * "Module 1.1: ", "Unit 1.1.1: ", "Problem 1 — ", "Version 1: "
 */
export const formatLearnerTitle = (rawTitle = '') => {
  return rawTitle
    .replace(/^Module\s*[\d.]+:\s*/i, '')
    .replace(/^Unit\s*[\d.]+:\s*/i, '')
    .replace(/^Problem\s*\d+\s*—\s*/i, '')
    .replace(/^Version\s*\d+:\s*/i, '')
    .trim();
};

/**
 * Map raw task array into structured learner hierarchy
 */
export const mapLldTasksToLearnerHierarchy = (tasks = []) => {
  if (!Array.isArray(tasks) || tasks.length === 0) {
    return { topics: [], designChallenges: [], totalLessonsCount: 0, totalPracticesCount: 0 };
  }

  // 1. Separate by node type
  const rawModules = tasks.filter(t => t.taskType === 'CurriculumModule' || t.curriculumMeta?.nodeType === 'module')
    .sort((a, b) => (a.taskId || '').localeCompare(b.taskId || '', undefined, { numeric: true }));

  const rawUnits = tasks.filter(t => t.taskType === 'CurriculumUnit' || t.curriculumMeta?.nodeType === 'unit')
    .sort((a, b) => (a.taskId || '').localeCompare(b.taskId || '', undefined, { numeric: true }));

  const rawDrills = tasks.filter(t => t.taskType === 'CurriculumDrill' || t.curriculumMeta?.nodeType === 'drill')
    .sort((a, b) => (a.taskId || '').localeCompare(b.taskId || '', undefined, { numeric: true }));

  const rawMajor = tasks.filter(t => t.taskType === 'MajorProblem' || t.curriculumMeta?.nodeType === 'major_problem')
    .sort((a, b) => (a.taskId || '').localeCompare(b.taskId || '', undefined, { numeric: true }));

  const rawVersions = tasks.filter(t => t.taskType === 'ProblemVersion' || t.curriculumMeta?.nodeType === 'problem_version')
    .sort((a, b) => (a.taskId || '').localeCompare(b.taskId || '', undefined, { numeric: true }));

  // 2. Nest Drills (Practice / Think) into Lessons (Units)
  const populatedLessons = rawUnits.map(unit => {
    const unitIdStr = unit._id?.toString();
    const unitTaskId = unit.taskId;

    const matchedDrills = rawDrills.filter(drill => {
      const pId = getParentId(drill.parentTask);
      if (pId && unitIdStr && pId === unitIdStr) return true;
      const pTaskId = getParentTaskId(drill.parentTask);
      if (pTaskId && unitTaskId && pTaskId === unitTaskId) return true;
      return false;
    });

    return {
      ...unit,
      learnerTitle: formatLearnerTitle(unit.taskName),
      drills: matchedDrills
    };
  });

  // 3. Nest Lessons into Topics (Modules)
  const populatedTopics = rawModules.map(mod => {
    const modIdStr = mod._id?.toString();
    const modTaskId = mod.taskId;

    const matchedLessons = populatedLessons.filter(lesson => {
      const pId = getParentId(lesson.parentTask);
      if (pId && modIdStr && pId === modIdStr) return true;
      const pTaskId = getParentTaskId(lesson.parentTask);
      if (pTaskId && modTaskId && pTaskId === modTaskId) return true;
      return false;
    });

    return {
      ...mod,
      learnerTitle: formatLearnerTitle(mod.taskName),
      lessons: matchedLessons
    };
  });

  // 4. Nest Versions into Design Challenges (Major Problems)
  const populatedChallenges = rawMajor.map(prob => {
    const probIdStr = prob._id?.toString();
    const probTaskId = prob.taskId;

    const matchedVersions = rawVersions.filter(v => {
      const pId = getParentId(v.parentTask);
      if (pId && probIdStr && pId === probIdStr) return true;
      const pTaskId = getParentTaskId(v.parentTask);
      if (pTaskId && probTaskId && pTaskId === probTaskId) return true;
      return false;
    });

    return {
      ...prob,
      learnerTitle: formatLearnerTitle(prob.taskName),
      versions: matchedVersions
    };
  });

  const totalLessonsCount = populatedLessons.length;
  const totalPracticesCount = rawDrills.length;

  return {
    topics: populatedTopics,
    designChallenges: populatedChallenges,
    totalLessonsCount,
    totalPracticesCount
  };
};
