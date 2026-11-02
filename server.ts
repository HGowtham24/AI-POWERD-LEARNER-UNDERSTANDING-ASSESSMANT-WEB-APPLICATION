import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { db } from './server/db.js';
import {
  transcribeAudioWithGemini,
  computeSemanticEmbeddingSimilarity,
  evaluateConceptAndFeedback,
  generateQuestionSpeech,
  generateQuestionRubric,
} from './server/aiService.js';
import { analyzeAudioBuffer } from './server/audioAnalyzer.js';
import { AssessmentResult, Question, User } from './src/types.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Middleware for large audio payload JSON
app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));

// ----------------------------------------------------
// AUTH ENDPOINTS
// ----------------------------------------------------
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, role } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  let user = db.getUserByEmail(email);
  if (!user) {
    // If demo user or new login, create a user record
    const name = email.split('@')[0].replace('.', ' ');
    const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
    user = db.createUser({
      id: `user-${Date.now()}`,
      name: formattedName,
      email,
      role: role || (email.includes('teacher') ? 'teacher' : 'student'),
      createdAt: new Date().toISOString(),
      institution: 'Global EdTech University',
    });
  }

  res.json({ user });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, role, institution, gradeLevel } = req.body;
  if (!email || !name) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const existing = db.getUserByEmail(email);
  if (existing) {
    return res.json({ user: existing });
  }

  const newUser: User = {
    id: `user-${Date.now()}`,
    name,
    email,
    role: role || 'student',
    institution: institution || 'LearnSense Academy',
    gradeLevel: gradeLevel || 'Higher Education',
    createdAt: new Date().toISOString(),
  };

  db.createUser(newUser);
  res.json({ user: newUser });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) {
    const defaultStudent = db.getUserById('user-student-demo');
    return res.json({ user: defaultStudent });
  }
  const user = db.getUserById(userId);
  res.json({ user: user || null });
});

// ----------------------------------------------------
// SUBJECTS & QUESTIONS
// ----------------------------------------------------
app.get('/api/subjects', (req: Request, res: Response) => {
  const subjects = db.getSubjects();
  res.json({ subjects });
});

app.post('/api/subjects', (req: Request, res: Response) => {
  const { name, description, iconName, topics } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Subject name is required' });
  }
  const id = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const subject = db.createSubject({
    id,
    name,
    description: description || '',
    iconName: iconName || 'BookOpen',
    topics: topics || [],
  });
  res.json({ subject });
});

app.get('/api/questions', (req: Request, res: Response) => {
  const { subjectId, difficulty, topic } = req.query as Record<string, string>;
  const questions = db.getQuestions({ subjectId, difficulty, topic });
  res.json({ questions });
});

app.get('/api/questions/:id', (req: Request, res: Response) => {
  const question = db.getQuestionById(req.params.id);
  if (!question) {
    return res.status(404).json({ error: 'Question not found' });
  }
  res.json({ question });
});

app.post('/api/questions/ai-generate', async (req: Request, res: Response) => {
  const { questionText, subjectName, topic } = req.body;
  if (!questionText) {
    return res.status(400).json({ error: 'questionText is required' });
  }

  try {
    const rubric = await generateQuestionRubric(questionText, subjectName, topic);
    res.json({ rubric });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to generate rubric', details: err.message });
  }
});

app.post('/api/questions', async (req: Request, res: Response) => {
  const data = req.body as Partial<Question>;
  if (!data.questionText) {
    return res.status(400).json({ error: 'questionText is required' });
  }

  const subjects = db.getSubjects();
  let sub = data.subjectId ? subjects.find((s) => s.id === data.subjectId) : undefined;
  if (!sub) {
    sub = subjects[0] || { id: 'cs-ai', name: 'General Science' };
  }

  // If user only provided questionText and omitted concepts or referenceAnswer,
  // automatically generate rich concepts & model answer using AI
  let referenceAnswer = data.referenceAnswer;
  let importantConcepts = data.importantConcepts;
  let keywords = data.keywords;
  let difficulty = data.difficulty;
  let expectedDuration = data.expectedDurationSeconds;

  if (!referenceAnswer || !importantConcepts || importantConcepts.length === 0) {
    try {
      const generated = await generateQuestionRubric(
        data.questionText,
        sub.name,
        data.topic || 'General Topic'
      );
      if (!referenceAnswer) referenceAnswer = generated.referenceAnswer;
      if (!importantConcepts || importantConcepts.length === 0) importantConcepts = generated.importantConcepts;
      if (!keywords || keywords.length === 0) keywords = generated.keywords;
      if (!difficulty) difficulty = generated.difficulty;
      if (!expectedDuration) expectedDuration = generated.expectedDurationSeconds;
    } catch (e) {
      console.warn('Auto rubric fallback notice:', e);
    }
  }

  const newQuestion: Question = {
    id: `q-${Date.now()}`,
    subjectId: sub.id,
    subjectName: sub.name,
    topic: data.topic || 'Custom Practice Topic',
    questionText: data.questionText,
    difficulty: difficulty || 'Intermediate',
    expectedDurationSeconds: expectedDuration || 60,
    referenceAnswer: referenceAnswer || `Explanation of ${data.questionText}`,
    importantConcepts: importantConcepts || [
      { id: `c-${Date.now()}-1`, name: 'Core Principles', description: 'Clear understanding of core principles.', weight: 1.0, mandatory: true },
      { id: `c-${Date.now()}-2`, name: 'Working Mechanism', description: 'Step by step explanation of mechanisms.', weight: 1.0, mandatory: true }
    ],
    keywords: keywords || ['concept', 'explanation', 'mechanism'],
    scoringConfig: data.scoringConfig || {
      semanticWeight: 0.40,
      conceptWeight: 0.40,
      relevanceWeight: 0.20,
    },
  };

  const created = db.createQuestion(newQuestion);
  res.json({ question: created });
});

app.put('/api/questions/:id', (req: Request, res: Response) => {
  const updated = db.updateQuestion(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Question not found' });
  }
  res.json({ question: updated });
});

app.delete('/api/questions/:id', (req: Request, res: Response) => {
  const deleted = db.deleteQuestion(req.params.id);
  res.json({ success: deleted });
});

// ----------------------------------------------------
// AUDIO & SPEECH ENDPOINTS
// ----------------------------------------------------
app.post('/api/speech/transcribe', async (req: Request, res: Response) => {
  const { audioBase64, mimeType } = req.body;
  if (!audioBase64) {
    return res.status(400).json({ error: 'audioBase64 is required' });
  }

  try {
    const text = await transcribeAudioWithGemini(audioBase64, mimeType || 'audio/webm');
    res.json({ transcription: text });
  } catch (err: any) {
    console.error('Transcription route error:', err);
    res.status(500).json({
      error: 'Audio transcription failed',
      details: err.message || 'Check GEMINI_API_KEY in Settings > Secrets',
    });
  }
});

app.post('/api/speech/synthesize', async (req: Request, res: Response) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'text is required' });
  }
  try {
    const audioData = await generateQuestionSpeech(text);
    res.json({ audioBase64: audioData });
  } catch (err) {
    res.status(500).json({ error: 'Speech synthesis unavailable' });
  }
});

app.post('/api/analysis/semantic', async (req: Request, res: Response) => {
  const { studentText, referenceText } = req.body;
  if (!studentText || !referenceText) {
    return res.status(400).json({ error: 'studentText and referenceText are required' });
  }
  try {
    const similarity = await computeSemanticEmbeddingSimilarity(studentText, referenceText);
    res.json({ semanticSimilarity: similarity });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/analysis/speech', (req: Request, res: Response) => {
  const { audioBase64, text, duration } = req.body;
  if (!audioBase64 || !text) {
    return res.status(400).json({ error: 'audioBase64 and text are required' });
  }
  const speechAnalysis = analyzeAudioBuffer(audioBase64, text, duration);
  res.json({ speechAnalysis });
});

// ----------------------------------------------------
// FULL ASSESSMENT SUBMISSION & PIPELINE
// ----------------------------------------------------
app.post('/api/assessments/start', (req: Request, res: Response) => {
  const { subjectId, topic, difficulty, count } = req.body;
  const questions = db.getQuestions({ subjectId, difficulty, topic });
  const selected = questions.slice(0, Number(count) || 1);
  res.json({
    assessmentSessionId: `sess-${Date.now()}`,
    questions: selected.length > 0 ? selected : [db.getQuestions()[0]],
  });
});

app.post('/api/assessments/submit', async (req: Request, res: Response) => {
  const {
    questionId,
    studentId,
    studentName,
    audioBase64,
    mimeType,
    clientTranscript,
    reportedDuration,
  } = req.body;

  if (!questionId) {
    return res.status(400).json({ error: 'questionId is required' });
  }

  const question = db.getQuestionById(questionId);
  if (!question) {
    return res.status(404).json({ error: 'Question not found' });
  }

  const activeStudentId = studentId || 'user-student-demo';
  const activeStudentName = studentName || 'Alex Rivera';

  try {
    // 1. SPEECH-TO-TEXT TRANSCRIPTION
    let transcription = clientTranscript || '';
    let transcriptionConfidence = 0.95;

    if (audioBase64 && (!transcription || transcription.trim().length === 0)) {
      try {
        transcription = await transcribeAudioWithGemini(audioBase64, mimeType || 'audio/webm');
      } catch (err) {
        console.warn('Backend audio transcription notice, using client transcript fallback:', err);
        transcription = clientTranscript || 'No transcription could be derived from audio recording.';
        transcriptionConfidence = 0.70;
      }
    }

    if (!transcription || transcription.trim().length === 0) {
      transcription = clientTranscript || 'Spoken answer submitted.';
    }

    // 2. SPEECH ACOUSTIC ANALYSIS (Librosa style)
    const speechAnalysis = analyzeAudioBuffer(
      audioBase64 || '',
      transcription,
      reportedDuration
    );

    // 3. SEMANTIC EMBEDDING & COSINE SIMILARITY
    const semanticSimilarity = await computeSemanticEmbeddingSimilarity(
      transcription,
      question.referenceAnswer
    );

    // 4. CONCEPT EVALUATION & AI FEEDBACK
    const evaluation = await evaluateConceptAndFeedback(
      question,
      transcription,
      speechAnalysis,
      semanticSimilarity
    );

    // 5. TRANSPARENT CONFIGURABLE SCORING
    const weights = question.scoringConfig || {
      semanticWeight: 0.40,
      conceptWeight: 0.40,
      relevanceWeight: 0.20,
    };

    const calculatedUnderstanding = Math.round(
      weights.semanticWeight * semanticSimilarity +
      weights.conceptWeight * evaluation.conceptCoverage +
      weights.relevanceWeight * evaluation.answerRelevance
    );

    const understandingScore = Math.min(100, Math.max(25, calculatedUnderstanding));

    const assessmentResult: AssessmentResult = {
      id: `asmt-${Date.now()}`,
      studentId: activeStudentId,
      studentName: activeStudentName,
      questionId: question.id,
      questionText: question.questionText,
      subjectName: question.subjectName,
      topicName: question.topic,
      difficulty: question.difficulty,
      createdAt: new Date().toISOString(),
      audioDuration: speechAnalysis.durationSeconds,
      audioBase64: audioBase64 ? audioBase64.substring(0, 500000) : undefined, // store for playback if needed
      transcription,
      transcriptionConfidence,
      semanticSimilarity,
      conceptCoverage: evaluation.conceptCoverage,
      answerRelevance: evaluation.answerRelevance,
      speechFluency: speechAnalysis.fluencyScore,
      understandingScore,
      speechAnalysis,
      conceptsEvaluated: evaluation.conceptsEvaluated,
      strengths: evaluation.strengths,
      missedConcepts: evaluation.missedConcepts,
      improvementAreas: evaluation.improvementAreas,
      aiFeedback: evaluation.aiFeedback,
      recommendedTopics: evaluation.recommendedTopics,
      scoringConfig: weights,
    };

    const saved = db.saveAssessment(assessmentResult);
    res.json({ assessment: saved });
  } catch (err: any) {
    console.error('Error in assessment submit endpoint:', err);
    res.status(500).json({ error: 'Assessment evaluation error', details: err.message });
  }
});

app.get('/api/assessments/history', (req: Request, res: Response) => {
  const { studentId } = req.query as { studentId?: string };
  const assessments = db.getAssessments(studentId);
  res.json({ assessments });
});

app.get('/api/assessments/:id', (req: Request, res: Response) => {
  const assessment = db.getAssessmentById(req.params.id);
  if (!assessment) {
    return res.status(404).json({ error: 'Assessment not found' });
  }
  res.json({ assessment });
});

app.get('/api/students/:studentId/analytics', (req: Request, res: Response) => {
  const analytics = db.getStudentAnalytics(req.params.studentId);
  res.json({ analytics });
});

app.get('/api/teacher/overview', (req: Request, res: Response) => {
  const overview = db.getTeacherOverview();
  res.json({ overview });
});

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', brand: 'LearnSense', timestamp: new Date().toISOString() });
});

// ----------------------------------------------------
// DEV SERVER & STATIC FILE SERVING
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 LearnSense server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
