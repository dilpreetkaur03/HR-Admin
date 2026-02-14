import { useEffect, useState } from 'react';
import { CalendarCheck, Plus, Filter, UserCheck, UserX } from 'lucide-react';
import { Button, Card, Input, Select, Modal, EmptyState, LoadingSpinner, ErrorState, Badge } from '../components/ui';
import { getAllAttendance, markAttendance, getAllEmployees } from '../api';
import type { Attendance, AttendanceCreate, Employee } from '../types';

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterEmployee, setFilterEmployee] = useState('');
  
  // Modal state
  const [isMarkModalOpen, setIsMarkModalOpen] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState<AttendanceCreate>({
    employee_id: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Present',
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof AttendanceCreate, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [attendanceData, employeesData] = await Promise.all([
        getAllAttendance(startDate || undefined, endDate || undefined),
        getAllEmployees(),
      ]);
      
      setAttendance(attendanceData);
      setEmployees(employeesData);
    } catch (err) {
      setError('Failed to load attendance data. Please check if the server is running.');
      console.error('Fetch attendance error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFilter = async () => {
    try {
      setLoading(true);
      const data = await getAllAttendance(startDate || undefined, endDate || undefined);
      setAttendance(data);
    } catch (err) {
      console.error('Filter error:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setFilterEmployee('');
    fetchData();
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof AttendanceCreate, string>> = {};
    
    if (!formData.employee_id) {
      errors.employee_id = 'Please select an employee';
    }
    if (!formData.date) {
      errors.date = 'Date is required';
    }
    if (!formData.status) {
      errors.status = 'Status is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleMarkAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setSubmitting(true);
      setSubmitError(null);
      
      await markAttendance(formData);
      
      // Reset form and close modal
      setFormData({
        employee_id: '',
        date: new Date().toISOString().split('T')[0],
        status: 'Present',
      });
      setFormErrors({});
      setIsMarkModalOpen(false);
      
      // Refresh attendance list
      await fetchData();
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to mark attendance';
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAttendance = filterEmployee 
    ? attendance.filter(a => a.employee_id === filterEmployee)
    : attendance;

  if (loading && attendance.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error && attendance.length === 0) {
    return <ErrorState message={error} onRetry={fetchData} />;
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Attendance</h1>
          <p className="mt-1 text-[var(--color-text-secondary)]">
            Track and manage employee attendance ({attendance.length} records)
          </p>
        </div>
        <Button 
          onClick={() => {
            setFormData({
              employee_id: '',
              date: new Date().toISOString().split('T')[0],
              status: 'Present',
            });
            setFormErrors({});
            setSubmitError(null);
            setIsMarkModalOpen(true);
          }}
          disabled={employees.length === 0}
        >
          <Plus className="h-5 w-5" />
          Mark Attendance
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <Select
              label="Employee"
              value={filterEmployee}
              onChange={(e) => setFilterEmployee(e.target.value)}
              options={[
                { value: '', label: 'All Employees' },
                ...employees.map(emp => ({ value: emp.employee_id, label: emp.full_name }))
              ]}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleFilter}>
              <Filter className="h-4 w-4" />
              Apply
            </Button>
            <Button variant="ghost" onClick={clearFilters}>
              Clear
            </Button>
          </div>
        </div>
      </Card>

      {/* Attendance Records */}
      {employees.length === 0 ? (
        <Card className="p-0">
          <EmptyState
            icon={CalendarCheck}
            title="No employees to track"
            description="Add employees first before marking attendance."
          />
        </Card>
      ) : filteredAttendance.length === 0 ? (
        <Card className="p-0">
          <EmptyState
            icon={CalendarCheck}
            title="No attendance records"
            description={startDate || endDate || filterEmployee 
              ? "No records match your filters. Try adjusting the date range or employee filter."
              : "Start tracking attendance by marking an employee's status for today."
            }
            action={
              <Button onClick={() => setIsMarkModalOpen(true)}>
                <Plus className="h-5 w-5" />
                Mark Attendance
              </Button>
            }
          />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--color-surface-hover)]">
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                    Employee ID
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {filteredAttendance.map((record) => (
                  <tr key={record.id} className="hover:bg-[var(--color-surface-hover)]">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-[var(--color-text-primary)] font-medium">
                        {new Date(record.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-[var(--color-text-primary)]">
                        {record.employee_name || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-[var(--color-text-secondary)]">
                        {record.employee_id}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {record.status === 'Present' ? (
                        <Badge variant="success">
                          <UserCheck className="h-3 w-3 mr-1" />
                          Present
                        </Badge>
                      ) : (
                        <Badge variant="danger">
                          <UserX className="h-3 w-3 mr-1" />
                          Absent
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Mark Attendance Modal */}
      <Modal
        isOpen={isMarkModalOpen}
        onClose={() => setIsMarkModalOpen(false)}
        title="Mark Attendance"
      >
        <form onSubmit={handleMarkAttendance} className="space-y-4">
          {submitError && (
            <div className="p-3 rounded-lg bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/20 text-[var(--color-danger)] text-sm">
              {submitError}
            </div>
          )}
          
          <Select
            label="Employee"
            value={formData.employee_id}
            onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
            options={[
              { value: '', label: 'Select an employee' },
              ...employees.map(emp => ({ value: emp.employee_id, label: `${emp.full_name} (${emp.employee_id})` }))
            ]}
            error={formErrors.employee_id}
          />
          
          <Input
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            error={formErrors.date}
          />
          
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[var(--color-text-secondary)]">
              Status
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'Present' })}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                  formData.status === 'Present'
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-[var(--color-border)] hover:border-green-500/50'
                }`}
              >
                <UserCheck className={`h-6 w-6 ${formData.status === 'Present' ? 'text-green-400' : 'text-[var(--color-text-secondary)]'}`} />
                <span className={`font-medium ${formData.status === 'Present' ? 'text-green-400' : 'text-[var(--color-text-secondary)]'}`}>
                  Present
                </span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'Absent' })}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                  formData.status === 'Absent'
                    ? 'border-red-500 bg-red-500/10'
                    : 'border-[var(--color-border)] hover:border-red-500/50'
                }`}
              >
                <UserX className={`h-6 w-6 ${formData.status === 'Absent' ? 'text-red-400' : 'text-[var(--color-text-secondary)]'}`} />
                <span className={`font-medium ${formData.status === 'Absent' ? 'text-red-400' : 'text-[var(--color-text-secondary)]'}`}>
                  Absent
                </span>
              </button>
            </div>
            {formErrors.status && (
              <p className="text-sm text-[var(--color-danger)]">{formErrors.status}</p>
            )}
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsMarkModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting}>
              Mark Attendance
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
