import React, { useState, useEffect } from 'react';
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
  Search,
  Bell,
  Target,
  XCircle,
  Gift,
  Calendar,
  AlertCircle,
  Lightbulb,
  BarChart3,
  X,
  Mail,
  Edit,
} from 'lucide-react';

export function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showATSModal, setShowATSModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);

  // Real data from backend
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch jobs from backend
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const fetchedJobs = await jobsAPI.getAll();
        const normalizedJobs = Array.isArray(fetchedJobs)
          ? fetchedJobs
          : Array.isArray(fetchedJobs?.jobs)
            ? fetchedJobs.jobs
            : [];
        setJobs(normalizedJobs);
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Helper: Check if deadline is within 3 days
  function isExpiringSoon(deadline: string): boolean {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const daysLeft = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft <= 3 && daysLeft >= 0;
  }

  // Helper: Calculate jobs added this week
  function getJobsThisWeek(jobs: Job[]): number {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    return jobs.filter((job) => new Date(job.created_at) >= oneWeekAgo).length;
  }

  // Helper: Calculate applications this week
  function getApplicationsThisWeek(jobs: Job[]): number {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    return jobs.filter((job) => {
      if (!job.applied_date) return false;
      return new Date(job.applied_date) >= oneWeekAgo;
    }).length;
  }

  // Helper: Calculate rejection rate
  function getRejectionRate(jobs: Job[]): string {
    const totalApplications = jobs.filter((j) =>
      ['applied', 'interviewing', 'offer', 'rejected'].includes(j.status)
    ).length;
    if (totalApplications === 0) return '0%';

    const rejections = jobs.filter((j) => j.status === 'rejected').length;
    const rate = Math.round((rejections / totalApplications) * 100);
    return `${rate}% of total`;
  }

  // Calculate real stats from backend data
  const activeApplications = jobs.filter((j) => ['applied', 'interviewing'].includes(j.status)).length;
  const savedJobsCount = jobs.filter((j) => j.status === 'saved').length;
  const rejectedJobs = jobs.filter((j) => j.status === 'rejected').length;
  const offers = jobs.filter((j) => j.status === 'offer').length;

  const applicationsThisWeek = getApplicationsThisWeek(jobs);
  const savedExpiring = jobs.filter((j) => j.status === 'saved' && j.deadline && isExpiringSoon(j.deadline)).length;
  const jobsThisWeek = getJobsThisWeek(jobs);

  const stats = [
    {
      label: 'Active Applications',
      value: activeApplications.toString(),
      change:
        applicationsThisWeek > 0
          ? `+${applicationsThisWeek} this week`
          : activeApplications > 0
            ? 'No new applications'
            : 'Start applying!',
      icon: Briefcase,
      gradient: 'from-tech-cyan to-tech-blue',
    },
    {
      label: 'Jobs Saved',
      value: savedJobsCount.toString(),
      change:
        savedExpiring > 0
          ? `${savedExpiring} expiring soon`
          : savedJobsCount > 0
            ? jobsThisWeek > 0
              ? `+${jobsThisWeek} added this week`
              : 'Ready to apply'
            : 'Save jobs to track',
      icon: Target,
      gradient: 'from-purple-500 to-indigo-500',
    },
    {
      label: 'Jobs Rejected',
      value: rejectedJobs.toString(),
      change: rejectedJobs > 0 ? getRejectionRate(jobs) : 'Keep applying!',
      icon: XCircle,
      gradient: 'from-orange-500 to-red-500',
    },
    {
      label: 'Offers Received',
      value: offers.toString(),
      change:
        offers > 0
          ? offers === 1
            ? 'Congratulations! 🎉'
            : `${offers} offers pending`
          : activeApplications > 0
            ? 'Stay positive!'
            : 'Keep applying!',
      icon: Gift,
      gradient: 'from-green-500 to-emerald-500',
    },
  ];

  // Helper: Format date to "X days ago"
  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  }

  // Helper: Format deadline
  function formatDeadline(dateString: string | null): string {
    if (!dateString) return '';

    const deadline = new Date(dateString);
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day left';
    if (diffDays < 7) return `${diffDays} days left`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks left`;
    return `${Math.floor(diffDays / 30)} months left`;
  }

  // Convert backend jobs to display format (recent 10 jobs)
  const recentJobs = jobs
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10)
    .map((job) => ({
      id: job.id.toString(),
      company: job.company_name,
      position: job.position,
      status: job.status as 'saved' | 'applied' | 'interviewing' | 'offer' | 'rejected',
      date: formatDate(job.created_at),
      deadline: job.deadline ? formatDeadline(job.deadline) : '',
      hasUnread: false,
    }));

  // Generate smart notifications based on real data
  const notifications = [
    ...jobs
      .filter((j) => j.deadline && isExpiringSoon(j.deadline))
      .map((j) => ({
        id: `deadline-${j.id}`,
        message: `Application deadline for ${j.company_name} in ${formatDeadline(j.deadline!)}`,
        time: '1 hour ago',
        urgent: true,
      })),
    ...jobs
      .filter((j) => j.status === 'interviewing')
      .slice(0, 1)
      .map((j) => ({
        id: `interview-${j.id}`,
        message: `Interviewing with ${j.company_name} - prepare for your interview!`,
        time: '2 hours ago',
        urgent: false,
      })),
  ].slice(0, 3);

  // If no real notifications, show placeholder
  if (notifications.length === 0) {
    notifications.push({
      id: 'placeholder',
      message: 'No urgent notifications. Keep up the great work!',
      time: 'Just now',
      urgent: false,
    });
  }

  // Generate AI tips based on real data
  const aiTips: Array<{
    id: string;
    title: string;
    description: string;
    action: string;
    priority: 'high' | 'medium';
    onClick: () => void;
  }> = [];

  // Tip 1: Saved jobs needing action
  const savedJobsList = jobs.filter((j) => j.status === 'saved');
  if (savedJobsList.length >= 3) {
    aiTips.push({
      id: '1',
      title: `${savedJobsList.length} Saved Jobs Ready`,
      description: `You have ${savedJobsList.length} saved jobs. Start applying to increase your chances of landing interviews!`,
      action: 'View Saved Jobs',
      priority: 'high',
      onClick: () => (window.location.href = '/jobs?status=saved'),
    });
  }

  // Tip 2: Follow-up reminders
  const oldApplications = jobs.filter((j) => {
    if (j.status !== 'applied' || !j.applied_date) return false;
    const daysSince = Math.floor((new Date().getTime() - new Date(j.applied_date).getTime()) / (1000 * 60 * 60 * 24));
    return daysSince >= 7;
  });

  if (oldApplications.length > 0) {
    const job = oldApplications[0];
    aiTips.push({
      id: '2',
      title: 'Follow Up Reminder',
      description: `It's been ${Math.floor(
        (new Date().getTime() - new Date(job.applied_date!).getTime()) / (1000 * 60 * 60 * 24)
      )} days since you applied to ${job.company_name}. Consider sending a follow-up email.`,
      action: 'Draft Email',
      priority: 'medium',
      onClick: () => setShowEmailModal(true),
    });
  }

  // If no AI tips, show coming soon
  if (aiTips.length === 0) {
    aiTips.push({
      id: 'placeholder',
      title: 'AI Insights Coming Soon',
      description: 'Add more jobs to unlock personalized tips and recommendations powered by AI.',
      action: 'Add Job',
      priority: 'medium',
      onClick: () => (window.location.href = '/jobs/add'),
    });
  }

  // Filter jobs based on search and status
  const filteredJobs = recentJobs.filter((job) => {
    const matchesSearch =
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.position.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <AppLayout title="Dashboard" actions={<div></div>}>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading your dashboard...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Dashboard"
      actions={
        <Link to="/jobs/add">
          <Button variant="tech-gradient" leftIcon={<Plus className="h-4 w-4" />}>
            Add New Job
          </Button>
        </Link>
      }
    >
      {/* ============================= Stats ============================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="relative rounded-2xl bg-white border border-gray-100 p-6 shadow-sm overflow-hidden">
            <div
              className={`absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gradient-to-br ${stat.gradient} opacity-10`}
            />
            <div className="relative">
              <div
                className={`h-10 w-10 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-white mb-4`}
              >
                <stat.icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm font-medium text-gray-600">{stat.label}</p>
              <p className="text-xs text-tech-blue mt-1">{stat.change}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ========================== Notifications ========================== */}
      <div className="rounded-2xl bg-white border border-gray-100 p-4 mb-8 shadow-sm">
        <div className="flex items-start gap-3">
          <Bell className="h-5 w-5 text-blue-500 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-3">
              Recent Notifications
              <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                {notifications.filter((n) => n.urgent).length} urgent
              </span>
            </h3>
            <div className="space-y-2">
              {notifications.map((n) => (
                <div key={n.id} className="flex justify-between text-sm">
                  <div className="flex items-start gap-2">
                    {n.urgent && <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />}
                    <span className="text-gray-700">{n.message}</span>
                  </div>
                  <span className="text-xs text-gray-400">{n.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ======================== Applications & AI ======================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ---------------------- Recent Applications ---------------------- */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Recent Applications</h2>
            <Link to="/jobs" className="text-sm font-medium text-tech-blue flex items-center gap-1">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by company or position..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-900 placeholder-gray-400"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-900"
            >
              <option value="all">All Status</option>
              <option value="saved">Saved</option>
              <option value="applied">Applied</option>
              <option value="interviewing">Interviewing</option>
              <option value="offer">Offer</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm divide-y">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <div key={job.id} className="p-4 hover:bg-gray-50 transition">
                  <div className="flex justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{job.position}</p>
                      <p className="text-xs text-gray-500">{job.company}</p>
                    </div>
                    <Badge status={job.status} />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {job.date}
                    </span>
                    {job.deadline && (
                      <span
                        className={`flex items-center gap-1 ${
                          job.deadline.includes('day') && parseInt(job.deadline) <= 2 ? 'text-red-600 font-medium' : ''
                        }`}
                      >
                        <Calendar className="h-3 w-3" /> {job.deadline}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <p className="text-gray-500 mb-4">
                  {jobs.length === 0 ? 'No jobs yet. Add your first job to get started!' : 'No jobs match your filters'}
                </p>
                {jobs.length === 0 && (
                  <Link to="/jobs/add">
                    <Button variant="tech-gradient">Add Your First Job</Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* --------------------------- AI Insights -------------------------- */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-gray-900">AI Insights</h2>
          <div className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-purple-500 text-white flex items-center justify-center">
                <Lightbulb className="h-4 w-4" />
              </div>
              <h3 className="font-semibold text-gray-900">Smart Tips</h3>
            </div>

            <div className="space-y-3">
              {aiTips.map((tip) => (
                <div
                  key={tip.id}
                  className={`p-4 rounded-xl border ${
                    tip.priority === 'high' ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between mb-1">
                    <p className="font-medium text-gray-900 text-sm">{tip.title}</p>
                    {tip.priority === 'high' && (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">High</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{tip.description}</p>
                  <button onClick={tip.onClick} className="text-xs font-medium text-tech-blue flex items-center gap-1">
                    {tip.action} <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ============================== Modals ============================== */}

      {showEmailModal && (
        <Modal title="Follow-Up Email" onClose={() => setShowEmailModal(false)} icon={Mail}>
          <p className="text-sm text-gray-600">Draft email content goes here.</p>
        </Modal>
      )}

      {showResumeModal && (
        <Modal title="Update Resume" onClose={() => setShowResumeModal(false)} icon={Edit}>
          <p className="text-sm text-gray-600">Resume optimization details go here.</p>
        </Modal>
      )}

      {showATSModal && (
        <Modal title="ATS Analysis" onClose={() => setShowATSModal(false)} icon={BarChart3}>
          <p className="text-sm text-gray-600">ATS score breakdown goes here.</p>
        </Modal>
      )}
    </AppLayout>
  );
}

/* ============================= Modal Wrapper ============================= */

function Modal({ title, icon: Icon, onClose, children }: any) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-tech-blue" />
            <h3 className="font-semibold text-gray-900">{title}</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
