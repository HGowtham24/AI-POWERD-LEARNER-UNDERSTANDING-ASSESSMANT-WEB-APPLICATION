import React, { useRef } from 'react';
import { AssessmentResult } from '../types.js';
import { ScoreGauge } from '../components/ScoreGauge.js';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  Award,
  ArrowRight,
  RotateCcw,
  Download,
  BookOpen,
  Volume2,
  Clock,
  Activity,
  Layers,
  FileText,
  Printer,
  ChevronRight,
  Headphones,
} from 'lucide-react';

interface AssessmentResultsPageProps {
  assessment: AssessmentResult;
  onRetake: () => void;
  onContinue: () => void;
  onBackToDashboard: () => void;
}

export const AssessmentResultsPage: React.FC<AssessmentResultsPageProps> = ({
  assessment,
  onRetake,
  onContinue,
  onBackToDashboard,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrintPdf = () => {
    window.print();
  };

  const understoodConcepts = assessment.conceptsEvaluated.filter(
    (c) => c.status === 'understood'
  );
  const partialConcepts = assessment.conceptsEvaluated.filter(
    (c) => c.status === 'partially_understood'
  );
  const missedConcepts = assessment.conceptsEvaluated.filter(
    (c) => c.status === 'missed'
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 print:p-0 print:space-y-4">
      {/* Top Header / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <button
            onClick={onBackToDashboard}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-1 inline-flex items-center gap-1"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Assessment Evaluation Report
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Session ID: {assessment.id} • Completed {new Date(assessment.createdAt).toLocaleString()}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrintPdf}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Download / Print PDF</span>
          </button>

          <button
            onClick={onRetake}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors shadow-sm"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" />
            <span>Retake Question</span>
          </button>

          <button
            onClick={onContinue}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm shadow-indigo-600/30 transition-all"
          >
            <span>Continue Learning</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Print Container */}
      <div ref={printRef} className="space-y-8 print:space-y-6">
        {/* Question Banner */}
        <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl space-y-2 border border-slate-800">
          <div className="flex items-center justify-between text-xs font-bold text-indigo-400">
            <span>{assessment.subjectName} • {assessment.topicName}</span>
            <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-2 py-0.5 rounded-full">
              {assessment.difficulty} Difficulty
            </span>
          </div>
          <p className="text-base sm:text-lg font-bold text-slate-100">
            "{assessment.questionText}"
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-400 font-mono pt-1">
            <span>Student: {assessment.studentName}</span>
            <span>Duration: {assessment.audioDuration}s</span>
          </div>
        </div>

        {/* Hero Score Showcase & Dimensional Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Circular Score Gauge */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center">
            <ScoreGauge score={assessment.understandingScore} size="lg" />
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-3 max-w-xs">
              Synthesized from semantic similarity (40%), concept coverage (40%), and relevance (20%).
            </p>
          </div>

          {/* 4 Dimensional Metric Cards */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            {/* Dimension 1: Semantic Similarity */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-indigo-600 dark:text-indigo-400 font-bold mb-1">
                  <span>Semantic Similarity</span>
                  <Layers className="w-4 h-4" />
                </div>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {assessment.semanticSimilarity}%
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Sentence embedding cosine similarity against reference models.
                </p>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mt-3">
                <div style={{ width: `${assessment.semanticSimilarity}%` }} className="h-full bg-indigo-500 rounded-full" />
              </div>
            </div>

            {/* Dimension 2: Concept Coverage */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-bold mb-1">
                  <span>Concept Coverage</span>
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {assessment.conceptCoverage}%
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Coverage of mandatory & supporting conceptual pillars.
                </p>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mt-3">
                <div style={{ width: `${assessment.conceptCoverage}%` }} className="h-full bg-emerald-500 rounded-full" />
              </div>
            </div>

            {/* Dimension 3: Answer Relevance */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-purple-600 dark:text-purple-400 font-bold mb-1">
                  <span>Answer Relevance</span>
                  <Award className="w-4 h-4" />
                </div>
                <div className="text-3xl font-extrabold text-purple-600 dark:text-purple-400">
                  {assessment.answerRelevance}%
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Evaluation of topical precision without tangential filler.
                </p>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mt-3">
                <div style={{ width: `${assessment.answerRelevance}%` }} className="h-full bg-purple-500 rounded-full" />
              </div>
            </div>

            {/* Dimension 4: Speech Fluency (Independent Supporting Metric) */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-teal-600 dark:text-teal-400 font-bold mb-1">
                  <span>Speech Fluency</span>
                  <Activity className="w-4 h-4" />
                </div>
                <div className="text-3xl font-extrabold text-teal-600 dark:text-teal-400">
                  {assessment.speechFluency}%
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Pacing ({assessment.speechAnalysis?.speakingRateWpm} WPM, {assessment.speechAnalysis?.speechConsistency} consistency).
                </p>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mt-3">
                <div style={{ width: `${assessment.speechFluency}%` }} className="h-full bg-teal-500 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Acoustic Speech Characteristics Box */}
        {assessment.speechAnalysis && (
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              <Activity className="w-4 h-4 text-teal-500" />
              <span>Acoustic Speech Characteristics (Librosa Metrics)</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs">
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px]">Total Duration</span>
                <span className="text-base font-bold text-slate-900 dark:text-white font-mono">
                  {assessment.speechAnalysis.durationSeconds}s
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px]">Speaking Pace</span>
                <span className="text-base font-bold text-slate-900 dark:text-white font-mono">
                  {assessment.speechAnalysis.speakingRateWpm} WPM
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px]">Pause Frequency</span>
                <span className="text-base font-bold text-slate-900 dark:text-white font-mono">
                  {assessment.speechAnalysis.pauseCount} pauses
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px]">Pause Ratio</span>
                <span className="text-base font-bold text-slate-900 dark:text-white font-mono">
                  {Math.round(assessment.speechAnalysis.pauseRatio * 100)}%
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 col-span-2 sm:col-span-1">
                <span className="text-slate-400 block text-[10px]">Flow Consistency</span>
                <span className="text-base font-bold text-teal-600 dark:text-teal-400">
                  {assessment.speechAnalysis.speechConsistency}
                </span>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-600 dark:text-slate-400 italic">
              Vocal feedback: {assessment.speechAnalysis.acousticFeedback}
            </p>
          </div>
        )}

        {/* Section: AI Analysis of Your Answer */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h2 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                AI Analysis of Your Spoken Answer
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Verbatim speech transcription & semantic concept evaluation
              </p>
            </div>
          </div>

          {/* Transcribed Answer Box */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-500" />
                <span>Your Transcribed Answer</span>
              </span>
              <span className="font-mono text-[11px] text-slate-400">
                {assessment.transcription.split(/\s+/).filter(Boolean).length} words
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed italic bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
              "{assessment.transcription}"
            </p>
          </div>

          {/* Concepts You Understood */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Concepts You Understood ({understoodConcepts.length})</span>
            </h3>

            {understoodConcepts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {understoodConcepts.map((concept, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/40 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-emerald-900 dark:text-emerald-200">
                        {concept.conceptName}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full">
                        Mastered
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {concept.explanation}
                    </p>
                    {concept.evidenceSnippet && (
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-400 italic">
                        Evidence quote: "{concept.evidenceSnippet}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                No core concepts were fully articulated in this attempt.
              </p>
            )}
          </div>

          {/* Concepts You Missed or Partially Understood */}
          {(missedConcepts.length > 0 || partialConcepts.length > 0) && (
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                <span>Concepts to Strengthen ({missedConcepts.length + partialConcepts.length})</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {partialConcepts.map((concept, idx) => (
                  <div
                    key={`partial-${idx}`}
                    className="p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-amber-900 dark:text-amber-200">
                        {concept.conceptName}
                      </span>
                      <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded-full">
                        Partial
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {concept.explanation}
                    </p>
                  </div>
                ))}

                {missedConcepts.map((concept, idx) => (
                  <div
                    key={`missed-${idx}`}
                    className="p-3.5 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/30 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-rose-900 dark:text-rose-200">
                        {concept.conceptName}
                      </span>
                      <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/60 px-2 py-0.5 rounded-full">
                        Omitted
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {concept.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strengths & Areas for Improvement */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Strengths */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
                Your Demonstrated Strengths
              </span>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                {assessment.strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Areas for Improvement */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
                Actionable Areas for Improvement
              </span>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                {assessment.improvementAreas.map((imp, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-indigo-500 font-bold">→</span>
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* AI Pedagogical Feedback Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-purple-50/50 to-white dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-slate-900 border border-indigo-200/80 dark:border-indigo-800 space-y-2">
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>AI Pedagogical Evaluation & Coach Note</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
              {assessment.aiFeedback}
            </p>
          </div>

          {/* Recommended Next Steps */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              Recommended Next Concepts to Master
            </span>
            <div className="flex flex-wrap gap-2">
              {assessment.recommendedTopics.map((topic, i) => (
                <button
                  key={i}
                  onClick={onContinue}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors inline-flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{topic}</span>
                  <ChevronRight className="w-3 h-3 text-indigo-400" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
