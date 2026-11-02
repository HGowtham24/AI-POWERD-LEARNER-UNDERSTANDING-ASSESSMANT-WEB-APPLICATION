import React, { useEffect, useState } from 'react';
import {
  Mic,
  Brain,
  Layers,
  Activity,
  CheckCircle2,
  Sparkles,
  Loader2,
} from 'lucide-react';

interface AiAnalysisPageProps {
  onCompleted?: () => void;
}

export const AiAnalysisPage: React.FC<AiAnalysisPageProps> = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const steps = [
    {
      id: 'stt',
      title: 'Speech-to-Text Transcription',
      engine: 'Gemini 3.5 Transcribe / Whisper Engine',
      description: 'Converting raw audio recording into verbatim phoneme and word sequences...',
      icon: Mic,
    },
    {
      id: 'embeddings',
      title: 'Semantic Vector Embeddings',
      engine: 'Gemini Embedding 2 Preview / SBERT',
      description: 'Projecting student explanation into multi-dimensional conceptual vector space...',
      icon: Brain,
    },
    {
      id: 'cosine',
      title: 'Cosine Similarity Computation',
      engine: 'Mathematical Vector Dot Product',
      description: 'Comparing semantic distance between student phrasing and reference answer...',
      icon: Layers,
    },
    {
      id: 'concepts',
      title: 'Concept & Misconception Analysis',
      engine: 'Structured Pedagogical Reasoner',
      description: 'Evaluating mandatory pillars, partial explanations, and omitted concepts...',
      icon: CheckCircle2,
    },
    {
      id: 'acoustics',
      title: 'Acoustic Speech & Fluency Profiling',
      engine: 'Librosa-Style Audio Energy Analyzer',
      description: 'Measuring speaking rate (WPM), pause frequencies, and vocal consistency...',
      icon: Activity,
    },
    {
      id: 'feedback',
      title: 'Pedagogical Synthesis & Report Generation',
      engine: 'Gemini 3.8 Flash Educational Coach',
      description: 'Synthesizing strengths, growth areas, and personalized study recommendations...',
      icon: Sparkles,
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1100);

    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-8">
      {/* Animated Glowing AI Orb */}
      <div className="relative flex items-center justify-center w-28 h-28 mx-auto">
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 animate-spin opacity-40 blur-xl" />
        <div className="relative w-24 h-24 rounded-full bg-slate-900 border border-indigo-500/40 flex items-center justify-center text-white shadow-2xl">
          <Brain className="w-10 h-10 text-indigo-400 animate-pulse" />
        </div>
      </div>

      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          LearnSense AI Assessment Engine
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
          Evaluating conceptual understanding, semantic depth, and acoustic speech characteristics...
        </p>
      </div>

      {/* Stepped Pipeline Cards */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-3 text-left">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;

          return (
            <div
              key={step.id}
              className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3.5 ${
                isCurrent
                  ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 shadow-sm'
                  : isDone
                  ? 'border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/30'
                  : 'border-transparent opacity-40'
              }`}
            >
              <div
                className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                  isDone
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                    : isCurrent
                    ? 'bg-indigo-600 text-white animate-bounce'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {step.title}
                  </h3>
                  <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                    {step.engine}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-mono">
        <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
        <span>Synthesizing multi-modal assessment results...</span>
      </div>
    </div>
  );
};
