'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { supabase, WorkoutExercise, WorkoutLog } from '@/lib/supabase';
import { Check, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function WorkoutPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [todaysLogs, setTodaysLogs] = useState<WorkoutLog[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedWorkout, setSelectedWorkout] = useState<'Push' | 'Pull' | 'Legs'>('Push');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      loadData();
    }
  }, [user, loading, router]);

  const loadData = async () => {
    try {
      const [exercisesResult, logsResult] = await Promise.all([
        supabase.from('workout_exercises').select('*').order('position'),
        supabase
          .from('workout_logs')
          .select('*')
          .eq('user_id', user?.id)
          .eq('date', new Date().toISOString().split('T')[0]),
      ]);

      if (exercisesResult.error) throw exercisesResult.error;
      if (logsResult.error) throw logsResult.error;

      setExercises(exercisesResult.data || []);
      setTodaysLogs(logsResult.data || []);
    } catch (error) {
      console.error('Error loading workout data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const logExercise = async (exercise: WorkoutExercise, sets: number, reps: number) => {
    try {
      const { error } = await supabase.from('workout_logs').insert({
        user_id: user?.id,
        date: new Date().toISOString().split('T')[0],
        workout_type: exercise.workout_type,
        exercise_name: exercise.exercise_name,
        sets_completed: sets,
        reps: reps,
      });

      if (error) throw error;

      toast({
        title: 'Exercise logged!',
        description: `${exercise.exercise_name} - ${sets} sets x ${reps} reps`,
      });

      await loadData();
    } catch (error) {
      console.error('Error logging exercise:', error);
      toast({
        title: 'Error',
        description: 'Failed to log exercise',
        variant: 'destructive',
      });
    }
  };

  if (loading || loadingData) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-slate-600">Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  const workoutTypes: Array<'Push' | 'Pull' | 'Legs'> = ['Push', 'Pull', 'Legs'];
  const filteredExercises = exercises.filter(e => e.workout_type === selectedWorkout);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Workout Tracker</h1>
          <p className="text-slate-600 mt-2">Track your Push/Pull/Legs split with progressive overload</p>
        </div>

        <Tabs value={selectedWorkout} onValueChange={(v) => setSelectedWorkout(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            {workoutTypes.map(type => (
              <TabsTrigger key={type} value={type}>
                {type}
              </TabsTrigger>
            ))}
          </TabsList>

          {workoutTypes.map(type => (
            <TabsContent key={type} value={type} className="space-y-4">
              {filteredExercises.length === 0 ? (
                <Card>
                  <CardContent className="py-8">
                    <p className="text-center text-slate-500">
                      No exercises found. Please set up your workout plan.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {filteredExercises.map(exercise => (
                    <ExerciseCard
                      key={exercise.id}
                      exercise={exercise}
                      todaysLogs={todaysLogs}
                      onLog={logExercise}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

function ExerciseCard({
  exercise,
  todaysLogs,
  onLog,
}: {
  exercise: WorkoutExercise;
  todaysLogs: WorkoutLog[];
  onLog: (exercise: WorkoutExercise, sets: number, reps: number) => void;
}) {
  const [sets, setSets] = useState(exercise.default_sets.toString());
  const [reps, setReps] = useState(exercise.default_reps.toString());

  const isLogged = todaysLogs.some(
    log => log.exercise_name === exercise.exercise_name && log.workout_type === exercise.workout_type
  );

  const handleLog = () => {
    const setsNum = parseInt(sets) || exercise.default_sets;
    const repsNum = parseInt(reps) || exercise.default_reps;
    onLog(exercise, setsNum, repsNum);
  };

  return (
    <Card className={isLogged ? 'border-green-500 bg-green-50' : ''}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <span>{exercise.exercise_name}</span>
              {isLogged && <Check className="h-5 w-5 text-green-600" />}
            </CardTitle>
            <CardDescription>
              Recommended: {exercise.default_sets} sets x {exercise.default_reps} reps
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end space-x-4">
          <div className="flex-1">
            <label className="text-sm font-medium text-slate-700">Sets</label>
            <Input
              type="number"
              value={sets}
              onChange={(e) => setSets(e.target.value)}
              min="1"
              className="mt-1"
            />
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium text-slate-700">Reps</label>
            <Input
              type="number"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              min="1"
              className="mt-1"
            />
          </div>
          <Button onClick={handleLog} disabled={isLogged}>
            {isLogged ? 'Logged' : 'Log'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}