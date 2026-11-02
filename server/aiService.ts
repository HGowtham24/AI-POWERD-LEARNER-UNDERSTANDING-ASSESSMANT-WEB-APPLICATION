import { GoogleGenAI, Type } from '@google/genai';
import { Question, ConceptResult, SpeechAnalysis } from '../src/types.js';

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

export async function transcribeAudioWithGemini(
  base64Audio: string,
  mimeType: string = 'audio/webm'
): Promise<string> {
  const ai = getAiClient();
  if (!ai) {
    throw new Error('GEMINI_API_KEY is not configured on the server');
  }

  try {
    // Normalizing mime types if needed (e.g. audio/webm;codecs=opus -> audio/webm)
    const cleanMime = mimeType.split(';')[0].trim() || 'audio/webm';

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: cleanMime,
              data: base64Audio,
            },
          },
          {
            text: 'Transcribe this student verbal answer verbatim. Capture all spoken words clearly without adding comments, corrections, or omissions.',
          },
        ],
      },
    });

    const transcription = response.text?.trim() || '';
    return transcription;
  } catch (err) {
    console.error('Error in transcribeAudioWithGemini:', err);
    throw err;
  }
}

export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;
  const len = Math.min(vecA.length, vecB.length);
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < len; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  const sim = dot / (Math.sqrt(normA) * Math.sqrt(normB));
  return Math.max(0, Math.min(1, sim));
}

export async function computeSemanticEmbeddingSimilarity(
  studentText: string,
  referenceText: string
): Promise<number> {
  const ai = getAiClient();
  if (!ai) {
    return localTextSimilarity(studentText, referenceText);
  }

  try {
    const studentEmbed = await ai.models.embedContent({
      model: 'gemini-embedding-2-preview',
      contents: [studentText],
    });

    const refEmbed = await ai.models.embedContent({
      model: 'gemini-embedding-2-preview',
      contents: [referenceText],
    });

    const vecA = studentEmbed.embeddings?.[0]?.values;
    const vecB = refEmbed.embeddings?.[0]?.values;

    if (vecA && vecB) {
      const sim = cosineSimilarity(vecA, vecB);
      // Rescale cosine similarity to a realistic percentage (0 - 100)
      // Dense embeddings usually range between 0.55 - 0.95 for related content
      const scaled = Math.min(100, Math.max(30, Math.round(((sim - 0.35) / 0.65) * 100)));
      return scaled;
    }
  } catch (err) {
    console.warn('Embedding API unavailable, utilizing lexical-semantic fallback:', err);
  }

  return localTextSimilarity(studentText, referenceText);
}

export async function generateQuestionSpeech(text: string): Promise<string | null> {
  const ai = getAiClient();
  if (!ai) return null;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Please read this assessment question clearly and encouragingly: ${text}`,
              speechMetadata: {
                style: 'Articulate, supportive academic instructor',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (err) {
    console.warn('TTS generation notice:', err);
    return null;
  }
}

export async function evaluateConceptAndFeedback(
  question: Question,
  transcribedText: string,
  speechStats: SpeechAnalysis,
  semanticScore: number
): Promise<{
  conceptsEvaluated: ConceptResult[];
  conceptCoverage: number;
  answerRelevance: number;
  strengths: string[];
  missedConcepts: string[];
  improvementAreas: string[];
  aiFeedback: string;
  recommendedTopics: string[];
}> {
  const ai = getAiClient();

  if (ai && transcribedText.trim().length > 10) {
    try {
      const prompt = `
You are LearnSense, an expert academic evaluator analyzing a student's spoken explanation.
Evaluate how well the student understands the underlying concepts.

Question: "${question.questionText}"
Topic: "${question.topic}" (Subject: ${question.subjectName})
Reference Answer: "${question.referenceAnswer}"

Required Important Concepts:
${JSON.stringify(question.importantConcepts, null, 2)}

Keywords:
${JSON.stringify(question.keywords)}

Student's Transcribed Spoken Answer:
"${transcribedText}"

Speech Characteristics (for context only - DO NOT penalize score for speech speed):
- Duration: ${speechStats.durationSeconds}s
- Speaking Rate: ${speechStats.speakingRateWpm} WPM
- Pauses: ${speechStats.pauseCount} (${speechStats.pauseDurationSeconds}s total)

Instructions:
1. Compare student's explanation against each Important Concept. A concept is "understood" if explained in the student's own words, "partially_understood" if incomplete, or "missed" if absent or incorrect.
2. Provide short evidence snippets from their answer where applicable.
3. Calculate conceptCoverage (0-100) based on weighted concept coverage.
4. Calculate answerRelevance (0-100) assessing if they stayed on-topic without irrelevant tangents.
5. Provide 2-3 specific student Strengths.
6. Provide specific Missed Concepts (if any).
7. Provide 1-2 actionable Areas for Improvement.
8. Write warm, encouraging, pedagogically sound AI Feedback summarizing their understanding.
9. Recommend 2 related topics to study next.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              conceptsEvaluated: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    conceptName: { type: Type.STRING },
                    status: {
                      type: Type.STRING,
                      description: 'understood, partially_understood, or missed',
                    },
                    evidenceSnippet: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                  },
                  required: ['conceptName', 'status', 'explanation'],
                },
              },
              conceptCoverage: { type: Type.NUMBER },
              answerRelevance: { type: Type.NUMBER },
              strengths: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              missedConcepts: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              improvementAreas: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              aiFeedback: { type: Type.STRING },
              recommendedTopics: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: [
              'conceptsEvaluated',
              'conceptCoverage',
              'answerRelevance',
              'strengths',
              'improvementAreas',
              'aiFeedback',
              'recommendedTopics',
            ],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      if (parsed.conceptsEvaluated && Array.isArray(parsed.conceptsEvaluated)) {
        return {
          conceptsEvaluated: parsed.conceptsEvaluated,
          conceptCoverage: Math.min(100, Math.max(20, Math.round(parsed.conceptCoverage || 75))),
          answerRelevance: Math.min(100, Math.max(30, Math.round(parsed.answerRelevance || 80))),
          strengths: parsed.strengths || ['Clear expression of foundational ideas.'],
          missedConcepts: parsed.missedConcepts || [],
          improvementAreas: parsed.improvementAreas || ['Expand on underlying mechanisms.'],
          aiFeedback: parsed.aiFeedback || 'Good effort in articulating your thoughts clearly.',
          recommendedTopics: parsed.recommendedTopics || [question.topic],
        };
      }
    } catch (err) {
      console.warn('Gemini structured evaluation warning, using semantic heuristic evaluation:', err);
    }
  }

  // Fallback evaluation if API key is not present or structured call had issue
  return localConceptEvaluation(question, transcribedText, semanticScore);
}

// Fallback semantic similarity using term frequency and n-gram overlap
function localTextSimilarity(textA: string, textB: string): number {
  const cleanA = textA.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const cleanB = textB.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');

  const wordsA = new Set(cleanA.split(/\s+/).filter((w) => w.length > 2));
  const wordsB = new Set(cleanB.split(/\s+/).filter((w) => w.length > 2));

  if (wordsA.size === 0 || wordsB.size === 0) return 40;

  let intersection = 0;
  wordsA.forEach((w) => {
    if (wordsB.has(w)) intersection++;
  });

  const jaccard = intersection / (wordsA.size + wordsB.size - intersection);
  // Scale jaccard (0.1 - 0.6 is common for free spoken response vs textbook)
  const score = Math.min(95, Math.max(45, Math.round((jaccard * 1.8 + 0.35) * 100)));
  return score;
}

function localConceptEvaluation(
  question: Question,
  transcribedText: string,
  semanticScore: number
): {
  conceptsEvaluated: ConceptResult[];
  conceptCoverage: number;
  answerRelevance: number;
  strengths: string[];
  missedConcepts: string[];
  improvementAreas: string[];
  aiFeedback: string;
  recommendedTopics: string[];
} {
  const lowerText = transcribedText.toLowerCase();

  const conceptsEvaluated: ConceptResult[] = question.importantConcepts.map((concept) => {
    const conceptWords = concept.name
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3);
    const matches = conceptWords.filter((w) => lowerText.includes(w));

    let status: 'understood' | 'partially_understood' | 'missed' = 'missed';
    let explanation = `The core idea regarding ${concept.name} was not clearly highlighted in the explanation.`;
    let evidenceSnippet = '';

    if (matches.length === conceptWords.length || (conceptWords.length > 1 && matches.length >= 1 && semanticScore > 70)) {
      status = 'understood';
      explanation = `Demonstrated accurate understanding of ${concept.name}.`;
      evidenceSnippet = `Spoke directly about ${concept.name.toLowerCase()}`;
    } else if (matches.length > 0 || semanticScore > 60) {
      status = 'partially_understood';
      explanation = `Addressed elements of ${concept.name}, but could be developed more deeply.`;
      evidenceSnippet = `Mentioned related terms`;
    }

    return {
      conceptName: concept.name,
      status,
      evidenceSnippet,
      explanation,
    };
  });

  const understoodCount = conceptsEvaluated.filter((c) => c.status === 'understood').length;
  const partialCount = conceptsEvaluated.filter((c) => c.status === 'partially_understood').length;
  const total = conceptsEvaluated.length || 1;

  const conceptCoverage = Math.min(100, Math.round(((understoodCount + partialCount * 0.5) / total) * 100));
  const answerRelevance = Math.min(98, Math.max(50, Math.round(semanticScore * 0.95 + 5)));

  const strengths = [
    'Articulated the core theme using natural phrasing and personal explanation.',
    'Connected the main topic with relevant contextual details.',
  ];

  const missedList = conceptsEvaluated.filter((c) => c.status === 'missed').map((c) => c.conceptName);
  const improvementAreas =
    missedList.length > 0
      ? [`Consider diving deeper into ${missedList.join(' and ')} to present a fully rounded response.`]
      : ['Try giving an additional real-world case study to show applied mastery.'];

  const aiFeedback = `Good effort explaining ${question.topic}! You showed a solid foundational grasp of the material. Reviewing the detailed concept breakdown will help you master the remaining technical nuances.`;

  return {
    conceptsEvaluated,
    conceptCoverage,
    answerRelevance,
    strengths,
    missedConcepts: missedList,
    improvementAreas,
    aiFeedback,
    recommendedTopics: [question.topic, `${question.subjectName} Advanced Concepts`],
  };
}

export async function generateQuestionRubric(
  questionText: string,
  subjectName: string = 'General',
  topic: string = 'General Topic'
): Promise<{
  referenceAnswer: string;
  importantConcepts: { id: string; name: string; description: string; weight: number; mandatory: boolean }[];
  keywords: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  expectedDurationSeconds: number;
}> {
  const ai = getAiClient();
  if (ai) {
    try {
      const prompt = `
You are an expert curriculum designer and educator for LearnSense.
Given this spoken oral assessment question: "${questionText}"
Subject: ${subjectName}
Topic: ${topic}

Generate:
1. A clear, comprehensive model reference answer (2-4 sentences) that an articulate student would explain in their own words.
2. 3-4 distinct core concepts or pillars that should be covered (with name, brief description, weight, and mandatory boolean).
3. 6-10 keywords or technical terms related to the concept.
4. Suggested difficulty: "Beginner", "Intermediate", or "Advanced".
5. Expected answer duration in seconds (typically between 45 and 90).
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              referenceAnswer: { type: Type.STRING },
              importantConcepts: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    weight: { type: Type.NUMBER },
                    mandatory: { type: Type.BOOLEAN },
                  },
                  required: ['name', 'description', 'weight', 'mandatory'],
                },
              },
              keywords: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              difficulty: {
                type: Type.STRING,
                description: 'Beginner, Intermediate, or Advanced',
              },
              expectedDurationSeconds: { type: Type.NUMBER },
            },
            required: ['referenceAnswer', 'importantConcepts', 'keywords', 'difficulty', 'expectedDurationSeconds'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      if (parsed.referenceAnswer && parsed.importantConcepts) {
        return {
          referenceAnswer: parsed.referenceAnswer,
          importantConcepts: parsed.importantConcepts.map((c: any, i: number) => ({
            id: c.id || `c-${Date.now()}-${i}`,
            name: c.name,
            description: c.description,
            weight: Number(c.weight) || 1.0,
            mandatory: !!c.mandatory,
          })),
          keywords: parsed.keywords || [],
          difficulty: (['Beginner', 'Intermediate', 'Advanced'].includes(parsed.difficulty)
            ? parsed.difficulty
            : 'Intermediate') as any,
          expectedDurationSeconds: Number(parsed.expectedDurationSeconds) || 60,
        };
      }
    } catch (err) {
      console.warn('AI question rubric generation notice:', err);
    }
  }

  // Fallback generation if Gemini API is offline
  return {
    referenceAnswer: `A comprehensive explanation of ${questionText}. A solid answer clearly defines the foundational mechanism, explains how the components interact, and addresses real-world implications.`,
    importantConcepts: [
      { id: `c-${Date.now()}-1`, name: 'Core Definition & Principles', description: 'Accurate fundamental explanation of the concept.', weight: 1.2, mandatory: true },
      { id: `c-${Date.now()}-2`, name: 'Operational Mechanism & Dynamics', description: 'How the process or algorithm functions step by step.', weight: 1.0, mandatory: true },
      { id: `c-${Date.now()}-3`, name: 'Application & Context', description: 'Real-world example or practical use case.', weight: 0.8, mandatory: false },
    ],
    keywords: questionText.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 3),
    difficulty: 'Intermediate',
    expectedDurationSeconds: 60,
  };
}

