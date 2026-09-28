export interface PersonalInfo {
  fullName: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

export interface ExperienceItem {
  id: string;
  title: string;
  company: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  description: string;
}

export interface EducationItem {
  id: string;
  school: string;
  degree: string;
  startDate?: string;
  endDate?: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  techStack?: string;
  link?: string;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer?: string;
  date?: string;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: string[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
  meta?: { template: string };
}

export const genId = () => Math.random().toString(36).slice(2, 10);