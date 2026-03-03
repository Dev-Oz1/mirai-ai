import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { AppLayout } from '../../layouts/AppLayout';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { jobsAPI } from '../../services/api';
import type { Job } from '../../types';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  MapPin,
  DollarSign,
  Edit,
  Trash2,
  AlertCircle,
  Briefcase,
} from 'lucide-react';

export function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const buttonRefs = useRef<{ [key: number]: HTMLButtonElement | null }>({});

  // Fetch jobs
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      const fetchedJobs = await jobsAPI.getAll();
      setJobs(fetchedJobs);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter jobs
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Handle menu toggle
  const handleMenuToggle = (jobId: number) => {
    if (openMenuId === jobId) {
      setOpenMenuId(null);
    } else {
      const button = buttonRefs.current[jobId];
      if (button) {
        const rect = button.getBoundingClientRect();
        setMenuPosition({
          top: rect.bottom + window.scrollY + 5,
          right: window.innerWidth - rect.right + window.scrollX,
        });
      }
      setOpenMenuId(jobId);
    }
  };

  // Delete job
  const handleDeleteClick = (job: Job) => {
    setJobToDelete(job);
    setShowDeleteModal(true);
    setOpenMenuId(null);
  };

  const handleDeleteConfirm = async () => {
    if (!jobToDelete) return;

    try {
      setIsDeleting(true);
      await jobsAPI.delete(jobToDelete.id);
      setJobs(jobs.filter((j) => j.id !== jobToDelete.id));
      setShowDeleteModal(false);
      setJobToDelete(null);
    } catch (error) {
      console.error('Failed to delete job:', error);
      alert('Failed to delete job. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <AppLayout title="My Applications" actions={<div></div>}>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading jobs...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="My Applications"
      actions={
        <Link to="/jobs/add">
          <Button variant="tech-gradient" leftIcon={<Plus className="h-4 w-4" />}>
            Add Job
          </Button>
        </Link>
      }
    >
      {/* Filters & Search */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by company or position..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-10 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none min-w-[140px]"
          >
            <option value="all">All Status</option>
            <option value="saved">Saved</option>
            <option value="applied">Applied</option>
            <option value="interviewing">Interviewing</option>
            <option value="offer">Offer</option>
            <option value="rejected">Rejected</option>
            <option value="withdrawn">Withdrawn</option>
          </select>
        </div>
      </div>

      {/* Jobs List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-bold text-gray-700 uppercase text-xs tracking-wider">
                  Company & Role
                </th>
                <th className="px-6 py-4 font-bold text-gray-700 uppercase text-xs tracking-wider hidden md:table-cell">
                  Details
                </th>
                <th className="px-6 py-4 font-bold text-gray-700 uppercase text-xs tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 font-bold text-gray-700 uppercase text-xs tracking-wider hidden sm:table-cell">
                  Date Added
                </th>
                <th className="px-6 py-4 font-bold text-gray-700 uppercase text-xs tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                  <tr
                    key={job.id}
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    {/* Company & Role */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-600 font-bold text-lg flex-shrink-0 shadow-sm">
                          {job.company_name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {job.position}
                          </div>
                          <div className="text-gray-500 text-xs font-medium">
                            {job.company_name}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Details */}
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="space-y-1">
                        {job.location && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                            <MapPin className="h-3 w-3" /> {job.location}
                          </div>
                        )}
                        {job.salary_range && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                            <DollarSign className="h-3 w-3" /> {job.salary_range}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <Badge status={job.status} />
                    </td>

                    {/* Date Added */}
                    <td className="px-6 py-4 hidden sm:table-cell text-gray-500 text-xs font-medium">
                      {formatDate(job.created_at)}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex justify-end">
                        <button
                          ref={(el) => { buttonRefs.current[job.id] = el; }}
                          onClick={() => handleMenuToggle(job.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium mb-2">
                      {jobs.length === 0 ? 'No jobs yet' : 'No jobs found'}
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      {jobs.length === 0
                        ? 'Start tracking your job applications by adding your first job.'
                        : 'Try adjusting your search or filters.'}
                    </p>
                    {jobs.length === 0 && (
                      <Link to="/jobs/add">
                        <Button variant="tech-gradient" leftIcon={<Plus className="h-4 w-4" />}>
                          Add Your First Job
                        </Button>
                      </Link>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer with count */}
        {filteredJobs.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <span className="text-xs text-gray-500 font-medium">
              Showing {filteredJobs.length} of {jobs.length} jobs
            </span>
          </div>
        )}
      </div>

      {/* Dropdown Menu - Rendered via Portal */}
      {openMenuId !== null &&
        createPortal(
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-[998]"
              onClick={() => setOpenMenuId(null)}
            />

            {/* Menu */}
            <div
              className="fixed z-[999] bg-white border border-gray-200 rounded-lg shadow-xl py-1 min-w-[140px]"
              style={{
                top: `${menuPosition.top}px`,
                right: `${menuPosition.right}px`,
              }}
            >
              <Link
                to={`/jobs/${openMenuId}`}
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setOpenMenuId(null)}
              >
                <Edit className="h-4 w-4 flex-shrink-0" />
                <span className="whitespace-nowrap">Edit</span>
              </Link>
              <button
                onClick={() => {
                  const job = jobs.find((j) => j.id === openMenuId);
                  if (job) handleDeleteClick(job);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="h-4 w-4 flex-shrink-0" />
                <span className="whitespace-nowrap">Delete</span>
              </button>
            </div>
          </>,
          document.body
        )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && jobToDelete && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !isDeleting && setShowDeleteModal(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Delete Job</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-gray-700 mb-6">
              Are you sure you want to delete{' '}
              <span className="font-semibold">
                {jobToDelete.position} at {jobToDelete.company_name}
              </span>
              ?
            </p>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteConfirm}
                isLoading={isDeleting}
                className="flex-1"
              >
                {isDeleting ? 'Deleting...' : 'Delete Job'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}