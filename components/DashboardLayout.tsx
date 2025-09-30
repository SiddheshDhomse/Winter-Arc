'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Chrome as Home, Dumbbell, BookOpen, Brain, TrendingUp, History, LogOut } from 'lucide-react';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile, signOut } = useAuth();
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/workout', label: 'Workout', icon: Dumbbell },
    { href: '/dsa', label: 'DSA', icon: BookOpen },
    { href: '/study', label: 'Study', icon: Brain },
    { href: '/progress', label: 'Progress', icon: TrendingUp },
    { href: '/logs', label: 'Logs', icon: History },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-slate-900">Winter Arc Pulse</h1>
            </div>
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? 'default' : 'ghost'}
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Button>
                  </Link>
                );
              })}
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <p className="font-medium text-slate-900">{profile?.name}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="md:hidden bg-white border-b border-slate-200 sticky top-16 z-40">
        <div className="flex overflow-x-auto py-2 px-4 space-x-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  size="sm"
                  className="flex items-center space-x-2 whitespace-nowrap"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}