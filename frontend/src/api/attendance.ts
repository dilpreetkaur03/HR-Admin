import apiClient from './client';
import type { Attendance, AttendanceCreate, AttendanceSummary } from '../types';

const ATTENDANCE_ENDPOINT = '/api/attendance';

/**
 * Get all attendance records with optional date filtering
 */
export const getAllAttendance = async (
  startDate?: string,
  endDate?: string
): Promise<Attendance[]> => {
  const params = new URLSearchParams();
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  
  const queryString = params.toString();
  const url = queryString ? `${ATTENDANCE_ENDPOINT}?${queryString}` : ATTENDANCE_ENDPOINT;
  
  const response = await apiClient.get<Attendance[]>(url);
  return response.data;
};

/**
 * Get attendance records for a specific employee
 */
export const getEmployeeAttendance = async (
  employeeId: string,
  startDate?: string,
  endDate?: string
): Promise<Attendance[]> => {
  const params = new URLSearchParams();
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  
  const queryString = params.toString();
  const url = queryString 
    ? `${ATTENDANCE_ENDPOINT}/employee/${employeeId}?${queryString}` 
    : `${ATTENDANCE_ENDPOINT}/employee/${employeeId}`;
  
  const response = await apiClient.get<Attendance[]>(url);
  return response.data;
};

/**
 * Mark attendance for an employee
 */
export const markAttendance = async (attendance: AttendanceCreate): Promise<Attendance> => {
  const response = await apiClient.post<Attendance>(ATTENDANCE_ENDPOINT, attendance);
  return response.data;
};

/**
 * Get attendance summary for all employees
 */
export const getAttendanceSummary = async (): Promise<AttendanceSummary[]> => {
  const response = await apiClient.get<AttendanceSummary[]>(`${ATTENDANCE_ENDPOINT}/summary`);
  return response.data;
};

