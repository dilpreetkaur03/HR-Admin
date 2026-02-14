// Employee types
export interface Employee {
  id: string;
  employee_id: string;
  full_name: string;
  email: string;
  department: string;
  created_at: string;
  updated_at: string;
}

export interface EmployeeCreate {
  employee_id: string;
  full_name: string;
  email: string;
  department: string;
}

// Attendance types
export type AttendanceStatus = 'Present' | 'Absent';

export interface Attendance {
  id: string;
  employee_id: string;
  date: string;
  status: AttendanceStatus;
  employee_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface AttendanceCreate {
  employee_id: string;
  date: string;
  status: AttendanceStatus;
}

export interface AttendanceSummary {
  employee_id: string;
  employee_name: string;
  total_present: number;
  total_absent: number;
  total_days: number;
}

// API response types
export interface ApiError {
  detail: string;
}

// Dashboard stats
export interface DashboardStats {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  attendanceRate: number;
}


