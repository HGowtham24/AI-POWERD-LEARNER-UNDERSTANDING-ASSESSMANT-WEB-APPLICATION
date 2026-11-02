import React from 'react';
import { useAuth } from '../context/AuthContext.js';
import {
  LayoutDashboard,
  Mic,
  History,
  BarChart3,
  BookOpen,
  Settings,
  Users,
  FileQuestion,
  LogOut,
  RotateCcw,
  Sparkles,
  Award,
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  const { user, role, logout, switchRole } = useAuth();

  const studentNavItems: NavItem[] = [
    { id: 'student-dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'assessment-setup', label: 'New Assessment', icon: Mic, badge: 'Voice AI' },
    { id: 'assessment-history', label: 'My Assessments', icon: History },
    { id: 'performance-analytics', label: 'Performance Analytics', icon: BarChart3 },
    { id: 'profile', label: 'Profile & Settings', icon: Settings },
  ];

  const teacherNavItems: NavItem[] = [
    { id: 'teacher-dashboard', label: 'Teacher Overview', icon: LayoutDashboard },
    { id: 'question-management', label: 'Question Management', icon: FileQuestion },
    { id: 'student-reports', label: 'Student Reports', icon: Users },
    { id: 'performance-analytics', label: 'Class Analytics', icon: BarChart3 },
    { id: 'profile', label: 'Settings & Rubric', icon: Settings },
  ];

  const items = role === 'teacher' ? teacherNavItems : studentNavItems;

  return (
    <aside className="w-64 shrink-0 hidden lg:flex flex-col border-r border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md min-h-[calc(100vh-4rem)] p-4 justify-between">
      <div className="space-y-6">
        {/* Role Indicator Banner */}
        <div className="p-3 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
              Workspace
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
              {role === 'teacher' ? 'Instructor' : 'Student'}
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 mt-1 truncate">
            {user?.name}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
            {user?.institution || 'LearnSense Academy'}
          </p>
        </div>

        {/* Navigation list */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500 mb-2">
            Menu
          </p>
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Pro Tip Card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-purple-50/40 to-slate-50/40 dark:from-indigo-950/30 dark:via-purple-950/20 dark:to-slate-900/30 border border-indigo-100/60 dark:border-indigo-900/40">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Voice Assessment Tip</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Explain concepts in your own natural phrasing. The AI evaluates semantic depth, not exact word-matching!
          </p>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800/80 space-y-2">
        <button
          onClick={() => switchRole(role === 'student' ? 'teacher' : 'student')}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Switch to {role === 'student' ? 'Teacher Portal' : 'Student View'}</span>
        </button>

        <button
          onClick={() => {
            logout();
            onNavigate('landing');
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
