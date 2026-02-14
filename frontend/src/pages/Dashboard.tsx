import { useEffect, useState } from 'react';
import { Users, UserCheck, UserX, TrendingUp, CalendarDays } from 'lucide-react';
import { Card, LoadingSpinner, ErrorState } from '../components/ui';
import { apiClient } from '../api';
import type { AttendanceSummary } from '../types';

interface DashboardStats {
  total_employees: number;
  present_today: number;
  absent_today: number;
  attendance_rate: number;
  date: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [summaries, setSummaries] = useState<AttendanceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [statsResponse, summaryResponse] = await Promise.all([
        apiClient.get<DashboardStats>('/api/dashboard/stats'),
        apiClient.get<AttendanceSummary[]>('/api/attendance/summary'),
      ]);
      
      setStats(statsResponse.data);
      setSummaries(summaryResponse.data);
    } catch (err) {
      setError('Failed to load dashboard data. Please check if the server is running.');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchData} />;
  }

  const statCards = [
    { 
      label: 'Total Employees', 
      value: stats?.total_employees ?? 0, 
      icon: Users, 
      color: 'blue',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-400'
    },
    { 
      label: 'Present Today', 
      value: stats?.present_today ?? 0, 
      icon: UserCheck, 
      color: 'green',
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-400'
    },
    { 
      label: 'Absent Today', 
      value: stats?.absent_today ?? 0, 
      icon: UserX, 
      color: 'red',
      bgColor: 'bg-red-500/10',
      textColor: 'text-red-400'
    },
    { 
      label: 'Attendance Rate', 
      value: `${stats?.attendance_rate ?? 0}%`, 
      icon: TrendingUp, 
      color: 'purple',
      bgColor: 'bg-purple-500/10',
      textColor: 'text-purple-400'
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Dashboard</h1>
          <p className="mt-1 text-[var(--color-text-secondary)]">
            Welcome to HRMS Lite - Your HR management overview
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
          <CalendarDays className="h-4 w-4" />
          {stats?.date ? new Date(stats.date).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }) : 'Today'}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-text-secondary)]">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold text-[var(--color-text-primary)]">
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Attendance Summary Table */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Attendance Summary
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Overview of attendance records per employee
          </p>
        </div>
        
        {summaries.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-[var(--color-text-secondary)]">
              No attendance records yet. Start by adding employees and marking attendance.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--color-surface-hover)]">
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                    Present
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                    Absent
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                    Total Days
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                    Attendance %
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {summaries.map((summary) => {
                  const attendancePercent = summary.total_days > 0 
                    ? Math.round((summary.total_present / summary.total_days) * 100) 
                    : 0;
                  
                  return (
                    <tr key={summary.employee_id} className="hover:bg-[var(--color-surface-hover)]">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-[var(--color-text-primary)]">
                            {summary.employee_name}
                          </p>
                          <p className="text-sm text-[var(--color-text-secondary)]">
                            {summary.employee_id}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-green-500/10 text-green-400 font-semibold">
                          {summary.total_present}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-red-500/10 text-red-400 font-semibold">
                          {summary.total_absent}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-[var(--color-text-primary)] font-medium">
                        {summary.total_days}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-24 h-2 bg-[var(--color-surface-hover)] rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                attendancePercent >= 80 ? 'bg-green-500' : 
                                attendancePercent >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${attendancePercent}%` }}
                            />
                          </div>
                          <span className={`text-sm font-medium ${
                            attendancePercent >= 80 ? 'text-green-400' : 
                            attendancePercent >= 50 ? 'text-yellow-400' : 'text-red-400'
                          }`}>
                            {attendancePercent}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
