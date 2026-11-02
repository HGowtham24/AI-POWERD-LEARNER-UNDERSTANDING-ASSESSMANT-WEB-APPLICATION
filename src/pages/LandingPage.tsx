import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import {
  Mic,
  Brain,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Activity,
  Layers,
  BarChart,
  ShieldCheck,
  Volume2,
  FileText,
  Play,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { ScoreGauge } from '../components/ScoreGauge.js';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { isLoggedIn, loginAsDemo } = useAuth();
  const [demoPlaying, setDemoPlaying] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-32">
        {/* Subtle background ambient gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-indigo-500/10 via-purple-500/10 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Next-Generation Voice-Based Assessment Engine</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 dark:text-white leading-[1.15]">
              Go Beyond Written Exams.{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
                Discover What Students Truly Understand.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
              An intelligent voice-based assessment platform that evaluates conceptual understanding
              through spoken answers, semantic analysis, and speech fluency.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => {
                  if (!isLoggedIn) loginAsDemo('student');
                  onNavigate('assessment-setup');
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 transition-all active:scale-95"
              >
                <Mic className="w-5 h-5" />
                <span>Start Learning & Assessment</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  if (!isLoggedIn) loginAsDemo('teacher');
                  onNavigate('teacher-dashboard');
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200 transition-all"
              >
                <ShieldCheck className="w-5 h-5 text-indigo-500" />
                <span>Explore Teacher Dashboard</span>
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              No software installation required • Instant AI feedback • Works in any modern browser
            </p>
          </div>

          {/* Interactive Mockup / Hero Showcase */}
          <div className="mt-14 max-w-4xl mx-auto rounded-3xl p-4 sm:p-6 bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="ml-2 font-mono text-slate-400">learnsense://assessment/voice-analysis</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold">
                Live Speech Pipeline
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 items-center">
              {/* Question & Audio Wave */}
              <div className="md:col-span-2 space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-1">
                    <span>Prompt #1: Machine Learning Basics</span>
                    <span className="bg-indigo-50 dark:bg-indigo-950/80 px-2 py-0.5 rounded">Duration: 42s</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    "What is Machine Learning? Explain how it works and how it differs from traditional rule-based programming in your own words."
                  </p>
                </div>

                {/* Simulated Audio Waveform Bar */}
                <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between gap-4">
                  <button
                    onClick={() => setDemoPlaying(!demoPlaying)}
                    className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0 hover:bg-indigo-500 transition-colors"
                  >
                    {demoPlaying ? <Activity className="w-5 h-5 animate-pulse" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
                  </button>
                  <div className="flex-1 flex items-center gap-1.5 h-10">
                    {[40, 65, 30, 85, 95, 60, 45, 75, 90, 80, 50, 70, 95, 85, 40, 60, 80, 50, 90, 70, 40, 60, 30].map(
                      (h, i) => (
                        <div
                          key={i}
                          style={{ height: `${demoPlaying ? (h * 0.9) : (h * 0.45)}%` }}
                          className={`flex-1 rounded-full transition-all duration-300 ${
                            demoPlaying ? 'bg-indigo-400' : 'bg-slate-600'
                          }`}
                        />
                      )
                    )}
                  </div>
                  <span className="font-mono text-xs text-slate-400 shrink-0">00:42 / 01:00</span>
                </div>

                {/* Transcribed excerpt */}
                <div className="p-3.5 rounded-xl bg-slate-100/80 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-bold text-slate-800 dark:text-slate-100">Transcribed Answer: </span>
                  "...computers learn directly from data instead of a programmer coding every rule. We feed example inputs and known answers to learn mathematical representations..."
                </div>
              </div>

              {/* Score Gauge Preview */}
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
                <ScoreGauge score={90} size="md" label="Overall Understanding" />
                <div className="grid grid-cols-2 gap-2 w-full mt-4 text-[11px] font-semibold text-center">
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Semantic Similarity</span>
                    <span className="text-indigo-600 dark:text-indigo-400 text-sm font-bold">88%</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Concept Coverage</span>
                    <span className="text-emerald-600 dark:text-emerald-400 text-sm font-bold">90%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white dark:bg-slate-900/50 border-y border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-wider font-bold text-indigo-600 dark:text-indigo-400">
              The Assessment Workflow
            </span>
            <h2 className="text-3xl font-bold text-slate-950 dark:text-white mt-2">
              How LearnSense Evaluates Your Understanding
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-3 text-sm">
              Six intelligent phases transform raw vocal explanations into transparent pedagogical insights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Get a Question',
                desc: 'Select a subject, topic, and difficulty. Listen to the question via text-to-speech or read the prompt at your own pace.',
                icon: FileText,
              },
              {
                step: '02',
                title: 'Speak Your Answer',
                desc: 'Hit record and explain the concept in your own natural phrasing. Live audio waveforms reflect your vocal input.',
                icon: Mic,
              },
              {
                step: '03',
                title: 'Speech-to-Text Transcription',
                desc: 'The backend transcribes your voice verbatim, preserving scientific terminology, phrasing, and speaking pauses.',
                icon: Volume2,
              },
              {
                step: '04',
                title: 'Semantic Vector Understanding',
                desc: 'Computes deep semantic embeddings using Sentence-BERT & Gemini to evaluate meaning beyond superficial keyword matching.',
                icon: Brain,
              },
              {
                step: '05',
                title: 'Acoustic Fluency Analysis',
                desc: 'Measures speaking pace (WPM), pause durations, and speech consistency separately from knowledge.',
                icon: Activity,
              },
              {
                step: '06',
                title: 'Pedagogical Report & Growth',
                desc: 'Receive transparent breakdowns of understood concepts, missed topics, strengths, and targeted study recommendations.',
                icon: Sparkles,
              },
            ].map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  className="relative p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400/80 transition-all hover:-translate-y-1 group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="font-mono text-xl font-extrabold text-slate-300 dark:text-slate-700">
                      {card.step}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{card.title}</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{card.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-wider font-bold text-indigo-600 dark:text-indigo-400">
              Core Capabilities
            </span>
            <h2 className="text-3xl font-bold text-slate-950 dark:text-white mt-2">
              Engineered for Genuine Academic Comprehension
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Semantic Answer Evaluation',
                description:
                  'Students explain ideas differently. Cosine vector similarity recognizes synonymous explanations without requiring rote repetition.',
                icon: Layers,
              },
              {
                title: 'Intelligent Concept Extraction',
                description:
                  'Breaks questions down into mandatory and optional concepts, flagging accurately explained ideas versus crucial gaps.',
                icon: CheckCircle2,
              },
              {
                title: 'Speech Fluency Independence',
                description:
                  'Speech rate and pause metrics are treated as supporting communication indicators, never unfairly lowering the student’s knowledge score.',
                icon: Activity,
              },
              {
                title: 'Configurable Scoring Rubrics',
                description:
                  'Educators can fine-tune semantic weights, concept weights, and relevance ratios according to assessment objectives.',
                icon: BarChart,
              },
              {
                title: 'Classroom & Student Analytics',
                description:
                  'Track understanding progress over time, uncover widespread classroom misconceptions, and isolate topics needing review.',
                icon: ShieldCheck,
              },
              {
                title: 'Actionable Pedagogical Feedback',
                description:
                  'Constructive feedback highlights what the learner did well, explains missing nuances, and suggests immediate next readings.',
                icon: Zap,
              },
            ].map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">{feat.title}</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{feat.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why LearnSense Comparison Section */}
      <section className="py-20 bg-slate-100/80 dark:bg-slate-900/30 border-y border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs uppercase tracking-wider font-bold text-indigo-600 dark:text-indigo-400">
              Why LearnSense?
            </span>
            <h2 className="text-3xl font-bold text-slate-950 dark:text-white mt-2">
              Voice Explanation vs Traditional Testing
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Traditional */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Traditional Multiple Choice & Memorization
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span> Encourages guessing and shallow elimination tactics.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span> Rewards verbatim memorization of keywords without comprehension.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span> Conceals underlying misconceptions behind binary right/wrong answers.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span> Cannot capture how students articulate relational concepts.
                </li>
              </ul>
            </div>

            {/* LearnSense */}
            <div className="p-6 rounded-3xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/60">
              <h3 className="font-bold text-lg text-indigo-950 dark:text-indigo-100 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> LearnSense Voice Comprehension
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-700 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">✓</span> Evaluates the Feynman technique: if you can explain it verbally, you understand it.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">✓</span> Understands synonyms and idiosyncratic student examples via deep embeddings.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">✓</span> Pinpoints exact missed conceptual pillars for targeted review.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">✓</span> Fosters verbal articulation skills crucial for professional mastery.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-sm text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Mic className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white">LearnSense</span>
            <span className="text-xs text-slate-400">© 2026 LearnSense Platform. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6 text-xs font-semibold">
            <button onClick={() => onNavigate('landing')} className="hover:text-indigo-600">About</button>
            <button onClick={() => onNavigate('assessment-setup')} className="hover:text-indigo-600">Assessment</button>
            <button onClick={() => onNavigate('teacher-dashboard')} className="hover:text-indigo-600">Educators</button>
            <button onClick={() => onNavigate('profile')} className="hover:text-indigo-600">Privacy & Terms</button>
          </div>
        </div>
      </footer>
    </div>
  );
};
