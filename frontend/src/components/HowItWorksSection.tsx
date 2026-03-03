import React from 'react';
import { Upload, Cpu, Edit3, Download, ArrowRight } from 'lucide-react';

export function HowItWorksSection() {
  const steps = [
    {
      id: 1,
      title: 'Input Your Details',
      description:
        'Upload your existing CV or enter your professional history manually.',
      icon: Upload,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
    },
    {
      id: 2,
      title: 'AI Processing',
      description:
        'Our advanced AI analyzes your profile and matches it with job requirements.',
      icon: Cpu,
      color: 'text-purple-500',
      bg: 'bg-purple-50',
    },
    {
      id: 3,
      title: 'Review & Refine',
      description:
        'Customize the generated content with our intuitive editor tools.',
      icon: Edit3,
      color: 'text-pink-500',
      bg: 'bg-pink-50',
    },
    {
      id: 4,
      title: 'Download & Apply',
      description:
        'Export your polished documents in PDF or Word format instantly.',
      icon: Download,
      color: 'text-green-500',
      bg: 'bg-green-50',
    },
  ];

  return (
    <section className="py-24 bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Create professional application documents in four simple steps.
          </p>
        </div>
        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-gray-200 to-transparent -translate-y-1/2 z-0" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className="flex flex-col items-center text-center group"
              >
                <div
                  className={`w-20 h-20 rounded-2xl ${step.bg} ${step.color} flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300 relative bg-white border border-gray-200`}
                >
                  <step.icon className="h-8 w-8" />
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-sm border-4 border-white">
                    {step.id}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed max-w-xs">
                  {step.description}
                </p>
                {/* Mobile Arrow */}
                {index < steps.length - 1 && (
                  <div className="lg:hidden mt-8 text-gray-300">
                    <ArrowRight className="h-6 w-6 rotate-90 md:rotate-0" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}