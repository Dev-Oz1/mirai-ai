import React from 'react';
import { Star, Quote } from 'lucide-react';

export function TestimonialsSection() {
  const testimonials = [
    {
      id: 1,
      name: 'Sarah Jenkins',
      role: 'Product Manager at TechFlow',
      quote:
        "Mirai AI completely transformed my job search. The CV generator helped me highlight achievements I hadn't even thought of. I landed 3 interviews in my first week.",
      avatar: 'SJ',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      id: 2,
      name: 'David Chen',
      role: 'Senior Developer',
      quote:
        'The resume builder is intuitive and produces stunning results. I love how it tailors the content to specific job descriptions automatically. A game changer.',
      avatar: 'DC',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      id: 3,
      name: 'Elena Rodriguez',
      role: 'Marketing Director',
      quote:
        'Professional, polished, and incredibly fast. The templates are beautiful and the AI suggestions are actually useful, not just generic filler text.',
      avatar: 'ER',
      gradient: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <section className="py-24 bg-slate-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 border border-blue-200 text-blue-600 text-xs font-bold uppercase tracking-wider mb-4">
            <Star className="h-3 w-3 fill-current" />
            <span>Success Stories</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Loved by Professionals
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join thousands of users who have accelerated their careers with our
            intelligent tools.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative group"
            >
              <div className="absolute top-6 right-6 text-gray-200 group-hover:text-blue-200 transition-colors">
                <Quote className="h-10 w-10" />
              </div>
              <div className="flex items-center gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="h-4 w-4 text-yellow-400 fill-current"
                  />
                ))}
              </div>
              <p className="text-gray-900 leading-relaxed mb-8 relative z-10">
                "{testimonial.quote}"
              </p>
              <div className="flex items-center gap-4">
                <div
                  className={`h-12 w-12 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center text-white font-bold text-lg shadow-md`}
                >
                  {testimonial.avatar}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">
                    {testimonial.name}
                  </h4>
                  <p className="text-xs text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}