// Builder for Phase 1
import fs from "fs";
import { formatUnitDescription, formatDrillDescription, formatMajorProblemDescription, formatProblemVersionDescription } from "./content_formatters.js";

export const PHASE1_REWRITE = {};

// Modules
PHASE1_REWRITE["LLDP1-M1"] = {
  taskName: "Module 1.1: C++ Foundations for Low Level Design",
  taskDescription: "Learn how objects are born, how they live in memory, and how they interact in C++ without memorizing complex jargon up front."
};

PHASE1_REWRITE["LLDP1-M2"] = {
  taskName: "Module 1.2: Protecting Your Objects and Data",
  taskDescription: "Learn why letting outside code touch your variables directly causes silent bugs, and how to build classes that protect their own data."
};

PHASE1_REWRITE["LLDP1-M3"] = {
  taskName: "Module 1.3: Connecting Objects Together",
  taskDescription: "Learn how objects relate to one another, when one object should own another, and why nesting class upon class often leads to painful design traps."
};

PHASE1_REWRITE["LLDP1-M4"] = {
  taskName: "Module 1.4: From User Story to Working Classes",
  taskDescription: "Learn how to take an ordinary real-world requirement written in plain English and turn it into clean, well-organized classes."
};

console.log("Base modules defined for Phase 1.");
