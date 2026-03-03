import React from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/Button';
import { Link } from 'react-router-dom';

interface TemplatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: {
    name: string;
    image: string;
    type: string;
  } | null;
}

export function TemplatePreviewModal({
  isOpen,
  onClose,
  template,
}: TemplatePreviewModalProps) {
  if (!isOpen || !template) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white z-10">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{template.name}</h3>
            <p className="text-sm text-gray-500 capitalize">
              {template.type} Template
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-6 flex justify-center">
          <img
            src={template.image}
            alt={template.name}
            className="max-w-full h-auto shadow-lg rounded-lg border border-gray-200"
          />
        </div>
        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-white flex justify-end gap-3 z-10">
          <Button variant="secondary" onClick={onClose}>
            Close Preview
          </Button>
          <Link to="/signup">
            <Button variant="tech-gradient">Use This Template</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}