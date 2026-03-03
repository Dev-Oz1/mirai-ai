import React from 'react';
import { Rocket, Calendar, Star } from 'lucide-react';

export function RoadmapSection() {
  const roadmap = [
    {
      quarter: 'Q3 2024',
      title: 'LinkedIn Optimization',
      status: 'In Progress',
      desc: 'AI analysis of your LinkedIn profile with specific improvement suggestions.',
    },
    {
      quarter: 'Q4 2024',
      title: 'Interview Coach',
      status: 'Coming Soon',
      desc: 'Real-time voice practice for common interview questions based on your resume.',
    },
    {
      quarter: 'Q1 2025',
      title: 'Auto-Apply',
      status: 'Planned',
      desc: 'One-click application submission to major job boards.',
    },
  ];

  return (
    <section className="py-20 bg-slate-900 text-white overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[100px]"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-bold uppercase tracking-wider mb-4">
              <Rocket className="h-3 w-3" />
              <span>Product Roadmap</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Building the Future of Career Tools
            </h2>
            <p className="text-gray-400 max-w-xl">
              We're constantly evolving. Here's what our engineering team is
              building next to help you land your dream job.
            </p>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {roadmap.map((item, i) => (
            <div
              key={i}
              className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-xl hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sm font-medium text-blue-300">
                  <Calendar className="h-4 w-4" />
                  {item.quarter}
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    item.status === 'In Progress'
                      ? 'bg-green-500/20 text-green-300'
                      : item.status === 'Coming Soon'
                        ? 'bg-yellow-500/20 text-yellow-300'
                        : 'bg-gray-500/20 text-gray-300'
                  }`}
                >
                  {item.status}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                {item.title}
                {i === 0 && (
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                )}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}