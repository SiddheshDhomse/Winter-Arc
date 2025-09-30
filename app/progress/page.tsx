'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export default function ProgressPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    dsa: { solved: 0, total: 0 },
    workout: { logged: 0, streak: 0 },
    study: { os: 0, dbms: 0, oop: 0, cn: 0 },
  });
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      loadStats();
    }
  }, [user, loading, router]);

  const loadStats = async () => {
    try {
      const [dsaProblems, dsaLogs, workoutLogs, studyTopics, studyLogs] = await Promise.all([
        supabase.from('dsa_problems').select('id'),
        supabase.from('dsa_logs').select('*').eq('user_id', user?.id).eq('status', true),
        supabase
          .from('workout_logs')
          .select('date')
          .eq('user_id', user?.id)
          .order('date', { ascending: false }),
        supabase.from('study_topics').select('id, subject'),
        supabase.from('study_logs').select('*').eq('user_id', user?.id).eq('status', true),
      ]);

      const dsaTotal = dsaProblems.data?.length || 0;
      const dsaSolved = dsaLogs.data?.length || 0;

      const workoutLogged = workoutLogs.data?.length || 0;
      const workoutStreak = calculateStreak(workoutLogs.data?.map(l => l.date) || []);

      const studyBySubject = {
        os: 0,
        dbms: 0,
        oop: 0,
        cn: 0,
      };

      if (studyLogs.data) {
        studyLogs.data.forEach(log => {
          const subject = log.subject.toLowerCase() as keyof typeof studyBySubject;
          if (studyBySubject[subject] !== undefined) {
            studyBySubject[subject]++;
          }
        });
      }

      setStats({
        dsa: { solved: dsaSolved, total: dsaTotal },
        workout: { logged: workoutLogged, streak: workoutStreak },
        study: studyBySubject,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const calculateStreak = (dates: string[]): number => {
    if (dates.length === 0) return 0;

    const uniqueDates = Array.from(new Set(dates)).sort().reverse();
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < uniqueDates.length; i++) {
      const date = new Date(uniqueDates[i]);
      date.setHours(0, 0, 0, 0);

      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);

      if (date.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
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

  const dsaPercentage = stats.dsa.total > 0 ? Math.round((stats.dsa.solved / stats.dsa.total) * 100) : 0;

  const studyData = [
    { subject: 'OS', completed: stats.study.os, fill: '#3b82f6' },
    { subject: 'DBMS', completed: stats.study.dbms, fill: '#10b981' },
    { subject: 'OOP', completed: stats.study.oop, fill: '#f59e0b' },
    { subject: 'CN', completed: stats.study.cn, fill: '#ef4444' },
  ];

  const dsaData = [
    { name: 'Solved', value: stats.dsa.solved, fill: '#10b981' },
    { name: 'Unsolved', value: stats.dsa.total - stats.dsa.solved, fill: '#e5e7eb' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Progress Overview</h1>
          <p className="text-slate-600 mt-2">Track your overall performance and growth</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>DSA Progress</CardTitle>
              <CardDescription>Problems solved</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-blue-600">{dsaPercentage}%</div>
              <p className="text-sm text-slate-600 mt-2">
                {stats.dsa.solved} / {stats.dsa.total} problems
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Workout Streak</CardTitle>
              <CardDescription>Consecutive days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-orange-600">{stats.workout.streak}</div>
              <p className="text-sm text-slate-600 mt-2">{stats.workout.logged} total workouts logged</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Study Topics</CardTitle>
              <CardDescription>Total completed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-600">
                {stats.study.os + stats.study.dbms + stats.study.oop + stats.study.cn}
              </div>
              <p className="text-sm text-slate-600 mt-2">Across all subjects</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>DSA Problem Distribution</CardTitle>
              <CardDescription>Solved vs Unsolved</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.dsa.total === 0 ? (
                <p className="text-center text-slate-500 py-8">No DSA problems found</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dsaData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {dsaData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Study Progress by Subject</CardTitle>
              <CardDescription>Topics completed per subject</CardDescription>
            </CardHeader>
            <CardContent>
              {studyData.every(s => s.completed === 0) ? (
                <p className="text-center text-slate-500 py-8">No study progress yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={studyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="subject" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="completed" radius={[8, 8, 0, 0]}>
                      {studyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}