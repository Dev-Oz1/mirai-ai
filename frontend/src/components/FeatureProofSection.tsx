import React from 'react';
import { Search, History, BarChart3, Lock } from 'lucide-react';

export function FeatureProofSection() {
  const features = [
    {
      icon: BarChart3,
      title: 'Real ATS Score Preview',
      desc: 'See exactly how your resume scores against automated filters before you apply. We analyze formatting, keywords, and structure.',
      stat: '98% Accuracy',
    },
    {
      icon: Search,
      title: 'Job-Specific Keyword Matching',
      desc: "Paste a job description and we'll identify missing keywords. Our AI suggests exactly where to add them for maximum impact.",
      stat: '2x Interview Rate',
    },
    {
      icon: History,
      title: 'Smart Version History',
      desc: 'Never lose a tailored version. We automatically save every iteration of your resume so you can track what works for each application.',
      stat: 'Unlimited Versions',
    },
    {
      icon: Lock,
      title: 'Privacy-First Architecture',
      desc: "Your data is yours. We don't sell your resume data to recruiters. You control who sees your information and when.",
      stat: 'Bank-Level Security',
    },
  ];

  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Built on Real Data, Not Hype
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We don't just "improve" your resume. We give you the specific data
            and tools you need to beat the system.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                {feature.desc}
              </p>
              <div className="pt-4 border-t border-gray-100">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  {feature.stat}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}