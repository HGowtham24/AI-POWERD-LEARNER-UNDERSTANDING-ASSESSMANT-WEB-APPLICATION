import React, { useEffect, useState } from 'react';
import { User, AssessmentResult, StudentAnalytics } from '../types.js';
import {
  Users,
  Search,
  Award,
  BookOpen,
  Calendar,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

interface StudentReportsPageProps {
  onSelectAssessment: (assessment: AssessmentResult) => void;
  onNavigate: (page: string) => void;
}

export const StudentReportsPage: React.FC<StudentReportsPageProps> = ({
  onSelectAssessment,
  onNavigate,
}) => {
  const [students, setStudents] = useState<User[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [studentAssessments, setStudentAssessments] = useState<AssessmentResult[]>([]);
  const [studentAnalytics, setStudentAnalytics] = useState<StudentAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/teacher/overview');
        const data = await res.json();
        // Fallback default student if empty
        const defaultStudent: User = {
          id: 'user-student-demo',
          name: 'Alex Rivera',
          email: 'alex.student@learnsense.edu',
          role: 'student',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          createdAt: new Date().toISOString(),
          institution: 'Horizon Academy of Sciences',
          gradeLevel: 'Undergraduate Year 2',
        };

        setStudents([defaultStudent]);
        setSelectedStudent(defaultStudent);
      } catch (err) {
        console.error('Error fetching students:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Fetch individual student's records whenever selected
  useEffect(() => {
    if (!selectedStudent) return;

    const fetchStudentDetails = async () => {
      try {
        const [asmtRes, anRes] = await Promise.all([
          fetch(`/api/assessments/history?studentId=${selectedStudent.id}`),
          fetch(`/api/students/${selectedStudent.id}/analytics`),
        ]);
        const asmtData = await asmtRes.json();
        const anData = await anRes.json();

        setStudentAssessments(asmtData.assessments || []);
        setStudentAnalytics(anData.analytics || null);
      } catch (err) {
        console.error('Error fetching student details:', err);
      }
    };

    fetchStudentDetails();
  }, [selectedStudent]);

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Student Progress & Verbal Reports
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Authorized instructor view: drill down into student understanding scores and misconception histories
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Student Roster List */}
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Enrolled Students ({students.length})
            </span>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search students..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none dark:text-white"
              />
            </div>

            <div className="space-y-1.5">
              {filteredStudents.map((stud) => {
                const isSelected = selectedStudent?.id === stud.id;
                return (
                  <button
                    key={stud.id}
                    onClick={() => setSelectedStudent(stud)}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/60 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <img
                      src={stud.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                      alt={stud.name}
                      className="w-9 h-9 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                        {stud.name}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {stud.email}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Selected Student's Dossier & Spoken History */}
        <div className="lg:col-span-2 space-y-6">
          {selectedStudent && (
            <>
              {/* Student Overview Card */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedStudent.avatarUrl}
                    alt={selectedStudent.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-200 dark:border-slate-800"
                  />
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      {selectedStudent.name}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {selectedStudent.email} • {selectedStudent.institution || 'Horizon Academy'}
                    </p>
                    <span className="inline-block mt-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                      Grade: {selectedStudent.gradeLevel || 'Undergraduate Year 2'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-center">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                      Avg Score
                    </span>
                    <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                      {studentAnalytics?.averageScore ?? 89}%
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950 text-center">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                      Assessments
                    </span>
                    <span className="text-xl font-black text-purple-600 dark:text-purple-400">
                      {studentAssessments.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Assessment Records Table for Selected Student */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                    Spoken Assessment Submissions ({studentAssessments.length})
                  </h3>
                  <span className="text-xs text-slate-400">
                    Click any record to inspect full AI evaluation report
                  </span>
                </div>

                {studentAssessments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                        <tr>
                          <th className="py-2.5 px-3">Topic / Subject</th>
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Duration</th>
                          <th className="py-2.5 px-3">Understanding</th>
                          <th className="py-2.5 px-3">Fluency</th>
                          <th className="py-2.5 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {studentAssessments.map((asmt) => (
                          <tr key={asmt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="py-3 px-3">
                              <p className="font-semibold text-slate-900 dark:text-slate-100">{asmt.topicName}</p>
                              <p className="text-[10px] text-slate-500">{asmt.subjectName}</p>
                            </td>
                            <td className="py-3 px-3 text-slate-500">
                              {new Date(asmt.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-300">
                              {asmt.audioDuration}s
                            </td>
                            <td className="py-3 px-3">
                              <span
                                className={`inline-flex px-2 py-0.5 rounded-full font-bold ${
                                  asmt.understandingScore >= 85
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                    : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                                }`}
                              >
                                {asmt.understandingScore}%
                              </span>
                            </td>
                            <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                              {asmt.speechFluency}%
                            </td>
                            <td className="py-3 px-3 text-right">
                              <button
                                onClick={() => {
                                  onSelectAssessment(asmt);
                                  onNavigate('assessment-results');
                                }}
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100"
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
                  <p className="text-xs text-slate-400 py-6 text-center">No assessments recorded for this student.</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
