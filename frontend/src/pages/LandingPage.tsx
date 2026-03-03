import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Zap, Shield, Globe, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';
import { TestimonialsSection } from '../components/TestimonialsSection';
import { HowItWorksSection } from '../components/HowItWorksSection';
import { TemplateGallerySection } from '../components/TemplateGallerySection';
import { QuickValueSection } from '../components/QuickValueSection';
import { ToolComparisonSection } from '../components/ToolComparisonSection';
import { FeatureProofSection } from '../components/FeatureProofSection';
import { FAQSection } from '../components/FAQSection';
import { RoadmapSection } from '../components/RoadmapSection';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Logo />
            <div className="flex items-center gap-6">
              <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors hidden sm:block">Log in</Link>
              <Link to="/signup"><Button variant="tech-gradient" size="md">Get Started</Button></Link>
            </div>
          </div>
        </div>
      </nav>
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-slate-50">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative z-10 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-600 text-xs font-bold uppercase tracking-wider mb-6">
              <Sparkles className="h-3 w-3" /><span>AI-Powered Career Engine</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight mb-6 leading-[1.1]">Your Future <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">Built Intelligently</span></h1>
            <p className="text-xl text-gray-600 mb-8 max-w-lg leading-relaxed">Leverage advanced AI to craft perfect resumes, generate tailored cover letters, and track your applications with precision.</p>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/signup"><Button size="xl" variant="tech-gradient" rightIcon={<ArrowRight className="h-5 w-5" />}>Start Building Free</Button></Link>
              </div>
              <p className="text-xs text-gray-500 ml-1">No credit card required • Free plan available</p>
            </div>
            <div className="mt-12 flex items-center gap-4 text-sm text-gray-600">
              <div className="flex -space-x-2">{[1,2,3,4].map(i=><div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-700">U{i}</div>)}</div>
              <p>Trusted by 10,000+ professionals</p>
            </div>
          </div>
          <div className="relative animate-float hidden lg:block">
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-200 to-pink-200 rounded-full blur-[100px] -z-10 opacity-30" />
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/50 glass-panel p-2">
              <img src="https://cdn.magicpatterns.com/uploads/jQ4e1S88U8PP9n1z81upE4/thisisengineering-sbVu5zitZt0-unsplash.jpg" alt="AI Technology" className="rounded-xl w-full h-auto object-cover" />
              <div className="absolute -bottom-6 -left-6 glass-panel p-4 rounded-xl animate-pulse-slow">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600"><CheckCircle2 className="h-6 w-6" /></div>
                  <div><p className="text-xs text-gray-600">Success Rate</p><p className="text-lg font-bold text-gray-900">98.5%</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <QuickValueSection />
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16"><h2 className="text-3xl font-bold text-gray-900 mb-4">Advanced Tools for Modern Careers</h2><p className="text-lg text-gray-600 max-w-2xl mx-auto">Our suite of AI-powered tools gives you the competitive edge in today's job market.</p></div>
          <div className="grid md:grid-cols-3 gap-8">{[{icon:Zap,title:'Instant Generation',desc:'Create tailored cover letters in seconds with our advanced LLM engine.',gradient:'from-cyan-500 to-blue-600'},{icon:Shield,title:'ATS Optimization',desc:'Ensure your resume passes automated filters with keyword optimization.',gradient:'from-pink-500 to-orange-500'},{icon:Globe,title:'Market Insights',desc:'Get real-time data on salary ranges and hiring trends for your role.',gradient:'from-purple-500 to-indigo-500'}].map((f,i)=><div key={i} className="group relative p-8 rounded-2xl bg-slate-50 border border-gray-200 hover:border-transparent transition-all duration-300"><div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${f.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} /><div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}><f.icon className="h-6 w-6" /></div><h3 className="text-xl font-bold text-gray-900 mb-3">{f.title}</h3><p className="text-gray-600 leading-relaxed">{f.desc}</p></div>)}</div>
        </div>
      </section>
      <ToolComparisonSection />
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-slate-50">
        <div className="absolute inset-0 -z-20" /><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[120px] -z-10" />
        <div className="max-w-7xl mx-auto"><div className="glass-panel rounded-3xl p-8 md:p-12 overflow-hidden relative"><div className="grid lg:grid-cols-2 gap-12 items-center"><div className="order-2 lg:order-1"><h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Work Smarter, <br /><span className="text-gradient-accent">Not Harder</span></h2><p className="text-lg text-gray-600 mb-8">Our intuitive dashboard brings all your job search activities into one cohesive workspace. Track applications, manage documents, and get AI insights in real-time.</p><ul className="space-y-4 mb-8">{['Smart Application Tracking','Document Version Control','Interview Scheduling'].map((item,i)=><li key={i} className="flex items-center gap-3 text-gray-900 font-medium"><div className="h-6 w-6 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center"><CheckCircle2 className="h-4 w-4" /></div>{item}</li>)}</ul><div className="flex flex-col gap-2"><Link to="/signup"><Button variant="tech-gradient" className="w-fit">Explore Dashboard</Button></Link><span className="text-xs text-gray-500">Free for first 3 applications</span></div></div><div className="order-1 lg:order-2 relative"><img src="https://cdn.magicpatterns.com/uploads/gYx3nBfWb48AS8gbZZMWDt/hugo-barbosa-AZ1dAHLnYFc-unsplash.jpg" alt="Modern Workspace" className="rounded-2xl shadow-2xl w-full h-auto object-cover hover:scale-[1.02] transition-transform duration-500" /></div></div></div></div>
      </section>
      <FeatureProofSection /><TemplateGallerySection /><HowItWorksSection /><FAQSection /><RoadmapSection /><TestimonialsSection />
      <section className="py-24 px-4 bg-white">
        <div className="max-w-5xl mx-auto relative"><div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-3xl blur-xl opacity-30 transform translate-y-4" /><div className="relative bg-white rounded-3xl p-12 md:p-20 text-center border border-gray-200 overflow-hidden shadow-xl"><div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-cyan-500 to-blue-600" /><h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Ready to Accelerate Your Career?</h2><p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">Join the platform that's redefining how professionals land their dream jobs.</p><div className="flex flex-col items-center gap-3"><div className="flex flex-col sm:flex-row justify-center gap-4 w-full"><Link to="/signup"><Button size="xl" variant="tech-gradient" className="w-full sm:w-auto px-12">Get Started Now</Button></Link></div><p className="text-sm text-gray-500">No credit card required • Cancel anytime</p></div></div></div>
      </section>
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <Logo /><div className="text-sm text-gray-600">© {new Date().getFullYear()} Mirai AI. All rights reserved.</div>
          <div className="flex gap-6"><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Privacy</a><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Terms</a><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Contact</a></div>
        </div>
      </footer>
    </div>
  );
}