'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase, DSAProblem, DSALog } from '@/lib/supabase';
import { ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function DSAPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [problems, setProblems] = useState<DSAProblem[]>([]);
  const [userLogs, setUserLogs] = useState<DSALog[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [topicFilter, setTopicFilter] = useState<string>('all');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      loadData();
    }
  }, [user, loading, router]);

  const loadData = async () => {
    try {
      const [problemsResult, logsResult] = await Promise.all([
        supabase.from('dsa_problems').select('*').order('position'),
        supabase.from('dsa_logs').select('*').eq('user_id', user?.id),
      ]);

      if (problemsResult.error) throw problemsResult.error;
      if (logsResult.error) throw logsResult.error;

      setProblems(problemsResult.data || []);
      setUserLogs(logsResult.data || []);
    } catch (error) {
      console.error('Error loading DSA data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const toggleProblem = async (problem: DSAProblem, currentStatus: boolean) => {
    try {
      if (currentStatus) {
        const log = userLogs.find(l => l.problem_id === problem.id);
        if (log) {
          const { error } = await supabase.from('dsa_logs').delete().eq('id', log.id);
          if (error) throw error;
        }
      } else {
        const { error } = await supabase.from('dsa_logs').insert({
          user_id: user?.id,
          problem_id: problem.id,
          status: true,
          date: new Date().toISOString().split('T')[0],
        });
        if (error) throw error;
      }

      toast({
        title: currentStatus ? 'Unmarked as solved' : 'Marked as solved!',
        description: problem.title,
      });

      await loadData();
    } catch (error) {
      console.error('Error toggling problem:', error);
      toast({
        title: 'Error',
        description: 'Failed to update problem status',
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

  const topics = Array.from(new Set(problems.map(p => p.topic)));
  const filteredProblems = problems.filter(problem => {
    const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         problem.topic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'all' || problem.difficulty === difficultyFilter;
    const matchesTopic = topicFilter === 'all' || problem.topic === topicFilter;
    return matchesSearch && matchesDifficulty && matchesTopic;
  });

  const solvedCount = userLogs.filter(l => l.status).length;
  const totalCount = problems.length;
  const progressPercentage = totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">DSA Tracker</h1>
          <p className="text-slate-600 mt-2">Track your progress through coding problems</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Progress Overview</CardTitle>
            <CardDescription>
              {solvedCount} of {totalCount} problems solved ({progressPercentage}%)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-4 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Input
                  placeholder="Search problems..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Difficulties</SelectItem>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={topicFilter} onValueChange={setTopicFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Topic" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Topics</SelectItem>
                    {topics.map(topic => (
                      <SelectItem key={topic} value={topic}>
                        {topic}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {filteredProblems.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <p className="text-center text-slate-500">
                  No problems found. Try adjusting your filters.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredProblems.map(problem => {
              const log = userLogs.find(l => l.problem_id === problem.id);
              const isSolved = log?.status || false;

              return (
                <Card key={problem.id} className={isSolved ? 'border-green-500 bg-green-50' : ''}>
                  <CardContent className="py-4">
                    <div className="flex items-start space-x-4">
                      <Checkbox
                        checked={isSolved}
                        onCheckedChange={() => toggleProblem(problem, isSolved)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className={`font-medium ${isSolved ? 'line-through text-slate-600' : 'text-slate-900'}`}>
                              {problem.title}
                            </h3>
                            <p className="text-sm text-slate-600 mt-1">{problem.topic}</p>
                          </div>
                          <div className="flex items-center space-x-2 shrink-0">
                            <Badge
                              variant={
                                problem.difficulty === 'Easy'
                                  ? 'default'
                                  : problem.difficulty === 'Medium'
                                  ? 'secondary'
                                  : 'destructive'
                              }
                            >
                              {problem.difficulty}
                            </Badge>
                            <a
                              href={problem.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}