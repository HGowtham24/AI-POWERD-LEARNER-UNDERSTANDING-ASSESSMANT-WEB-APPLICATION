import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useTheme } from '../context/ThemeContext.js';
import {
  Mic,
  Moon,
  Sun,
  Sparkles,
  LogOut,
  User as UserIcon,
  ShieldCheck,
  GraduationCap,
  Menu,
  X,
  Play,
  RotateCcw,
} from 'lucide-react';

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentPage }) => {
  const { user, role, logout, switchRole, isLoggedIn } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div
          onClick={() => onNavigate(isLoggedIn ? (role === 'teacher' ? 'teacher-dashboard' : 'student-dashboard') : 'landing')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl tracking-tight text-slate-950 dark:text-white">
                Learn<span className="text-indigo-600 dark:text-indigo-400">Sense</span>
              </span>
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                AI Voice Assessment
              </span>
            </div>
            <p className="hidden md:block text-[11px] text-slate-500 dark:text-slate-400 -mt-0.5">
              Speak Your Knowledge. Understand Your Progress.
            </p>
          </div>
        </div>

        {/* Desktop Controls */}
        <div className="hidden md:flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
          </button>

          {isLoggedIn ? (
            <>
              {/* Quick Start Assessment CTA for student */}
              {role === 'student' && (
                <button
                  onClick={() => onNavigate('assessment-setup')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/30 transition-all hover:shadow-indigo-600/40 active:scale-95"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Start Assessment</span>
                </button>
              )}

              {/* Role Switcher Pill */}
              <button
                onClick={() => switchRole(role === 'student' ? 'teacher' : 'student')}
                title={`Currently in ${role} view. Click to switch to ${role === 'student' ? 'teacher' : 'student'} view`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-indigo-500 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-indigo-500" />
                <span>Switch to {role === 'student' ? 'Teacher' : 'Student'}</span>
              </button>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                >
                  <img
                    src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                    alt={user?.name}
                    className="w-8 h-8 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                  />
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[120px]">
                      {user?.name}
                    </p>
                    <div className="flex items-center gap-1">
                      {role === 'teacher' ? (
                        <span className="text-[10px] font-medium text-purple-600 dark:text-purple-400 flex items-center gap-0.5">
                          <ShieldCheck className="w-3 h-3" /> Teacher
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5">
                          <GraduationCap className="w-3 h-3" /> Student
                        </span>
                      )}
                    </div>
                  </div>
                </button>

                {userMenuOpen && (
                  <div
                    onMouseLeave={() => setUserMenuOpen(false)}
                    className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 text-sm"
                  >
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{user?.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        onNavigate('profile');
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center gap-2 text-slate-700 dark:text-slate-300"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" /> Profile & Settings
                    </button>

                    <button
                      onClick={() => {
                        switchRole(role === 'student' ? 'teacher' : 'student');
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center gap-2 text-slate-700 dark:text-slate-300"
                    >
                      <RotateCcw className="w-4 h-4 text-indigo-500" /> Switch Role ({role === 'student' ? 'Teacher' : 'Student'})
                    </button>

                    <div className="border-t border-slate-100 dark:border-slate-800 mt-1">
                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                          onNavigate('landing');
                        }}
                        className="w-full text-left px-4 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 font-medium"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('login')}
                className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 transition-colors"
              >
                Log In
              </button>
              <button
                onClick={() => onNavigate('register')}
                className="px-4 py-2 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/30 transition-all"
              >
                Get Started Free
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-4 space-y-3">
          {isLoggedIn ? (
            <>
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <img
                  src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                  alt={user?.name}
                  className="w-10 h-10 rounded-xl object-cover"
                />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{user?.name}</p>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 capitalize">{role} Account</p>
                </div>
              </div>

              <button
                onClick={() => {
                  onNavigate(role === 'teacher' ? 'teacher-dashboard' : 'student-dashboard');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 font-medium text-slate-700 dark:text-slate-300"
              >
                Dashboard Overview
              </button>

              {role === 'student' && (
                <>
                  <button
                    onClick={() => {
                      onNavigate('assessment-setup');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-2 font-medium text-indigo-600 dark:text-indigo-400"
                  >
                    Start New Assessment
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('assessment-history');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-2 font-medium text-slate-700 dark:text-slate-300"
                  >
                    My Assessments
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('performance-analytics');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-2 font-medium text-slate-700 dark:text-slate-300"
                  >
                    Performance Analytics
                  </button>
                </>
              )}

              {role === 'teacher' && (
                <>
                  <button
                    onClick={() => {
                      onNavigate('question-management');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-2 font-medium text-slate-700 dark:text-slate-300"
                  >
                    Question Management
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('student-reports');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-2 font-medium text-slate-700 dark:text-slate-300"
                  >
                    Student Reports
                  </button>
                </>
              )}

              <button
                onClick={() => {
                  switchRole(role === 'student' ? 'teacher' : 'student');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 font-medium text-indigo-600 dark:text-indigo-400"
              >
                Switch Role to {role === 'student' ? 'Teacher' : 'Student'}
              </button>

              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                  onNavigate('landing');
                }}
                className="w-full text-left py-2 font-medium text-rose-600 dark:text-rose-400"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  onNavigate('login');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-center font-semibold text-slate-700 dark:text-slate-300"
              >
                Log In
              </button>
              <button
                onClick={() => {
                  onNavigate('register');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 rounded-xl bg-indigo-600 text-center font-semibold text-white"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
