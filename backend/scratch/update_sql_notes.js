import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const PARENT_TASK_ID = '6a30c5bef7cfd43d78e67c36';
const USER_ID = '6993047f16e85ff3e4efd9a3';

// HTML elements styling helper designed to completely override external spacing/margin issues
const wrapper = (content) => `
  <div style="font-family: Inter, system-ui, sans-serif; font-size: 13px; color: #1e293b; line-height: 1.4 !important; margin: 0px !important; padding: 0px !important;">
    ${content}
  </div>
`;

const heading = (text) => `
  <div style="font-size: 14px; font-weight: 800; color: #1e3a8a; display: block; margin: 8px 0px 4px 0px !important; padding: 0px !important; border-bottom: 1px solid #e2e8f0; padding-bottom: 2px !important;">
    ${text}
  </div>
`;

const subheading = (text) => `
  <div style="font-size: 12px; font-weight: 700; color: #2563eb; display: block; margin: 6px 0px 2px 0px !important; padding: 0px !important;">
    ${text}
  </div>
`;

const p = (text) => `
  <div style="margin: 0px 0px 4px 0px !important; padding: 0px !important; line-height: 1.4 !important;">
    ${text}
  </div>
`;

const hinglish = (text) => `
  <div style="margin: 0px 0px 6px 0px !important; padding: 0px !important; color: #64748b; font-style: italic; font-size: 12px; line-height: 1.4 !important;">
    <strong>Hinglish:</strong> ${text}
  </div>
`;

const card = (content) => `
  <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; border-radius: 6px; padding: 6px 10px; margin: 4px 0px !important; border-top: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; border-left-width: 4px !important; line-height: 1.4 !important;">
    ${content}
  </div>
`;

const warningCard = (content) => `
  <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 6px; padding: 6px 10px; margin: 4px 0px !important; border-top: 1px solid #fef3c7; border-right: 1px solid #fef3c7; border-bottom: 1px solid #fef3c7; border-left-width: 4px !important; line-height: 1.4 !important;">
    ${content}
  </div>
`;

const table = (headers, rows) => `
  <table style="width: 100%; border-collapse: collapse; margin: 4px 0px !important; padding: 0px !important; font-size: 12px;">
    <thead>
      <tr style="background-color: #f1f5f9; margin: 0px !important; padding: 0px !important;">
        ${headers.map(h => `<th style="padding: 4px 6px; border: 1px solid #cbd5e1; font-weight: 700; text-align: left; margin: 0px !important;">${h}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${rows.map(row => `
        <tr style="margin: 0px !important; padding: 0px !important;">
          ${row.map(cell => `<td style="padding: 4px 6px; border: 1px solid #cbd5e1; vertical-align: top; margin: 0px !important;">${cell}</td>`).join('')}
        </tr>
      `).join('')}
    </tbody>
  </table>
`;

const codeBlock = (code) => `
  <pre style="background-color: #f1f5f9; padding: 6px 10px; border-radius: 6px; overflow-x: auto; margin: 4px 0px 6px 0px !important; border: 1px solid #cbd5e1; font-size: 11px; font-family: monospace; line-height: 1.3 !important;">${code}</pre>
`;

const notesMap = {
  'RGB-72': {
    title: 'DBMS & Database Fundamentals',
    content: wrapper(`
      ${heading('1. What is Data & Database?')}
      ${p('<strong>Data:</strong> Data is raw, unprocessed facts, numbers, or characters that do not carry specific meaning on their own.')}
      ${hinglish('Data matlab koi bhi raw info jaise "John" ya "100". Jab tak hum isko context na dein (jaise Customer Name "John" hai), iska koi use nahi hota.')}
      
      ${p('<strong>Database:</strong> A database is an organized, digital repository of structured data designed for efficient storage, access, modification, and management.')}
      ${hinglish('Database ek digital ledger/register hai jahan data systematic tarike se rows aur columns me save hota hai, taaki search ya change karna aasan ho.')}

      ${heading('2. Why do we need a Database? (Real-World Concurrency Analogy)')}
      ${p('If we can save data in flat text files (.txt) or Excel sheets (.csv), why do we need a database?')}
      ${card(`
        ${p('<strong>IRCTC Ticket Booking Analogy:</strong>')}
        ${p('Imagine an Excel sheet is used to store train ticket bookings. If 5,000 users click "Book Seat 12" at the exact same millisecond:')}
        ${p('- <strong>File System / Excel:</strong> The system will try to write to the same file concurrently. The file will get locked, or worse, corrupted, and multiple people might end up booking the same seat.')}
        ${p('- <strong>Database:</strong> DBMS uses locking mechanisms and transactions to process requests sequentially and atomically, ensuring data remains correct.')}
      `)}

      ${heading('3. File System vs. DBMS')}
      ${p('<strong>File System:</strong> A method of storing and organizing files on a storage medium (like your hard disk) managed directly by the Operating System.')}
      ${hinglish('File system matlab normal files (jaise notepad or csv) jo OS save karta hai. Isme database features missing hote hain.')}
      
      ${table(
        ['Feature', 'File System', 'Database Management System (DBMS)'],
        [
          ['Redundancy', 'High (Same data can be duplicated in different files)', 'Low (Centralized tables minimize duplicates)'],
          ['Data Consistency', 'Low (Changing email in one file might leave old email in another)', 'High (Rules automatically update linked records)'],
          ['Concurrent Access', 'Extremely difficult (Locks the entire file for editing)', 'Easy (Row-level locking allows parallel edits)'],
          ['Security', 'Limited OS-level folder permissions', 'Granular role, table, and column level permissions']
        ]
      )}

      ${heading('4. Types of Keys in Relational Model')}
      ${p('<strong>Primary Key (PK):</strong> A column (or set of columns) that uniquely identifies each row in a table. It cannot contain duplicate or NULL values.')}
      ${hinglish('Primary Key unique identity code (Aadhaar Card) ki tarah hai. Iske bina database system rows ko separate identify nahi kar sakta.')}
      
      ${p('<strong>Foreign Key (FK):</strong> A column in one table that points to the Primary Key of another table, establishing a connection between them.')}
      ${hinglish('Foreign Key ek bridge ki tarah hai. Jaise order table me Customer ID foreign key hai jo customer details table se link hoti hai. Isse referential integrity bani rehti hai (koi bogus order nahi daal sakta jo user table me na ho).')}

      ${warningCard(`
        <strong>🎯 Interview Question: Primary Key vs. Unique Key</strong><br/>
        - Primary Key is only ONE per table and strictly forbids NULL values.<br/>
        - Unique Key can be MULTIPLE in a table, and allows NULL values (handling depends on DB engine).
      `)}
    `)
  },
  'RGB-73': {
    title: 'SQL Command Classification & DDL Commands',
    content: wrapper(`
      ${heading('1. What is SQL & How it Works')}
      ${p('<strong>SQL (Structured Query Language):</strong> A standard declarative programming language used to communicate with and manipulate relational databases.')}
      ${hinglish('SQL woh language hai jisse hum databases se baat karte hain (data mangne ya add karne ke liye).')}

      ${heading('2. SQL Sublanguages')}
      ${p('SQL commands are divided into functional groups:')}
      ${table(
        ['Category', 'Commands', 'Purpose', 'Transaction Logging'],
        [
          ['<strong>DDL</strong> (Definition)', '<code>CREATE, ALTER, DROP, TRUNCATE</code>', 'Define or modify table structure (Schema).', 'Autocommitted. Cannot rollback easily.'],
          ['<strong>DML</strong> (Manipulation)', '<code>INSERT, UPDATE, DELETE</code>', 'Modify rows/records inside existing tables.', 'Needs COMMIT to save. Rollback supported.'],
          ['<strong>DQL</strong> (Query)', '<code>SELECT</code>', 'Fetch or read data from tables.', 'Read-only. No state changes.'],
          ['<strong>TCL</strong> (Transaction)', '<code>COMMIT, ROLLBACK, SAVEPOINT</code>', 'Control transaction save states.', 'Manages log records.']
        ]
      )}

      ${heading('3. DDL Commands Syntax')}
      ${p('<strong>CREATE TABLE:</strong> Sets up the table name, columns, data types, and rules.')}
      ${codeBlock(`CREATE TABLE employees (
    emp_id INT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    salary DECIMAL(10, 2)
);`)}
      
      ${p('<strong>ALTER TABLE:</strong> Modifies columns of an existing table structure.')}
      ${codeBlock(`-- Add Column
ALTER TABLE employees ADD email VARCHAR(100);
-- Drop Column
ALTER TABLE employees DROP COLUMN salary;`)}

      ${heading('4. 🎯 Interview Favorite: DELETE vs. TRUNCATE vs. DROP')}
      ${p('Think of a physical textbook to understand these three commands:')}
      ${table(
        ['Property', 'DELETE', 'TRUNCATE', 'DROP'],
        [
          ['Command Class', 'DML (manipulates data rows)', 'DDL (re-creates schema structure)', 'DDL (deletes schema metadata)'],
          ['Execution Speed', 'Slow (erases row-by-row, logs each action)', 'Fast (deallocates storage pages in one go)', 'Fastest (deletes table completely from disk)'],
          ['WHERE Support', 'Yes (can delete specific rows)', 'No (deletes everything inside table)', 'No (deletes the entire table structure)'],
          ['Rollback Status', 'Can be rolled back easily', 'Rollback depends on database settings', 'Cannot be rolled back']
        ]
      )}
    `)
  },
  'RGB-74': {
    title: 'Inserting & Retrieving Data in SQL',
    content: wrapper(`
      ${heading('1. The INSERT Statement')}
      ${p('<strong>INSERT INTO:</strong> Used to add new rows of data into a database table.')}
      ${codeBlock(`-- Single Row Insertion
INSERT INTO users (id, name, email) VALUES (1, 'Raj', 'raj@gmail.com');

-- Bulk Insertion (Highly optimized, reduces transactional overhead)
INSERT INTO users (id, name, email) VALUES 
(2, 'Simran', 'simran@gmail.com'),
(3, 'Aman', 'aman@gmail.com'),
(4, 'Neha', 'neha@gmail.com');`)}

      ${heading('2. Selecting & Querying Data')}
      ${p('<strong>SELECT DISTINCT:</strong> Returns only unique values by filtering out duplicates from the result set.')}
      ${codeBlock(`-- Gets unique cities of users
SELECT DISTINCT city FROM users;`)}

      ${heading('3. Limit & Offset (Pagination)')}
      ${p('<strong>Pagination:</strong> Splitting search results into pages. <code>LIMIT</code> controls row count per page, <code>OFFSET</code> controls how many rows to skip.')}
      ${codeBlock(`-- Page size = 10, Page 3 (Skips first 20 records)
SELECT * FROM users ORDER BY id LIMIT 10 OFFSET 20;`)}

      ${warningCard(`
        <strong>🎯 Interview Deep-Dive: Deep Paging Performance Penalty</strong><br/>
        <strong>Problem:</strong> When you run <code>OFFSET 1000000 LIMIT 10</code>, the database must scan all 1,000,000 rows, load them in memory, and discard them just to return 10 rows. This causes heavy CPU and Disk IO stress.<br/>
        <strong>Solution:</strong> Use <em>Keyset Pagination</em>. Track the last seen row ID and filter on it: <code>WHERE id > 1000000 ORDER BY id LIMIT 10;</code> (Direct index seek).
      `)}
    `)
  },
  'RGB-75': {
    title: 'Data Filtering: WHERE, operators & NULL Traps',
    content: wrapper(`
      ${heading('1. WHERE Clause Operators')}
      ${p('Filters records before grouping occurs. Evaluates condition on individual rows.')}
      ${codeBlock(`SELECT * FROM employees 
WHERE salary BETWEEN 50000 AND 100000 
  AND dept_id IN (1, 3, 5)
  AND status != 'TERMINATED';`)}

      ${heading('2. Pattern Matching using LIKE')}
      ${p('<strong>LIKE:</strong> Used in a WHERE clause to search for a specified pattern in a column.')}
      ${p('- <code>%</code> represents zero, one, or multiple characters.')}
      ${p('- <code>_</code> represents a single, character placeholder.')}
      ${codeBlock(`-- Starts with A and ends with S (e.g. "AmanS")
SELECT * FROM users WHERE name LIKE 'A%S';

-- Matches names of exactly 4 letters starting with R
SELECT * FROM users WHERE name LIKE 'R___';`)}

      ${heading('3. 🎯 Interview Concept: The NULL Value Comparison Trap')}
      ${warningCard(`
        <strong>Why doesn\\'t \\'column = NULL\\' work?</strong><br/>
        In SQL, NULL is not a value; it represents "unknown" or "missing" data. Because of this, comparing anything to NULL using <code>=</code> or <code>!=</code> evaluates to <code>UNKNOWN</code>. You must use <strong>IS NULL</strong> and <strong>IS NOT NULL</strong>.<br/><br/>
        <strong>NOT IN + NULL Gotcha:</strong><br/>
        If you run <code>WHERE dept_id NOT IN (1, 2, NULL)</code>, it translates to <code>dept_id != 1 AND dept_id != 2 AND dept_id != NULL</code>. Since <code>dept_id != NULL</code> evaluates to UNKNOWN, the entire condition evaluates to UNKNOWN, returning an empty result.
      `)}
    `)
  },
  'RGB-76': {
    title: 'SQL Practice: Fundamentals & Processing Order',
    content: wrapper(`
      ${heading('1. Logical Query Execution Order (High Weightage)')}
      ${p('We write queries starting with SELECT, but the database engine compiles and executes the clauses in a completely different sequence:')}
      
      ${codeBlock(`1. FROM & JOIN     <-- Sets baseline tables
2. WHERE           <-- Filters raw rows
3. GROUP BY        <-- Segments rows into buckets
4. HAVING          <-- Filters grouped buckets
5. SELECT          <-- Projects output columns
6. DISTINCT        <-- Filters unique values
7. ORDER BY        <-- Sorts result set
8. LIMIT & OFFSET  <-- Paginate rows`)}
      
      ${hinglish('Isi liye hum WHERE clause me alias column names use nahi kar sakte, kyunki SELECT (jahan alias banta hai) WHERE ke baad chalta hai!')}

      ${heading('2. Practice Schema Layout')}
      ${table(
        ['Table', 'Columns'],
        [
          ['<strong>Employee</strong>', '<code>emp_id, name, age, salary, dept_id, hire_date</code>'],
          ['<strong>Department</strong>', '<code>dept_id, dept_name, manager_id</code>'],
          ['<strong>Student</strong>', '<code>roll_no, name, marks, city, gender</code>']
        ]
      )}

      ${heading('3. Query Practice Set & Solutions')}
      ${p('<strong>Q1. Find employees older than 25 hired in 2026:</strong>')}
      ${codeBlock(`SELECT * FROM Employee 
WHERE age > 25 AND hire_date BETWEEN '2026-01-01' AND '2026-12-31';`)}

      ${p('<strong>Q2. List unique cities of students where marks are above 80:</strong>')}
      ${codeBlock(`SELECT DISTINCT city FROM Student 
WHERE marks > 80 AND city IS NOT NULL;`)}
    `)
  },
  'RGB-77': {
    title: 'Built-in SQL Functions & SARGable Queries',
    content: wrapper(`
      ${heading('1. Core Functions Cheat Sheet')}
      <div style="margin: 0px 0px 6px 0px !important; padding: 0px !important;">
        <span style="font-weight: 700;">String:</span> <code>SUBSTRING(str, pos, len)</code>, <code>REPLACE()</code>, <code>TRIM()</code>.<br/>
        <span style="font-weight: 700;">Numeric:</span> <code>ROUND(x, decimal_places)</code>, <code>CEIL()</code> (upwards), <code>FLOOR()</code> (downwards).<br/>
        <span style="font-weight: 700;">Date:</span> <code>NOW()</code>, <code>CURDATE()</code>, <code>DATEDIFF(d1, d2)</code>.
      </div>

      ${heading('2. 🎯 Interview Concept: SARGable Queries (Index Optimization)')}
      ${p('<strong>SARGable (Search Argument Able):</strong> A query that can utilize indexes to fetch data quickly.')}
      ${hinglish('Agar hum indexed column par koi function laga dete hain (like wrapping column in YEAR() or LOWER()), to database index use nahi kar pata aur speed slow ho jati hai.')}

      ${warningCard(`
        <strong>Query Comparison:</strong><br/>
        ❌ <em>Non-SARGable (Slow):</em><br/>
        <code>SELECT * FROM Emp WHERE YEAR(hire_date) = 2026;</code><br/>
        (Applying function on hire_date column disables index).<br/><br/>
        ✅ <em>SARGable (Fast):</em><br/>
        <code>SELECT * FROM Emp WHERE hire_date >= '2026-01-01' AND hire_date <= '2026-12-31';</code>
      `)}
    `)
  },
  'RGB-78': {
    title: 'Aggregations, Grouping & HAVING Clause',
    content: wrapper(`
      ${heading('1. Aggregate Functions')}
      ${p('Aggregate functions perform a calculation on a set of values and return a single value.')}
      ${p('- <code>COUNT(*)</code>: Counts every row, including NULLs.')}
      ${p('- <code>COUNT(col)</code>: Counts only values that are NOT NULL.')}

      ${heading('2. GROUP BY and HAVING Clauses')}
      ${p('<strong>GROUP BY:</strong> Groups rows that have the same values in specified columns into summary rows.')}
      ${p('<strong>HAVING:</strong> Used to filter groups after aggregation has occurred.')}

      ${heading('3. 🎯 Interview Favorite: WHERE vs. HAVING')}
      ${table(
        ['Property', 'WHERE', 'HAVING'],
        [
          ['Execution Time', 'Runs BEFORE rows are grouped.', 'Runs AFTER rows are grouped.'],
          ['Aggregates', 'Cannot contain aggregate functions (e.g. <code>WHERE AVG(sal) > 10</code> is invalid).', 'Supports aggregate functions (e.g. <code>HAVING AVG(sal) > 10</code>).'],
          ['Performance', 'Highly efficient. Reduces database row size early.', 'Processes the grouped records, slightly slower.']
        ]
      )}

      ${subheading('Example Query:')}
      ${codeBlock(`SELECT dept_id, AVG(salary) 
FROM Employee
WHERE status = 'ACTIVE' -- filters rows first
GROUP BY dept_id
HAVING AVG(salary) > 60000; -- filters groups second`)}
    `)
  },
  'RGB-79': {
    title: 'SQL Joins & Performance Optimization',
    content: wrapper(`
      ${heading('1. Core Joins Visualized')}
      ${p('<strong>Joins:</strong> Used to combine rows from two or more tables based on a related column.')}
      
      ${table(
        ['Join Type', 'Venn Diagram representation', 'Resulting Records'],
        [
          ['<strong>INNER JOIN</strong>', '[ A ∩ B ]', 'Only records that have matching keys in BOTH tables.'],
          ['<strong>LEFT JOIN</strong>', '[ A ∪ (A ∩ B) ]', 'All records from left table, plus matched right table records.'],
          ['<strong>RIGHT JOIN</strong>', '[ (A ∩ B) ∪ B ]', 'All records from right table, plus matched left table records.'],
          ['<strong>FULL JOIN</strong>', '[ A ∪ B ]', 'All records when there is a match in either left or right table.']
        ]
      )}

      ${heading('2. 🎯 Interview Concept: ON vs. WHERE in LEFT JOIN')}
      ${warningCard(`
        <strong>Join Condition (ON):</strong> Controls how the tables match. An unmatched left row is still returned (with NULL values on the right).<br/><br/>
        <strong>Filter Condition (WHERE):</strong> Filters the final output *after* the tables are joined. If you filter on a right-side column (e.g., <code>WHERE r.status = 'ACTIVE'</code>), the unmatched rows (which have NULL values) are discarded, converting the LEFT JOIN into an INNER JOIN.
      `)}

      ${heading('3. Self Join Example (Employee-Manager Hierarchy)')}
      ${p('A join of a table with itself, requiring table aliasing:')}
      ${codeBlock(`SELECT emp.name AS Employee, mgr.name AS Manager
FROM Employee emp
LEFT JOIN Employee mgr ON emp.manager_id = mgr.emp_id;`)}
    `)
  },
  'RGB-80': {
    title: 'Database Relationships & Integrity Constraints',
    content: wrapper(`
      ${heading('1. Database Relationships')}
      <div style="margin: 0px 0px 6px 0px !important; padding: 0px !important;">
        <span style="font-weight: 700;">One-to-One (1:1):</span> E.g., User and AadhaarCard. FK is unique.<br/>
        <span style="font-weight: 700;">One-to-Many (1:N):</span> E.g., Department and Employees. FK is placed in the child table.<br/>
        <span style="font-weight: 700;">Many-to-Many (M:N):</span> E.g., Students and Courses.
      </div>

      ${heading('2. Bridge / Junction Tables')}
      ${p('Relational databases cannot store lists or arrays in a single column without violating normalization rules. A <strong>Bridge Table</strong> maps these associations by storing pairs of IDs in separate rows.')}
      
      ${codeBlock(`-- Bridge Table Example for Course Enrollments
CREATE TABLE CourseEnrollments (
    student_id INT,
    course_id INT,
    enrollment_date DATE,
    PRIMARY KEY (student_id, course_id),
    FOREIGN KEY (student_id) REFERENCES Student(roll_no) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES Course(id) ON DELETE CASCADE
);`)}

      ${hinglish('Student_id aur course_id dono ko milakar composite primary key banayi gayi hai taaki ek student ek course me do baar enroll na ho sake.')}
    `)
  },
  'RGB-81': {
    title: 'SQL Practice: Intermediate Level Challenges',
    content: wrapper(`
      ${heading('Intermediate Practice Set')}

      ${p('<strong>Q1. Find departments where the total salary bill exceeds 200,000, for employees hired after 2020:</strong>')}
      ${codeBlock(`SELECT dept_id, SUM(salary) AS total_bill
FROM Employee
WHERE hire_date > '2020-12-31'
GROUP BY dept_id
HAVING SUM(salary) > 200000;`)}

      ${p('<strong>Q2. List students who scored higher than the average score of female students:</strong>')}
      ${codeBlock(`SELECT name, marks 
FROM Student 
WHERE marks > (
    SELECT AVG(marks) 
    FROM Student 
    WHERE gender = 'F'
);`)}
    `)
  },
  'RGB-82': {
    title: 'Subqueries & Correlated Subqueries',
    content: wrapper(`
      ${heading('1. Types of Subqueries')}
      <div style="margin: 0px 0px 6px 0px !important; padding: 0px !important;">
        <span style="font-weight: 700;">Scalar Subquery:</span> Returns a single value. Used with normal comparisons (e.g. <code>=, &gt;, &lt;</code>).<br/>
        <span style="font-weight: 700;">Multi-Row Subquery:</span> Returns a list of values. Used with <code>IN, ANY, ALL</code>.
      </div>

      ${heading('2. Correlated Subquery')}
      ${p('A subquery that references columns from the outer query. It evaluates once for every row processed by the outer query.')}
      ${codeBlock(`-- Find employees earning more than their department's average salary
SELECT e1.name, e1.salary, e1.dept_id
FROM Employee e1
WHERE e1.salary > (
    SELECT AVG(e2.salary) 
    FROM Employee e2 
    WHERE e2.dept_id = e1.dept_id -- reference to outer query
);`)}

      ${heading('3. 🎯 Interview Favorite: EXISTS vs. IN')}
      ${warningCard(`
        <strong>IN operator:</strong> Executes the subquery first, stores the result set in memory, and then filters. Slow for large datasets.<br/><br/>
        <strong>EXISTS operator:</strong> Evaluates row-by-row and stops processing the subquery as soon as a single match is found. Generally faster for complex queries.
      `)}
    `)
  },
  'RGB-83': {
    title: 'CTE (Common Table Expressions) & Recursive CTEs',
    content: wrapper(`
      ${heading('1. Common Table Expression (CTE)')}
      ${p('A temporary result set defined using the <code>WITH</code> clause that remains active only within the scope of a single query.')}
      ${codeBlock(`WITH Sales_CTE AS (
    SELECT salesman_id, SUM(amount) AS total_sales
    FROM Orders GROUP BY salesman_id
)
SELECT s.name, c.total_sales 
FROM Sales_CTE c
JOIN Salesman s ON c.salesman_id = s.id;`)}

      ${heading('2. Recursive CTE (Hierarchy Traversals)')}
      ${p('Self-referential CTEs used to traverse organizational charts, folder paths, or network graphs.')}
      ${codeBlock(`WITH RECURSIVE OrgChart AS (
    -- Anchor Member: Root CEO
    SELECT emp_id, name, manager_id, 1 AS level
    FROM Employee WHERE manager_id IS NULL
    UNION ALL
    -- Recursive Member: Joins child with parent
    SELECT e.emp_id, e.name, e.manager_id, o.level + 1
    FROM Employee e
    JOIN OrgChart o ON e.manager_id = o.emp_id
)
SELECT * FROM OrgChart;`)}

      ${heading('3. 🎯 Interview Concept: CTE vs. Subquery vs. Temp Table')}
      ${table(
        ['Feature', 'Subquery', 'CTE', 'Temp Table'],
        [
          ['Readability', 'Poor (nested queries)', 'Excellent (modular sections)', 'Fair (requires create/drop statements)'],
          ['Reusability', 'No (must rewrite query)', 'Yes (multiple references inside query)', 'Yes (across the entire session)'],
          ['Indexing', 'No', 'No', 'Yes (supports indexes for performance)']
        ]
      )}
    `)
  },
  'RGB-84': {
    title: 'Window Functions (Row_Number, Rank, Lag, Lead)',
    content: wrapper(`
      ${heading('1. Window Functions vs. GROUP BY (High Weightage)')}
      ${card(`
        <strong>GROUP BY:</strong> Collapses rows and aggregates them, hiding individual details.<br/><br/>
        <strong>Window Functions:</strong> Calculate values over a window of rows while keeping every original row visible in the output.
      `)}

      ${heading('2. ROW_NUMBER() vs. RANK() vs. DENSE_RANK()')}
      ${p('How ranks are assigned when values are identical (Ties):')}
      ${table(
        ['Name', 'Score', 'ROW_NUMBER()', 'RANK()', 'DENSE_RANK()'],
        [
          ['Alice', '100', '1', '1', '1'],
          ['Bob', '100', '2', '1', '1'],
          ['Charlie', '90', '3', '3 (skips 2)', '2 (no gap)']
        ]
      )}

      ${heading('3. Offset Window Functions: LAG & LEAD')}
      ${p('Used to access values from preceding (LAG) or succeeding (LEAD) rows without self-joining.')}
      ${codeBlock(`-- Finds month-over-month growth details
SELECT month, revenue,
       LAG(revenue, 1) OVER (ORDER BY month) AS previous_month_revenue
FROM MonthlyRevenue;`)}
    `)
  },
  'RGB-85': {
    title: 'Views, Stored Procedures, Functions & Triggers',
    content: wrapper(`
      ${heading('1. Database Views')}
      <div style="margin: 0px 0px 6px 0px !important; padding: 0px !important;">
        <span style="font-weight: 700;">View:</span> A virtual table based on a SELECT query. It does not store data on disk. Used to simplify queries and hide sensitive columns.<br/>
        <span style="font-weight: 700;">Materialized View:</span> A physical copy of the view cached on disk. Used to speed up complex queries, but must be refreshed when data changes.
      </div>

      ${heading('2. Stored Procedures vs. Functions')}
      ${table(
        ['Feature', 'Stored Procedure', 'User-Defined Function (UDF)'],
        [
          ['Return Values', 'Can return zero, one, or multiple result sets.', 'Must return a single value or table.'],
          ['Transactions', 'Can use COMMIT and ROLLBACK inside.', 'Cannot manage transactions (Read-Only).'],
          ['Execution', 'Called using: <code>CALL proc_name();</code>', 'Called inline: <code>SELECT func();</code>']
        ]
      )}

      ${heading('3. Database Triggers')}
      ${p('Pre-compiled database blocks that execute automatically before or after DML events (INSERT, UPDATE, DELETE).')}
    `)
  },
  'RGB-86': {
    title: 'Advanced Practice Challenges & Query Construction',
    content: wrapper(`
      ${heading('Advanced Practice Set')}

      ${p('<strong>Q1. Find the 3rd highest salary per department:</strong>')}
      ${codeBlock(`WITH Ranked AS (
    SELECT name, salary, dept_id,
           DENSE_RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) as rnk
    FROM Employee
)
SELECT name, salary, dept_id 
FROM Ranked 
WHERE rnk = 3;`)}

      ${p('<strong>Q2. Identify users who logged in for 3 or more consecutive days:</strong>')}
      ${codeBlock(`WITH DistinctLogins AS (
    SELECT DISTINCT user_id, CAST(login_time AS DATE) AS login_date
    FROM Logins
),
Grouped AS (
    SELECT user_id, login_date,
           login_date - INTERVAL (ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY login_date)) DAY AS grp
    FROM DistinctLogins
)
SELECT user_id, COUNT(*) AS consecutive_days
FROM Grouped
GROUP BY user_id, grp
HAVING COUNT(*) >= 3;`)}
    `)
  },
  'RGB-87': {
    title: 'Database Normalization Rules (1NF to BCNF)',
    content: wrapper(`
      ${heading('1. The Need for Normalization')}
      ${p('Normalization is the process of organizing columns and tables to minimize redundancy and prevent anomalies:')}
      <div style="margin: 0px 0px 6px 0px !important; padding: 0px !important;">
        <span style="font-weight: 700;">Insert Anomaly:</span> Cannot insert a teacher unless a student registers for their class.<br/>
        <span style="font-weight: 700;">Update Anomaly:</span> If an address is duplicated across 10 rows, updating it requires modifying all 10 rows. Otherwise, data becomes inconsistent.<br/>
        <span style="font-weight: 700;">Delete Anomaly:</span> Deleting a student deletes their entire course description.
      </div>

      ${heading('2. Normal Forms (1NF to BCNF)')}
      ${table(
        ['Normal Form', 'Core Requirement', 'Goal / Solution'],
        [
          ['<strong>1NF</strong>', 'Atomic Values. No repeating groups.', 'Every cell must contain a single value.'],
          ['<strong>2NF</strong>', 'In 1NF + No Partial Dependency.', 'All non-key columns must depend on the ENTIRE primary key (Composite key rules).'],
          ['<strong>3NF</strong>', 'In 2NF + No Transitive Dependency.', 'Non-key columns cannot depend on other non-key columns (e.g. A -> B, B -> C).'],
          ['<strong>BCNF</strong>', 'For every X -> Y, X must be a Super Key.', 'Strict version of 3NF resolving overlapping candidate keys.']
        ]
      )}
    `)
  },
  'RGB-88': {
    title: 'Database Schema Design Casestudies',
    content: wrapper(`
      ${heading('Case Study: E-Commerce System Design')}
      
      ${p('<strong>Normalized Tables Structure:</strong>')}
      <div style="margin: 0px 0px 6px 0px !important; padding: 0px !important;">
        <span style="font-weight: 700;">Users:</span> <code>user_id (PK)</code>, <code>email (Unique)</code>, <code>password</code><br/>
        <span style="font-weight: 700;">Products:</span> <code>product_id (PK)</code>, <code>price</code>, <code>stock</code><br/>
        <span style="font-weight: 700;">Orders:</span> <code>order_id (PK)</code>, <code>user_id (FK)</code>, <code>order_date</code><br/>
        <span style="font-weight: 700;">OrderItems (Junction):</span> <code>order_id (FK)</code>, <code>product_id (FK)</code>, <code>quantity</code>, <code>PRIMARY KEY (order_id, product_id)</code>
      </div>

      ${p('<strong>Referential Constraints Syntax:</strong>')}
      ${codeBlock(`CREATE TABLE OrderItems (
    order_id INT,
    product_id INT,
    quantity INT CHECK (quantity > 0),
    PRIMARY KEY (order_id, product_id),
    FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE RESTRICT
);`)}
    `)
  },
  'RGB-89': {
    title: 'SQL Constraints & Referential Actions',
    content: wrapper(`
      ${heading('1. Data Constraints')}
      <div style="margin: 0px 0px 6px 0px !important; padding: 0px !important;">
        <span style="font-weight: 700;">NOT NULL:</span> Prevents empty values in columns.<br/>
        <span style="font-weight: 700;">CHECK:</span> Validates criteria (e.g. <code>CHECK (salary &gt;= 0)</code>).<br/>
        <span style="font-weight: 700;">UNIQUE:</span> Guarantees unique values, allows NULLs.
      </div>

      ${heading('2. Referential Integrity Constraints (Cascading Rules)')}
      ${p('Defines what happens to child records when parent primary rows are deleted:')}
      ${table(
        ['Cascading Rule', 'Resulting Database action'],
        [
          ['<code>ON DELETE CASCADE</code>', 'Deletes all child rows automatically when the parent row is deleted.'],
          ['<code>ON DELETE SET NULL</code>', 'Sets the child foreign key values to NULL.'],
          ['<code>ON DELETE RESTRICT</code>', 'Blocks the delete command on parent tables while child rows exist.']
        ]
      )}
    `)
  },
  'RGB-90': {
    title: 'Transactions, ACID Properties & Isolation Levels',
    content: wrapper(`
      ${heading('1. Transaction Control (ACID Properties)')}
      ${p('A transaction is a logical unit of work that must succeed or fail as a single unit.')}
      
      ${card(`
        <strong>UPI Money Transfer Analogy:</strong><br/>
        You send Rs. 500 to a friend. This requires two updates: debiting your account and crediting theirs. If the transaction fails midway, Atomicity guarantees both updates are rolled back, ensuring your money isn\\'t lost.
      `)}

      <div style="margin: 0px 0px 6px 0px !important; padding: 0px !important;">
        <span style="font-weight: 700;">Atomicity:</span> All-or-nothing execution.<br/>
        <span style="font-weight: 700;">Consistency:</span> The database moves from one valid state to another, preserving all rules and constraints.<br/>
        <span style="font-weight: 700;">Isolation:</span> Concurrent transactions execute independently without visible intermediate states.<br/>
        <span style="font-weight: 700;">Durability:</span> Once committed, updates are permanently saved in disk files and survive system crashes.
      </div>

      ${heading('2. Concurrency Isolation Levels')}
      ${table(
        ['Isolation Level', 'Dirty Reads', 'Non-Repeatable Reads', 'Phantom Reads'],
        [
          ['<strong>Read Uncommitted</strong>', '❌ Allowed', '❌ Allowed', '❌ Allowed'],
          ['<strong>Read Committed</strong>', '✅ Prevented', '❌ Allowed', '❌ Allowed'],
          ['<strong>Repeatable Read</strong>', '✅ Prevented', '✅ Prevented', '❌ Allowed'],
          ['<strong>Serializable</strong>', '✅ Prevented', '✅ Prevented', '✅ Prevented']
        ]
      )}
    `)
  },
  'RGB-91': {
    title: 'Database Indexing: Textbook Index Analogy',
    content: wrapper(`
      ${heading('1. The Textbook Index Analogy')}
      ${card(`
        <strong>How indexing works:</strong><br/>
        Instead of reading all 500 pages of a book line-by-line (Table Scan), you open the Index page at the back of the book alphabetically. You find "ACID: page 120" and jump directly to that page (Index Seek).
      `)}

      ${heading('2. Clustered vs. Non-Clustered Indexes')}
      <div style="margin: 0px 0px 6px 0px !important; padding: 0px !important;">
        <span style="font-weight: 700;">Clustered Index:</span> Physically sorts and stores the actual table data rows on disk. Only ONE clustered index is allowed per table.<br/>
        <span style="font-weight: 700;">Non-Clustered Index:</span> Stores pointers to physical data row addresses in a separate index structure. Multiple non-clustered indexes are allowed.
      </div>

      ${heading('3. Composite Indexes (Leftmost Prefix Rule)')}
      ${p('An index on columns <code>(colA, colB, colC)</code> is optimized only if filters check columns from left to right (e.g., <code>colA</code> or <code>colA, colB</code>). Queries filtering only on <code>colB</code> cannot use the index tree.')}
    `)
  },
  'RGB-92': {
    title: 'Top SQL Pattern Queries & Step-by-Step Solutions',
    content: wrapper(`
      ${heading('Essential Query Templates')}

      ${p('<strong>1. Find the N-th Highest Salary:</strong>')}
      ${codeBlock(`WITH Ranked AS (
    SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) as rnk
    FROM Employee
)
SELECT DISTINCT salary FROM Ranked WHERE rnk = @N;`)}

      ${p('<strong>2. Delete Duplicates and Keep Lowest ID:</strong>')}
      ${codeBlock(`DELETE e1 FROM Employee e1
JOIN Employee e2 ON e1.email = e2.email AND e1.id > e2.id;`)}

      ${p('<strong>3. Calculate a Running Total:</strong>')}
      ${codeBlock(`SELECT id, amount,
       SUM(amount) OVER (ORDER BY order_date) AS running_total
FROM Orders;`)}
    `)
  },
  'RGB-93': {
    title: 'LeetCode SQL Easy Solutions',
    content: wrapper(`
      ${heading('Easy Level Questions')}

      ${p('<strong>1. Big Countries (LC 595):</strong>')}
      ${codeBlock(`SELECT name, population, area FROM World
WHERE area >= 3000000 OR population >= 25000000;`)}

      ${p('<strong>2. Find Customer Referee (LC 584) - Handling NULLs:</strong>')}
      ${codeBlock(`SELECT name FROM Customer
WHERE referee_id != 2 OR referee_id IS NULL;`)}
    `)
  },
  'RGB-94': {
    title: 'LeetCode SQL Medium Solutions',
    content: wrapper(`
      ${heading('Medium Level Questions')}

      ${p('<strong>1. Department Highest Salary (LC 184):</strong>')}
      ${codeBlock(`WITH Ranked AS (
    SELECT e.name AS Employee, e.salary, d.name AS Department,
           RANK() OVER (PARTITION BY e.departmentId ORDER BY e.salary DESC) AS rnk
    FROM Employee e
    JOIN Department d ON e.departmentId = d.id
)
SELECT Department, Employee, salary 
FROM Ranked 
WHERE rnk = 1;`)}
    `)
  },
  'RGB-95': {
    title: 'Technical Interview Execution Framework',
    content: wrapper(`
      ${heading('The Interview Strategy')}
      <div style="margin: 0px 0px 6px 0px !important; padding: 0px !important;">
        <strong>1. Ask Clarifying Questions:</strong> Ask how to handle duplicates, null values, or tie ranks.<br/>
        <strong>2. State the Approach First:</strong> Describe the query flow before typing code.<br/>
        <strong>3. Review Edge Cases:</strong> Dry run query parameters manually with the interviewer.
      </div>
    `)
  },
  'RGB-96': {
    title: 'SQL & Database Design Cheat Sheet',
    content: wrapper(`
      ${heading('Revision Cheat Sheet')}
      <div style="margin: 0px 0px 6px 0px !important; padding: 0px !important;">
        <strong>Join Logic:</strong> INNER (Intersections), LEFT (Left table fully preserved).<br/>
        <strong>Ranks:</strong> ROW_NUMBER (Consecutive), RANK (Skips numbers), DENSE_RANK (No gaps).<br/>
        <strong>Normalization:</strong> 1NF (Atomic), 2NF (No partial dependency), 3NF (No transitive dependency).
      </div>
    `)
  }
};

// Fallback notes using clean structure with no gaps
const getFallbackNote = (taskId, taskName, taskDescription) => {
  return {
    title: `Study Notes: ${taskName}`,
    content: wrapper(`
      ${heading('Topic Details')}
      ${p(taskDescription ? taskDescription.replace(/\n/g, '<br/>') : 'Detailed lesson roadmap details.')}
      
      ${heading('Interview Prep Tips')}
      <div style="margin: 0px 0px 6px 0px !important; padding: 0px !important;">
        - Study standard syntax and constraint behaviors.<br/>
        - Analyze query execution costs using EXPLAIN plans.
      </div>
    `)
  };
};

// Clean HTML to collapse all carriage returns and redundant spaces to resolve white-space: pre-wrap issues
const cleanHtml = (html) => {
  if (!html) return '';
  const preBlocks = [];
  let placeholderIndex = 0;
  
  // Replace <pre> blocks with placeholders
  let processedHtml = html.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, (match) => {
    const placeholder = `__PRE_BLOCK_PLACEHOLDER_${placeholderIndex}__`;
    preBlocks.push({ placeholder, content: match });
    placeholderIndex++;
    return placeholder;
  });

  // Strip all newlines and collapse spaces
  processedHtml = processedHtml
    .replace(/\r?\n|\r/g, ' ') // convert all physical line breaks to single spaces
    .replace(/>\s+</g, '><')   // delete whitespace between HTML tags
    .replace(/\s+/g, ' ')     // collapse consecutive spaces
    .trim();

  // Restore the <pre> blocks
  for (const block of preBlocks) {
    processedHtml = processedHtml.replace(block.placeholder, block.content);
  }

  return processedHtml;
};

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const Task = mongoose.connection.collection('tasks');
    const Note = mongoose.connection.collection('notes');

    const childTasks = await Task.find({
      parentTask: new mongoose.Types.ObjectId(PARENT_TASK_ID)
    }).sort({ taskId: 1 }).toArray();

    console.log(`Found ${childTasks.length} child tasks for SQL parent.`);

    let notesInserted = 0;
    let notesUpdated = 0;

    for (const task of childTasks) {
      const taskId = task.taskId;
      const explicitNote = notesMap[taskId];
      const noteData = explicitNote || getFallbackNote(taskId, task.taskName, task.taskDescription);

      const cleanedContent = cleanHtml(noteData.content);

      const existingNote = await Note.findOne({
        taskId: task._id,
        userId: new mongoose.Types.ObjectId(USER_ID)
      });

      const notePayload = {
        userId: new mongoose.Types.ObjectId(USER_ID),
        title: noteData.title,
        content: cleanedContent,
        imageUrl: '',
        color: '#fef08a', // standard yellow
        position: { x: 100, y: 100 },
        size: { width: 450, height: 350 },
        isPinned: false,
        taskId: task._id,
        tags: [],
        taskIds: [],
        updatedAt: new Date()
      };

      if (existingNote) {
        await Note.updateOne(
          { _id: existingNote._id },
          { $set: { title: notePayload.title, content: notePayload.content, updatedAt: new Date() } }
        );
        notesUpdated++;
      } else {
        notePayload.createdAt = new Date();
        await Note.insertOne(notePayload);
        notesInserted++;
      }
    }

    console.log(`Execution completed. Notes Inserted: ${notesInserted}, Notes Updated: ${notesUpdated}.`);
    process.exit(0);
  } catch (err) {
    console.error('Error during execution:', err);
    process.exit(1);
  }
};

run();
