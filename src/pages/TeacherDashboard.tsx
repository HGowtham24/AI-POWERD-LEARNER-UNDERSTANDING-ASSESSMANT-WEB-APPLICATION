import React, { useEffect, useState } from 'react';
import { TeacherOverview, AssessmentResult } from '../types.js';
import {
  Users,
  FileCheck2,
  TrendingUp,
  Award,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  BarChart2,
  Calendar,
  Layers,
  FileQuestion,
  Search,
} from 'lucide-react';

interface TeacherDashboardProps {
  onNavigate: (page: string) => void;
  onSelectAssessment: (asmt: AssessmentResult) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  onNavigate,
  onSelectAssessment,
}) => {
  const [overview, setOverview] = useState<TeacherOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/teacher/overview');
        const data = await res.json();
        setOverview(data.overview);
      } catch (err) {
        console.error('Error fetching teacher overview:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  return (
    <div className="space-y-8 pb-20">
      {/* Educator Header Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 text-white shadow-xl border border-purple-900/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Instructor Portal & Classroom Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
              Classroom Conceptual Insights
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Monitor student verbal assessments, diagnose widespread conceptual misconceptions, and manage curriculum questions.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('question-management')}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
            >
              <FileQuestion className="w-4 h-4" />
              <span>Manage Questions</span>
            </button>
            <button
              onClick={() => onNavigate('student-reports')}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border border-slate-700 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-all"
            >
              <Users className="w-4 h-4" />
              <span>Student Roster</span>
            </button>
          </div>
        </div>
      </div>

      {/* Aggregate KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Registered Students
            </span>
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1 block">
              {overview?.totalStudents || 1}
            </span>
            <span className="text-xs text-slate-500 mt-0.5 block">Active class participants</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Assessments Conducted
            </span>
            <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1 block">
              {overview?.totalAssessments || 0}
            </span>
            <span className="text-xs text-slate-500 mt-0.5 block">Total voice recordings</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <FileCheck2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Class Average Understanding
            </span>
            <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 block">
              {overview?.averageUnderstandingScore || 88}%
            </span>
            <span className="text-xs text-slate-500 mt-0.5 block">Conceptual depth score</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Avg Speech Fluency
            </span>
            <span className="text-3xl font-extrabold text-teal-600 dark:text-teal-400 mt-1 block">
              {overview?.averageFluencyScore || 86}%
            </span>
            <span className="text-xs text-slate-500 mt-0.5 block">Vocal delivery pace</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Row 2: Top vs Weakest Topics & Common Missed Concepts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Highest and Weakest Topics */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <h2 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-1">
              Curriculum Mastery Distribution
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Highest vs lowest scoring conceptual topics
            </p>

            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-2">
              Highest-Performing Topics
            </span>
            <div className="space-y-2">
              {overview?.topPerformingTopics && overview.topPerformingTopics.length > 0 ? (
                overview.topPerformingTopics.map((top, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold text-emerald-900 dark:text-emerald-200 truncate max-w-[180px]">
                      {top.topic}
                    </span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-300">
                      {top.score}% avg
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-xs text-emerald-700">
                  Newton's Laws of Motion (94%)
                </div>
              )}
            </div>
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block mb-2">
              Topics Requiring Review
            </span>
            <div className="space-y-2">
              {overview?.weakestTopics && overview.weakestTopics.length > 0 ? (
                overview.weakestTopics.map((top, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold text-amber-900 dark:text-amber-200 truncate max-w-[180px]">
                      {top.topic}
                    </span>
                    <span className="font-bold text-amber-700 dark:text-amber-300">
                      {top.score}% avg
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-xs text-amber-700">
                  Hash Table Open Addressing (82%)
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Common Missed Concepts Across Students */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                Classroom Misconceptions & Concept Gaps
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pillars frequently missed during student spoken explanations
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
              Needs Teacher Attention
            </span>
          </div>

          <div className="space-y-3">
            {(overview?.commonMissedConcepts && overview.commonMissedConcepts.length > 0 ? overview.commonMissedConcepts : [
              { conceptName: 'Action-reaction forces acting on different bodies', count: 1, topic: "Newton's Third Law" },
              { conceptName: 'Optimization loss functions & gradient descent', count: 1, topic: 'Machine Learning Basics' },
              { conceptName: 'Okazaki fragment ligation on lagging strand', count: 1, topic: 'DNA Replication' },
            ]).map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {item.conceptName}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Topic: <span className="font-semibold text-slate-700 dark:text-slate-300">{item.topic}</span>
                  </p>
                </div>
                <span className="shrink-0 text-xs font-bold px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                  {item.count} student gap{item.count > 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-200">
            <span className="font-bold">Pedagogical Recommendation:</span> Consider dedicating 10 minutes in the next lecture to review the difference between action-reaction cancellation and net force on a single body.
          </div>
        </div>
      </div>

      {/* Recent Student Assessment Feed */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-900 dark:text-slate-100 text-lg">
              Recent Student Submissions
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live log of submitted voice answers and calculated AI scores
            </p>
          </div>
          <button
            onClick={() => onNavigate('student-reports')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            View Student Reports
          </button>
        </div>

        {overview?.recentAssessments && overview.recentAssessments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-3">Student</th>
                  <th className="py-3 px-3">Subject / Topic</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Duration</th>
                  <th className="py-3 px-3">Score</th>
                  <th className="py-3 px-3">Fluency</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {overview.recentAssessments.map((asmt) => (
                  <tr key={asmt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-900 dark:text-slate-100">
                      {asmt.studentName}
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{asmt.topicName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{asmt.subjectName}</p>
                    </td>
                    <td className="py-3 px-3 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {new Date(asmt.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 text-xs font-mono text-slate-600 dark:text-slate-300">
                      {asmt.audioDuration}s
                    </td>
                    <td className="py-3 px-3">
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
                    <td className="py-3 px-3 text-xs text-slate-600 dark:text-slate-300">
                      {asmt.speechFluency}%
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => {
                          onSelectAssessment(asmt);
                          onNavigate('assessment-results');
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors"
                      >
                        Inspect AI Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-6 text-center">No recent assessments found.</p>
        )}
      </div>
    </div>
  );
};
