import { type ReactNode } from 'react';
import { FieldValue } from 'firebase/firestore';

// ============================================================================
// USER & AUTH TYPES
// ============================================================================
export interface User {
  uid: string;
  name: string;
  email: string;
  role: 'admin' | 'siswa';
  jenjang: string;
  kelas: string;
  isActive: boolean;
  createdAt: string;
  serverCreatedAt?: FieldValue;
}

export interface AuthContextType {
  currentUser: User | null;
  authLoading: boolean;
}

// ============================================================================
// QUESTION BANK TYPES
// ============================================================================
export interface Question {
  id: string;
  jenjang: string;
  kelas: string;
  materi: string;
  submateri: string;
  difficulty: string;
  type: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  source: string;
  createdBy?: string;
  createdAt?: string;
  serverCreatedAt?: FieldValue;
  updatedAt?: string;
}

export interface QuestionFormData {
  id: string | null;
  jenjang: string;
  kelas: string;
  materi: string;
  submateri: string;
  difficulty: string;
  type: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  source: string;
}

export interface GeneratedQuestion extends Omit<Question, 'id'> {
  tempId: string;
}

// ============================================================================
// EXERCISE / PAKET LATIHAN TYPES
// ============================================================================
export interface Exercise {
  id: string;
  title: string;
  description: string;
  jenjang: string;
  kelas: string;
  materi: string;
  duration: number;
  difficulty: string;
  status: 'published' | 'draft';
  questionIds: string[];
  ownerId: string;
  createdByRole: string;
  visibility: string;
  createdAt?: string;
  publishedAt?: string;
  serverCreatedAt?: FieldValue;
  updatedAt?: string;
}

export interface ExerciseFormData {
  title: string;
  description: string;
  jenjang: string;
  kelas: string;
  materi: string;
  duration: number;
  difficulty: string;
  status: 'published' | 'draft';
  questionIds: string[];
}

// ============================================================================
// ATTEMPT / HASIL LATIHAN TYPES
// ============================================================================
export interface Attempt {
  id: string;
  userId: string;
  studentName: string;
  exerciseId: string;
  exerciseTitle: string;
  jenjang: string;
  materi: string;
  answers: Record<string, string>;
  questionSnapshot: Question[];
  score: number;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  durationUsed: number;
  submittedAt: string;
  serverSubmittedAt?: FieldValue;
  status: string;
}

// ============================================================================
// ACTIVITY LOG TYPES
// ============================================================================
export interface ActivityLog {
  id: string;
  userId: string;
  activity: string;
  description: string;
  createdAt: string;
  serverTs?: FieldValue;
}

// ============================================================================
// TOAST NOTIFICATION TYPES
// ============================================================================
export interface Toast {
  message: string;
  type: 'success' | 'error';
}

// ============================================================================
// LOGIN & REGISTER FORM TYPES
// ============================================================================
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  jenjang: string;
  kelas: string;
}

// ============================================================================
// AI GENERATOR FORM TYPES
// ============================================================================
export interface AIGeneratorForm {
  jenjang: string;
  kelas: string;
  materi: string;
  submateri: string;
  difficulty: string;
  count: number;
  type: string;
  abilityLevel: string;
}

// ============================================================================
// ADMIN STATS TYPES
// ============================================================================
export interface AdminStats {
  totalStudents: number;
  totalQuestions: number;
  totalExercises: number;
  totalAttempts: number;
  avgScore: number;
  byJenjang: Array<{ name: string; jumlah: number }>;
  scoreTrend: Array<{ name: string; nilai: number }>;
}

export interface StudentStats {
  myAttempts: Attempt[];
  totalDone: number;
  avgScore: number;
  highestScore: number;
  trendData: Array<{ name: string; nilai: number; judul: string }>;
  recommendedMateri: string[];
}

// ============================================================================
// PROTECTED ROUTE PROPS TYPES
// ============================================================================
export interface ProtectedRouteProps {
  allowedRole: string;
  children: ReactNode;
  onUnauthorized: () => void;
}

// ============================================================================
// PDF EXPORT TYPES
// ============================================================================
export interface ExportPDFConfig {
  title: string;
  subtitle: string;
  questions: Question[];
  includeAnswers?: boolean;
}

// ============================================================================
// CHART DATA TYPES
// ============================================================================
export interface ByJenjangData {
  name: string;
  jumlah: number;
}

export interface ScoreTrendData {
  name: string;
  nilai: number;
}

export interface StudentTrendData {
  name: string;
  nilai: number;
  judul: string;
}
