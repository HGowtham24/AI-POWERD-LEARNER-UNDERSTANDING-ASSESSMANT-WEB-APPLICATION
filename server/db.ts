import fs from 'fs';
import path from 'path';
import { User, Subject, Question, AssessmentResult, StudentAnalytics, TeacherOverview } from '../src/types.js';

interface DatabaseSchema {
  users: User[];
  subjects: Subject[];
  questions: Question[];
  assessments: AssessmentResult[];
}

const DB_FILE = path.resolve(process.cwd(), 'database.json');

const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'cs-ai',
    name: 'Computer Science & AI',
    description: 'Foundations of algorithms, artificial intelligence, and machine learning architectures.',
    iconName: 'Cpu',
    topics: ['Machine Learning Basics', 'Neural Networks', 'Hash Tables & Search', 'Object-Oriented Design', 'Distributed Systems'],
  },
  {
    id: 'bio-life',
    name: 'Biology & Life Sciences',
    description: 'Cellular biology, genetic replication, metabolic cycles, and evolutionary systems.',
    iconName: 'Dna',
    topics: ['Photosynthesis', 'DNA Replication', 'Cellular Respiration', 'Immune System Responses', 'CRISPR & Gene Editing'],
  },
  {
    id: 'phys-sci',
    name: 'Physics & Mechanics',
    description: 'Classical Newtonian dynamics, energy conservation, electromagnetism, and relativity.',
    iconName: 'Atom',
    topics: ["Newton's Laws of Motion", 'Thermodynamics', 'Special Relativity', 'Wave-Particle Duality', 'Quantum Entanglement'],
  },
  {
    id: 'econ-fin',
    name: 'Economics & Markets',
    description: 'Microeconomic dynamics, price elasticity, market equilibrium, and macroeconomic policies.',
    iconName: 'TrendingUp',
    topics: ['Supply and Demand Equilibrium', 'Inflation and Monetary Policy', 'Opportunity Cost & Comparative Advantage', 'Market Structures'],
  },
];

const INITIAL_QUESTIONS: Question[] = [
  {
    id: 'q-ml-1',
    subjectId: 'cs-ai',
    subjectName: 'Computer Science & AI',
    topic: 'Machine Learning Basics',
    questionText: 'What is Machine Learning? Explain how it works and how it differs from traditional rule-based programming in your own words.',
    difficulty: 'Beginner',
    expectedDurationSeconds: 60,
    referenceAnswer: 'Machine Learning is a subset of artificial intelligence where algorithms learn patterns directly from data rather than following hardcoded, explicit rules. In traditional programming, humans write explicit logic and input data to produce answers. In machine learning, algorithms receive data and known answers to learn the underlying rules or mathematical patterns. The process involves training on historical data, evaluating on validation sets, and generalizing to make predictions on unseen data.',
    importantConcepts: [
      { id: 'c1', name: 'Learning from Data', description: 'Algorithms deduce rules or statistical patterns from data rather than hand-coded logic.', weight: 1.2, mandatory: true },
      { id: 'c2', name: 'Contrast with Traditional Programming', description: 'Rules + Data = Answers vs Data + Answers = Rules/Model.', weight: 1.0, mandatory: true },
      { id: 'c3', name: 'Training and Generalization', description: 'Iterative parameter adjustment during training to accurately predict on unseen data.', weight: 1.0, mandatory: false },
      { id: 'c4', name: 'Feature Extraction / Pattern Recognition', description: 'Identifying relevant features or patterns to map inputs to targets.', weight: 0.8, mandatory: false },
    ],
    keywords: ['data', 'patterns', 'rules', 'traditional programming', 'training', 'generalization', 'model', 'prediction', 'algorithm'],
    scoringConfig: {
      semanticWeight: 0.40,
      conceptWeight: 0.40,
      relevanceWeight: 0.20,
    },
  },
  {
    id: 'q-ht-2',
    subjectId: 'cs-ai',
    subjectName: 'Computer Science & AI',
    topic: 'Hash Tables & Search',
    questionText: 'Explain how a Hash Table operates, how it achieves average O(1) time complexity for lookups, and how collisions are handled.',
    difficulty: 'Intermediate',
    expectedDurationSeconds: 75,
    referenceAnswer: 'A hash table is a key-value data structure that achieves average O(1) constant time complexity for insertions, deletions, and lookups. It works by taking a key and passing it through a hash function that computes an integer index corresponding to a slot in an underlying array. When two distinct keys hash to the same bucket index, a collision occurs. Common collision resolution strategies include separate chaining (storing colliding items in linked lists or balanced trees at the bucket) and open addressing (such as linear or quadratic probing to find the next available array slot).',
    importantConcepts: [
      { id: 'c1', name: 'Hash Function & Bucket Indexing', description: 'Deterministic function mapping arbitrary keys to array index integers.', weight: 1.0, mandatory: true },
      { id: 'c2', name: 'Average O(1) Constant Time', description: 'Direct array indexing allows instantaneous lookups without linear scanning.', weight: 1.0, mandatory: true },
      { id: 'c3', name: 'Collision Handling Mechanisms', description: 'Resolution via separate chaining (linked lists) or open addressing (probing).', weight: 1.2, mandatory: true },
      { id: 'c4', name: 'Load Factor and Resizing', description: 'Dynamic resizing when the table fills up to prevent performance degradation to O(n).', weight: 0.8, mandatory: false },
    ],
    keywords: ['hash function', 'constant time', 'O(1)', 'collision', 'separate chaining', 'open addressing', 'array index', 'key-value', 'load factor'],
    scoringConfig: {
      semanticWeight: 0.40,
      conceptWeight: 0.40,
      relevanceWeight: 0.20,
    },
  },
  {
    id: 'q-photo-3',
    subjectId: 'bio-life',
    subjectName: 'Biology & Life Sciences',
    topic: 'Photosynthesis',
    questionText: 'Explain the biological process of Photosynthesis. Detail what occurs in the light-dependent reactions versus the light-independent Calvin cycle.',
    difficulty: 'Intermediate',
    expectedDurationSeconds: 90,
    referenceAnswer: 'Photosynthesis is the biochemical process by which autotrophs convert sunlight, water, and carbon dioxide into chemical energy in the form of glucose, releasing oxygen as a byproduct. In the light-dependent reactions within thylakoid membranes, chlorophyll absorbs photons, splitting water molecules (photolysis) to generate ATP, NADPH, and oxygen gas. In the light-independent Calvin cycle occurring in the stroma, the enzyme RuBisCO fixes atmospheric CO2 using the stored ATP and NADPH chemical energy to synthesize high-energy carbohydrates (glucose).',
    importantConcepts: [
      { id: 'c1', name: 'Overall Energy Conversion & Equation', description: 'Conversion of sunlight + CO2 + H2O into glucose (C6H12O6) and O2.', weight: 1.0, mandatory: true },
      { id: 'c2', name: 'Light-Dependent Reactions (Thylakoids)', description: 'Photon absorption by chlorophyll, water photolysis, generation of ATP and NADPH.', weight: 1.2, mandatory: true },
      { id: 'c3', name: 'Calvin Cycle / Carbon Fixation (Stroma)', description: 'Use of ATP/NADPH energy and RuBisCO to fix carbon dioxide into sugar molecules.', weight: 1.2, mandatory: true },
      { id: 'c4', name: 'Organelle Localization (Chloroplast)', description: 'Thylakoid membranes versus stroma compartmentation.', weight: 0.6, mandatory: false },
    ],
    keywords: ['photosynthesis', 'chlorophyll', 'thylakoid', 'stroma', 'light-dependent', 'Calvin cycle', 'ATP', 'NADPH', 'carbon fixation', 'glucose', 'water splitting'],
    scoringConfig: {
      semanticWeight: 0.40,
      conceptWeight: 0.40,
      relevanceWeight: 0.20,
    },
  },
  {
    id: 'q-dna-4',
    subjectId: 'bio-life',
    subjectName: 'Biology & Life Sciences',
    topic: 'DNA Replication',
    questionText: 'Describe the semi-conservative model of DNA replication. What are the key enzymes involved and how do leading and lagging strands differ?',
    difficulty: 'Advanced',
    expectedDurationSeconds: 90,
    referenceAnswer: 'DNA replication is semi-conservative, meaning each newly formed double helix consists of one conserved template strand and one newly synthesized daughter strand. Key enzymes include Helicase (unwinds the replication fork), Primase (synthesizes RNA primers), DNA Polymerase (adds complementary nucleotides in the 5 to 3 direction and proofreads), and Ligase (seals phosphodiester backbone gaps). Because DNA polymerase only works in the 5 to 3 direction, the leading strand is synthesized continuously towards the fork, while the lagging strand is synthesized discontinuously away from the fork as Okazaki fragments that are subsequently joined by DNA ligase.',
    importantConcepts: [
      { id: 'c1', name: 'Semi-Conservative Nature', description: 'Each new double helix retains one parent strand and one synthesized strand.', weight: 1.0, mandatory: true },
      { id: 'c2', name: 'Key Replication Enzymes', description: 'Roles of Helicase, DNA Polymerase, Primase, and DNA Ligase.', weight: 1.2, mandatory: true },
      { id: 'c3', name: 'Directionality and Strand Asymmetry', description: 'Synthesis occurs strictly 5 prime to 3 prime.', weight: 1.0, mandatory: true },
      { id: 'c4', name: 'Leading vs. Lagging (Okazaki Fragments)', description: 'Continuous synthesis vs discontinuous fragments joined by ligase.', weight: 1.2, mandatory: true },
    ],
    keywords: ['semi-conservative', 'helicase', 'DNA polymerase', 'ligase', 'primase', 'leading strand', 'lagging strand', 'Okazaki fragments', '5 to 3 direction'],
    scoringConfig: {
      semanticWeight: 0.40,
      conceptWeight: 0.40,
      relevanceWeight: 0.20,
    },
  },
  {
    id: 'q-newton-5',
    subjectId: 'phys-sci',
    subjectName: 'Physics & Mechanics',
    topic: "Newton's Laws of Motion",
    questionText: "Explain Newton's Third Law of Motion. Why do action and reaction forces not simply cancel each other out?",
    difficulty: 'Beginner',
    expectedDurationSeconds: 60,
    referenceAnswer: "Newton's Third Law states that for every action, there is an equal and opposite reaction; whenever object A exerts a force on object B, object B exerts an equal magnitude force in the exact opposite direction on object A. These forces never cancel each other out to prevent acceleration because action-reaction pairs act on two completely different objects, not on the same body. For example, when you walk, your foot pushes backward on the ground, and the ground pushes forward on your foot; the forward force accelerates you, while the backward force slightly acts on the Earth.",
    importantConcepts: [
      { id: 'c1', name: 'Equal and Opposite Force Pairs', description: 'Forces always occur in matched pairs equal in magnitude and opposite in vector direction.', weight: 1.0, mandatory: true },
      { id: 'c2', name: 'Action on Different Bodies', description: 'Action and reaction forces act on separate objects, so they do not sum to zero on a single body.', weight: 1.4, mandatory: true },
      { id: 'c3', name: 'Real-world Physics Example', description: 'Clear demonstration (e.g., walking, rocket propulsion, swimming, or jumping).', weight: 0.8, mandatory: false },
    ],
    keywords: ['action', 'reaction', 'equal and opposite', 'different objects', 'different bodies', 'cancel out', 'acceleration', 'force pair'],
    scoringConfig: {
      semanticWeight: 0.40,
      conceptWeight: 0.40,
      relevanceWeight: 0.20,
    },
  },
  {
    id: 'q-econ-6',
    subjectId: 'econ-fin',
    subjectName: 'Economics & Markets',
    topic: 'Supply and Demand Equilibrium',
    questionText: 'Explain how the interaction between market supply and demand establishes equilibrium price and quantity, and what happens during a shortage or surplus.',
    difficulty: 'Intermediate',
    expectedDurationSeconds: 70,
    referenceAnswer: 'Market equilibrium occurs at the intersection of the downward-sloping demand curve and upward-sloping supply curve, where the quantity demanded by consumers precisely equals the quantity supplied by producers at the equilibrium price. If price is above equilibrium, quantity supplied exceeds quantity demanded, creating a surplus; producers compete by cutting prices until balance is restored. If price is below equilibrium, quantity demanded exceeds supply, creating a shortage; buyers compete, bidding prices upward until the market clears.',
    importantConcepts: [
      { id: 'c1', name: 'Market Equilibrium Point', description: 'Intersection where quantity demanded equals quantity supplied with no tendency for change.', weight: 1.2, mandatory: true },
      { id: 'c2', name: 'Dynamics of Surplus', description: 'Price above equilibrium leads to excess supply, downward price pressure.', weight: 1.0, mandatory: true },
      { id: 'c3', name: 'Dynamics of Shortage', description: 'Price below equilibrium leads to excess demand, upward bidding on prices.', weight: 1.0, mandatory: true },
      { id: 'c4', name: 'Price Mechanism as Signal', description: 'Price shifts signal resource allocation and incentivize buyer and seller behaviors.', weight: 0.8, mandatory: false },
    ],
    keywords: ['supply', 'demand', 'equilibrium', 'surplus', 'shortage', 'market clearing price', 'quantity demanded', 'quantity supplied'],
    scoringConfig: {
      semanticWeight: 0.40,
      conceptWeight: 0.40,
      relevanceWeight: 0.20,
    },
  },
];

const INITIAL_USERS: User[] = [
  {
    id: 'user-student-demo',
    name: 'Alex Rivera',
    email: 'alex.student@learnsense.edu',
    role: 'student',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    institution: 'Horizon Academy of Sciences',
    gradeLevel: 'Undergraduate Year 2',
  },
  {
    id: 'user-teacher-demo',
    name: 'Dr. Elena Rostova',
    email: 'elena.teacher@learnsense.edu',
    role: 'teacher',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    institution: 'Department of Computer Science & Pedagogy',
  },
];

const INITIAL_ASSESSMENTS: AssessmentResult[] = [
  {
    id: 'asmt-sample-1',
    studentId: 'user-student-demo',
    studentName: 'Alex Rivera',
    questionId: 'q-ml-1',
    questionText: 'What is Machine Learning? Explain how it works and how it differs from traditional rule-based programming in your own words.',
    subjectName: 'Computer Science & AI',
    topicName: 'Machine Learning Basics',
    difficulty: 'Beginner',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    audioDuration: 42.5,
    transcription: 'Machine learning is basically where computers learn directly from data instead of a programmer coding every single rule by hand. In normal software, you write if-else rules and feed inputs to get outputs. But in machine learning, you give the system inputs along with example outputs, and the model figures out the mathematical patterns. It trains over many epochs and then it can predict on new unseen data.',
    transcriptionConfidence: 0.96,
    semanticSimilarity: 88,
    conceptCoverage: 90,
    answerRelevance: 95,
    speechFluency: 84,
    understandingScore: 90,
    speechAnalysis: {
      durationSeconds: 42.5,
      wordCount: 78,
      speakingRateWpm: 110,
      pauseCount: 4,
      pauseDurationSeconds: 4.8,
      pauseRatio: 0.11,
      speechConsistency: 'Smooth',
      fluencyScore: 84,
      acousticFeedback: 'Pacing was deliberate and very clear. Pauses matched natural syntactic boundaries between conceptual points.',
    },
    conceptsEvaluated: [
      {
        conceptName: 'Learning from Data',
        status: 'understood',
        evidenceSnippet: 'computers learn directly from data instead of a programmer coding every single rule',
        explanation: 'Accurately articulated the distinction between learning parameters and writing manual instructions.',
      },
      {
        conceptName: 'Contrast with Traditional Programming',
        status: 'understood',
        evidenceSnippet: 'In normal software, you write if-else rules... in machine learning you give inputs with example outputs',
        explanation: 'Excellent, intuitive explanation of the inverted paradigm.',
      },
      {
        conceptName: 'Training and Generalization',
        status: 'understood',
        evidenceSnippet: 'It trains over many epochs and then it can predict on new unseen data',
        explanation: 'Understands model training and the goal of generalizing to unseen instances.',
      },
      {
        conceptName: 'Feature Extraction / Pattern Recognition',
        status: 'partially_understood',
        evidenceSnippet: 'figures out the mathematical patterns',
        explanation: 'Mentioned mathematical patterns, but did not explicitly detail feature representation.',
      },
    ],
    strengths: [
      'Crisp contrast drawn between procedural programming rules and trained statistical models.',
      'Clear vocabulary regarding training epochs and generalizing to unseen test data.',
      'Strong speaking cadence with natural cognitive pauses.',
    ],
    missedConcepts: [
      'Could explicitly discuss how loss functions or optimization guide parameter updates.',
    ],
    improvementAreas: [
      'Briefly cite an example of loss minimization (like gradient descent) to elevate the technical depth.',
    ],
    aiFeedback: 'Superb conceptual grasp of machine learning foundations! You explained the inverted paradigm with genuine intuition rather than memorized jargon. Your pacing was composed and easy to follow.',
    recommendedTopics: ['Gradient Descent Optimization', 'Supervised vs Unsupervised Learning'],
    scoringConfig: {
      semanticWeight: 0.40,
      conceptWeight: 0.40,
      relevanceWeight: 0.20,
    },
  },
  {
    id: 'asmt-sample-2',
    studentId: 'user-student-demo',
    studentName: 'Alex Rivera',
    questionId: 'q-newton-5',
    questionText: "Explain Newton's Third Law of Motion. Why do action and reaction forces not simply cancel each other out?",
    subjectName: 'Physics & Mechanics',
    topicName: "Newton's Laws of Motion",
    difficulty: 'Beginner',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    audioDuration: 38.0,
    transcription: "Newton's third law says for every action force there is an equal and opposite reaction force. People often wonder why things move if the forces are equal and opposite. The crucial thing is that the action force and reaction force act on two entirely different objects. For example, when a swimmer pushes back against the water, the water pushes forward on the swimmer. Because the forces act on different bodies, they don't cancel out on the swimmer.",
    transcriptionConfidence: 0.98,
    semanticSimilarity: 92,
    conceptCoverage: 95,
    answerRelevance: 96,
    speechFluency: 88,
    understandingScore: 94,
    speechAnalysis: {
      durationSeconds: 38.0,
      wordCount: 82,
      speakingRateWpm: 129,
      pauseCount: 3,
      pauseDurationSeconds: 3.2,
      pauseRatio: 0.08,
      speechConsistency: 'Smooth',
      fluencyScore: 88,
      acousticFeedback: 'Very fluid speech rhythm with crisp articulation and zero disruptive hesitation.',
    },
    conceptsEvaluated: [
      {
        conceptName: 'Equal and Opposite Force Pairs',
        status: 'understood',
        evidenceSnippet: 'for every action force there is an equal and opposite reaction force',
        explanation: 'Correct statement of magnitude parity and directional opposition.',
      },
      {
        conceptName: 'Action on Different Bodies',
        status: 'understood',
        evidenceSnippet: 'the action force and reaction force act on two entirely different objects',
        explanation: 'Directly resolved the common student misconception about cancellation.',
      },
      {
        conceptName: 'Real-world Physics Example',
        status: 'understood',
        evidenceSnippet: 'when a swimmer pushes back against the water, the water pushes forward on the swimmer',
        explanation: 'Applied the principle accurately to a fluid mechanics swimming example.',
      },
    ],
    strengths: [
      'Zeroed in immediately on the core physics principle: forces act on different bodies.',
      'Swimmer propulsion analogy was clean and mechanically correct.',
      'Natural, confident spoken delivery.',
    ],
    missedConcepts: [],
    improvementAreas: [
      'Could touch on F=ma to explain why unequal accelerations occur when masses differ drastically (like Earth vs ball).',
    ],
    aiFeedback: 'Outstanding explanation! You tackled the hardest conceptual trap in introductory mechanics with total clarity. The swimmer example made your logic crystal clear.',
    recommendedTopics: ['Conservation of Linear Momentum', 'Free Body Diagrams in Mechanics'],
    scoringConfig: {
      semanticWeight: 0.40,
      conceptWeight: 0.40,
      relevanceWeight: 0.20,
    },
  },
];

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn('Could not read existing database.json, initializing fresh store:', err);
    }
    const initial: DatabaseSchema = {
      users: INITIAL_USERS,
      subjects: INITIAL_SUBJECTS,
      questions: INITIAL_QUESTIONS,
      assessments: INITIAL_ASSESSMENTS,
    };
    this.save(initial);
    return initial;
  }

  private save(data: DatabaseSchema) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing database.json:', err);
    }
  }

  getUsers(): User[] {
    return this.data.users;
  }

  getUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(user: User): User {
    this.data.users.push(user);
    this.save(this.data);
    return user;
  }

  getSubjects(): Subject[] {
    return this.data.subjects.map((sub) => {
      const qCount = this.data.questions.filter((q) => q.subjectId === sub.id).length;
      return { ...sub, questionCount: qCount };
    });
  }

  createSubject(subject: Subject): Subject {
    this.data.subjects.push(subject);
    this.save(this.data);
    return subject;
  }

  getQuestions(filter?: { subjectId?: string; difficulty?: string; topic?: string }): Question[] {
    let result = this.data.questions;
    if (filter?.subjectId) {
      result = result.filter((q) => q.subjectId === filter.subjectId);
    }
    if (filter?.difficulty) {
      result = result.filter((q) => q.difficulty === filter.difficulty);
    }
    if (filter?.topic) {
      result = result.filter((q) => q.topic.toLowerCase() === filter.topic?.toLowerCase());
    }
    return result;
  }

  getQuestionById(id: string): Question | undefined {
    return this.data.questions.find((q) => q.id === id);
  }

  createQuestion(question: Question): Question {
    this.data.questions.push(question);
    this.save(this.data);
    return question;
  }

  updateQuestion(id: string, updates: Partial<Question>): Question | null {
    const idx = this.data.questions.findIndex((q) => q.id === id);
    if (idx === -1) return null;
    this.data.questions[idx] = { ...this.data.questions[idx], ...updates };
    this.save(this.data);
    return this.data.questions[idx];
  }

  deleteQuestion(id: string): boolean {
    const prevLen = this.data.questions.length;
    this.data.questions = this.data.questions.filter((q) => q.id !== id);
    if (this.data.questions.length !== prevLen) {
      this.save(this.data);
      return true;
    }
    return false;
  }

  getAssessments(studentId?: string): AssessmentResult[] {
    if (studentId) {
      return this.data.assessments.filter((a) => a.studentId === studentId);
    }
    return this.data.assessments;
  }

  getAssessmentById(id: string): AssessmentResult | undefined {
    return this.data.assessments.find((a) => a.id === id);
  }

  saveAssessment(assessment: AssessmentResult): AssessmentResult {
    this.data.assessments.unshift(assessment);
    this.save(this.data);
    return assessment;
  }

  getStudentAnalytics(studentId: string): StudentAnalytics {
    const list = this.getAssessments(studentId);
    const user = this.getUserById(studentId) || { name: 'Student' };

    if (list.length === 0) {
      return {
        studentId,
        studentName: user.name,
        totalAssessments: 0,
        averageScore: 0,
        highestScore: 0,
        completedTopicsCount: 0,
        averageFluency: 0,
        scoreOverTime: [],
        subjectMastery: [],
        topicPerformance: [],
        conceptCoverageTrend: [],
        strongestTopics: [],
        weakestTopics: [],
      };
    }

    const scores = list.map((a) => a.understandingScore);
    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const highestScore = Math.max(...scores);
    const uniqueTopics = Array.from(new Set(list.map((a) => a.topicName)));
    const avgFluency = Math.round(list.map((a) => a.speechFluency).reduce((a, b) => a + b, 0) / list.length);

    const scoreOverTime = [...list]
      .reverse()
      .map((a) => ({
        date: new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: a.understandingScore,
        topic: a.topicName,
      }));

    const subjectMap: Record<string, { total: number; count: number }> = {};
    const topicMap: Record<string, { total: number; count: number; difficulty: string }> = {};

    list.forEach((a) => {
      if (!subjectMap[a.subjectName]) subjectMap[a.subjectName] = { total: 0, count: 0 };
      subjectMap[a.subjectName].total += a.understandingScore;
      subjectMap[a.subjectName].count += 1;

      if (!topicMap[a.topicName]) topicMap[a.topicName] = { total: 0, count: 0, difficulty: a.difficulty };
      topicMap[a.topicName].total += a.understandingScore;
      topicMap[a.topicName].count += 1;
    });

    const subjectMastery = Object.entries(subjectMap).map(([subject, data]) => ({
      subject,
      score: Math.round(data.total / data.count),
      count: data.count,
    }));

    const topicPerformance = Object.entries(topicMap).map(([topic, data]) => ({
      topic,
      score: Math.round(data.total / data.count),
      difficulty: data.difficulty,
    }));

    const sortedTopics = [...topicPerformance].sort((a, b) => b.score - a.score);
    const strongestTopics = sortedTopics.slice(0, 3).map((t) => t.topic);
    const weakestTopics = sortedTopics.slice(-2).map((t) => t.topic);

    const conceptCoverageTrend = [...list]
      .reverse()
      .map((a) => ({
        date: new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        coverage: a.conceptCoverage,
      }));

    return {
      studentId,
      studentName: user.name,
      totalAssessments: list.length,
      averageScore: avgScore,
      highestScore,
      completedTopicsCount: uniqueTopics.length,
      averageFluency: avgFluency,
      scoreOverTime,
      subjectMastery,
      topicPerformance,
      conceptCoverageTrend,
      strongestTopics,
      weakestTopics,
    };
  }

  getTeacherOverview(): TeacherOverview {
    const assessments = this.data.assessments;
    const students = this.data.users.filter((u) => u.role === 'student');

    if (assessments.length === 0) {
      return {
        totalStudents: students.length,
        totalAssessments: 0,
        averageUnderstandingScore: 0,
        averageFluencyScore: 0,
        topPerformingTopics: [],
        weakestTopics: [],
        recentAssessments: [],
        commonMissedConcepts: [],
      };
    }

    const avgScore = Math.round(assessments.reduce((sum, a) => sum + a.understandingScore, 0) / assessments.length);
    const avgFluency = Math.round(assessments.reduce((sum, a) => sum + a.speechFluency, 0) / assessments.length);

    const topicMap: Record<string, { total: number; students: Set<string> }> = {};
    const missedConceptMap: Record<string, { count: number; topic: string }> = {};

    assessments.forEach((a) => {
      if (!topicMap[a.topicName]) {
        topicMap[a.topicName] = { total: 0, students: new Set() };
      }
      topicMap[a.topicName].total += a.understandingScore;
      topicMap[a.topicName].students.add(a.studentId);

      a.conceptsEvaluated
        .filter((c) => c.status === 'missed' || c.status === 'partially_understood')
        .forEach((c) => {
          if (!missedConceptMap[c.conceptName]) {
            missedConceptMap[c.conceptName] = { count: 0, topic: a.topicName };
          }
          missedConceptMap[c.conceptName].count += 1;
        });
    });

    const topicStats = Object.entries(topicMap).map(([topic, data]) => ({
      topic,
      score: Math.round(data.total / data.students.size),
      studentCount: data.students.size,
    }));

    topicStats.sort((a, b) => b.score - a.score);
    const topPerformingTopics = topicStats.slice(0, 3);
    const weakestTopics = [...topicStats].sort((a, b) => a.score - b.score).slice(0, 3);

    const commonMissedConcepts = Object.entries(missedConceptMap)
      .map(([conceptName, data]) => ({
        conceptName,
        count: data.count,
        topic: data.topic,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalStudents: students.length,
      totalAssessments: assessments.length,
      averageUnderstandingScore: avgScore,
      averageFluencyScore: avgFluency,
      topPerformingTopics,
      weakestTopics,
      recentAssessments: assessments.slice(0, 8),
      commonMissedConcepts,
    };
  }
}

export const db = new Database();
