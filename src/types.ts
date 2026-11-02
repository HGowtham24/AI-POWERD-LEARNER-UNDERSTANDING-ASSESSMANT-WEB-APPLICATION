export type UserRole = 'student' | 'teacher';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
  institution?: string;
  gradeLevel?: string;
}

export interface ImportantConcept {
  id: string;
  name: string;
  description: string;
  weight: number; // e.g. 1
  mandatory: boolean;
}

export interface Question {
  id: string;
  subjectId: string;
  subjectName: string;
  topic: string;
  questionText: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  expectedDurationSeconds: number;
  referenceAnswer: string;
  importantConcepts: ImportantConcept[];
  keywords: string[];
  scoringConfig: {
    semanticWeight: number; // e.g. 0.40
    conceptWeight: number;  // e.g. 0.40
    relevanceWeight: number; // e.g. 0.20
  };
}

export interface Subject {
  id: string;
  name: string;
  description: string;
  iconName: string;
  topics: string[];
  questionCount?: number;
}

export interface SpeechAnalysis {
  durationSeconds: number;
  wordCount: number;
  speakingRateWpm: number;
  pauseCount: number;
  pauseDurationSeconds: number;
  pauseRatio: number; // pauseDuration / totalDuration
  speechConsistency: 'Smooth' | 'Moderate' | 'Hesitant';
  fluencyScore: number; // 0 - 100
  acousticFeedback: string;
}

export interface ConceptResult {
  conceptName: string;
  status: 'understood' | 'partially_understood' | 'missed';
  evidenceSnippet?: string;
  explanation: string;
}

export interface AssessmentResult {
  id: string;
  studentId: string;
  studentName: string;
  questionId: string;
  questionText: string;
  subjectName: string;
  topicName: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  createdAt: string;
  audioBase64?: string;
  audioDuration: number;
  transcription: string;
  transcriptionConfidence: number;
  semanticSimilarity: number; // 0 - 100
  conceptCoverage: number;    // 0 - 100
  answerRelevance: number;     // 0 - 100
  speechFluency: number;       // 0 - 100
  understandingScore: number;  // 0 - 100 overall
  speechAnalysis: SpeechAnalysis;
  conceptsEvaluated: ConceptResult[];
  strengths: string[];
  missedConcepts: string[];
  improvementAreas: string[];
  aiFeedback: string;
  recommendedTopics: string[];
  scoringConfig: {
    semanticWeight: number;
    conceptWeight: number;
    relevanceWeight: number;
  };
}

export interface StudentAnalytics {
  studentId: string;
  studentName: string;
  totalAssessments: number;
  averageScore: number;
  highestScore: number;
  completedTopicsCount: number;
  averageFluency: number;
  scoreOverTime: { date: string; score: number; topic: string }[];
  subjectMastery: { subject: string; score: number; count: number }[];
  topicPerformance: { topic: string; score: number; difficulty: string }[];
  conceptCoverageTrend: { date: string; coverage: number }[];
  strongestTopics: string[];
  weakestTopics: string[];
}

export interface TeacherOverview {
  totalStudents: number;
  totalAssessments: number;
  averageUnderstandingScore: number;
  averageFluencyScore: number;
  topPerformingTopics: { topic: string; score: number; studentCount: number }[];
  weakestTopics: { topic: string; score: number; studentCount: number }[];
  recentAssessments: AssessmentResult[];
  commonMissedConcepts: { conceptName: string; count: number; topic: string }[];
}
