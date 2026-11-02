import React, { useEffect, useState } from 'react';
import { Question, Subject, ImportantConcept } from '../types.js';
import {
  FileQuestion,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  Check,
  X,
  Sliders,
  Layers,
  Sparkles,
  BookOpen,
  Clock,
  AlertCircle,
  Wand2,
  Loader2,
} from 'lucide-react';

export const QuestionManagementPage: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    subjectId: 'cs-ai',
    topic: '',
    questionText: '',
    difficulty: 'Intermediate' as 'Beginner' | 'Intermediate' | 'Advanced',
    expectedDurationSeconds: 60,
    referenceAnswer: '',
    keywords: '',
    semanticWeight: 0.40,
    conceptWeight: 0.40,
    relevanceWeight: 0.20,
    importantConcepts: [] as ImportantConcept[],
  });

  // Fetch Questions & Subjects
  const loadData = async () => {
    setLoading(true);
    try {
      const [qRes, subRes] = await Promise.all([
        fetch('/api/questions'),
        fetch('/api/subjects'),
      ]);
      const qData = await qRes.json();
      const subData = await subRes.json();
      setQuestions(qData.questions || []);
      setSubjects(subData.subjects || []);
    } catch (err) {
      console.error('Error loading questions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingQuestion(null);
    setFormData({
      subjectId: subjects[0]?.id || 'cs-ai',
      topic: '',
      questionText: '',
      difficulty: 'Intermediate',
      expectedDurationSeconds: 60,
      referenceAnswer: '',
      keywords: '',
      semanticWeight: 0.40,
      conceptWeight: 0.40,
      relevanceWeight: 0.20,
      importantConcepts: [
        { id: `c-${Date.now()}-1`, name: 'Core Definition & Principle', description: 'Accurate fundamental explanation', weight: 1.0, mandatory: true },
        { id: `c-${Date.now()}-2`, name: 'Operational Mechanism', description: 'Step by step mechanics or process flow', weight: 1.0, mandatory: true },
      ],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (q: Question) => {
    setEditingQuestion(q);
    setFormData({
      subjectId: q.subjectId,
      topic: q.topic,
      questionText: q.questionText,
      difficulty: q.difficulty,
      expectedDurationSeconds: q.expectedDurationSeconds,
      referenceAnswer: q.referenceAnswer,
      keywords: q.keywords.join(', '),
      semanticWeight: q.scoringConfig?.semanticWeight ?? 0.40,
      conceptWeight: q.scoringConfig?.conceptWeight ?? 0.40,
      relevanceWeight: q.scoringConfig?.relevanceWeight ?? 0.20,
      importantConcepts: q.importantConcepts || [],
    });
    setIsModalOpen(true);
  };

  const handleAiGenerateRubric = async () => {
    if (!formData.questionText.trim()) return;
    setIsGeneratingAi(true);

    try {
      const sub = subjects.find((s) => s.id === formData.subjectId);
      const res = await fetch('/api/questions/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText: formData.questionText,
          subjectName: sub ? sub.name : 'General',
          topic: formData.topic || 'General Topic',
        }),
      });

      const data = await res.json();
      if (data.rubric) {
        setFormData((prev) => ({
          ...prev,
          referenceAnswer: data.rubric.referenceAnswer,
          importantConcepts: data.rubric.importantConcepts,
          keywords: data.rubric.keywords.join(', '),
          difficulty: data.rubric.difficulty,
          expectedDurationSeconds: data.rubric.expectedDurationSeconds,
        }));
      }
    } catch (e) {
      console.warn('AI generation error:', e);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const sub = subjects.find((s) => s.id === formData.subjectId);

    const payload: Partial<Question> = {
      subjectId: formData.subjectId,
      subjectName: sub ? sub.name : 'General',
      topic: formData.topic || 'General Topic',
      questionText: formData.questionText,
      difficulty: formData.difficulty,
      expectedDurationSeconds: Number(formData.expectedDurationSeconds) || 60,
      referenceAnswer: formData.referenceAnswer,
      keywords: formData.keywords.split(',').map((k) => k.trim()).filter(Boolean),
      importantConcepts: formData.importantConcepts,
      scoringConfig: {
        semanticWeight: Number(formData.semanticWeight),
        conceptWeight: Number(formData.conceptWeight),
        relevanceWeight: Number(formData.relevanceWeight),
      },
    };

    try {
      if (editingQuestion) {
        await fetch(`/api/questions/${editingQuestion.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch('/api/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      console.error('Error saving question:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this question from the active assessment pool?')) {
      try {
        await fetch(`/api/questions/${id}`, { method: 'DELETE' });
        loadData();
      } catch (err) {
        console.error('Error deleting question:', err);
      }
    }
  };

  const addConceptRow = () => {
    setFormData((prev) => ({
      ...prev,
      importantConcepts: [
        ...prev.importantConcepts,
        {
          id: `c-${Date.now()}`,
          name: '',
          description: '',
          weight: 1.0,
          mandatory: false,
        },
      ],
    }));
  };

  const removeConceptRow = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      importantConcepts: prev.importantConcepts.filter((_, i) => i !== index),
    }));
  };

  const updateConceptRow = (index: number, field: keyof ImportantConcept, val: any) => {
    setFormData((prev) => {
      const updated = [...prev.importantConcepts];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, importantConcepts: updated };
    });
  };

  const filtered = questions.filter((q) => {
    const matchSearch =
      q.questionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.subjectName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSubject = selectedSubjectFilter === 'All' || q.subjectId === selectedSubjectFilter;
    return matchSearch && matchSubject;
  });

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Question & Rubric Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Author curriculum prompts, define core concept evaluation pillars, and configure scoring weights
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Question</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search questions by text, topic, or subject..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none dark:text-white"
          />
        </div>

        <div className="w-full sm:w-56">
          <select
            value={selectedSubjectFilter}
            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none dark:text-white"
          >
            <option value="All">All Subjects</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Questions Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-50/60 dark:bg-slate-950/60 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Question Prompt</th>
                  <th className="py-3.5 px-3">Subject & Topic</th>
                  <th className="py-3.5 px-3">Difficulty</th>
                  <th className="py-3.5 px-3">Target Duration</th>
                  <th className="py-3.5 px-3">Concepts Defined</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filtered.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-4 max-w-sm">
                      <p className="font-bold text-slate-900 dark:text-slate-100 line-clamp-2">
                        "{q.questionText}"
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        Ref: {q.referenceAnswer}
                      </p>
                    </td>

                    <td className="py-4 px-3">
                      <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 block">
                        {q.topic}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                        {q.subjectName}
                      </span>
                    </td>

                    <td className="py-4 px-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                          q.difficulty === 'Beginner'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : q.difficulty === 'Intermediate'
                            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                            : 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                        }`}
                      >
                        {q.difficulty}
                      </span>
                    </td>

                    <td className="py-4 px-3 text-xs font-mono text-slate-600 dark:text-slate-300">
                      ~{q.expectedDurationSeconds}s
                    </td>

                    <td className="py-4 px-3">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                        <Layers className="w-3.5 h-3.5" />
                        <span>{q.importantConcepts?.length || 0} pillars</span>
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(q)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                        title="Edit question & rubric"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(q.id)}
                        className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition-colors"
                        title="Delete question"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 text-sm">
            No questions found. Click "Create New Question" to add one!
          </div>
        )}
      </div>

      {/* Modal: Create / Edit Question */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
          <div className="max-w-2xl w-full bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl my-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingQuestion ? 'Edit Question & Assessment Rubric' : 'Author New Spoken Question'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Subject Domain
                  </label>
                  <select
                    value={formData.subjectId}
                    onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 dark:text-white"
                  >
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Topic Title
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    placeholder="e.g. Distributed Consensus"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Question Prompt (The question students will hear and answer aloud)
                </label>
                <textarea
                  required
                  rows={2}
                  value={formData.questionText}
                  onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                  placeholder="e.g. What is the Byzantine Generals Problem? Explain how distributed consensus solves it."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 dark:text-white"
                />
              </div>

              {/* AI Auto-Fill Action */}
              <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-50/80 to-purple-50/80 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between gap-3">
                <span className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-1.5 font-medium">
                  <Wand2 className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Draft reference answer & core concept pillars automatically</span>
                </span>
                <button
                  type="button"
                  disabled={isGeneratingAi || !formData.questionText.trim()}
                  onClick={handleAiGenerateRubric}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isGeneratingAi ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Auto-Fill with AI</span>
                    </>
                  )}
                </button>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Reference Explanation (Model answer used for semantic embedding comparison)
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.referenceAnswer}
                  onChange={(e) => setFormData({ ...formData, referenceAnswer: e.target.value })}
                  placeholder="Comprehensive scientific explanation covering the essential mechanics..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Expected Duration (Seconds)
                  </label>
                  <input
                    type="number"
                    min={20}
                    max={300}
                    value={formData.expectedDurationSeconds}
                    onChange={(e) => setFormData({ ...formData, expectedDurationSeconds: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 dark:text-white"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Keywords (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.keywords}
                    onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                    placeholder="consensus, nodes, fault tolerance"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              {/* Scoring Weights Rubric */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="font-bold text-slate-700 dark:text-slate-300 block">
                  Scoring Rubric Weights (Must sum to 1.0)
                </span>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-0.5">Semantic (40%)</label>
                    <input
                      type="number"
                      step="0.05"
                      min="0.1"
                      max="0.8"
                      value={formData.semanticWeight}
                      onChange={(e) => setFormData({ ...formData, semanticWeight: Number(e.target.value) })}
                      className="w-full px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-0.5">Concept (40%)</label>
                    <input
                      type="number"
                      step="0.05"
                      min="0.1"
                      max="0.8"
                      value={formData.conceptWeight}
                      onChange={(e) => setFormData({ ...formData, conceptWeight: Number(e.target.value) })}
                      className="w-full px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-0.5">Relevance (20%)</label>
                    <input
                      type="number"
                      step="0.05"
                      min="0.05"
                      max="0.5"
                      value={formData.relevanceWeight}
                      onChange={(e) => setFormData({ ...formData, relevanceWeight: Number(e.target.value) })}
                      className="w-full px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Important Concepts Editor */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Important Conceptual Pillars ({formData.importantConcepts.length})
                  </span>
                  <button
                    type="button"
                    onClick={addConceptRow}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Concept</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {formData.importantConcepts.map((concept, idx) => (
                    <div
                      key={concept.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          required
                          value={concept.name}
                          onChange={(e) => updateConceptRow(idx, 'name', e.target.value)}
                          placeholder="Concept Name (e.g. Byzantine Failure)"
                          className="flex-1 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                        <button
                          type="button"
                          onClick={() => removeConceptRow(idx)}
                          className="text-rose-500 hover:text-rose-700 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={concept.description}
                        onChange={(e) => updateConceptRow(idx, 'description', e.target.value)}
                        placeholder="Expected articulation or criteria..."
                        className="w-full px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                >
                  Save Question & Rubric
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
