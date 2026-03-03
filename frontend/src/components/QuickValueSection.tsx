import React from 'react';
import { Upload, Sparkles, Target, Clock } from 'lucide-react';

export function QuickValueSection() {
  const steps = [
    {
      icon: Upload,
      title: 'Upload Your CV',
      desc: 'Drag & drop your existing resume. We support PDF and Word formats.',
    },
    {
      icon: Sparkles,
      title: 'AI Enhancement',
      desc: 'Our engine optimizes content, formatting, and keywords instantly.',
    },
    {
      icon: Target,
      title: 'Track & Apply',
      desc: 'Manage applications and tailor versions for specific job descriptions.',
    },
  ];

  return (
    <section className="py-12 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="md:w-1/3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wider mb-3">
              <Clock className="h-3 w-3" />
              <span>60 Seconds to Value</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              From upload to optimized in under a minute.
            </h2>
            <p className="text-gray-600">
              Stop wasting hours formatting. Get straight to the application.
            </p>
          </div>
          <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <div key={i} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden sm:block absolute top-6 right-[-50%] w-full h-[2px] bg-gray-200 z-0" />
                )}
                <div className="relative z-10 bg-white p-5 rounded-xl border border-gray-200 shadow-sm h-full">
                  <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}