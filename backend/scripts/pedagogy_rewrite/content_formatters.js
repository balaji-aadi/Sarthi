/**
 * Sarthi LLD v2.1 — Content Formatter & Pedagogical Validator
 * Enforces beginner-first pedagogy, 9-section Units, 14-section Drills, and LeetCode-style Major Problems.
 */

export function formatUnitDescription(unit) {
  const {
    whatAreWeTryingToSolve,
    seeItWithASmallExample,
    whatIsGoingWrong,
    theSimpleIdea,
    technicalWords, // Array of { term, explanation }
    whyThisMattersInLLD,
    tryIt,
    nowChangeTheRequirement,
    whatDidTheChangeTeachUs,
    canYouExplainIt
  } = unit;

  const techWordsText = technicalWords
    .map(t => `- **${t.term}**: ${t.explanation}`)
    .join('\n');

  return `### 1. What Are We Trying To Solve?
${whatAreWeTryingToSolve.trim()}

### 2. See It With a Small Example
${seeItWithASmallExample.trim()}

### 3. What Is Going Wrong?
${whatIsGoingWrong.trim()}

### 4. The Simple Idea
${theSimpleIdea.trim()}

### 5. Technical Words
${techWordsText.trim()}

### 6. Why This Matters in LLD
${whyThisMattersInLLD.trim()}

### 7. Try It
${tryIt.trim()}

### 8. Now Change the Requirement
${nowChangeTheRequirement.trim()}

### 9. What Did the Change Teach Us?
${whatDidTheChangeTeachUs.trim()}

### 10. Can You Explain It?
${canYouExplainIt.trim()}`;
}

export function formatDrillDescription(drill) {
  const {
    title,
    problemStatement,
    contextScenario,
    startingPoint,
    yourTask,
    apiInterface,
    inputInteractionModel,
    expectedBehavior,
    examples,
    constraintsAssumptions,
    edgeCases,
    acceptanceCriteria,
    whatToObserve,
    thinkAbout
  } = drill;

  const criteriaText = Array.isArray(acceptanceCriteria)
    ? acceptanceCriteria.map(c => `* ${c}`).join('\n')
    : acceptanceCriteria.trim();

  return `## ${title.trim()}

### Problem Statement
${problemStatement.trim()}

### Context & Scenario
${contextScenario.trim()}

### Starting Point
${startingPoint.trim()}

### Your Task
${yourTask.trim()}

### API & Interface
${apiInterface.trim()}

### Input & Interaction Model
${inputInteractionModel.trim()}

### Expected Behavior
${expectedBehavior.trim()}

### Examples
${examples.trim()}

### Constraints & Assumptions
${constraintsAssumptions.trim()}

### Edge Cases
${edgeCases.trim()}

### Acceptance Criteria
${criteriaText}

### What To Observe
${whatToObserve.trim()}

### Think About
${thinkAbout.trim()}`;
}

export function formatMajorProblemDescription(prob) {
  const {
    contextScenario,
    functionalRequirements,
    operationsApi,
    expectedBehavior,
    examplesScenarios,
    constraintsAssumptions,
    edgeCasesErrorHandling,
    stateLifecycleRules,
    acceptanceCriteria,
    whatYouNeedToImplement
  } = prob;

  return `### 1. Context & Scenario
${contextScenario.trim()}

### 2. Functional Requirements
${functionalRequirements.map(r => `* ${r}`).join('\n')}

### 3. Core Operations & API
\`\`\`cpp
${operationsApi.join('\n')}
\`\`\`

### 4. Expected Behavior
${expectedBehavior.trim()}

### 5. Examples & Interaction Scenarios
${examplesScenarios.trim()}

### 6. Constraints & Assumptions
${constraintsAssumptions.map(c => `* ${c}`).join('\n')}

### 7. Edge Cases & Error Handling
${edgeCasesErrorHandling.map(e => `* ${e}`).join('\n')}

### 8. State & Lifecycle Rules
${stateLifecycleRules.trim()}

### 9. Acceptance Criteria
${acceptanceCriteria.map(a => `* ${a}`).join('\n')}

### 10. What You Need To Implement
${whatYouNeedToImplement.trim()}`;
}

export function formatProblemVersionDescription(ver) {
  const {
    whatChanged,
    whyOldDesignStruggles,
    newRequirements,
    observableBehavior,
    examples,
    acceptanceCriteria,
    designReviewNote // Post-attempt guidance
  } = ver;

  let desc = `### 1. What Changed?
${whatChanged.trim()}

### 2. Why Does the Previous Design Struggle?
${whyOldDesignStruggles.trim()}

### 3. New Requirements
${newRequirements.map(r => `* ${r}`).join('\n')}

### 4. Expected Observable Behavior
${observableBehavior.trim()}

### 5. Examples
${examples.trim()}

### 6. Acceptance Criteria
${acceptanceCriteria.map(a => `* ${a}`).join('\n')}`;

  if (designReviewNote) {
    desc += `\n\n### 7. Post-Attempt Design Review
${designReviewNote.trim()}`;
  }

  return desc;
}
