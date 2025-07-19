export interface CVAnalysis {
  globalScore: number;
  detailedScores: {
    clarity: number;
    impact: number;
    structure: number;
  };
  strengths: string[];
  improvements: string[];
  missingKeywords: string[];
  formatRecommendations: string[];
}

export interface JobOffer {
  title: string;
  company: string;
  description: string;
  requirements: string[];
  skills: string[];
}

export interface CVJobMatch {
  compatibilityRate: number;
  alignedSkills: string[];
  gaps: string[];
  adaptationTips: string[];
}

export interface CoverLetter {
  content: string;
  tone: 'formal' | 'dynamic' | 'creative';
}

export interface InterviewQuestion {
  id: string;
  question: string;
  type: 'general' | 'technical' | 'behavioral';
  timeLimit: number;
}

export interface InterviewFeedback {
  questionId: string;
  score: number;
  feedback: string;
  improvements: string[];
}

export interface SkillGap {
  skill: string;
  importance: 'high' | 'medium' | 'low';
  estimatedTime: string;
  resources: Resource[];
}

export interface Resource {
  title: string;
  type: 'video' | 'course' | 'article' | 'certification';
  url: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  description: string;
}

export interface UserSession {
  cvText?: string;
  cvAnalysis?: CVAnalysis;
  jobOffer?: JobOffer;
  cvJobMatch?: CVJobMatch;
  coverLetter?: CoverLetter;
  interviewResults?: {
    questions: InterviewQuestion[];
    answers: string[];
    feedback: InterviewFeedback[];
    globalScore: number;
  };
  skillGaps?: SkillGap[];
}