import React from 'react';
import { FileText, PenTool, Check } from 'lucide-react';
import { Button } from './ui/Button';
import { Link } from 'react-router-dom';

export function ToolComparisonSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Which tool is right for you?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Whether you're starting from scratch or optimizing an existing
            resume, we have the specialized tool you need.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* CV Generator */}
          <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 hover:border-blue-300 transition-colors">
            <div className="h-12 w-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              CV Generator
            </h3>
            <p className="text-gray-600 mb-6">
              Best for professionals with an existing resume who need to tailor
              it for specific job applications.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                'Upload existing PDF/Word resume',
                'Match keywords to job description',
                'Generate tailored cover letters',
                'ATS score analysis & optimization',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
            <Link to="/signup">
              <Button variant="tech-outline" className="w-full">
                Try CV Generator
              </Button>
            </Link>
          </div>
          {/* Resume Builder */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-white shadow-xl">
            <div className="h-12 w-12 rounded-xl bg-white/10 text-white flex items-center justify-center mb-6">
              <PenTool className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Resume Builder
            </h3>
            <p className="text-gray-300 mb-6">
              Perfect for creating a professional resume from scratch using our
              ATS-friendly templates.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                'Step-by-step guided builder',
                'Professional templates library',
                'AI content suggestions',
                'Real-time formatting preview',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-200">{item}</span>
                </li>
              ))}
            </ul>
            <Link to="/signup">
              <Button variant="tech-gradient" className="w-full">
                Start Building Free
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}