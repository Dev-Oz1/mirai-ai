import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Eye, Check } from 'lucide-react';
import { TemplatePreviewModal } from './TemplatePreviewModal';
import { Link } from 'react-router-dom';

export function TemplateGallerySection() {
  const [activeTab, setActiveTab] = useState<'cv' | 'resume'>('resume');
  const [selectedTemplate, setSelectedTemplate] = useState<{
    name: string;
    image: string;
    type: string;
  } | null>(null);

  const templates = [
    {
      id: 1,
      name: 'Modern Entry Level',
      type: 'resume',
      image:
        'https://cdn.magicpatterns.com/uploads/nFitViSzCPfpJS8NKmqdNw/Modern_Entry_Level_Fresher_Cover_Letter_Resume_.png',
      popular: true,
    },
    {
      id: 2,
      name: 'Professional Marketing',
      type: 'resume',
      image:
        'https://cdn.magicpatterns.com/uploads/qYsC3RpbQCKRega8Qxwewb/Gray_and_White_Simple_Professional_Marketing_Manager_CV_Resume.png',
      popular: false,
    },
    {
      id: 3,
      name: 'Real Estate Professional',
      type: 'resume',
      image:
        'https://cdn.magicpatterns.com/uploads/a1L52qdG9QofycgxMYCH9X/Black_and_White_Simple_Minimalist_Real_Estate_Resume.png',
      popular: false,
    },
    {
      id: 4,
      name: 'Minimalist Gold',
      type: 'cv',
      image:
        'https://cdn.magicpatterns.com/uploads/7vLeHFvMgMYVbzKNo8LCfw/Gold_Minimalist_Professional_Business_Letterhead_A4.png',
      popular: true,
    },
    {
      id: 5,
      name: 'Classic Formal',
      type: 'cv',
      image:
        'https://cdn.magicpatterns.com/uploads/4SvujuBadZwLJsuVHzHgZF/Black__White_Simple_Classic_Formal_Job_Application_Cover_Letter.png',
      popular: false,
    },
    {
      id: 6,
      name: 'Dusty Grey Minimalist',
      type: 'cv',
      image:
        'https://cdn.magicpatterns.com/uploads/cdX9fBFnGKXwDJawtP3a7T/Dusty_Grey_Minimalist_Professional_Cover_Letter.png',
      popular: false,
    },
  ];

  const filteredTemplates = templates.filter((t) => t.type === activeTab);

  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Professional Templates
            </h2>
            <p className="text-lg text-gray-600 max-w-xl">
              Choose from our curated collection of ATS-friendly templates
              designed to get you hired.
            </p>
          </div>

          <div className="flex p-1 bg-white border border-gray-200 rounded-xl shadow-sm">
            <button
              onClick={() => setActiveTab('resume')}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'resume'
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-slate-50'
              }`}
            >
              Resume Templates
            </button>
            <button
              onClick={() => setActiveTab('cv')}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'cv'
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-slate-50'
              }`}
            >
              CV / Cover Letters
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="group relative bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-xl hover:border-blue-300 transition-all duration-300"
            >
              {/* Image Container */}
              <div className="aspect-[3/4] overflow-hidden bg-slate-100 relative">
                <img
                  src={template.image}
                  alt={template.name}
                  className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-4 p-6 backdrop-blur-[2px]">
                  <Link to="/signup" className="w-full">
                    <Button variant="tech-gradient" className="w-full">
                      Use This Template
                    </Button>
                  </Link>
                  <Button
                    variant="secondary"
                    className="w-full"
                    leftIcon={<Eye className="h-4 w-4" />}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    Preview
                  </Button>
                </div>

                {template.popular && (
                  <div className="absolute top-3 left-3 bg-yellow-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                    <Check className="h-3 w-3" /> Popular
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <h3 className="font-bold text-gray-900">{template.name}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  ATS-Optimized • Fully Customizable
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <TemplatePreviewModal
        isOpen={!!selectedTemplate}
        onClose={() => setSelectedTemplate(null)}
        template={selectedTemplate}
      />
    </section>
  );
}