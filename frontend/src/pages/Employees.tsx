import { useEffect, useState } from 'react';
import { Users, Plus, Trash2, Mail, Building2, Search } from 'lucide-react';
import { Button, Card, Input, Modal, EmptyState, LoadingSpinner, ErrorState } from '../components/ui';
import { getAllEmployees, createEmployee, deleteEmployee } from '../api';
import type { Employee, EmployeeCreate } from '../types';

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  
  // Form states
  const [formData, setFormData] = useState<EmployeeCreate>({
    employee_id: '',
    full_name: '',
    email: '',
    department: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<EmployeeCreate>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllEmployees();
      setEmployees(data);
    } catch (err) {
      setError('Failed to load employees. Please check if the server is running.');
      console.error('Fetch employees error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const validateForm = (): boolean => {
    const errors: Partial<EmployeeCreate> = {};
    
    if (!formData.employee_id.trim()) {
      errors.employee_id = 'Employee ID is required';
    }
    if (!formData.full_name.trim()) {
      errors.full_name = 'Full name is required';
    } else if (formData.full_name.trim().length < 2) {
      errors.full_name = 'Name must be at least 2 characters';
    }
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    if (!formData.department.trim()) {
      errors.department = 'Department is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setSubmitting(true);
      setSubmitError(null);
      
      await createEmployee(formData);
      
      // Reset form and close modal
      setFormData({ employee_id: '', full_name: '', email: '', department: '' });
      setFormErrors({});
      setIsAddModalOpen(false);
      
      // Refresh employees list
      await fetchEmployees();
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to add employee';
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEmployee = async () => {
    if (!selectedEmployee) return;
    
    try {
      setSubmitting(true);
      await deleteEmployee(selectedEmployee.employee_id);
      
      setIsDeleteModalOpen(false);
      setSelectedEmployee(null);
      
      // Refresh employees list
      await fetchEmployees();
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to delete employee';
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteModal = (employee: Employee) => {
    setSelectedEmployee(employee);
    setSubmitError(null);
    setIsDeleteModalOpen(true);
  };

  const filteredEmployees = employees.filter(emp => 
    emp.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.employee_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchEmployees} />;
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Employees</h1>
          <p className="mt-1 text-[var(--color-text-secondary)]">
            Manage your employee directory ({employees.length} total)
          </p>
        </div>
        <Button onClick={() => {
          setFormData({ employee_id: '', full_name: '', email: '', department: '' });
          setFormErrors({});
          setSubmitError(null);
          setIsAddModalOpen(true);
        }}>
          <Plus className="h-5 w-5" />
          Add Employee
        </Button>
      </div>

      {/* Search */}
      {employees.length > 0 && (
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--color-text-secondary)]" />
          <input
            type="text"
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
          />
        </div>
      )}

      {/* Employee List */}
      {employees.length === 0 ? (
        <Card className="p-0">
          <EmptyState
            icon={Users}
            title="No employees yet"
            description="Get started by adding your first employee to the system."
            action={
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="h-5 w-5" />
                Add Employee
              </Button>
            }
          />
        </Card>
      ) : filteredEmployees.length === 0 ? (
        <Card className="p-0">
          <EmptyState
            icon={Search}
            title="No results found"
            description={`No employees match "${searchQuery}". Try a different search term.`}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((employee) => (
            <Card key={employee.id} className="p-6 hover:border-[var(--color-accent)]/50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center">
                    <span className="text-lg font-semibold text-[var(--color-accent)]">
                      {employee.full_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--color-text-primary)]">
                      {employee.full_name}
                    </h3>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      {employee.employee_id}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => openDeleteModal(employee)}
                  className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] hover:bg-red-500/10 transition-colors"
                  title="Delete employee"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{employee.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                  <Building2 className="h-4 w-4" />
                  <span>{employee.department}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Employee Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Employee"
      >
        <form onSubmit={handleAddEmployee} className="space-y-4">
          {submitError && (
            <div className="p-3 rounded-lg bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/20 text-[var(--color-danger)] text-sm">
              {submitError}
            </div>
          )}
          
          <Input
            label="Employee ID"
            placeholder="e.g., EMP001"
            value={formData.employee_id}
            onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
            error={formErrors.employee_id}
          />
          
          <Input
            label="Full Name"
            placeholder="e.g., John Doe"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            error={formErrors.full_name}
          />
          
          <Input
            label="Email Address"
            type="email"
            placeholder="e.g., john@company.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={formErrors.email}
          />
          
          <Input
            label="Department"
            placeholder="e.g., Engineering"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            error={formErrors.department}
          />
          
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting}>
              Add Employee
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Employee"
        size="sm"
      >
        <div className="space-y-4">
          {submitError && (
            <div className="p-3 rounded-lg bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/20 text-[var(--color-danger)] text-sm">
              {submitError}
            </div>
          )}
          
          <p className="text-[var(--color-text-secondary)]">
            Are you sure you want to delete <strong className="text-[var(--color-text-primary)]">{selectedEmployee?.full_name}</strong>? 
            This will also remove all their attendance records. This action cannot be undone.
          </p>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteEmployee}
              isLoading={submitting}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
