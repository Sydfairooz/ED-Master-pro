export type Role = 'student' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  status?: 'active' | 'banned';
}


export interface Question {
  id: string;
  text: string;
  options: string[];
  correctOptionIndex: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  questions: Question[];
  endTime?: string;
  isEnded?: boolean;
}


export interface Attempt {
  id: string;
  userId: string;
  quizId: string;
  score: number;
  totalQuestions: number;
  timestamp: string;
}

export interface Database {
  users: User[];
  quizzes: Quiz[];
  attempts: Attempt[];
}
