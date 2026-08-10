// frontend/types/resume.ts

export interface AnalysisData {
  matchScore: number;
  summary?: string;
  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
  recommendations?: string[];
}