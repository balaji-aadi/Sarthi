import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;
const PROJECT_ID = '69d7788e6d3910f342f371d9';
const USER_ID = '6993047f16e85ff3e4efd9a3';

const tiers = [
  // Tier 1
  {
    name: 'Two Pointers',
    children: [
      'Two Sum II (sorted)', 'Remove duplicates from sorted array', 'Container with most water',
      '3Sum', '4Sum', 'Move zeroes', 'Valid palindrome', 'Squares of sorted array',
      'Partition array', 'Trapping rain water'
    ]
  },
  {
    name: 'Hashing',
    children: [
      'Two Sum', 'Group Anagrams', 'Top K frequent elements', 'Longest consecutive sequence',
      'Subarray sum equals K', 'Happy number', 'Isomorphic strings', 'Find duplicate',
      'Majority element', 'Contains duplicate II'
    ]
  },
  {
    name: 'Prefix Sum',
    children: [
      'Range sum query', 'Subarray sum equals K', 'Continuous subarray sum', 'Subarrays divisible by K',
      'Count subarrays with equal 0 and 1', 'Maximum size subarray sum = K', 'Difference array basics',
      'Car pooling', 'Range addition', 'Product of array except self'
    ]
  },
  {
    name: 'Kadane’s Algorithm',
    children: [
      'Maximum subarray', 'Maximum circular subarray', 'Maximum product subarray',
      'Best time to buy and sell stock', 'Maximum sum rectangle (2D Kadane)',
      'Maximum subarray with one deletion', 'K concatenation max sum', 'Maximum alternating subarray',
      'Largest sum of averages', 'Maximum difference problem'
    ]
  },
  {
    name: 'String Matching (KMP etc.)',
    children: [
      'Implement KMP', 'Find substring', 'Repeated substring pattern', 'Longest prefix suffix',
      'Rabin-Karp', 'Z algorithm', 'Shortest palindrome', 'String rotation check',
      'Pattern matching in stream', 'Wildcard matching'
    ]
  },
  // Tier 2
  {
    name: 'Intervals',
    children: [
      'Merge intervals', 'Insert interval', 'Non-overlapping intervals', 'Meeting rooms I',
      'Meeting rooms II', 'Minimum number of arrows', 'Employee free time', 'Interval intersection',
      'Car pooling', 'My calendar I'
    ]
  },
  {
    name: 'Monotonic Stack',
    children: [
      'Next greater element', 'Daily temperatures', 'Stock span', 'Largest rectangle in histogram',
      'Maximal rectangle', 'Next smaller element', 'Sum of subarray minimums',
      'Trapping rain water (stack)', 'Remove K digits', 'Car fleet'
    ]
  },
  {
    name: 'Top K Elements',
    children: [
      'Top K frequent elements', 'Kth largest element', 'K closest points', 'Merge K sorted lists',
      'Kth smallest in sorted matrix', 'Find median from data stream', 'Reorganize string',
      'Task scheduler', 'Sort characters by frequency', 'K closest elements'
    ]
  },
  {
    name: 'Palindrome (STRINGS)',
    children: [
      'Valid palindrome', 'Longest palindrome substring', 'Count palindromic substrings',
      'Longest palindrome subsequence', 'Palindrome partitioning', 'Shortest palindrome',
      'Break palindrome', 'Palindrome pairs', 'Minimum insertions to palindrome', 'Partition labels'
    ]
  },
  {
    name: 'Backtracking (STRINGS)',
    children: [
      'Permutations', 'Subsets', 'Combination sum', 'Generate parentheses', 'Word search',
      'Palindrome partitioning', 'Letter combinations phone', 'N-Queens', 'Restore IP addresses',
      'Partition to K subsets'
    ]
  },
  // Tier 3
  {
    name: 'Trie',
    children: [
      'Implement trie', 'Insert and search', 'Word dictionary', 'Replace words', 'Word search II',
      'Longest prefix', 'Auto-complete', 'Map sum pairs', 'Concatenated words', 'Stream checker'
    ]
  },
  {
    name: 'Two Pointers (STRINGS)',
    children: [
      'Valid palindrome', 'Reverse string', 'Reverse words in string', 'Longest palindrome substring',
      'String compression', 'Merge strings alternately', 'Backspace string compare',
      'One edit distance', 'Remove duplicates', 'Minimum swaps'
    ]
  },
  {
    name: 'Hashing & Anagram (STRINGS)',
    children: [
      'Valid anagram', 'Group anagrams', 'Find all anagrams', 'Check permutation',
      'Minimum steps to make anagram', 'Ransom note', 'Isomorphic string', 'Word pattern',
      'Frequency sort', 'First unique character'
    ]
  }
];

async function addTasks() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const Task = mongoose.connection.collection('tasks');

    // Find current max taskId for DSA
    const dsaTasks = await Task.find({ taskId: { $regex: /^DSA-/ } }).toArray();
    let maxId = 0;
    dsaTasks.forEach(t => {
      const num = parseInt(t.taskId.split('-')[1]);
      if (num > maxId) maxId = num;
    });
    let taskIdCounter = maxId + 1;

    // Start date: tomorrow (April 22, 2026)
    let currentStartDate = new Date('2026-04-22T00:00:00Z');

    for (const tier of tiers) {
      const numChildren = tier.children.length;
      const numDays = Math.ceil(numChildren / 3);
      const dueDate = new Date(currentStartDate);
      dueDate.setDate(dueDate.getDate() + numDays - 1);

      // Create Parent Task
      const parentTask = {
        projectName: new mongoose.Types.ObjectId(PROJECT_ID),
        taskName: tier.name,
        taskId: `DSA-${taskIdCounter++}`,
        taskPriority: 'high',
        taskType: 'preparation',
        taskStartDate: new Date(currentStartDate),
        taskDueDate: new Date(dueDate),
        estimatedHours: numChildren * 1.5,
        storyPoints: 0,
        progress: 0,
        status: 'todo',
        assignee: new mongoose.Types.ObjectId(USER_ID),
        createdBy: new mongoose.Types.ObjectId(USER_ID),
        parentTask: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        subtaskStats: { total: numChildren, completed: 0 }
      };

      const parentResult = await Task.insertOne(parentTask);
      const parentId = parentResult.insertedId;
      console.log(`Added Parent: ${tier.name} (Due: ${dueDate.toISOString().split('T')[0]})`);

      // Create Child Tasks
      for (let i = 0; i < numChildren; i++) {
        const childDay = Math.floor(i / 3);
        const childDate = new Date(currentStartDate);
        childDate.setDate(childDate.getDate() + childDay);

        const childTask = {
          projectName: new mongoose.Types.ObjectId(PROJECT_ID),
          taskName: tier.children[i],
          taskId: `DSA-${taskIdCounter++}`,
          taskPriority: 'medium',
          taskType: 'preparation',
          taskStartDate: new Date(childDate),
          taskDueDate: new Date(childDate),
          estimatedHours: 1.5,
          storyPoints: 0,
          progress: 0,
          status: 'todo',
          assignee: new mongoose.Types.ObjectId(USER_ID),
          createdBy: new mongoose.Types.ObjectId(USER_ID),
          parentTask: parentId,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        await Task.insertOne(childTask);
      }
      console.log(`  Added ${numChildren} children for ${tier.name}`);

      // Next parent start date is day after previous parent due date
      currentStartDate = new Date(dueDate);
      currentStartDate.setDate(currentStartDate.getDate() + 1);
    }

    console.log('All tasks added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error adding tasks:', error);
    process.exit(1);
  }
}

addTasks();
