-- Winter Arc Pulse - Complete Database Setup
-- Run this script in your Supabase SQL Editor to set up all tables and seed data

-- ============================================================================
-- TABLES CREATION
-- ============================================================================

-- 1. Users Profile Table
CREATE TABLE IF NOT EXISTS users_profile (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  college text,
  weight integer,
  goal text,
  created_at timestamptz DEFAULT now()
);

-- 2. Daily Tasks Table
CREATE TABLE IF NOT EXISTS daily_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users_profile(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  task_type text NOT NULL CHECK (task_type IN ('DSA', 'Workout', 'Study')),
  description text NOT NULL,
  status boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 3. Workout Exercises (Reference Data)
CREATE TABLE IF NOT EXISTS workout_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_type text NOT NULL CHECK (workout_type IN ('Push', 'Pull', 'Legs')),
  exercise_name text NOT NULL,
  default_sets integer DEFAULT 3,
  default_reps integer DEFAULT 10,
  position integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 4. Workout Logs
CREATE TABLE IF NOT EXISTS workout_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users_profile(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  workout_type text NOT NULL CHECK (workout_type IN ('Push', 'Pull', 'Legs')),
  exercise_name text NOT NULL,
  sets_completed integer NOT NULL,
  reps integer NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- 5. DSA Problems (Reference Data)
CREATE TABLE IF NOT EXISTS dsa_problems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  topic text NOT NULL,
  link text NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  position integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 6. DSA Logs
CREATE TABLE IF NOT EXISTS dsa_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users_profile(id) ON DELETE CASCADE,
  problem_id uuid NOT NULL REFERENCES dsa_problems(id) ON DELETE CASCADE,
  status boolean DEFAULT false,
  date date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, problem_id)
);

-- 7. Study Topics (Reference Data)
CREATE TABLE IF NOT EXISTS study_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject text NOT NULL CHECK (subject IN ('OS', 'DBMS', 'OOP', 'CN')),
  topic text NOT NULL,
  position integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 8. Study Logs
CREATE TABLE IF NOT EXISTS study_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users_profile(id) ON DELETE CASCADE,
  topic_id uuid NOT NULL REFERENCES study_topics(id) ON DELETE CASCADE,
  subject text NOT NULL,
  topic text NOT NULL,
  status boolean DEFAULT false,
  date date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, topic_id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_daily_tasks_user_date ON daily_tasks(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_workout_logs_user_date ON workout_logs(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_dsa_problems_topic ON dsa_problems(topic);
CREATE INDEX IF NOT EXISTS idx_dsa_problems_position ON dsa_problems(position);
CREATE INDEX IF NOT EXISTS idx_dsa_logs_user_date ON dsa_logs(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_study_topics_subject ON study_topics(subject, position);
CREATE INDEX IF NOT EXISTS idx_study_logs_user_date ON study_logs(user_id, date DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE dsa_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE dsa_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_logs ENABLE ROW LEVEL SECURITY;

-- Users Profile Policies
CREATE POLICY "Users can view own profile" ON users_profile FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users_profile FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users_profile FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Daily Tasks Policies
CREATE POLICY "Users can view own tasks" ON daily_tasks FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasks" ON daily_tasks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON daily_tasks FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks" ON daily_tasks FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Workout Exercises Policies (Public Read)
CREATE POLICY "Anyone can view workout exercises" ON workout_exercises FOR SELECT TO authenticated USING (true);

-- Workout Logs Policies
CREATE POLICY "Users can view own workout logs" ON workout_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own workout logs" ON workout_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workout logs" ON workout_logs FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own workout logs" ON workout_logs FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- DSA Problems Policies (Public Read)
CREATE POLICY "Anyone can view DSA problems" ON dsa_problems FOR SELECT TO authenticated USING (true);

-- DSA Logs Policies
CREATE POLICY "Users can view own DSA logs" ON dsa_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own DSA logs" ON dsa_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own DSA logs" ON dsa_logs FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own DSA logs" ON dsa_logs FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Study Topics Policies (Public Read)
CREATE POLICY "Anyone can view study topics" ON study_topics FOR SELECT TO authenticated USING (true);

-- Study Logs Policies
CREATE POLICY "Users can view own study logs" ON study_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own study logs" ON study_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own study logs" ON study_logs FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own study logs" ON study_logs FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================================================
-- SEED DATA - Workout Exercises
-- ============================================================================

INSERT INTO workout_exercises (workout_type, exercise_name, default_sets, default_reps, position) VALUES
-- Push Day
('Push', 'Bench Press', 4, 8, 1),
('Push', 'Overhead Press', 3, 10, 2),
('Push', 'Incline Dumbbell Press', 3, 10, 3),
('Push', 'Lateral Raises', 3, 12, 4),
('Push', 'Tricep Dips', 3, 10, 5),
('Push', 'Tricep Pushdowns', 3, 12, 6),

-- Pull Day
('Pull', 'Deadlift', 4, 6, 1),
('Pull', 'Pull-ups', 3, 8, 2),
('Pull', 'Barbell Rows', 4, 8, 3),
('Pull', 'Face Pulls', 3, 15, 4),
('Pull', 'Bicep Curls', 3, 12, 5),
('Pull', 'Hammer Curls', 3, 12, 6),

-- Legs Day
('Legs', 'Squats', 4, 8, 1),
('Legs', 'Romanian Deadlift', 3, 10, 2),
('Legs', 'Leg Press', 3, 12, 3),
('Legs', 'Leg Curls', 3, 12, 4),
('Legs', 'Calf Raises', 4, 15, 5),
('Legs', 'Lunges', 3, 10, 6);

-- ============================================================================
-- SEED DATA - DSA Problems (Sample from Striver's Sheet)
-- ============================================================================

INSERT INTO dsa_problems (title, topic, link, difficulty, position) VALUES
-- Arrays
('Two Sum', 'Arrays', 'https://leetcode.com/problems/two-sum/', 'Easy', 1),
('Best Time to Buy and Sell Stock', 'Arrays', 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/', 'Easy', 2),
('Contains Duplicate', 'Arrays', 'https://leetcode.com/problems/contains-duplicate/', 'Easy', 3),
('Product of Array Except Self', 'Arrays', 'https://leetcode.com/problems/product-of-array-except-self/', 'Medium', 4),
('Maximum Subarray', 'Arrays', 'https://leetcode.com/problems/maximum-subarray/', 'Medium', 5),
('3Sum', 'Arrays', 'https://leetcode.com/problems/3sum/', 'Medium', 6),
('Container With Most Water', 'Arrays', 'https://leetcode.com/problems/container-with-most-water/', 'Medium', 7),
('Trapping Rain Water', 'Arrays', 'https://leetcode.com/problems/trapping-rain-water/', 'Hard', 8),

-- Strings
('Valid Anagram', 'Strings', 'https://leetcode.com/problems/valid-anagram/', 'Easy', 9),
('Valid Palindrome', 'Strings', 'https://leetcode.com/problems/valid-palindrome/', 'Easy', 10),
('Longest Substring Without Repeating Characters', 'Strings', 'https://leetcode.com/problems/longest-substring-without-repeating-characters/', 'Medium', 11),
('Longest Palindromic Substring', 'Strings', 'https://leetcode.com/problems/longest-palindromic-substring/', 'Medium', 12),
('Group Anagrams', 'Strings', 'https://leetcode.com/problems/group-anagrams/', 'Medium', 13),

-- Linked List
('Reverse Linked List', 'Linked List', 'https://leetcode.com/problems/reverse-linked-list/', 'Easy', 14),
('Merge Two Sorted Lists', 'Linked List', 'https://leetcode.com/problems/merge-two-sorted-lists/', 'Easy', 15),
('Linked List Cycle', 'Linked List', 'https://leetcode.com/problems/linked-list-cycle/', 'Easy', 16),
('Remove Nth Node From End of List', 'Linked List', 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/', 'Medium', 17),
('Reorder List', 'Linked List', 'https://leetcode.com/problems/reorder-list/', 'Medium', 18),
('Merge K Sorted Lists', 'Linked List', 'https://leetcode.com/problems/merge-k-sorted-lists/', 'Hard', 19),

-- Binary Trees
('Maximum Depth of Binary Tree', 'Binary Trees', 'https://leetcode.com/problems/maximum-depth-of-binary-tree/', 'Easy', 20),
('Invert Binary Tree', 'Binary Trees', 'https://leetcode.com/problems/invert-binary-tree/', 'Easy', 21),
('Binary Tree Level Order Traversal', 'Binary Trees', 'https://leetcode.com/problems/binary-tree-level-order-traversal/', 'Medium', 22),
('Validate Binary Search Tree', 'Binary Trees', 'https://leetcode.com/problems/validate-binary-search-tree/', 'Medium', 23),
('Lowest Common Ancestor of BST', 'Binary Trees', 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/', 'Medium', 24),
('Binary Tree Maximum Path Sum', 'Binary Trees', 'https://leetcode.com/problems/binary-tree-maximum-path-sum/', 'Hard', 25),

-- Dynamic Programming
('Climbing Stairs', 'Dynamic Programming', 'https://leetcode.com/problems/climbing-stairs/', 'Easy', 26),
('House Robber', 'Dynamic Programming', 'https://leetcode.com/problems/house-robber/', 'Medium', 27),
('Coin Change', 'Dynamic Programming', 'https://leetcode.com/problems/coin-change/', 'Medium', 28),
('Longest Increasing Subsequence', 'Dynamic Programming', 'https://leetcode.com/problems/longest-increasing-subsequence/', 'Medium', 29),
('Word Break', 'Dynamic Programming', 'https://leetcode.com/problems/word-break/', 'Medium', 30),

-- Graphs
('Number of Islands', 'Graphs', 'https://leetcode.com/problems/number-of-islands/', 'Medium', 31),
('Clone Graph', 'Graphs', 'https://leetcode.com/problems/clone-graph/', 'Medium', 32),
('Course Schedule', 'Graphs', 'https://leetcode.com/problems/course-schedule/', 'Medium', 33),
('Pacific Atlantic Water Flow', 'Graphs', 'https://leetcode.com/problems/pacific-atlantic-water-flow/', 'Medium', 34),
('Word Ladder', 'Graphs', 'https://leetcode.com/problems/word-ladder/', 'Hard', 35),

-- Stacks
('Valid Parentheses', 'Stacks', 'https://leetcode.com/problems/valid-parentheses/', 'Easy', 36),
('Min Stack', 'Stacks', 'https://leetcode.com/problems/min-stack/', 'Medium', 37),
('Daily Temperatures', 'Stacks', 'https://leetcode.com/problems/daily-temperatures/', 'Medium', 38),
('Largest Rectangle in Histogram', 'Stacks', 'https://leetcode.com/problems/largest-rectangle-in-histogram/', 'Hard', 39),

-- Binary Search
('Binary Search', 'Binary Search', 'https://leetcode.com/problems/binary-search/', 'Easy', 40),
('Search in Rotated Sorted Array', 'Binary Search', 'https://leetcode.com/problems/search-in-rotated-sorted-array/', 'Medium', 41),
('Find Minimum in Rotated Sorted Array', 'Binary Search', 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/', 'Medium', 42),
('Median of Two Sorted Arrays', 'Binary Search', 'https://leetcode.com/problems/median-of-two-sorted-arrays/', 'Hard', 43),

-- Heaps
('Kth Largest Element in Array', 'Heaps', 'https://leetcode.com/problems/kth-largest-element-in-an-array/', 'Medium', 44),
('Top K Frequent Elements', 'Heaps', 'https://leetcode.com/problems/top-k-frequent-elements/', 'Medium', 45),
('Find Median from Data Stream', 'Heaps', 'https://leetcode.com/problems/find-median-from-data-stream/', 'Hard', 46),

-- Backtracking
('Subsets', 'Backtracking', 'https://leetcode.com/problems/subsets/', 'Medium', 47),
('Permutations', 'Backtracking', 'https://leetcode.com/problems/permutations/', 'Medium', 48),
('Combination Sum', 'Backtracking', 'https://leetcode.com/problems/combination-sum/', 'Medium', 49),
('N-Queens', 'Backtracking', 'https://leetcode.com/problems/n-queens/', 'Hard', 50);

-- ============================================================================
-- SEED DATA - Study Topics
-- ============================================================================

-- Operating Systems Topics
INSERT INTO study_topics (subject, topic, position) VALUES
('OS', 'Introduction to Operating Systems', 1),
('OS', 'Process Management', 2),
('OS', 'Process Scheduling Algorithms', 3),
('OS', 'Threads and Multithreading', 4),
('OS', 'Process Synchronization', 5),
('OS', 'Deadlocks - Detection and Prevention', 6),
('OS', 'Memory Management', 7),
('OS', 'Paging and Segmentation', 8),
('OS', 'Virtual Memory', 9),
('OS', 'File Systems', 10),
('OS', 'Disk Scheduling Algorithms', 11),
('OS', 'I/O Systems', 12);

-- Database Management Systems Topics
INSERT INTO study_topics (subject, topic, position) VALUES
('DBMS', 'Introduction to DBMS', 1),
('DBMS', 'ER Model and Diagrams', 2),
('DBMS', 'Relational Model', 3),
('DBMS', 'SQL Basics and Queries', 4),
('DBMS', 'Joins and Set Operations', 5),
('DBMS', 'Normalization (1NF to BCNF)', 6),
('DBMS', 'Transactions and ACID Properties', 7),
('DBMS', 'Concurrency Control', 8),
('DBMS', 'Deadlock in DBMS', 9),
('DBMS', 'Indexing and B+ Trees', 10),
('DBMS', 'Query Optimization', 11),
('DBMS', 'NoSQL Databases', 12);

-- Object Oriented Programming Topics
INSERT INTO study_topics (subject, topic, position) VALUES
('OOP', 'Introduction to OOP', 1),
('OOP', 'Classes and Objects', 2),
('OOP', 'Encapsulation', 3),
('OOP', 'Inheritance', 4),
('OOP', 'Polymorphism', 5),
('OOP', 'Abstraction', 6),
('OOP', 'Constructors and Destructors', 7),
('OOP', 'Static and Dynamic Binding', 8),
('OOP', 'Interface vs Abstract Class', 9),
('OOP', 'Exception Handling', 10),
('OOP', 'Design Patterns - Singleton, Factory', 11),
('OOP', 'SOLID Principles', 12);

-- Computer Networks Topics
INSERT INTO study_topics (subject, topic, position) VALUES
('CN', 'Introduction to Computer Networks', 1),
('CN', 'OSI Model', 2),
('CN', 'TCP/IP Model', 3),
('CN', 'Application Layer Protocols (HTTP, FTP, DNS)', 4),
('CN', 'Transport Layer - TCP and UDP', 5),
('CN', 'Three-Way Handshake', 6),
('CN', 'Network Layer and IP Addressing', 7),
('CN', 'Subnetting and CIDR', 8),
('CN', 'Routing Algorithms', 9),
('CN', 'Data Link Layer and MAC', 10),
('CN', 'Error Detection and Correction', 11),
('CN', 'Network Security Basics', 12);

-- ============================================================================
-- COMPLETE!
-- ============================================================================

-- Your database is now ready to use with the Winter Arc Pulse app!
-- All tables, indexes, RLS policies, and seed data have been created.