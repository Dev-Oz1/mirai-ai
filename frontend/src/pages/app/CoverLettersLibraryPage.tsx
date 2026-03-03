import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppLayout } from '../../layouts/AppLayout';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { coverLettersAPI } from '../../services/api';
import type { CoverLetter } from '../../types';
import {
  FileText,
  Plus,
  Search,
  Copy,
  Trash2,
  Eye,
  Check,
  AlertCircle,
  Calendar,
  Briefcase,
  Filter,
  Sparkles,
  Lightbulb,
  X,
  Award,
  Scroll,
} from 'lucide-react';

export function CoverLettersLibraryPage() {
  const navigate = useNavigate();
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toneFilter, setToneFilter] = useState('all');
  const [selectedLetter, setSelectedLetter] = useState<CoverLetter | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [letterToDelete, setLetterToDelete] = useState<CoverLetter | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Fetch cover letters
  useEffect(() => {
    fetchCoverLetters();
  }, []);

  const fetchCoverLetters = async () => {
    try {
      setIsLoading(true);
      const letters = await coverLettersAPI.getAll();
      setCoverLetters(letters);
    } catch (error) {
      console.error('Failed to fetch cover letters:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter letters
  const filteredLetters = coverLetters.filter((letter) => {
    const matchesSearch = letter.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTone = toneFilter === 'all' || letter.tone === toneFilter;
    return matchesSearch && matchesTone;
  });

  // Handle preview
  const handlePreview = (letter: CoverLetter) => {
    setSelectedLetter(letter);
    setShowPreviewModal(true);
  };

  // Handle copy
  const handleCopy = async (letter: CoverLetter) => {
    try {
      await navigator.clipboard.writeText(letter.content);
      setCopiedId(letter.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // Handle delete
  const handleDeleteClick = (letter: CoverLetter) => {
    setLetterToDelete(letter);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!letterToDelete) return;

    try {
      setIsDeleting(true);
      await coverLettersAPI.delete(letterToDelete.id);
      setCoverLetters(coverLetters.filter((l) => l.id !== letterToDelete.id));
      setShowDeleteModal(false);
      setLetterToDelete(null);
    } catch (error) {
      console.error('Failed to delete letter:', error);
      alert('Failed to delete cover letter. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Get tone badge color
  const getToneBadgeColor = (tone: string) => {
    const colors: Record<string, string> = {
      professional: 'bg-blue-100 text-blue-700',
      enthusiastic: 'bg-purple-100 text-purple-700',
      formal: 'bg-gray-100 text-gray-700',
      creative: 'bg-pink-100 text-pink-700',
    };
    return colors[tone] || 'bg-gray-100 text-gray-700';
  };

  if (isLoading) {
    return (
      <AppLayout title="Cover Letters" actions={<div></div>}>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading cover letters...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Cover Letters"
      actions={
        <Link to="/generator/cover-letter">
          <Button variant="tech-gradient" leftIcon={<Plus className="h-4 w-4" />}>
            Generate New
          </Button>
        </Link>
      }
    >
      {/* Stats - All 6 Cards with UNIQUE Icons */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {[
          {
            label: 'Total Letters',
            value: coverLetters.length,
            icon: FileText,
            color: 'from-gray-500 to-gray-600',
            textColor: 'text-gray-900',
          },
          {
            label: 'Professional',
            value: coverLetters.filter((l) => l.tone === 'professional').length,
            icon: Briefcase, // Business briefcase
            color: 'from-blue-500 to-blue-600',
            textColor: 'text-blue-600',
          },
          {
            label: 'Enthusiastic',
            value: coverLetters.filter((l) => l.tone === 'enthusiastic').length,
            icon: Sparkles, // Sparkle/excitement
            color: 'from-purple-500 to-purple-600',
            textColor: 'text-purple-600',
          },
          {
            label: 'Formal',
            value: coverLetters.filter((l) => l.tone === 'formal').length,
            icon: Scroll, // Formal scroll/document
            color: 'from-gray-400 to-gray-500',
            textColor: 'text-gray-600',
          },
          {
            label: 'Creative',
            value: coverLetters.filter((l) => l.tone === 'creative').length,
            icon: Lightbulb, // Creative idea
            color: 'from-pink-500 to-pink-600',
            textColor: 'text-pink-600',
          },
          {
            label: 'This Week',
            value: coverLetters.filter(
              (l) =>
                new Date(l.created_at) >
                new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            ).length,
            icon: Calendar,
            color: 'from-green-500 to-green-600',
            textColor: 'text-green-600',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <div
                className={`h-10 w-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-sm`}
              >
                <stat.icon className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className={`text-2xl font-bold ${stat.textColor}`}>
              {stat.value}
            </div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search cover letters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <select
            value={toneFilter}
            onChange={(e) => setToneFilter(e.target.value)}
            className="pl-10 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none min-w-[160px]"
          >
            <option value="all">All Tones</option>
            <option value="professional">Professional</option>
            <option value="enthusiastic">Enthusiastic</option>
            <option value="formal">Formal</option>
            <option value="creative">Creative</option>
          </select>
        </div>
      </div>

      {/* Cover Letters Grid */}
      {filteredLetters.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLetters.map((letter) => (
            <div
              key={letter.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-5"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white shadow-sm">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-sm line-clamp-1">
                      {letter.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${getToneBadgeColor(
                          letter.tone
                        )}`}
                      >
                        {letter.tone.charAt(0).toUpperCase() + letter.tone.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                {letter.content}
              </p>

              {/* Meta */}
              <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(letter.created_at)}
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {Math.round(letter.content.length / 5)} words
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handlePreview(letter)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  View
                </button>
                <button
                  onClick={() => handleCopy(letter)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  {copiedId === letter.id ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleDeleteClick(letter)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {coverLetters.length === 0 ? 'No cover letters yet' : 'No letters found'}
          </h3>
          <p className="text-gray-600 mb-6">
            {coverLetters.length === 0
              ? 'Generate your first AI-powered cover letter to get started.'
              : 'Try adjusting your search or filters.'}
          </p>
          {coverLetters.length === 0 && (
            <Link to="/generator/cover-letter">
              <Button variant="tech-gradient" leftIcon={<Plus className="h-4 w-4" />}>
                Generate Cover Letter
              </Button>
            </Link>
          )}
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && selectedLetter && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowPreviewModal(false)}
          />
          <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedLetter.title}
                </h3>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${getToneBadgeColor(
                    selectedLetter.tone
                  )}`}
                >
                  {selectedLetter.tone.charAt(0).toUpperCase() +
                    selectedLetter.tone.slice(1)}
                </span>
                <span className="text-sm text-gray-500">
                  {formatDate(selectedLetter.created_at)}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                  {selectedLetter.content}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowPreviewModal(false)}
                className="flex-1"
              >
                Close
              </Button>
              <Button
                variant="tech-gradient"
                onClick={() => handleCopy(selectedLetter)}
                leftIcon={
                  copiedId === selectedLetter.id ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )
                }
                className="flex-1"
              >
                {copiedId === selectedLetter.id ? 'Copied!' : 'Copy to Clipboard'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && letterToDelete && (
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
                <h3 className="text-lg font-bold text-gray-900">Delete Cover Letter</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-gray-700 mb-6">
              Are you sure you want to delete{' '}
              <span className="font-semibold">{letterToDelete.title}</span>?
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
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}