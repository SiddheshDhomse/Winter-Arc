'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase, StudyTopic, StudyLog } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export default function StudyPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [topics, setTopics] = useState<StudyTopic[]>([]);
  const [userLogs, setUserLogs] = useState<StudyLog[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<'OS' | 'DBMS' | 'OOP' | 'CN'>('OS');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      loadData();
    }
  }, [user, loading, router]);

  const loadData = async () => {
    try {
      const [topicsResult, logsResult] = await Promise.all([
        supabase.from('study_topics').select('*').order('position'),
        supabase.from('study_logs').select('*').eq('user_id', user?.id),
      ]);

      if (topicsResult.error) throw topicsResult.error;
      if (logsResult.error) throw logsResult.error;

      setTopics(topicsResult.data || []);
      setUserLogs(logsResult.data || []);
    } catch (error) {
      console.error('Error loading study data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const toggleTopic = async (topic: StudyTopic, currentStatus: boolean) => {
    try {
      if (currentStatus) {
        const log = userLogs.find(l => l.topic_id === topic.id);
        if (log) {
          const { error } = await supabase.from('study_logs').delete().eq('id', log.id);
          if (error) throw error;
        }
      } else {
        const { error } = await supabase.from('study_logs').insert({
          user_id: user?.id,
          topic_id: topic.id,
          subject: topic.subject,
          topic: topic.topic,
          status: true,
          date: new Date().toISOString().split('T')[0],
        });
        if (error) throw error;
      }

      toast({
        title: currentStatus ? 'Unmarked as completed' : 'Marked as completed!',
        description: topic.topic,
      });

      await loadData();
    } catch (error) {
      console.error('Error toggling topic:', error);
      toast({
        title: 'Error',
        description: 'Failed to update topic status',
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

  const subjects: Array<'OS' | 'DBMS' | 'OOP' | 'CN'> = ['OS', 'DBMS', 'OOP', 'CN'];
  const subjectNames = {
    OS: 'Operating Systems',
    DBMS: 'Database Management Systems',
    OOP: 'Object Oriented Programming',
    CN: 'Computer Networks',
  };

  const getSubjectProgress = (subject: string) => {
    const subjectTopics = topics.filter(t => t.subject === subject);
    const completedTopics = userLogs.filter(l => l.subject === subject && l.status);
    return {
      completed: completedTopics.length,
      total: subjectTopics.length,
      percentage: subjectTopics.length > 0 ? Math.round((completedTopics.length / subjectTopics.length) * 100) : 0,
    };
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Study Tracker</h1>
          <p className="text-slate-600 mt-2">Master core CS subjects for placements</p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {subjects.map(subject => {
            const progress = getSubjectProgress(subject);
            return (
              <Card key={subject}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{subject}</CardTitle>
                  <CardDescription className="text-xs">
                    {progress.completed}/{progress.total} topics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-600 transition-all duration-300"
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>
                  <p className="text-sm text-slate-600 mt-2">{progress.percentage}% complete</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Tabs value={selectedSubject} onValueChange={(v) => setSelectedSubject(v as any)}>
          <TabsList className="grid w-full grid-cols-4">
            {subjects.map(subject => (
              <TabsTrigger key={subject} value={subject}>
                {subject}
              </TabsTrigger>
            ))}
          </TabsList>

          {subjects.map(subject => {
            const subjectTopics = topics.filter(t => t.subject === subject);

            return (
              <TabsContent key={subject} value={subject} className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{subjectNames[subject]}</CardTitle>
                    <CardDescription>
                      Complete all topics to master {subjectNames[subject]}
                    </CardDescription>
                  </CardHeader>
                </Card>

                {subjectTopics.length === 0 ? (
                  <Card>
                    <CardContent className="py-8">
                      <p className="text-center text-slate-500">
                        No topics found. Please set up your study syllabus.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-2">
                    {subjectTopics.map(topic => {
                      const log = userLogs.find(l => l.topic_id === topic.id);
                      const isCompleted = log?.status || false;

                      return (
                        <Card
                          key={topic.id}
                          className={isCompleted ? 'border-green-500 bg-green-50' : ''}
                        >
                          <CardContent className="py-3">
                            <div className="flex items-center space-x-3">
                              <Checkbox
                                checked={isCompleted}
                                onCheckedChange={() => toggleTopic(topic, isCompleted)}
                              />
                              <label
                                className={`flex-1 cursor-pointer ${
                                  isCompleted ? 'line-through text-slate-600' : 'text-slate-900'
                                }`}
                              >
                                {topic.topic}
                              </label>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </DashboardLayout>
  );
}