import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '../../layouts/AppLayout';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { jobsAPI } from '../../services/api';
import type { Job } from '../../types';
import {
  Briefcase,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
  Search,
  Bell,
  Sparkles,
  Target,
  XCircle,
  Gift,
  Calendar,
  AlertCircle,
  Lightbulb,
  BarChart3,
} from 'lucide-react';

export function DashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Removed fake data
  const notifications: any[] = [];
  const aiTips: any[] = [];

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await jobsAPI.getAll();
        setJobs(data);
      } catch (err) {
        console.error('Failed to load jobs', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const formatDate = (date: string) => {
    const d = new Date(date);
    const diff = Math.ceil(
      (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return `${diff} days ago`;
    return `${Math.floor(diff / 7)} weeks ago`;
  };

  const formatDeadline = (date?: string) => {
    if (!date) return 'No deadline';
    const diff = Math.ceil(
      (new Date(date).getTime() - Date.now()) /
        (1000 * 60 * 60 * 24),
    );
    if (diff < 0) return 'Expired';
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    return `${diff} days left`;
  };

  const recentJobs = jobs.slice(0, 10).map((job) => ({
    id: job.id,
    company: job.company_name,
    position: job.position,
    status: job.status,
    date: formatDate(job.created_at),
    deadline: formatDeadline(job.deadline),
  }));

  const filteredJobs = recentJobs.filter((job) => {
    const matchText =
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.position.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus =
      statusFilter === 'all' || job.status === statusFilter;
    return matchText && matchStatus;
  });

  // Weekly stats
  const calculateWeeklyData = () => {
    if (!jobs.length) return [];
    const now = new Date();
    return Array.from({ length: 4 }).map((_, i) => {
      const start = new Date(now);
      start.setDate(now.getDate() - (28 - i * 7));
      const end = new Date(start);
      end.setDate(start.getDate() + 7);

      const weekJobs = jobs.filter((j) => {
        const d = new Date(j.created_at);
        return d >= start && d < end;
      });

      return {
        week: `Week ${i + 1}`,
        applied: weekJobs.length,
        interviews: weekJobs.filter(
          (j) => j.status === 'interviewing',
        ).length,
        offers: weekJobs.filter((j) => j.status === 'offer').length,
      };
    });
  };

  const weeklyData = calculateWeeklyData();

  if (isLoading) {
    return (
      <AppLayout title="Dashboard">
        <div className="flex justify-center items-center h-64 text-gray-500">
          Loading dashboard...
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Dashboard"
      actions={
        <Link to="/jobs/add">
          <Button variant="tech-gradient" leftIcon={<Plus />}>
            Add Job
          </Button>
        </Link>
      }
    >
      {/* Applications */}
      <div className="glass-panel p-5 mb-6">
        <div className="flex justify-between mb-4">
          <h2 className="font-bold">Recent Applications</h2>
          <Link
            to="/jobs"
            className="text-sm text-blue-600 flex items-center gap-1"
          >
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Search + Filter */}
        <div className="flex gap-3 mb-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by company or position..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white text-gray-900 placeholder-gray-400"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white text-gray-900"
          >
            <option value="all">All Status</option>
            <option value="saved">Saved</option>
            <option value="applied">Applied</option>
            <option value="interviewing">Interviewing</option>
            <option value="offer">Offer</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {filteredJobs.length ? (
          filteredJobs.map((job) => (
            <div
              key={job.id}
              className="flex justify-between items-center py-3 border-b"
            >
              <div>
                <p className="font-semibold">{job.position}</p>
                <p className="text-xs text-gray-500">{job.company}</p>
              </div>
              <div className="flex items-center gap-4">
                <Badge status={job.status} />
                <span className="text-xs text-gray-400">
                  {job.deadline}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-gray-400">
            No jobs found
          </div>
        )}
      </div>

      {/* Weekly Trends */}
      {weeklyData.some(
        (w) => w.applied || w.interviews || w.offers,
      ) ? (
        <div className="glass-panel p-6">
          <h3 className="font-bold flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            Application Trends
          </h3>
          {weeklyData.map((w) => (
            <div key={w.week} className="mb-3">
              <p className="text-xs mb-1">{w.week}</p>
              <div className="flex gap-1 h-6">
                <div
                  className="bg-blue-500 text-white text-xs flex items-center justify-center"
                  style={{ width: `${w.applied * 10}%` }}
                >
                  {w.applied || ''}
                </div>
                <div
                  className="bg-purple-500 text-white text-xs flex items-center justify-center"
                  style={{ width: `${w.interviews * 10}%` }}
                >
                  {w.interviews || ''}
                </div>
                <div
                  className="bg-green-500 text-white text-xs flex items-center justify-center"
                  style={{ width: `${w.offers * 10}%` }}
                >
                  {w.offers || ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel p-6 text-center">
          <BarChart3 className="h-10 w-10 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No trend data yet</p>
        </div>
      )}
    </AppLayout>
  );
}
