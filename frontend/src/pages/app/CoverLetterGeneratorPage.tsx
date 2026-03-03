import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../layouts/AppLayout';
import { Button } from '../../components/ui/Button';
import { jobsAPI, coverLettersAPI } from '../../services/api';
import type { Job } from '../../types';
import {
  FileText,
  Sparkles,
  Wand2,
  Save,
  Copy,
  Check,
  AlertCircle,
  Loader,
} from 'lucide-react';

export function CoverLetterGeneratorPage() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [tone, setTone] = useState<'professional' | 'enthusiastic' | 'formal' | 'creative'>('professional');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState('');

  // Fetch jobs on mount
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setIsLoadingJobs(true);
      const fetchedJobs = await jobsAPI.getAll();
      setJobs(fetchedJobs);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      setError('Failed to load jobs. Please try again.');
    } finally {
      setIsLoadingJobs(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedJobId) {
      setError('Please select a job');
      return;
    }

    try {
      setIsGenerating(true);
      setError('');
      setGeneratedLetter('');

      const response = await coverLettersAPI.generate({
        job_id: selectedJobId,
        tone: tone,
        additional_info: additionalInfo.trim() || undefined,
      });

      setGeneratedLetter(response.content);
    } catch (error: any) {
      console.error('Generation failed:', error);
      setError(
        error.response?.data?.detail || 'Failed to generate cover letter. Please try again.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedLetter) return;

    try {
      setIsSaving(true);

      // The letter is already saved by the generate endpoint
      // Just navigate to the library
      navigate('/cover-letters');
    } catch (error) {
      console.error('Save failed:', error);
      setError('Failed to save cover letter');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedLetter) return;

    try {
      await navigator.clipboard.writeText(generatedLetter);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const selectedJob = jobs.find((j) => j.id === selectedJobId);

  return (
    <AppLayout
      title="Cover Letter Generator"
      actions={
        generatedLetter ? (
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={handleCopy}
              leftIcon={isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            >
              {isCopied ? 'Copied!' : 'Copy'}
            </Button>
            <Button
              variant="tech-gradient"
              onClick={handleSave}
              isLoading={isSaving}
              leftIcon={<Save className="h-4 w-4" />}
            >
              Go to Library
            </Button>
          </div>
        ) : (
          <div></div>
        )
      }
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Configuration */}
          <div className="space-y-6">
            {/* Info Card */}
            <div className="glass-panel rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">AI Cover Letter Generator</h2>
                  <p className="text-xs text-gray-600">Powered by Llama 3.2</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Generate a personalized, ATS-optimized cover letter tailored to your
                selected job. The AI will analyze the job description and create
                compelling content that highlights your fit for the role.
              </p>
            </div>

            {/* Job Selection */}
            <div className="glass-panel rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                Select Job
              </h3>

              {isLoadingJobs ? (
                <div className="text-center py-8 text-gray-500">
                  Loading jobs...
                </div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-4">
                    No jobs found. Add a job first to generate a cover letter.
                  </p>
                  <Button
                    variant="tech-gradient"
                    onClick={() => navigate('/jobs/add')}
                  >
                    Add Job
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {jobs.map((job) => (
                    <button
                      key={job.id}
                      onClick={() => setSelectedJobId(job.id)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                        selectedJobId === job.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 bg-white'
                      }`}
                    >
                      <div className="font-semibold text-gray-900 text-sm mb-1">
                        {job.position}
                      </div>
                      <div className="text-xs text-gray-600">{job.company_name}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tone Selection */}
            <div className="glass-panel rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-4">Tone</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'professional', label: 'Professional', desc: 'Clear and confident' },
                  { value: 'enthusiastic', label: 'Enthusiastic', desc: 'Energetic and excited' },
                  { value: 'formal', label: 'Formal', desc: 'Traditional and respectful' },
                  { value: 'creative', label: 'Creative', desc: 'Unique and standout' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setTone(option.value as any)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      tone === option.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 bg-white'
                    }`}
                  >
                    <div className="font-semibold text-sm text-gray-900">
                      {option.label}
                    </div>
                    <div className="text-xs text-gray-600">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Additional Info */}
            <div className="glass-panel rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-4">
                Additional Information (Optional)
              </h3>
              <textarea
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                placeholder="Add any specific skills, experiences, or points you want to highlight..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white text-gray-900 placeholder-gray-400"
              />
              <p className="mt-2 text-xs text-gray-500">
                💡 Tip: Mention specific projects, achievements, or certifications
              </p>
            </div>

            {/* Generate Button */}
            <Button
              variant="tech-gradient"
              onClick={handleGenerate}
              isLoading={isGenerating}
              disabled={!selectedJobId || isGenerating}
              leftIcon={<Wand2 className="h-5 w-5" />}
              className="w-full py-4 text-lg"
            >
              {isGenerating ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  Generating Cover Letter...
                </>
              ) : (
                'Generate Cover Letter'
              )}
            </Button>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-start gap-2">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Right: Preview */}
          <div className="glass-panel rounded-2xl p-6 lg:sticky lg:top-8 self-start">
            <h3 className="font-bold text-gray-900 mb-4">Preview</h3>

            {selectedJob && (
              <div className="mb-4 p-4 bg-blue-50 rounded-xl">
                <div className="text-sm font-semibold text-gray-900 mb-1">
                  {selectedJob.position}
                </div>
                <div className="text-xs text-gray-600">{selectedJob.company_name}</div>
              </div>
            )}

            <div className="min-h-[500px] max-h-[600px] overflow-y-auto">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center h-full py-20">
                  <Loader className="h-12 w-12 text-blue-500 animate-spin mb-4" />
                  <p className="text-gray-600 mb-2">Generating your cover letter...</p>
                  <p className="text-sm text-gray-500">This may take 10-30 seconds</p>
                </div>
              ) : generatedLetter ? (
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                    {generatedLetter}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                  <FileText className="h-16 w-16 text-gray-300 mb-4" />
                  <p className="text-gray-600 mb-2">No cover letter generated yet</p>
                  <p className="text-sm text-gray-500">
                    Select a job and click "Generate Cover Letter"
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}