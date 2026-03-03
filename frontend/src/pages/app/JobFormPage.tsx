import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '../../layouts/AppLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { jobsAPI } from '../../services/api';
import type { Job, JobStatus } from '../../types';
import {
  Briefcase,
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  Link as LinkIcon,
  FileText,
  Save,
  X,
  ArrowLeft,
} from 'lucide-react';

export function JobFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    position: '',
    job_description: '',
    job_url: '',
    location: '',
    salary_range: '',
    status: 'saved' as JobStatus,
    applied_date: '',
    deadline: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch job if editing
  useEffect(() => {
    if (isEditing && id) {
      fetchJob(parseInt(id));
    }
  }, [id, isEditing]);

  const fetchJob = async (jobId: number) => {
    try {
      setIsLoading(true);
      const job: Job = await jobsAPI.getById(jobId);

      setFormData({
        company_name: job.company_name,
        position: job.position,
        job_description: job.job_description || '',
        job_url: job.job_url || '',
        location: job.location || '',
        salary_range: job.salary_range || '',
        status: job.status as JobStatus,
        applied_date: job.applied_date ? job.applied_date.split('T')[0] : '',
        deadline: job.deadline ? job.deadline.split('T')[0] : '',
        notes: job.notes || '',
      });
    } catch (error) {
      console.error('Failed to fetch job:', error);
      alert('Failed to load job details');
      navigate('/jobs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.company_name.trim()) {
      newErrors.company_name = 'Company name is required';
    }

    if (!formData.position.trim()) {
      newErrors.position = 'Position is required';
    }

    if (formData.job_url && !isValidUrl(formData.job_url)) {
      newErrors.job_url = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('🔍 Form submitted');

    if (!validate()) {
      console.log('❌ Validation failed');
      return;
    }

    try {
      setIsSaving(true);

      // Prepare data for API
      const apiData = {
        company_name: formData.company_name.trim(),
        position: formData.position.trim(),
        job_description: formData.job_description.trim() || null,
        job_url: formData.job_url.trim() || null,
        location: formData.location.trim() || null,
        salary_range: formData.salary_range.trim() || null,
        status: formData.status,
        applied_date: formData.applied_date || null,
        deadline: formData.deadline || null,
        notes: formData.notes.trim() || null,
      };

      console.log('📤 Submitting to backend:', apiData);

      if (isEditing && id) {
        await jobsAPI.update(parseInt(id), apiData);
        console.log('✅ Job updated successfully');
      } else {
        await jobsAPI.create(apiData);
        console.log('✅ Job created successfully');
      }

      navigate('/jobs');
    } catch (error: any) {
      console.error('❌ Failed to save job:', error);

      if (error.response?.data?.detail) {
        alert(`Error: ${error.response.data.detail}`);
      } else {
        alert('Failed to save job. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/jobs');
  };

  if (isLoading) {
    return (
      <AppLayout title={isEditing ? 'Edit Job' : 'Add Job'} actions={<div></div>}>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading job details...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title={isEditing ? 'Edit Job' : 'Add New Job'}
      actions={
        <Button
          variant="secondary"
          onClick={handleCancel}
          leftIcon={<ArrowLeft className="h-4 w-4" />}
        >
          Back to Jobs
        </Button>
      }
    >
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        {/* Basic Information */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-blue-500" />
            Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Company Name */}
            <Input
              label="Company Name"
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              placeholder="e.g., Google, Microsoft"
              icon={<Building2 className="h-4 w-4" />}
              error={errors.company_name}
              required
            />

            {/* Position */}
            <Input
              label="Position"
              name="position"
              value={formData.position}
              onChange={handleChange}
              placeholder="e.g., Software Engineer"
              icon={<Briefcase className="h-4 w-4" />}
              error={errors.position}
              required
            />

            {/* Location */}
            <Input
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., San Francisco, CA (Remote)"
              icon={<MapPin className="h-4 w-4" />}
            />

            {/* Salary Range */}
            <Input
              label="Salary Range"
              name="salary_range"
              value={formData.salary_range}
              onChange={handleChange}
              placeholder="e.g., $100k - $150k"
              icon={<DollarSign className="h-4 w-4" />}
            />

            {/* Job URL */}
            <div className="md:col-span-2">
              <Input
                label="Job Posting URL"
                name="job_url"
                value={formData.job_url}
                onChange={handleChange}
                placeholder="https://company.com/careers/job-id"
                icon={<LinkIcon className="h-4 w-4" />}
                error={errors.job_url}
                helperText="Paste the link to the job posting"
              />
            </div>
          </div>
        </div>

        {/* Job Description */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-500" />
            Job Description
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="job_description"
              value={formData.job_description}
              onChange={handleChange}
              placeholder="Paste the job description here... This helps AI generate better cover letters!"
              rows={8}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white text-gray-900 placeholder-gray-400"
            />
            <p className="mt-2 text-xs text-gray-500">
              💡 Tip: Include the full job description for better AI-generated cover letters
            </p>
          </div>
        </div>

        {/* Application Status */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            Application Status
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                required
              >
                <option value="saved">Saved</option>
                <option value="applied">Applied</option>
                <option value="interviewing">Interviewing</option>
                <option value="offer">Offer</option>
                <option value="rejected">Rejected</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </div>

            {/* Applied Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Applied Date
              </label>
              <input
                type="date"
                name="applied_date"
                value={formData.applied_date}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
              />
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Application Deadline
              </label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Notes</h2>

          <div>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Add any notes, contacts, interview dates, or other information..."
              rows={5}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white text-gray-900 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={handleCancel}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="tech-gradient"
            isLoading={isSaving}
            leftIcon={<Save className="h-4 w-4" />}
            className="flex-1"
          >
            {isSaving ? 'Saving...' : isEditing ? 'Update Job' : 'Save Job'}
          </Button>
        </div>
      </form>
    </AppLayout>
  );
}