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
const PROJECT_ID = '6a30c5bcf7cfd43d78e67bf8';
const PARENT_TASK_ID = '6a30c5bef7cfd43d78e67c36';

const getLocalDateAtMidnight = (dateStr) => {
  return new Date(`${dateStr}T00:00:00.000Z`);
};

const getLocalDateAtEndOfDay = (dateStr) => {
  return new Date(`${dateStr}T18:29:59.999Z`);
};

const newTasksData = [
  // Day 1
  {
    day: 1,
    hour: 1,
    title: "Day 1 - Hour 1: DBMS Basics",
    date: "2026-07-01",
    description: "Topics:\n- What is data?\n- What is Database?\n- Why database?\n- File System vs Database\n- What is DBMS?\n- Types of DBMS\n- Relational Database\n- Table, Row, Column\n- Primary Key, Candidate Key, Composite Key, Alternate Key, Foreign Key\n- NULL, Constraints\n\nUnderstand:\n- Customer (ID, Name, Age)\n- Why Primary Key exists\n- Why Foreign Key exists"
  },
  {
    day: 1,
    hour: 2,
    title: "Day 1 - Hour 2: SQL Basics",
    date: "2026-07-01",
    description: "Topics:\n- What is SQL\n- Types of SQL: DDL, DML, DQL, DCL, TCL\n- Commands: CREATE DATABASE, DROP DATABASE, USE, CREATE TABLE, DROP TABLE, ALTER TABLE, TRUNCATE\n\nPractice:\n- Create 10 tables manually."
  },
  {
    day: 1,
    hour: 3,
    title: "Day 1 - Hour 3: Insert & Retrieve",
    date: "2026-07-01",
    description: "Topics:\n- INSERT, SELECT, DISTINCT, LIMIT, OFFSET\n\nPractice:\n- Insert 50-100 rows manually."
  },
  {
    day: 1,
    hour: 4,
    title: "Day 1 - Hour 4: Filtering",
    date: "2026-07-01",
    description: "Topics:\n- WHERE, AND, OR, NOT, BETWEEN, IN, NOT IN, LIKE, IS NULL, IS NOT NULL, ORDER BY\n\nPractice:\n- 40 filtering queries."
  },
  {
    day: 1,
    hour: 5,
    title: "Day 1 - Hour 5: Practice (Fundamentals)",
    date: "2026-07-01",
    description: "Topics:\n- Practice 40 Questions using:\n  * Employee Table\n  * Department Table\n  * Student Table\n  * Orders Table\n\nExamples:\n- Employees older than 25\n- Employees starting with A\n- Salary > 50000\n- Last 5 employees\n- Highest salary"
  },

  // Day 2
  {
    day: 2,
    hour: 1,
    title: "Day 2 - Hour 1: Functions",
    date: "2026-07-02",
    description: "Topics:\n- Numeric: ROUND, CEIL, FLOOR, ABS, MOD\n- String: UPPER, LOWER, LENGTH, SUBSTRING, REPLACE, CONCAT, TRIM, LEFT, RIGHT\n- Date: NOW(), CURDATE(), DATEDIFF(), YEAR(), MONTH(), DAY()"
  },
  {
    day: 2,
    hour: 2,
    title: "Day 2 - Hour 2: Aggregate Functions",
    date: "2026-07-02",
    description: "Topics:\n- Aggregate Functions: COUNT, SUM, AVG, MAX, MIN\n- Grouping: GROUP BY, HAVING (one of the most asked interview topics)\n\nPractice:\n- 30 aggregate query questions."
  },
  {
    day: 2,
    hour: 3,
    title: "Day 2 - Hour 3: Joins",
    date: "2026-07-02",
    description: "Topics:\n- INNER JOIN, LEFT JOIN, RIGHT JOIN, FULL JOIN, SELF JOIN, CROSS JOIN\n- Understand using diagrams\n\nPractice:\n- 40 join questions."
  },
  {
    day: 2,
    hour: 4,
    title: "Day 2 - Hour 4: Relationships",
    date: "2026-07-02",
    description: "Topics:\n- Learn: One to One, One to Many, Many to Many, Bridge Tables\n- ER Diagram basics\n- Normalization introduction"
  },
  {
    day: 2,
    hour: 5,
    title: "Day 2 - Hour 5: Practice (Intermediate)",
    date: "2026-07-02",
    description: "Topics:\n- Solve 40 SQL Questions\n- Mixed: Filtering, Functions, Group By, Joins"
  },

  // Day 3
  {
    day: 3,
    hour: 1,
    title: "Day 3 - Hour 1: Subqueries",
    date: "2026-07-03",
    description: "Topics:\n- Subquery, Correlated Subquery, Nested Query, EXISTS, NOT EXISTS, ANY, ALL\n\nPractice:\n- 30 Questions"
  },
  {
    day: 3,
    hour: 2,
    title: "Day 3 - Hour 2: CTE",
    date: "2026-07-03",
    description: "Topics:\n- WITH clause, Recursive CTE\n- Understand: Why CTE exists\n- Difference: CTE vs Subquery"
  },
  {
    day: 3,
    hour: 3,
    title: "Day 3 - Hour 3: Window Functions",
    date: "2026-07-03",
    description: "Topics:\n- OVER(), PARTITION BY, ROW_NUMBER(), RANK(), DENSE_RANK(), LAG(), LEAD(), FIRST_VALUE(), LAST_VALUE(), NTILE() (spend enough time here)\n\nPractice:\n- 30 Questions"
  },
  {
    day: 3,
    hour: 4,
    title: "Day 3 - Hour 4: Views & Advanced Objects",
    date: "2026-07-03",
    description: "Topics:\n- VIEW, INDEX, Stored Procedure, Function, Trigger\n- Just understand, no need to master."
  },
  {
    day: 3,
    hour: 5,
    title: "Day 3 - Hour 5: Practice (Advanced)",
    date: "2026-07-03",
    description: "Topics:\n- Solve 40 Questions"
  },

  // Day 4
  {
    day: 4,
    hour: 1,
    title: "Day 4 - Hour 1: Normalization",
    date: "2026-07-04",
    description: "Topics:\n- Normalization: 1NF, 2NF, 3NF, BCNF (Interview favorite)"
  },
  {
    day: 4,
    hour: 2,
    title: "Day 4 - Hour 2: Schema Design",
    date: "2026-07-04",
    description: "Topics:\n- Relationships: One-One, One-Many, Many-Many\n- Design schemas for:\n  * Library\n  * Hospital\n  * School\n  * Movie\n  * E-commerce"
  },
  {
    day: 4,
    hour: 3,
    title: "Day 4 - Hour 3: Constraints",
    date: "2026-07-04",
    description: "Topics:\n- PRIMARY KEY, FOREIGN KEY, CHECK, DEFAULT, UNIQUE, AUTO_INCREMENT"
  },
  {
    day: 4,
    hour: 4,
    title: "Day 4 - Hour 4: Transactions",
    date: "2026-07-04",
    description: "Topics:\n- BEGIN, COMMIT, ROLLBACK, SAVEPOINT\n- ACID Properties: Atomicity, Consistency, Isolation, Durability"
  },
  {
    day: 4,
    hour: 5,
    title: "Day 4 - Hour 5: Indexing",
    date: "2026-07-04",
    description: "Topics:\n- Indexing: Clustered Index, Non-Clustered Index, Composite Index\n- Understand: Why indexes are fast, When not to use index"
  },

  // Day 5
  {
    day: 5,
    hour: 1,
    title: "Day 5 - Hour 1: Interview Patterns",
    date: "2026-07-05",
    description: "Topics:\n- Find second highest salary\n- Nth highest salary\n- Duplicate rows / delete duplicate rows\n- Running total\n- Top N employees\n- Employees without department / Customers with no orders\n- Second highest per department / Top salary in each department\n- Consecutive records\n- Gaps and Islands"
  },
  {
    day: 5,
    hour: 2,
    title: "Day 5 - Hour 2: LeetCode SQL Easy",
    date: "2026-07-05",
    description: "Topics:\n- Solve 20 Easy level SQL questions on LeetCode"
  },
  {
    day: 5,
    hour: 3,
    title: "Day 5 - Hour 3: LeetCode SQL Medium",
    date: "2026-07-05",
    description: "Topics:\n- Solve 20 Medium level SQL questions on LeetCode"
  },
  {
    day: 5,
    hour: 4,
    title: "Day 5 - Hour 4: Mock Interview",
    date: "2026-07-05",
    description: "Topics:\n- Conduct mock interview, explain every query aloud to show reasoning"
  },
  {
    day: 5,
    hour: 5,
    title: "Day 5 - Hour 5: Revision & Notes",
    date: "2026-07-05",
    description: "Topics:\n- Review all topics\n- Make 20 pages of handwritten notes"
  }
];

const update = async () => {
  try {
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI env variable is missing!");
    }
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const Task = mongoose.connection.collection('tasks');

    // 1. Rename the parent task and update subtaskStats
    const parentUpdateResult = await Task.updateOne(
      { _id: new mongoose.Types.ObjectId(PARENT_TASK_ID) },
      {
        $set: {
          taskName: "SQL & Database Design (5-Day Plan)",
          subtaskStats: { total: 25, completed: 0 }
        }
      }
    );
    console.log(`Updated parent task (matched: ${parentUpdateResult.matchedCount}, modified: ${parentUpdateResult.modifiedCount})`);

    // 2. Delete all existing subtasks under the parent task
    const deleteResult = await Task.deleteMany({
      parentTask: new mongoose.Types.ObjectId(PARENT_TASK_ID)
    });
    console.log(`Deleted ${deleteResult.deletedCount} old subtasks.`);

    // 3. Insert new subtasks (IDs starting from RGB-72)
    let nextTaskIdSuffix = 72;
    const tasksToInsert = newTasksData.map((task) => {
      const startDate = getLocalDateAtMidnight(task.date);
      const dueDate = getLocalDateAtEndOfDay(task.date);

      return {
        projectName: new mongoose.Types.ObjectId(PROJECT_ID),
        taskName: task.title,
        taskId: `RGB-${nextTaskIdSuffix++}`,
        taskPriority: 'medium',
        taskType: 'preparation',
        taskStartDate: startDate,
        taskDueDate: dueDate,
        estimatedHours: 1.0,
        backlogEstimatedHours: 0,
        storyPoints: 0,
        progress: 0,
        status: 'todo',
        assignee: new mongoose.Types.ObjectId(USER_ID),
        createdBy: new mongoose.Types.ObjectId(USER_ID),
        parentTask: new mongoose.Types.ObjectId(PARENT_TASK_ID),
        branchId: new mongoose.Types.ObjectId(BRANCH_ID),
        youtubeUrl: "",
        taskDescription: task.description,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    });

    const insertResult = await Task.insertMany(tasksToInsert);
    console.log(`Successfully inserted ${insertResult.insertedCount} new subtasks!`);

    process.exit(0);
  } catch (err) {
    console.error('Error updating SQL plan:', err);
    process.exit(1);
  }
};

update();
