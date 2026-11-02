import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useTheme } from '../context/ThemeContext.js';
import {
  User,
  Settings,
  Mic,
  Volume2,
  Sliders,
  Moon,
  Sun,
  ShieldCheck,
  GraduationCap,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export const ProfileSettingsPage: React.FC = () => {
  const { user, role, switchRole } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Microphone hardware test state
  const [micTesting, setMicTesting] = useState(false);
  const [micVolume, setMicVolume] = useState(0);
  const [micPermissionState, setMicPermissionState] = useState<'idle' | 'granted' | 'denied'>('idle');
  const animFrameRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Scoring rubric preferences
  const [semanticWeight, setSemanticWeight] = useState(40);
  const [conceptWeight, setConceptWeight] = useState(40);
  const [relevanceWeight, setRelevanceWeight] = useState(20);
  const [rubricSaved, setRubricSaved] = useState(false);

  // Start Mic Diagnostic Test
  const toggleMicTest = async () => {
    if (micTesting) {
      stopMicTest();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      setMicPermissionState('granted');
      setMicTesting(true);

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      const updateVolume = () => {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = Math.min(100, Math.round((sum / dataArray.length) * 1.5));
        setMicVolume(avg);
        animFrameRef.current = requestAnimationFrame(updateVolume);
      };

      updateVolume();
    } catch (err) {
      console.error('Mic test error:', err);
      setMicPermissionState('denied');
      setMicTesting(false);
    }
  };

  const stopMicTest = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    setMicTesting(false);
    setMicVolume(0);
  };

  useEffect(() => {
    return () => {
      stopMicTest();
    };
  }, []);

  const handleSaveRubric = (e: React.FormEvent) => {
    e.preventDefault();
    setRubricSaved(true);
    setTimeout(() => setRubricSaved(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Account Profile & System Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage your credentials, verify audio microphone diagnostics, and customize assessment configurations
        </p>
      </div>

      {/* Profile Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt={user?.name}
            className="w-16 h-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-800 shadow-sm"
          />
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {user?.name || 'Alex Rivera'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {user?.email || 'student@learnsense.edu'}
            </p>
            <div className="flex items-center gap-2 pt-0.5">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800">
                {role === 'teacher' ? <ShieldCheck className="w-3 h-3" /> : <GraduationCap className="w-3 h-3" />}
                <span className="capitalize">{role} Account</span>
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500">{user?.institution || 'Horizon Academy'}</span>
            </div>
          </div>
        </div>

        {/* Switch Role Button */}
        <button
          onClick={() => switchRole(role === 'student' ? 'teacher' : 'student')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-indigo-300 dark:border-indigo-800 bg-indigo-50/60 dark:bg-indigo-950/40 text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Switch to {role === 'student' ? 'Teacher Portal' : 'Student View'}</span>
        </button>
      </div>

      {/* Hardware Diagnostics: Microphone & Audio Test */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Mic className="w-5 h-5" />
            </span>
            <div>
              <h2 className="font-bold text-base text-slate-900 dark:text-white">
                Microphone Hardware Diagnostic
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Test audio sensitivity before starting an oral examination
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleMicTest}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
              micTesting
                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {micTesting ? 'Stop Audio Test' : 'Test Microphone'}
          </button>
        </div>

        {/* Live Audio Level Meter */}
        <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-600 dark:text-slate-400">
              Input Sound Level: {micTesting ? `${micVolume}%` : 'Inactive'}
            </span>
            <span className="text-slate-400 font-mono text-[11px]">
              {micTesting ? (micVolume > 15 ? 'Signal Good' : 'Speaking Quietly') : 'Click Test'}
            </span>
          </div>

          <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              style={{ width: `${micVolume}%` }}
              className={`h-full rounded-full transition-all duration-75 ${
                micVolume > 75
                  ? 'bg-rose-500'
                  : micVolume > 20
                  ? 'bg-emerald-500'
                  : 'bg-indigo-500'
              }`}
            />
          </div>

          <p className="text-[11px] text-slate-400 pt-1">
            Speak into your microphone. A healthy reading sits comfortably between 25% and 70%.
          </p>
        </div>

        {micPermissionState === 'denied' && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Microphone permission denied. Please allow microphone access in your browser site settings.</span>
          </div>
        )}
      </div>

      {/* Assessment Scoring Rubric Configuration */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
            <Sliders className="w-5 h-5" />
          </span>
          <div>
            <h2 className="font-bold text-base text-slate-900 dark:text-white">
              Assessment Scoring Rubric Configuration
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configure baseline evaluation ratios for oral answers
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveRubric} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Semantic Similarity
              </label>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {semanticWeight}%
              </div>
              <p className="text-[11px] text-slate-400">
                Evaluates embedding vector distance against reference answers.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Concept Coverage
              </label>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {conceptWeight}%
              </div>
              <p className="text-[11px] text-slate-400">
                Checks presence and precision of mandatory subject pillars.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Answer Relevance
              </label>
              <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
                {relevanceWeight}%
              </div>
              <p className="text-[11px] text-slate-400">
                Ensures student answers address the prompt without tangential drift.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Speech Fluency is calculated as a supporting metric and does not penalize understanding scores.
            </span>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition-all"
            >
              {rubricSaved ? 'Rubric Saved!' : 'Save Rubric Weights'}
            </button>
          </div>
        </form>
      </div>

      {/* Appearance Theme Selector */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="font-bold text-base text-slate-900 dark:text-white">
            Interface Theme Preference
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Switch between Light mode and Dark mode
          </p>
        </div>

        <button
          onClick={toggleTheme}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Light Theme</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-indigo-600" />
              <span>Dark Theme</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
