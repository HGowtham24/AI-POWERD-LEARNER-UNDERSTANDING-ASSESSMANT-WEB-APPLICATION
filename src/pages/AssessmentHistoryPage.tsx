import React, { useEffect, useState } from 'react';
import { AssessmentResult } from '../types.js';
import { useAuth } from '../context/AuthContext.js';
import {
  Search,
  Filter,
  Calendar,
  Mic,
  Clock,
  ArrowRight,
  TrendingUp,
  Award,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';

interface AssessmentHistoryPageProps {
  onSelectAssessment: (assessment: AssessmentResult) => void;
  onNavigate: (page: string) => void;
}

export const AssessmentHistoryPage: React.FC<AssessmentHistoryPageProps> = ({
  onSelectAssessment,
  onNavigate,
}) => {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<AssessmentResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'score-desc' | 'score-asc'>('date-desc');

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const studentId = user?.id || 'user-student-demo';
        const res = await fetch(`/api/assessments/history?studentId=${studentId}`);
        const data = await res.json();
        setAssessments(data.assessments || []);
      } catch (err) {
        console.error('Error loading assessment history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  // Unique subjects for filter
  const subjects = ['All', ...Array.from(new Set(assessments.map((a) => a.subjectName)))];

  // Filter & sort
  const filtered = assessments
    .filter((a) => {
      const matchSearch =
        a.topicName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.questionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.subjectName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchSubject = subjectFilter === 'All' || a.subjectName === subjectFilter;
      const matchDiff = difficultyFilter === 'All' || a.difficulty === difficultyFilter;

      return matchSearch && matchSubject && matchDiff;
    })
    .sort((a, b) => {
      if (sortBy === 'date-desc') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'date-asc') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === 'score-desc') {
        return b.understandingScore - a.understandingScore;
      }
      if (sortBy === 'score-asc') {
        return a.understandingScore - b.understandingScore;
      }
      return 0;
    });

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Assessment History & Records
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Complete archive of your spoken conceptual assessments and AI evaluations
          </p>
        </div>

        <button
          onClick={() => onNavigate('assessment-setup')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
        >
          <Mic className="w-4 h-4" />
          <span>New Assessment</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by topic, question, or keyword..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
            />
          </div>

          {/* Subject Filter */}
          <div>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none dark:text-white"
            >
              {subjects.map((sub) => (
                <option key={sub} value={sub}>
                  Subject: {sub}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none dark:text-white"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="score-desc">Highest Score</option>
              <option value="score-asc">Lowest Score</option>
            </select>
          </div>
        </div>
      </div>

      {/* Assessment List Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-50/60 dark:bg-slate-950/60 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Topic / Prompt</th>
                  <th className="py-3.5 px-3">Subject</th>
                  <th className="py-3.5 px-3">Date</th>
                  <th className="py-3.5 px-3">Duration</th>
                  <th className="py-3.5 px-3">Score</th>
                  <th className="py-3.5 px-3">Speech Fluency</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-4 text-right">Report</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-4 px-4 max-w-xs">
                      <p className="font-bold text-slate-900 dark:text-slate-100 truncate">
                        {item.topicName}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        "{item.questionText}"
                      </p>
                    </td>

                    <td className="py-4 px-3 text-xs text-slate-600 dark:text-slate-300">
                      {item.subjectName}
                    </td>

                    <td className="py-4 px-3 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="py-4 px-3 text-xs font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {item.audioDuration}s
                    </td>

                    <td className="py-4 px-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          item.understandingScore >= 85
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : item.understandingScore >= 70
                            ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}
                      >
                        {item.understandingScore}%
                      </span>
                    </td>

                    <td className="py-4 px-3 text-xs text-slate-600 dark:text-slate-300">
                      {item.speechFluency}% ({item.speechAnalysis?.speechConsistency || 'Smooth'})
                    </td>

                    <td className="py-4 px-3">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Evaluated
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => {
                          onSelectAssessment(item);
                          onNavigate('assessment-results');
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors"
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
          <div className="py-12 text-center text-slate-400 text-sm">
            <Clock className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
            <p>No assessments match your active search filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};
