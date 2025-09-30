'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase, DailyTask } from '@/lib/supabase';
import { Dumbbell, BookOpen, Brain, Plus } from 'lucide-react';

const motivationalQuotes = [
  "Your only limit is you. Push harder today!",
  "Success is the sum of small efforts repeated daily.",
  "Don't watch the clock; do what it does. Keep going.",
  "The future depends on what you do today.",
  "Push yourself, because no one else is going to do it for you.",
  "Great things never come from comfort zones.",
  "Dream it. Wish it. Do it.",
  "Your commitment to yourself is everything.",
];

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [quote] = useState(() => motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      loadTodaysTasks();
    }
  }, [user, loading, router]);

  const loadTodaysTasks = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('daily_tasks')
        .select('*')
        .eq('user_id', user?.id)
        .eq('date', today)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoadingTasks(false);
    }
  };

  const toggleTask = async (taskId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('daily_tasks')
        .update({ status: !currentStatus })
        .eq('id', taskId);

      if (error) throw error;
      await loadTodaysTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  if (loading || loadingTasks) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-slate-600">Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  const completedTasks = tasks.filter(t => t.status).length;
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const dsaTasks = tasks.filter(t => t.task_type === 'DSA');
  const workoutTasks = tasks.filter(t => t.task_type === 'Workout');
  const studyTasks = tasks.filter(t => t.task_type === 'Study');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome back!</CardTitle>
            <CardDescription className="text-blue-100 text-lg mt-2">
              {quote}
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Progress</CardTitle>
            <CardDescription>
              {completedTasks} of {totalTasks} tasks completed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={progressPercentage} className="h-3" />
            <p className="text-sm text-slate-600 mt-2">
              {progressPercentage === 100 && totalTasks > 0
                ? "Amazing! You've completed all your tasks!"
                : "Keep going! You're doing great!"}
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <span>DSA</span>
                </CardTitle>
                <Button size="sm" variant="ghost" onClick={() => router.push('/dsa')}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {dsaTasks.length === 0 ? (
                <p className="text-sm text-slate-500">No DSA tasks for today</p>
              ) : (
                <div className="space-y-3">
                  {dsaTasks.map(task => (
                    <div key={task.id} className="flex items-start space-x-2">
                      <Checkbox
                        checked={task.status}
                        onCheckedChange={() => toggleTask(task.id, task.status)}
                      />
                      <label className={`text-sm flex-1 cursor-pointer ${task.status ? 'line-through text-slate-400' : ''}`}>
                        {task.description}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Dumbbell className="h-5 w-5 text-orange-600" />
                  <span>Workout</span>
                </CardTitle>
                <Button size="sm" variant="ghost" onClick={() => router.push('/workout')}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {workoutTasks.length === 0 ? (
                <p className="text-sm text-slate-500">No workout tasks for today</p>
              ) : (
                <div className="space-y-3">
                  {workoutTasks.map(task => (
                    <div key={task.id} className="flex items-start space-x-2">
                      <Checkbox
                        checked={task.status}
                        onCheckedChange={() => toggleTask(task.id, task.status)}
                      />
                      <label className={`text-sm flex-1 cursor-pointer ${task.status ? 'line-through text-slate-400' : ''}`}>
                        {task.description}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-green-600" />
                  <span>Study</span>
                </CardTitle>
                <Button size="sm" variant="ghost" onClick={() => router.push('/study')}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {studyTasks.length === 0 ? (
                <p className="text-sm text-slate-500">No study tasks for today</p>
              ) : (
                <div className="space-y-3">
                  {studyTasks.map(task => (
                    <div key={task.id} className="flex items-start space-x-2">
                      <Checkbox
                        checked={task.status}
                        onCheckedChange={() => toggleTask(task.id, task.status)}
                      />
                      <label className={`text-sm flex-1 cursor-pointer ${task.status ? 'line-through text-slate-400' : ''}`}>
                        {task.description}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}