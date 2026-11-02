import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { AssessmentResult, StudentAnalytics, Subject } from '../types.js';
import {
  Mic,
  Award,
  TrendingUp,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  Clock,
  Sparkles,
  BarChart2,
  Calendar,
  AlertCircle,
  Play,
  FileText,
} from 'lucide-react';
import { ScoreGauge } from '../components/ScoreGauge.js';

interface StudentDashboardProps {
  onNavigate: (page: string, params?: any) => void;
  onSelectAssessment: (assessment: AssessmentResult) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onNavigate,
  onSelectAssessment,
}) => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<StudentAnalytics | null>(null);
  const [recentAssessments, setRecentAssessments] = useState<AssessmentResult[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const studentId = user?.id || 'user-student-demo';

        // 1. Fetch Student Analytics
        const analyticsRes = await fetch(`/api/students/${studentId}/analytics`);
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData.analytics);

        // 2. Fetch Recent Assessments
        const asmtRes = await fetch(`/api/assessments/history?studentId=${studentId}`);
        const asmtData = await asmtRes.json();
        setRecentAssessments(asmtData.assessments || []);

        // 3. Fetch Subjects
        const subRes = await fetch('/api/subjects');
        const subData = await subRes.json();
        setSubjects(subData.subjects || []);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const latestAssessment = recentAssessments[0] || null;

  return (
    <div className="space-y-8 pb-16">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white shadow-xl border border-indigo-900/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Voice Understanding Engine Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
              Welcome back, {user?.name || 'Scholar'}!
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              "When you explain a concept in your own voice, true understanding replaces rote memory."
              Ready to test your comprehension today?
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => onNavigate('assessment-setup')}
              className="inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base shadow-lg shadow-indigo-600/40 transition-all active:scale-95 group"
            >
              <Mic className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Start Assessment</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={() => onNavigate('assessment-setup')}
              className="inline-flex items-center justify-center gap-2 px-5 py-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-sm transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-indigo-300" />
              <span>+ Add Custom Question</span>
            </button>
          </div>
        </div>

        {/* Decorative backdrop shapes */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Summary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: 'Total Assessments',
            value: analytics?.totalAssessments ?? recentAssessments.length,
            subtitle: 'Voice tests completed',
            icon: Mic,
            color: 'text-indigo-600 dark:text-indigo-400',
            bg: 'bg-indigo-50 dark:bg-indigo-950/60',
          },
          {
            title: 'Avg Understanding',
            value: `${analytics?.averageScore ?? 88}%`,
            subtitle: 'Across all subjects',
            icon: TrendingUp,
            color: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-50 dark:bg-emerald-950/60',
          },
          {
            title: 'Highest Score',
            value: `${analytics?.highestScore ?? 94}%`,
            subtitle: 'Peak mastery achieved',
            icon: Award,
            color: 'text-amber-600 dark:text-amber-400',
            bg: 'bg-amber-50 dark:bg-amber-950/60',
          },
          {
            title: 'Completed Topics',
            value: analytics?.completedTopicsCount ?? 3,
            subtitle: 'Concepts validated',
            icon: BookOpen,
            color: 'text-purple-600 dark:text-purple-400',
            bg: 'bg-purple-50 dark:bg-purple-950/60',
          },
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  {card.title}
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1 block">
                  {card.value}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 block">
                  {card.subtitle}
                </span>
              </div>
              <div className={`w-12 h-12 rounded-2xl ${card.bg} ${card.color} flex items-center justify-center`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Latest Assessment Highlights & Subject Mastery */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latest Assessment Feature Card */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  <Sparkles className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="font-bold text-slate-900 dark:text-slate-100 text-lg">
                    Latest Spoken Assessment
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Detailed AI semantic & speech analysis
                  </p>
                </div>
              </div>
              {latestAssessment && (
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(latestAssessment.createdAt).toLocaleDateString()}
                </span>
              )}
            </div>

            {latestAssessment ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
                    <span>{latestAssessment.subjectName} • {latestAssessment.topicName}</span>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                      {latestAssessment.difficulty}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                    "{latestAssessment.questionText}"
                  </p>
                </div>

                {/* Score and Metric Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 text-center">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                      Overall Score
                    </span>
                    <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                      {latestAssessment.understandingScore}%
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-center">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                      Semantic Similarity
                    </span>
                    <span className="text-xl font-bold text-slate-800 dark:text-slate-200">
                      {latestAssessment.semanticSimilarity}%
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-center">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                      Concept Coverage
                    </span>
                    <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                      {latestAssessment.conceptCoverage}%
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-center">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                      Speech Fluency
                    </span>
                    <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                      {latestAssessment.speechFluency}%
                    </span>
                  </div>
                </div>

                {/* AI Encouraging Snippet */}
                <div className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-slate-950 border border-indigo-100 dark:border-indigo-950/60 text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-bold text-indigo-700 dark:text-indigo-300">AI Pedagogical Note: </span>
                  {latestAssessment.aiFeedback}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400">
                <Mic className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                <p>No assessment taken yet. Click Start New Assessment above to begin!</p>
              </div>
            )}
          </div>

          {latestAssessment && (
            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Acoustic speech duration: {latestAssessment.speechAnalysis?.durationSeconds}s
              </span>
              <button
                onClick={() => {
                  onSelectAssessment(latestAssessment);
                  onNavigate('assessment-results');
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
              >
                <span>View Full AI Report</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Subject Mastery Progress Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="font-bold text-slate-900 dark:text-slate-100 text-lg mb-1">
              Subject Mastery
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Cumulative score across learning domains
            </p>

            <div className="space-y-4">
              {subjects.map((sub, i) => {
                const masteryMatch = analytics?.subjectMastery?.find((sm) => sm.subject === sub.name);
                const score = masteryMatch ? masteryMatch.score : (82 + i * 4) % 100;
                return (
                  <div key={sub.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {sub.name}
                      </span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        {score}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        style={{ width: `${score}%` }}
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-700"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recommended Review Topics */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 block mb-2">
              Recommended Focus Areas
            </span>
            <div className="flex flex-wrap gap-1.5">
              {analytics?.weakestTopics && analytics.weakestTopics.length > 0 ? (
                analytics.weakestTopics.map((topic, i) => (
                  <span
                    key={i}
                    onClick={() => onNavigate('assessment-setup')}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900 cursor-pointer hover:bg-amber-100 transition-colors"
                  >
                    {topic}
                  </span>
                ))
              ) : (
                <>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                    Neural Network Activation
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                    DNA Ligase Proofreading
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Assessment Activity Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-slate-900 dark:text-slate-100 text-lg">
              Recent Spoken Assessments
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Audit log of completed oral tests and AI scores
            </p>
          </div>
          <button
            onClick={() => onNavigate('assessment-history')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
          >
            View All ({recentAssessments.length})
          </button>
        </div>

        {recentAssessments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-3">Topic / Subject</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Duration</th>
                  <th className="py-3 px-3">Understanding Score</th>
                  <th className="py-3 px-3">Speech Fluency</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {recentAssessments.slice(0, 5).map((asmt) => (
                  <tr key={asmt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-3">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{asmt.topicName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{asmt.subjectName}</p>
                    </td>
                    <td className="py-3.5 px-3 text-xs text-slate-500 dark:text-slate-400">
                      {new Date(asmt.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-3.5 px-3 text-xs font-mono text-slate-600 dark:text-slate-300">
                      {asmt.audioDuration}s
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          asmt.understandingScore >= 85
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : asmt.understandingScore >= 70
                            ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}
                      >
                        {asmt.understandingScore}%
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {asmt.speechFluency}% ({asmt.speechAnalysis?.speechConsistency})
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => {
                          onSelectAssessment(asmt);
                          onNavigate('assessment-results');
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors"
                      >
                        View Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-slate-400 text-sm">
            No assessments recorded yet.
          </div>
        )}
      </div>
    </div>
  );
};
