import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;
const USER_ID = '6993047f16e85ff3e4efd9a3';
const BRANCH_ID = '6a081b6e111c99b633b00d76';

const curriculum = [
  {
    name: "JavaScript (JS)",
    topics: [
      "Execution Context, Call Stack, Scope Chain & Temporal Dead Zone (TDZ)",
      "Primitive vs Reference Types & Deep vs Shallow Copy (shallow vs deep cloning mechanisms)",
      "Closures & Scope (private variables, memory leaks, closure bugs in loops)",
      "this Keyword & Explicit Binding (call, apply, bind usage and differences)",
      "Event Loop, Call Stack & Microtask/Macrotask Queues",
      "Promises & Async/Await (handling async flow and Promise states)",
      "Currying, Memoization, Debounce & Throttle (concepts and standard implementation)",
      "DOM Event Delegation, Bubbling & Capturing"
    ],
    revision: "JS Core Revision, Memory Management & GC Gotchas"
  },
  {
    name: "React.js",
    topics: [
      "Virtual DOM & Reconciliation (diffing algorithm, keys importance, render phases)",
      "React Hooks Internals: useState & useEffect (stale closures, cleanup, dependency gotchas)",
      "Component Lifecycle, Custom Hooks & useRef (DOM access, sharing logic)",
      "Context API vs Prop Drilling & Performance Re-renders (avoiding consumer re-renders)",
      "React Performance Optimization (useMemo, useCallback, React.memo, virtualizing lists)",
      "Controlled vs Uncontrolled Components & Form Handling (defaultValue, refs, validation)",
      "React Portals & ForwardRef (custom overlay design and forwarding DOM refs)",
      "TanStack/React Query Basics & Error Boundaries (server state caching, error boundaries)"
    ],
    revision: "React Component Design & Hook Gotchas Revision"
  },
  {
    name: "Redux Toolkit (RTK)",
    topics: [
      "Redux Flow Architecture (Actions, reducers, store, dispatch, and unidirectional flow)",
      "Redux Toolkit Setup & Slice APIs (configureStore, createSlice, extraReducers)",
      "Async Operations with createAsyncThunk (pending, fulfilled, rejected states)",
      "Redux Middleware (how middlewares intercept actions, custom middleware)",
      "Memoized Selectors (Reselect/createSelector performance)",
      "RTK Query (caching, mutation, queries, auto-prefetching)",
      "Redux Persist & Hydration (persisting state, hydration configs)",
      "Redux vs Context API vs Zustand (architectural comparison, trade-offs)"
    ],
    revision: "Redux Toolkit Flow & State Management Revision"
  },
  {
    name: "MySQL",
    topics: [
      "Relational Database Design & Normalization (keys, constraints, 1NF to BCNF)",
      "SQL Joins (optimizing INNER, LEFT, RIGHT, FULL, and SELF Joins)",
      "Subqueries & Common Table Expressions (CTEs) (clean queries)",
      "Database Indexing (B-Tree vs Hash indexing, clustered vs non-clustered)",
      "Window Functions (ROW_NUMBER, RANK, DENSE_RANK, LEAD, LAG analytics)",
      "Transactions, ACID & Isolation Levels (dirty reads, non-repeatable reads, phantom reads)",
      "Query Optimization (reading EXPLAIN plans, optimizing slow queries)"
    ],
    revision: "MySQL Joins, CTEs, Window Functions & Query Analysis Revision"
  },
  {
    name: "Docker",
    topics: [
      "Containers vs VMs & Docker Architecture (kernel sharing, Docker daemon)",
      "Docker CLI & Container Lifecycle (build, run, stop, pause, logs)",
      "Writing Optimized Dockerfiles (multi-stage builds, layers minimization)",
      "Docker Volumes & Bind Mounts (persisting state in dev and production)",
      "Docker Networking (bridge, host, port mappings, communication)",
      "Docker Compose Orchestration (multi-container setups, depends_on)",
      "Docker Hub & Public Registry (pushing, pulling, version management)"
    ],
    revision: "Docker Compose Setup & Multi-service Containerization Revision"
  },
  {
    name: "Nginx",
    topics: [
      "Reverse Proxy Configuration & Routing (routing requests to backend)",
      "Load Balancing & Upstream Blocks (round-robin, least-connections, ip-hash)",
      "Static Content Serving & Caching (serving builds, caching configuration)",
      "SSL/TLS Termination & HTTPS (SSL certificates, HTTP to HTTPS redirect, HTTP/2)",
      "Security Configurations (rate limiting, body size limits, custom headers)",
      "Nginx Logs & Troubleshooting (custom logs, access/error logs analysis)"
    ],
    revision: "Nginx Load Balancer & Secure Proxy Configuration Revision"
  },
  {
    name: "CI/CD & GitHub Actions",
    topics: [
      "GitHub Actions Workflow Syntax (workflows, jobs, steps, runners syntax)",
      "Environment Variables & Secrets Management (storing deployment keys, tokens)",
      "Build Matrices & Caching Dependencies (optimizing runs, caching assets)",
      "Environment Promotion Patterns (sequentially: Dev -> Staging -> Production)",
      "Automated Deployments (SSH deployment, cloud runners)",
      "Semantic Versioning (automated tagging)"
    ],
    revision: "CI/CD Pipeline Automation & Secret Orchestration Revision"
  },
  {
    name: "C++",
    topics: [
      "Pointers, References & Memory Layout (stack vs heap, pointer arithmetic)",
      "Object-Oriented Programming in C++ (inheritance, virtual functions, polymorphism)",
      "Manual Memory Management (allocations using new/delete, memory leaks prevention)",
      "Standard Template Library (STL) Containers (complexity of Vectors, Maps, Unordered Maps, Sets)"
    ],
    revision: "C++ Memory Management, STL & OOP Revision"
  }
];

const getLocalDateAtMidnight = (offsetDays) => {
  const d = new Date('2026-06-16T00:00:00Z');
  d.setDate(d.getDate() + offsetDays);
  return d;
};

async function seed() {
  try {
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI env variable is missing!");
    }
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const Project = mongoose.connection.collection('projects');
    const Task = mongoose.connection.collection('tasks');

    const arenaName = "Resume Grinding Phase 1 (Basics)";
    const arenaKey = "RGB";

    // 1. Clean up existing project with same key/name if any
    const existingProject = await Project.findOne({
      $or: [{ name: arenaName }, { key: arenaKey }]
    });

    if (existingProject) {
      console.log(`Found existing project: "${existingProject.name}" (${existingProject._id}). Cleaning up tasks...`);
      const deletedTasks = await Task.deleteMany({ projectName: existingProject._id });
      console.log(`Deleted ${deletedTasks.deletedCount} old tasks.`);
      await Project.deleteOne({ _id: existingProject._id });
      console.log(`Deleted old project.`);
    }

    // 2. Compute total duration and create the project
    // Total days: JS(5), React(5), RTK(5), MySQL(5), Docker(5), Nginx(4), CI/CD(4), C++(3) => Total 36 days (inclusive)
    // Let's compute day offsets dynamically to get exact end date.
    let totalDays = 0;
    curriculum.forEach(skill => {
      const numTopics = skill.topics.length;
      const coreDays = Math.ceil(numTopics / 2);
      const skillDuration = coreDays + 1; // core days + 1 revision day
      totalDays += skillDuration;
    });

    const startDate = getLocalDateAtMidnight(0);
    const endDate = getLocalDateAtMidnight(totalDays - 1);
    endDate.setHours(23, 59, 59, 999);

    const projectData = {
      name: arenaName,
      access: "private",
      key: arenaKey,
      description: "Resume grinding phase 1 focusing on high-yield interview preparation for SDE-2",
      startDate,
      endDate,
      priority: "high",
      clientName: "",
      budget: 0,
      progress: 0,
      projectManager: new mongoose.Types.ObjectId(USER_ID),
      teamMembers: [new mongoose.Types.ObjectId(USER_ID)],
      rolesAndResponsibilities: [],
      status: "active",
      settings: {
        sprintDuration: 2,
        enableSprints: false,
        enableYoutubeSearch: false,
        enableLeetCodeSearch: false
      },
      createdBy: new mongoose.Types.ObjectId(USER_ID),
      updatedBy: new mongoose.Types.ObjectId(USER_ID),
      branchId: new mongoose.Types.ObjectId(BRANCH_ID),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const projectInsertResult = await Project.insertOne(projectData);
    const projectId = projectInsertResult.insertedId;
    console.log(`Created new Project: "${arenaName}" with ID: ${projectId}`);

    // 3. Loop through curriculum and insert tasks
    let taskIdCounter = 1;
    let currentDayOffset = 0;

    for (const skill of curriculum) {
      const numTopics = skill.topics.length;
      const coreDays = Math.ceil(numTopics / 2);
      const skillDuration = coreDays + 1; // core days + 1 revision day

      const skillStart = getLocalDateAtMidnight(currentDayOffset);
      const skillDue = getLocalDateAtMidnight(currentDayOffset + skillDuration - 1);
      skillDue.setHours(23, 59, 59, 999);

      // Create Parent Task
      const parentTaskData = {
        projectName: projectId,
        taskName: skill.name,
        taskId: `${arenaKey}-${taskIdCounter++}`,
        taskPriority: 'high',
        taskType: 'preparation',
        taskStartDate: skillStart,
        taskDueDate: skillDue,
        estimatedHours: numTopics * 2.5 + 5.0,
        backlogEstimatedHours: 0,
        storyPoints: 0,
        progress: 0,
        status: 'todo',
        assignee: new mongoose.Types.ObjectId(USER_ID),
        createdBy: new mongoose.Types.ObjectId(USER_ID),
        parentTask: null,
        subtaskStats: { total: numTopics + 1, completed: 0 },
        branchId: new mongoose.Types.ObjectId(BRANCH_ID),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const parentInsertResult = await Task.insertOne(parentTaskData);
      const parentId = parentInsertResult.insertedId;
      console.log(`Added Parent Task: "${skill.name}" (${parentTaskData.taskId})`);

      // Create Core Child Tasks
      for (let i = 0; i < numTopics; i++) {
        const childDayOffset = Math.floor(i / 2);
        const childDate = getLocalDateAtMidnight(currentDayOffset + childDayOffset);

        const childTaskData = {
          projectName: projectId,
          taskName: skill.topics[i],
          taskId: `${arenaKey}-${taskIdCounter++}`,
          taskPriority: 'medium',
          taskType: 'preparation',
          taskStartDate: childDate,
          taskDueDate: childDate,
          estimatedHours: 2.5,
          backlogEstimatedHours: 0,
          storyPoints: 0,
          progress: 0,
          status: 'todo',
          assignee: new mongoose.Types.ObjectId(USER_ID),
          createdBy: new mongoose.Types.ObjectId(USER_ID),
          parentTask: parentId,
          branchId: new mongoose.Types.ObjectId(BRANCH_ID),
          createdAt: new Date(),
          updatedAt: new Date()
        };

        await Task.insertOne(childTaskData);
      }
      console.log(`  Added ${numTopics} core child tasks.`);

      // Create Revision Child Task
      const revisionDate = getLocalDateAtMidnight(currentDayOffset + coreDays);
      const revisionTaskData = {
        projectName: projectId,
        taskName: `[Revision] ${skill.revision}`,
        taskId: `${arenaKey}-${taskIdCounter++}`,
        taskPriority: 'medium',
        taskType: 'preparation',
        taskStartDate: revisionDate,
        taskDueDate: revisionDate,
        estimatedHours: 5.0,
        backlogEstimatedHours: 0,
        storyPoints: 0,
        progress: 0,
        status: 'todo',
        assignee: new mongoose.Types.ObjectId(USER_ID),
        createdBy: new mongoose.Types.ObjectId(USER_ID),
        parentTask: parentId,
        branchId: new mongoose.Types.ObjectId(BRANCH_ID),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await Task.insertOne(revisionTaskData);
      console.log(`  Added revision task: "${revisionTaskData.taskName}"`);

      // Advance start day for next skill
      currentDayOffset += skillDuration;
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
}

seed();
