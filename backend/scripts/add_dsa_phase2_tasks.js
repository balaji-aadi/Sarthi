import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

// Project IDs and User IDs retrieved from MongoDB
const BRANCH_ID = '6a081b6e111c99b633b00d76'; // Software Development
const USER_ID = '6993047f16e85ff3e4efd9a3';   // Balaji Aadi
const PROJECT_KEY = 'DSAP2';
const PROJECT_NAME = 'DSA Phase 2';

const curriculum = [
  {
    topic: "Linked List",
    patterns: [
      {
        name: "Basic Operations - Linked List",
        problems: [
          "Reverse Linked List",
          "Middle of Linked List",
          "Delete Node in Linked List",
          "Remove Linked List Elements",
          "Remove Duplicates from Sorted List"
        ]
      },
      {
        name: "Fast & Slow Pointer - Linked List",
        problems: [
          "Linked List Cycle",
          "Linked List Cycle II",
          "Remove Nth Node From End",
          "Palindrome Linked List",
          "Reorder List",
          "Delete Middle Node"
        ]
      },
      {
        name: "Reverse Pattern - Linked List",
        problems: [
          "Reverse Linked List",
          "Reverse Linked List II",
          "Reverse Nodes in K Group",
          "Swap Nodes in Pairs",
          "Rotate List",
          "Reverse Even Length Groups",
          "Reverse Linked List Recursive",
          "Reverse First N Nodes (or equivalent variation)"
        ]
      },
      {
        name: "Dummy Node Pattern - Linked List",
        problems: [
          "Add Two Numbers",
          "Partition List",
          "Merge Two Sorted Lists",
          "Remove Nth Node",
          "Swap Nodes in Pairs"
        ]
      },
      {
        name: "Merge Pattern - Linked List",
        problems: [
          "Merge Two Sorted Lists",
          "Merge K Sorted Lists",
          "Sort List",
          "Insertion Sort List"
        ]
      },
      {
        name: "Two Pointer Pattern - Linked List",
        problems: [
          "Intersection of Two Linked Lists",
          "Odd Even Linked List",
          "Maximum Twin Sum of a Linked List"
        ]
      },
      {
        name: "Arithmetic Pattern - Linked List",
        problems: [
          "Add Two Numbers II",
          "Double a Number Represented as Linked List",
          "Plus One Linked List"
        ]
      },
      {
        name: "Random Pointer - Linked List",
        problems: [
          "Copy List with Random Pointer",
          "Clone Linked List with Random Pointer (alternate approach)"
        ]
      },
      {
        name: "Flatten Pattern - Linked List",
        problems: [
          "Flatten Multilevel Doubly Linked List"
        ]
      },
      {
        name: "Design (LRU) - Linked List",
        problems: [
          "LRU Cache",
          "LFU Cache (optional if targeting top-tier companies)",
          "Browser History (or another doubly linked list design problem)"
        ]
      }
    ]
  },
  {
    topic: "Stack",
    patterns: [
      {
        name: "Basic Stack - Stack",
        problems: [
          "Implement Stack",
          "Min Stack",
          "Baseball Game",
          "Backspace String Compare"
        ]
      },
      {
        name: "Expression Evaluation - Stack",
        problems: [
          "Evaluate Reverse Polish Notation",
          "Basic Calculator",
          "Basic Calculator II",
          "Decode String"
        ]
      },
      {
        name: "Parentheses Pattern - Stack",
        problems: [
          "Valid Parentheses",
          "Generate Parentheses",
          "Longest Valid Parentheses",
          "Minimum Remove to Make Valid Parentheses",
          "Remove Invalid Parentheses (Hard)"
        ]
      },
      {
        name: "Simulation Pattern - Stack",
        problems: [
          "Asteroid Collision",
          "Daily Temperatures (monotonic review)",
          "Remove K Digits",
          "Simplify Path"
        ]
      },
      {
        name: "Design Stack - Stack",
        problems: [
          "Design Browser History",
          "Max Stack",
          "Frequency Stack"
        ]
      }
    ]
  },
  {
    topic: "Queue",
    patterns: [
      {
        name: "Queue Basics - Queue",
        problems: [
          "Implement Queue using Stacks",
          "Number of Recent Calls",
          "Moving Average from Data Stream"
        ]
      },
      {
        name: "Deque Pattern - Queue",
        problems: [
          "Sliding Window Maximum",
          "Shortest Subarray with Sum at Least K",
          "Design Circular Deque"
        ]
      },
      {
        name: "Circular Queue - Queue",
        problems: [
          "Design Circular Queue",
          "First Unique Number"
        ]
      },
      {
        name: "Design Queue - Queue",
        problems: [
          "Front Middle Back Queue",
          "Hit Counter"
        ]
      }
    ]
  },
  {
    topic: "Heap",
    patterns: [
      {
        name: "Top K Pattern - Heap",
        problems: [
          "Top K Frequent Elements",
          "K Closest Points to Origin",
          "Kth Largest Element in an Array",
          "Find K Pairs with Smallest Sums"
        ]
      },
      {
        name: "Merge Pattern - Heap",
        problems: [
          "Merge K Sorted Lists",
          "Smallest Range Covering Elements from K Lists",
          "Merge K Sorted Arrays (variation)"
        ]
      },
      {
        name: "Two Heap Pattern - Heap",
        problems: [
          "Find Median from Data Stream",
          "Sliding Window Median",
          "IPO"
        ]
      },
      {
        name: "Scheduling Pattern - Heap",
        problems: [
          "Meeting Rooms II",
          "Task Scheduler",
          "Maximum Events That Can Be Attended"
        ]
      },
      {
        name: "Design - Heap",
        problems: [
          "Design Twitter",
          "Seat Reservation Manager"
        ]
      }
    ]
  },
  {
    topic: "Recursion",
    patterns: [
      {
        name: "Fundamentals - Recursion",
        problems: [
          "Factorial",
          "Fibonacci",
          "Power Function",
          "Sum of Array",
          "Reverse String"
        ]
      },
      {
        name: "Tree-style Recursion - Recursion",
        problems: [
          "Generate Parentheses",
          "Letter Combinations of a Phone Number",
          "Permutations",
          "Subsets",
          "Combination Sum"
        ]
      },
      {
        name: "Divide & Conquer - Recursion",
        problems: [
          "Merge Sort",
          "Quick Sort",
          "Pow(x, n)",
          "Search in Rotated Sorted Array (recursive variant)"
        ]
      },
      {
        name: "Recursive Linked List - Recursion",
        problems: [
          "Reverse Linked List (recursive)",
          "Swap Nodes in Pairs (recursive)",
          "Merge Two Sorted Lists (recursive)"
        ]
      },
      {
        name: "Advanced Recursion - Recursion",
        problems: [
          "Josephus Problem",
          "Tower of Hanoi",
          "Recursive Bubble Sort (conceptual exercise)"
        ]
      }
    ]
  }
];

const projectDescription = `<h3>DSA Phase 2 Syllabus</h3>
<p>This arena covers the following advanced data structures and patterns:</p>
<ol>
  <li><strong>Linked List</strong> (~40 Problems)
    <ul>
      <li>Basic Operations</li>
      <li>Fast & Slow Pointer</li>
      <li>Reverse Pattern</li>
      <li>Dummy Node Pattern</li>
      <li>Merge Pattern</li>
      <li>Two Pointer Pattern</li>
      <li>Arithmetic Pattern</li>
      <li>Random Pointer</li>
      <li>Flatten Pattern</li>
      <li>Design (LRU)</li>
    </ul>
  </li>
  <li><strong>Stack</strong> (~20 Problems)
    <ul>
      <li>Basic Stack</li>
      <li>Expression Evaluation</li>
      <li>Parentheses Pattern</li>
      <li>Simulation Pattern</li>
      <li>Design Stack</li>
    </ul>
  </li>
  <li><strong>Queue</strong> (~10 Problems)
    <ul>
      <li>Queue Basics</li>
      <li>Deque Pattern</li>
      <li>Circular Queue</li>
      <li>Design Queue</li>
    </ul>
  </li>
  <li><strong>Heap</strong> (~15 Problems)
    <ul>
      <li>Top K Pattern</li>
      <li>Merge Pattern</li>
      <li>Two Heap Pattern</li>
      <li>Scheduling Pattern</li>
      <li>Design</li>
    </ul>
  </li>
  <li><strong>Recursion</strong> (~20 Problems)
    <ul>
      <li>Fundamentals</li>
      <li>Tree-style Recursion</li>
      <li>Divide & Conquer</li>
      <li>Recursive Linked List</li>
      <li>Advanced Recursion</li>
    </ul>
  </li>
</ol>`;

async function seed() {
  try {
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in env!");
    }

    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const Project = mongoose.connection.collection('projects');
    const Task = mongoose.connection.collection('tasks');

    // 1. Check if project already exists
    const existing = await Project.findOne({ key: PROJECT_KEY });
    if (existing) {
      console.log(`[WARNING] Project with key ${PROJECT_KEY} already exists (ID: ${existing._id}). Skipping creation to avoid deleting or modification.`);
      process.exit(0);
    }

    // 2. Perform sequential scheduling to find correct start and due dates
    // Start date: July 7, 2026
    let currentDate = new Date('2026-07-07T00:00:00Z');
    let currentDayProblemsCount = 0;
    let problemsTodayTarget = 3;

    function getNextProblemDate() {
      const dateToAssign = new Date(currentDate);
      currentDayProblemsCount++;
      if (currentDayProblemsCount >= problemsTodayTarget) {
        currentDate.setDate(currentDate.getDate() + 1);
        currentDayProblemsCount = 0;
        problemsTodayTarget = (problemsTodayTarget === 3) ? 4 : 3;
      }
      return dateToAssign;
    }

    function completeTopic() {
      if (currentDayProblemsCount > 0) {
        currentDate.setDate(currentDate.getDate() + 1);
        currentDayProblemsCount = 0;
        problemsTodayTarget = (problemsTodayTarget === 3) ? 4 : 3;
      }
      // Add 3-day rest gap
      currentDate.setDate(currentDate.getDate() + 3);
      currentDayProblemsCount = 0;
      problemsTodayTarget = 3;
    }

    // Compute dates for all topics and patterns beforehand to know project endDate
    const computedCurriculum = [];
    let firstProblemDate = null;
    let lastProblemDate = null;

    for (let tIdx = 0; tIdx < curriculum.length; tIdx++) {
      const topic = curriculum[tIdx];
      const patterns = [];

      for (const pattern of topic.patterns) {
        const problems = [];
        for (const problemName of pattern.problems) {
          const pDate = getNextProblemDate();
          if (!firstProblemDate) firstProblemDate = new Date(pDate);
          lastProblemDate = new Date(pDate);
          problems.push({
            name: problemName,
            date: pDate
          });
        }
        patterns.push({
          name: pattern.name,
          problems
        });
      }

      computedCurriculum.push({
        topic: topic.topic,
        patterns
      });

      // Complete the topic (only add gap if it is not the last topic)
      if (tIdx < curriculum.length - 1) {
        completeTopic();
      }
    }

    console.log(`Computed Schedule: Start = ${firstProblemDate.toISOString().split('T')[0]}, End = ${lastProblemDate.toISOString().split('T')[0]}`);

    // 3. Create the Project
    const projectDoc = {
      name: PROJECT_NAME,
      access: 'private',
      key: PROJECT_KEY,
      description: projectDescription,
      startDate: new Date(firstProblemDate),
      endDate: new Date(lastProblemDate),
      priority: 'high',
      clientName: '',
      budget: 0,
      progress: 0,
      projectManager: new mongoose.Types.ObjectId(USER_ID),
      teamMembers: [new mongoose.Types.ObjectId(USER_ID)],
      rolesAndResponsibilities: [],
      status: 'active',
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

    const projectResult = await Project.insertOne(projectDoc);
    const projectId = projectResult.insertedId;
    console.log(`Created Project "${PROJECT_NAME}" (ID: ${projectId})`);

    // 4. Create Parent and Child Tasks
    let taskIdCounter = 1;

    for (const topic of computedCurriculum) {
      for (const pattern of topic.patterns) {
        const numChildren = pattern.problems.length;
        
        // Find min/max dates for parent task
        const childDates = pattern.problems.map(p => p.date.getTime());
        const minDate = new Date(Math.min(...childDates));
        const maxDate = new Date(Math.max(...childDates));

        // Insert Parent Task
        const parentTaskDoc = {
          projectName: projectId,
          taskName: pattern.name,
          taskId: `${PROJECT_KEY}-${taskIdCounter++}`,
          taskPriority: 'high',
          taskType: 'preparation',
          taskStartDate: minDate,
          taskDueDate: maxDate,
          estimatedHours: numChildren * 1.5,
          backlogEstimatedHours: 0,
          storyPoints: 0,
          progress: 0,
          status: 'todo',
          assignee: new mongoose.Types.ObjectId(USER_ID),
          createdBy: new mongoose.Types.ObjectId(USER_ID),
          parentTask: null,
          subtaskStats: { total: numChildren, completed: 0 },
          branchId: new mongoose.Types.ObjectId(BRANCH_ID),
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const parentResult = await Task.insertOne(parentTaskDoc);
        const parentId = parentResult.insertedId;
        console.log(`Added Parent: "${pattern.name}" (${parentTaskDoc.taskId})`);

        // Insert Child Tasks
        for (const problem of pattern.problems) {
          const childTaskDoc = {
            projectName: projectId,
            taskName: problem.name,
            taskId: `${PROJECT_KEY}-${taskIdCounter++}`,
            taskPriority: 'medium',
            taskType: 'preparation',
            taskStartDate: problem.date,
            taskDueDate: problem.date,
            estimatedHours: 1.5,
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

          await Task.insertOne(childTaskDoc);
        }
        console.log(`  Added ${numChildren} children for "${pattern.name}"`);
      }
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
}

seed();
