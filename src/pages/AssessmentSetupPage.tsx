import React, { useEffect, useState } from 'react';
import { Subject, Question } from '../types.js';
import {
  BookOpen,
  Cpu,
  Dna,
  Atom,
  TrendingUp,
  Layers,
  Sparkles,
  ArrowRight,
  Clock,
  HelpCircle,
  CheckCircle2,
  Sliders,
  Play,
  Wand2,
  X,
  Loader2,
  Plus,
} from 'lucide-react';

interface AssessmentSetupPageProps {
  onStartAssessment: (selectedQuestions: Question[]) => void;
  onNavigate: (page: string) => void;
}

export const AssessmentSetupPage: React.FC<AssessmentSetupPageProps> = ({
  onStartAssessment,
  onNavigate,
}) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('cs-ai');
  const [selectedTopic, setSelectedTopic] = useState<string>('All Topics');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [questionCount, setQuestionCount] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  // Custom Question Modal State
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customQuestionText, setCustomQuestionText] = useState('');
  const [customSubjectId, setCustomSubjectId] = useState('cs-ai');
  const [customTopic, setCustomTopic] = useState('');
  const [customDifficulty, setCustomDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [customDuration, setCustomDuration] = useState(60);
  const [customRefAnswer, setCustomRefAnswer] = useState('');
  const [customKeywords, setCustomKeywords] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiGeneratedSuccess, setAiGeneratedSuccess] = useState(false);
  const [customConcepts, setCustomConcepts] = useState<{ id: string; name: string; description: string; weight: number; mandatory: boolean }[]>([]);

  // Fetch subjects & all questions
  useEffect(() => {
    const loadSetupData = async () => {
      setLoading(true);
      try {
        const [subRes, qRes] = await Promise.all([
          fetch('/api/subjects'),
          fetch('/api/questions'),
        ]);
        const subData = await subRes.json();
        const qData = await qRes.json();

        setSubjects(subData.subjects || []);
        setQuestions(qData.questions || []);

        if (subData.subjects && subData.subjects.length > 0) {
          setSelectedSubjectId(subData.subjects[0].id);
        }
      } catch (err) {
        console.error('Error fetching assessment setup data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSetupData();
  }, []);

  const activeSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

  // Available topics for active subject
  const availableTopics = ['All Topics', ...(activeSubject?.topics || [])];

  // Filter matching questions
  const filteredQuestions = questions.filter((q) => {
    if (q.subjectId !== selectedSubjectId) return false;
    if (selectedTopic !== 'All Topics' && q.topic.toLowerCase() !== selectedTopic.toLowerCase()) {
      return false;
    }
    if (selectedDifficulty !== 'All' && q.difficulty !== selectedDifficulty) {
      return false;
    }
    return true;
  });

  const previewQuestion = filteredQuestions[0] || questions.find((q) => q.subjectId === selectedSubjectId) || questions[0];

  const handleAiGenerateRubric = async () => {
    if (!customQuestionText.trim()) return;
    setIsGeneratingAi(true);
    setAiGeneratedSuccess(false);

    try {
      const activeSub = subjects.find((s) => s.id === customSubjectId);
      const res = await fetch('/api/questions/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText: customQuestionText,
          subjectName: activeSub ? activeSub.name : 'General',
          topic: customTopic || 'General Topic',
        }),
      });

      const data = await res.json();
      if (data.rubric) {
        setCustomRefAnswer(data.rubric.referenceAnswer);
        setCustomConcepts(data.rubric.importantConcepts);
        setCustomKeywords(data.rubric.keywords.join(', '));
        setCustomDifficulty(data.rubric.difficulty);
        setCustomDuration(data.rubric.expectedDurationSeconds);
        setAiGeneratedSuccess(true);
      }
    } catch (e) {
      console.warn('AI generation error:', e);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSaveCustomQuestion = async (startImmediately: boolean = false) => {
    if (!customQuestionText.trim()) return;

    const activeSub = subjects.find((s) => s.id === customSubjectId) || subjects[0];
    const payload = {
      subjectId: activeSub.id,
      subjectName: activeSub.name,
      topic: customTopic.trim() || 'Custom Practice Topic',
      questionText: customQuestionText.trim(),
      difficulty: customDifficulty,
      expectedDurationSeconds: Number(customDuration) || 60,
      referenceAnswer: customRefAnswer.trim() || `Comprehensive explanation of ${customQuestionText}`,
      keywords: customKeywords.split(',').map((k) => k.trim()).filter(Boolean),
      importantConcepts: customConcepts.length > 0 ? customConcepts : [
        { id: `c-${Date.now()}-1`, name: 'Core Definition & Principle', description: 'Accurate fundamental explanation', weight: 1.2, mandatory: true },
        { id: `c-${Date.now()}-2`, name: 'Operational Mechanism', description: 'Step by step mechanics or process flow', weight: 1.0, mandatory: true },
      ],
      scoringConfig: {
        semanticWeight: 0.40,
        conceptWeight: 0.40,
        relevanceWeight: 0.20,
      },
    };

    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.question) {
        setQuestions((prev) => [data.question, ...prev]);
        setSelectedSubjectId(data.question.subjectId);
        setIsCustomModalOpen(false);

        // Reset custom fields
        setCustomQuestionText('');
        setCustomTopic('');
        setCustomRefAnswer('');
        setCustomKeywords('');
        setCustomConcepts([]);
        setAiGeneratedSuccess(false);

        if (startImmediately) {
          onStartAssessment([data.question]);
        }
      }
    } catch (err) {
      console.error('Error saving custom question:', err);
    }
  };

  const handleStart = () => {
    const pool = filteredQuestions.length > 0 ? filteredQuestions : [previewQuestion];
    const chosen = pool.slice(0, questionCount);
    onStartAssessment(chosen);
  };

  const getSubjectIcon = (iconName: string) => {
    switch (iconName) {
      case 'Cpu':
        return <Cpu className="w-5 h-5" />;
      case 'Dna':
        return <Dna className="w-5 h-5" />;
      case 'Atom':
        return <Atom className="w-5 h-5" />;
      case 'TrendingUp':
        return <TrendingUp className="w-5 h-5" />;
      default:
        return <BookOpen className="w-5 h-5" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Oral Examination Setup</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Configure Your Voice Assessment
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            Choose a curated academic question or add your own custom question to test your spoken comprehension.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCustomModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all active:scale-95 shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>+ Add Custom Question</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Subject and Filters */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Select Subject */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                1
              </span>
              <span>Select Academic Subject</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {subjects.map((sub) => {
                const isSelected = sub.id === selectedSubjectId;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => {
                      setSelectedSubjectId(sub.id);
                      setSelectedTopic('All Topics');
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-950/40'
                    }`}
                  >
                    <div
                      className={`p-2.5 rounded-xl shrink-0 ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {getSubjectIcon(sub.iconName)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                        {sub.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                        {sub.description}
                      </p>
                      <span className="inline-block mt-2 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                        {sub.questionCount ?? 2} questions available
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Topics & Difficulty */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                2
              </span>
              <span>Refine Topic & Challenge Level</span>
            </div>

            {/* Topic Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Concept Topic
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTopics.map((topic) => {
                  const active = selectedTopic === topic;
                  return (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => setSelectedTopic(topic)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        active
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {topic}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Difficulty Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Target Difficulty
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['All', 'Beginner', 'Intermediate', 'Advanced'].map((diff) => {
                  const active = selectedDifficulty === diff;
                  return (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setSelectedDifficulty(diff)}
                      className={`py-2 rounded-xl text-xs font-semibold border text-center transition-all ${
                        active
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {diff}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Question Count */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                <span>Number of Questions in Session</span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {questionCount} question{questionCount > 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setQuestionCount(cnt)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${
                      questionCount === cnt
                        ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {cnt} Question{cnt > 1 ? 's' : ''}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Question Preview & Start CTA */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">
                Question Preview
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                {previewQuestion?.difficulty || 'Intermediate'}
              </span>
            </div>

            {previewQuestion ? (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                  "{previewQuestion.questionText}"
                </p>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800 text-xs space-y-2">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Expected Duration: ~{previewQuestion.expectedDurationSeconds}s</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Layers className="w-3.5 h-3.5 text-purple-500" />
                    <span>Core Pillars: {previewQuestion.importantConcepts.length} concepts evaluated</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Key Concepts Assessed
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {previewQuestion.importantConcepts.slice(0, 3).map((c) => (
                      <span
                        key={c.id}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      >
                        {c.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">No matching question found with current filters.</p>
            )}

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <button
                type="button"
                onClick={handleStart}
                className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Begin Spoken Assessment</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('profile')}
                className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 text-center"
              >
                Test Microphone Hardware First
              </button>
            </div>
          </div>

          {/* Assessment Protocol Notice */}
          <div className="p-4 rounded-2xl bg-slate-100/60 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-1.5">
            <span className="font-bold text-slate-700 dark:text-slate-300 block">
              Assessment Protocol:
            </span>
            <p>1. Find a quiet room with minimal background noise.</p>
            <p>2. Speak at your natural conversational cadence.</p>
            <p>3. Pausing to gather thoughts is completely natural and encouraged.</p>
          </div>
        </div>
      </div>

      {/* Custom Question Modal */}
      {isCustomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
          <div className="max-w-2xl w-full bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl my-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  <Sparkles className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Add Your Custom Question
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Practice explaining any concept in your own voice
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCustomModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Question Text */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Your Question Prompt <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={customQuestionText}
                  onChange={(e) => setCustomQuestionText(e.target.value)}
                  placeholder="e.g. What is Recursion in programming and why is a base case required?"
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              {/* Subject & Topic */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Academic Subject
                  </label>
                  <select
                    value={customSubjectId}
                    onChange={(e) => setCustomSubjectId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 dark:text-white"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Topic / Sub-area
                  </label>
                  <input
                    type="text"
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    placeholder="e.g. Recursive Algorithms"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              {/* Difficulty and Duration */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={customDifficulty}
                    onChange={(e) => setCustomDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Target Duration (Seconds)
                  </label>
                  <input
                    type="number"
                    min={20}
                    max={300}
                    value={customDuration}
                    onChange={(e) => setCustomDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              {/* AI Auto-Fill Action Banner */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-50/80 via-purple-50/50 to-slate-50/60 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-slate-900 border border-indigo-200/80 dark:border-indigo-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5 text-xs">
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Auto-Generate Evaluation Rubric with AI</span>
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Instantly draft model answers, concept pillars, and scientific keywords for your question.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isGeneratingAi || !customQuestionText.trim()}
                  onClick={handleAiGenerateRubric}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50 transition-all active:scale-95"
                >
                  {isGeneratingAi ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating Rubric...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generate Model Rubric</span>
                    </>
                  )}
                </button>
              </div>

              {aiGeneratedSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Model answer & {customConcepts.length} core concepts generated successfully!</span>
                </div>
              )}

              {/* Reference Answer */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Model Reference Explanation (Optional — AI compares your voice against this)
                </label>
                <textarea
                  rows={3}
                  value={customRefAnswer}
                  onChange={(e) => setCustomRefAnswer(e.target.value)}
                  placeholder="Enter the ideal conceptual explanation, or click 'Generate Model Rubric' above to auto-create..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 dark:text-white"
                />
              </div>

              {/* Concept Pillars Preview */}
              {customConcepts.length > 0 && (
                <div className="space-y-1.5">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block">
                    Core Concepts Assessed ({customConcepts.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {customConcepts.map((c, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[11px] font-semibold"
                      >
                        ✓ {c.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCustomModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-center"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={!customQuestionText.trim()}
                onClick={() => handleSaveCustomQuestion(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 disabled:opacity-50"
              >
                Save to Question Bank
              </button>

              <button
                type="button"
                disabled={!customQuestionText.trim()}
                onClick={() => handleSaveCustomQuestion(true)}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center justify-center gap-1.5 disabled:opacity-50 active:scale-95 transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Save & Start Assessment Now</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
