import React from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '../../layouts/AppLayout';
import {
  FileText,
  Sparkles,
  Target,
  Zap,
  ArrowRight,
} from 'lucide-react';

export function GeneratorSelectionPage() {
  const generators = [
    {
      id: 'cover-letter',
      title: 'Cover Letter Generator',
      description: 'Create personalized, ATS-optimized cover letters using AI',
      icon: FileText,
      gradient: 'from-blue-500 to-cyan-500',
      available: true,
      link: '/generator/cover-letter',
      features: [
        'AI-powered generation',
        'Multiple tone options',
        'Job-specific customization',
        'ATS optimization',
      ],
    },
    {
      id: 'resume-analyzer',
      title: 'Resume Analyzer',
      description: 'Get AI feedback on your resume and suggestions for improvement',
      icon: Target,
      gradient: 'from-purple-500 to-pink-500',
      available: false,
      link: '/generator/resume-analyzer',
      features: [
        'ATS compatibility check',
        'Keyword optimization',
        'Format suggestions',
        'Industry benchmarking',
      ],
    },
    {
      id: 'skills-matcher',
      title: 'Skills Matcher',
      description: 'Match your skills with job requirements and get recommendations',
      icon: Zap,
      gradient: 'from-orange-500 to-red-500',
      available: false,
      link: '/generator/skills-matcher',
      features: [
        'Skills gap analysis',
        'Learning recommendations',
        'Certification suggestions',
        'Market trends',
      ],
    },
  ];

  return (
    <AppLayout title="AI Generator" actions={<div></div>}>
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 text-white mb-4 shadow-lg">
          <Sparkles className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          AI-Powered Career Tools
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Leverage artificial intelligence to create compelling application materials
          and optimize your job search strategy
        </p>
      </div>

      {/* Generator Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {generators.map((generator) => {
          const Icon = generator.icon;

          return (
            <div
              key={generator.id}
              className={`glass-panel rounded-2xl p-6 relative overflow-hidden ${
                !generator.available ? 'opacity-60' : ''
              }`}
            >
              {/* Background Gradient */}
              <div
                className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${generator.gradient} opacity-10 rounded-bl-full`}
              />

              {/* Content */}
              <div className="relative z-10">
                {/* Icon */}
                <div
                  className={`h-12 w-12 rounded-xl bg-gradient-to-br ${generator.gradient} flex items-center justify-center text-white mb-4 shadow-md`}
                >
                  <Icon className="h-6 w-6" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {generator.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4">
                  {generator.description}
                </p>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {generator.features.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-2 text-sm text-gray-700"
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {generator.available ? (
                  <Link to={generator.link}>
                    <button
                      className={`w-full px-4 py-2.5 rounded-xl bg-gradient-to-r ${generator.gradient} text-white font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2`}
                    >
                      Get Started
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </Link>
                ) : (
                  <button
                    disabled
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-200 text-gray-500 font-medium cursor-not-allowed"
                  >
                    Coming Soon
                  </button>
                )}
              </div>

              {/* Badge for unavailable */}
              {!generator.available && (
                <div className="absolute top-4 right-4 bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full">
                  Soon
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Info Section */}
      <div className="mt-12 glass-panel rounded-2xl p-8 max-w-4xl mx-auto">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Powered by Advanced AI
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Our AI tools use state-of-the-art language models to understand job
              requirements and create personalized, professional content. All generated
              materials are optimized for Applicant Tracking Systems (ATS) to maximize
              your chances of getting noticed.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                Free AI (Llama 3.2)
              </span>
              <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full">
                Premium AI (Claude 3.5) - Upgrade
              </span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}