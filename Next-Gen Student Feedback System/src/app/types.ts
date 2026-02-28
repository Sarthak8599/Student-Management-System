export type Role = 'student' | 'faculty' | 'admin';

export type Department = 'CS' | 'AIML' | 'ENTC' | 'CHEMICAL' | 'General';

export interface DepartmentInfo {
  id: string;
  name: Department;
  hod: string; // Head of Department
  description: string;
  isActive: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  department?: Department; // Mainly for students
  isOnline?: boolean;
  lastLogin?: string;
}

export interface Course {
  id: string;
  title: string;
  code: string;
  facultyId: string; // User ID
  department: Department;
  description?: string;
  customQuestions?: string[];
  isActive: boolean;
  feedbackForm?: FeedbackForm; // Associated feedback form
}

export interface Feedback {
  id: string;
  studentId: string;
  courseId: string;
  rating: number; // 1-5
  aspects: {
    clarity: number;
    engagement: number;
    materials: number;
    [key: string]: number; // Allow dynamic aspects
  };
  comments: string;
  timestamp: string; // ISO date
}

export interface FeedbackForm {
  id: string;
  name: string;
  courseId: string;
  facultyId: string;
  department: Department;
  questions: FeedbackQuestion[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackQuestion {
  id: string;
  type: 'rating' | 'text' | 'multiple';
  question: string;
  required: boolean;
  options?: string[]; // For multiple choice
}
