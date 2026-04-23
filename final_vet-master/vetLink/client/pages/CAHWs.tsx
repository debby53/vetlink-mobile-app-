import { useState } from 'react';
import LandingHeader from '@/components/LandingHeader';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Users,
  Award,
  Video,
  FileText,
  Zap,
  CheckCircle,
  Clock,
  MapPin,
  AlertCircle,
  Heart,
  DollarSign,
  TrendingUp,
  MessageSquare,
  Sparkles,
  ChevronDown,
  GraduationCap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function CAHWs() {
  const [expandedModule, setExpandedModule] = useState<string | null>('module1');

  return (
    <div className="min-h-screen bg-white text-slate-900 font-['Outfit'] selection:bg-primary/20 antialiased overflow-x-hidden">
      <LandingHeader />

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 md:pt-52 md:pb-40 overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent -z-10" />
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-10"
            >
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 text-primary text-sm font-black tracking-widest uppercase">
                <Sparkles className="h-4 w-4" />
                <span>Impact the Community</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] text-slate-950 uppercase">
                LEAVE YOUR <br />
                <span className="text-primary italic">MARK.</span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-600 font-medium leading-relaxed max-w-xl">
                Become a Certified Community Animal Health Worker (CAHW). Get trained, get certified, and earn while you serve.
              </p>
              <div className="flex flex-col sm:flex-row gap-5">
                <Button className="h-18 px-12 rounded-2xl bg-primary text-white font-black text-xl hover:scale-105 transition-all shadow-xl shadow-primary/20">
                  Start Training Now
                </Button>
                <Button variant="ghost" className="h-18 px-12 rounded-2xl text-slate-900 font-bold text-xl hover:bg-slate-50 border border-slate-200">
                  View Curriculum
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="relative"
            >
              <div className="grid grid-cols-2 gap-6">
                {[
                  { label: 'Active CAHWs', val: '850+', icon: <Users /> },
                  { label: 'Communities', val: '200+', icon: <MapPin /> },
                  { label: 'Avg Income', val: '50k RWF', icon: <DollarSign /> },
                  { label: 'Success Rate', val: '92%', icon: <TrendingUp /> },
                ].map((stat, i) => (
                  <div key={i} className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-2xl shadow-slate-200/50 group hover:-translate-y-2 transition-transform duration-500">
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      {stat.icon}
                    </div>
                    <div className="text-3xl font-black tracking-tighter text-slate-950 mb-1">{stat.val}</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Certification Path */}
      <section className="py-32 bg-slate-950 text-white rounded-[4rem] md:rounded-[6rem] mx-4 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[150px] rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="container mx-auto max-w-7xl px-4 text-center">
          <div className="mb-24 space-y-6">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none">THE PATH TO <br />EXCELLENCE.</h2>
            <p className="text-xl text-slate-400 font-medium max-w-2xl mx-auto">Progress through our rigorous certification tiers to unlock higher income and responsibility.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              { level: 'BRONZE', color: 'text-orange-400', bg: 'bg-orange-400/10', desc: 'First-response care & basic assessments.' },
              { level: 'SILVER', color: 'text-slate-300', bg: 'bg-slate-300/10', desc: 'Disease management & protocol oversight.' },
              { level: 'GOLD', color: 'text-yellow-400', bg: 'bg-yellow-400/10', desc: 'Leadership, mentor, & regional management.' },
            ].map((tier, i) => (
              <div key={i} className="p-12 rounded-[3.5rem] bg-white/5 border border-white/10 flex flex-col items-center group hover:bg-white/10 transition-all">
                <div className={`h-24 w-24 rounded-full ${tier.bg} flex items-center justify-center ${tier.color} mb-10 group-hover:scale-110 transition-transform`}>
                  <Award className="h-12 w-12" />
                </div>
                <h3 className={`text-3xl font-black mb-4 tracking-tighter ${tier.color}`}>{tier.level}</h3>
                <p className="text-slate-400 font-medium mb-10">{tier.desc}</p>
                <Button variant="outline" className="w-full h-14 rounded-xl border-white/10 text-white hover:bg-white/10 font-bold">Requirement Details</Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Curriculum */}
      <section className="py-32 bg-white">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase">CURRICULUM.</h2>
            <p className="text-xl text-slate-500 font-medium italic">8 weeks of intensive, high-impact learning.</p>
          </div>

          <div className="space-y-6">
            {[
              { id: 'module1', title: 'Anatomy & Vital Signs', lessons: 'Overview of bovine & caprine anatomy.' },
              { id: 'module2', title: 'Diagnostic Protocols', lessons: 'The 12-point health inspection check.' },
              { id: 'module3', title: 'Drug Administration', lessons: 'Dosage, safety, and cold-chain logs.' },
              { id: 'module4', title: 'Platform Mastery', lessons: 'Mastering the USSD & App workflow.' },
            ].map((module) => (
              <div key={module.id} className="group border-b border-slate-100 pb-6">
                <button
                  onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
                  className="w-full flex justify-between items-center py-6 text-left"
                >
                  <div className="flex items-center gap-6">
                    <span className="text-xs font-black text-primary opacity-30 group-hover:opacity-100 transition-opacity">{module.id.slice(-1).padStart(2, '0')}</span>
                    <h4 className="text-2xl font-black tracking-tight text-slate-950 uppercase group-hover:text-primary transition-colors">{module.title}</h4>
                  </div>
                  <div className={`h-10 w-10 flex items-center justify-center rounded-full bg-slate-100 group-hover:bg-primary group-hover:text-white transition-all transform ${expandedModule === module.id ? 'rotate-180' : ''}`}>
                    <ChevronDown className="h-6 w-6" />
                  </div>
                </button>
                <AnimatePresence>
                  {expandedModule === module.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <p className="text-slate-500 font-medium text-lg leading-relaxed pb-6 pl-12">
                        {module.lessons} Includes 4 hours of video content and supervised field exercises.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20 px-4 text-center">
        <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase mb-20 leading-none">READY TO <br />LEAD?</h2>
        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <Button className="h-20 px-16 rounded-2xl bg-slate-950 text-white font-black text-2xl hover:scale-105 transition-all shadow-2xl">
            Apply for Training
          </Button>
          <Button variant="ghost" className="h-20 px-16 rounded-2xl text-slate-950 font-bold text-2xl hover:bg-slate-50 underline decoration-primary underline-offset-8">
            Download Brochure
          </Button>
        </div>
      </section>

      {/* Footer Area */}
      <footer className="py-20 bg-white border-t border-slate-100">
        <div className="container mx-auto px-4 text-center space-y-8">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <img src="/logo.png" alt="V" className="h-6 w-auto invert" />
            </div>
            <span className="text-2xl font-black tracking-tighter">VETLINK</span>
          </Link>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em] italic">COMMUNITY EMPOWERMENT. CARE EVOLVED.</p>
        </div>
      </footer>
    </div>
  );
}
