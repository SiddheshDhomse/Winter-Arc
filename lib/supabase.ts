import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserProfile = {
  id: string;
  name: string;
  college?: string;
  weight?: number;
  goal?: string;
  created_at: string;
};

export type DailyTask = {
  id: string;
  user_id: string;
  date: string;
  task_type: 'DSA' | 'Workout' | 'Study';
  description: string;
  status: boolean;
  created_at: string;
};

export type WorkoutLog = {
  id: string;
  user_id: string;
  date: string;
  workout_type: 'Push' | 'Pull' | 'Legs';
  exercise_name: string;
  sets_completed: number;
  reps: number;
  notes?: string;
  created_at: string;
};

export type DSAProblem = {
  id: string;
  title: string;
  topic: string;
  link: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  position: number;
  created_at: string;
};

export type DSALog = {
  id: string;
  user_id: string;
  problem_id: string;
  status: boolean;
  date: string;
  notes?: string;
  created_at: string;
};

export type StudyTopic = {
  id: string;
  subject: 'OS' | 'DBMS' | 'OOP' | 'CN';
  topic: string;
  position: number;
  created_at: string;
};

export type StudyLog = {
  id: string;
  user_id: string;
  topic_id: string;
  subject: string;
  topic: string;
  status: boolean;
  date: string;
  notes?: string;
  created_at: string;
};

export type WorkoutExercise = {
  id: string;
  workout_type: 'Push' | 'Pull' | 'Legs';
  exercise_name: string;
  default_sets: number;
  default_reps: number;
  position: number;
  created_at: string;
};