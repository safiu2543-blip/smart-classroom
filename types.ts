
export enum UserRole {
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT'
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  fatherName?: string;
  avatar?: string;
  themeColor?: string; // Hex code or Tailwind base name
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  timestamp: number;
  isRead: boolean;
  link?: string;
}

export interface Course {
  id: string;
  teacherId: string;
  name: string;
  subject: string;
  enrollmentCode: string;
  enrolledStudentIds: string[];
  pendingStudentIds: string[];
}

export interface LectureContent {
  id: string;
  courseId: string;
  title: string;
  type: 'note' | 'file' | 'link' | 'video' | 'voice';
  data: string;
  createdAt: number;
}

export interface AttendanceSession {
  id: string;
  courseId: string;
  code: string;
  startTime: number;
  endTime: number;
  isActive: boolean;
  latitude?: number;
  longitude?: number;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  courseId: string;
  timestamp: number;
  latitude?: number;
  longitude?: number;
  isProxyFlagged?: boolean;
  isManual?: boolean;
}
