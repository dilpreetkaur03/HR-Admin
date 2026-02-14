import apiClient from './client';
import type { Employee, EmployeeCreate } from '../types';

const EMPLOYEES_ENDPOINT = '/api/employees';

/**
 * Fetch all employees
 */
export const getAllEmployees = async (): Promise<Employee[]> => {
  const response = await apiClient.get<Employee[]>(EMPLOYEES_ENDPOINT);
  return response.data;
};

/**
 * Get a specific employee by employee_id
 */
export const getEmployee = async (employeeId: string): Promise<Employee> => {
  const response = await apiClient.get<Employee>(`${EMPLOYEES_ENDPOINT}/${employeeId}`);
  return response.data;
};

/**
 * Create a new employee
 */
export const createEmployee = async (employee: EmployeeCreate): Promise<Employee> => {
  const response = await apiClient.post<Employee>(EMPLOYEES_ENDPOINT, employee);
  return response.data;
};

/**
 * Delete an employee
 */
export const deleteEmployee = async (employeeId: string): Promise<void> => {
  await apiClient.delete(`${EMPLOYEES_ENDPOINT}/${employeeId}`);
};

