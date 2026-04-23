import { useState } from 'react';
import LandingHeader from '@/components/LandingHeader';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  Smartphone,
  Globe,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Heart,
  Zap,
  BookOpen,
  Play,
  Clock,
  Phone,
  LayoutDashboard,
  ShieldCheck,
  Star,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function Farmers() {
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const faqs = [
    {
      id: 'faq1',
      question: 'How do I use USSD?',
      answer: 'Simply dial *789# on any mobile phone (MTN or Airtel) to access the VetLink portal. No data or internet is required.'
    },
    {
      id: 'faq2',
      question: 'What animals do you cover?',
      answer: 'We cover cattle, goats, sheep, pigs, and poultry across all districts of Rwanda.'
    },
    {
      id: 'faq3',
      question: 'Is this service free?',
      answer: 'The medical triage via USSD is free. Direct veterinary consultations and prescriptions may have a small professional fee.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-['Outfit'] selection:bg-primary/20 antialiased overflow-x-hidden">
      <LandingHeader />

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 md:pt-52 md:pb-40 px-4">
        {/* Animated Background Decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden">
          <div className="absolute top-[10%] left-[-10%] w-[60%] h-[60%] bg-primary/10 blur-[150px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 blur-[130px] rounded-full" />
        </div>

        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-10"
            >
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-sm font-black tracking-widest text-primary uppercase">
                <Star className="h-4 w-4" />
                <span>Farmer First Network</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] uppercase">
                HEALTHY HERDS. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400 italic">BETTER LIVES.</span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-400 font-medium leading-relaxed max-w-xl">
                Connect with certified veterinarians in minutes. Use our mobile app, web portal, or just dial <span className="text-white font-bold">*789#</span>—no internet required.
              </p>
              <div className="flex flex-col sm:flex-row gap-5">
                <Button className="h-18 px-12 rounded-2xl bg-primary text-white font-black text-xl hover:scale-105 transition-all shadow-xl shadow-primary/30">
                  Join 12k+ Farmers
                </Button>
                <Button variant="ghost" className="h-18 px-12 rounded-2xl text-white font-bold text-xl hover:bg-white/5 border border-white/10">
                  Quick Assessment
                </Button>
              </div>
            </motion.div>

            {/* USSD Simulation Mockup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="relative p-1 rounded-[3.5rem] bg-gradient-to-b from-white/20 to-transparent border border-white/10"
            >
              <div className="bg-[#111] rounded-[3.4rem] p-10 md:p-16 text-center">
                <div className="h-20 w-20 rounded-3xl bg-primary/20 flex items-center justify-center text-primary mx-auto mb-10">
                  <Smartphone className="h-10 w-10" />
                </div>
                <h3 className="text-4xl font-black tracking-tighter uppercase mb-6">DIAL *789#</h3>
                <p className="text-slate-400 font-bold mb-12">No data connection? No problem. Use our nationwide USSD menu for instant care.</p>
                <div className="space-y-4 text-left">
                  {[
                    { id: '1', text: 'Report Sick Animal' },
                    { id: '2', text: 'Find Nearest Veterinarian' },
                    { id: '3', text: 'Market Price Updates' }
                  ].map((step) => (
                    <div key={step.id} className="p-5 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-6">
                      <span className="text-primary font-black">{step.id}.</span>
                      <span className="font-bold text-lg">{step.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Modern Card Grid */}
      <section className="py-32 px-4 bg-white text-black rounded-[4rem] md:rounded-[6rem] mx-4 shadow-2xl relative z-10">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="p-10 rounded-[3rem] bg-slate-50 border border-slate-100 space-y-8 group hover:bg-slate-100 transition-all duration-500">
              <div className="h-16 w-16 rounded-2xl bg-white shadow-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Zap className="h-8 w-8" />
              </div>
              <h4 className="text-3xl font-black uppercase tracking-tighter">Instant <br />Reporting.</h4>
              <p className="text-slate-500 font-medium">Quickly report symptoms and get an immediate triage assessment for your animal.</p>
            </div>
            <div className="p-10 rounded-[3rem] bg-slate-50 border border-slate-100 space-y-8 group hover:bg-secondary/5 transition-all duration-500">
              <div className="h-16 w-16 rounded-2xl bg-white shadow-xl flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <h4 className="text-3xl font-black uppercase tracking-tighter">Verified <br />Professionals.</h4>
              <p className="text-slate-500 font-medium">Every veterinarian on our platform is verified and certified by the Rwanda Agricultural Board.</p>
            </div>
            <div className="p-10 rounded-[3rem] bg-slate-50 border border-slate-100 space-y-8 group hover:bg-primary/5 transition-all duration-500">
              <div className="h-16 w-16 rounded-2xl bg-white shadow-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Heart className="h-8 w-8" />
              </div>
              <h4 className="text-3xl font-black uppercase tracking-tighter">Digital <br />Health Cards.</h4>
              <p className="text-slate-500 font-medium">Keep a complete digital record of your animals health, vaccinations, and treatments.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Area */}
      <section className="py-40">
        <div className="container mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase mb-24 leading-none underline decoration-primary decoration-8 underline-offset-8">FREQUENTLY <br />ASKED.</h2>
          <div className="space-y-4 text-left">
            {faqs.map((faq) => (
              <div key={faq.id} className="group border-b border-white/10 pb-6">
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                  className="w-full flex justify-between items-center py-6 text-left"
                >
                  <h4 className="text-2xl font-black tracking-tight group-hover:text-primary transition-colors">{faq.question}</h4>
                  <ChevronDown className={`h-6 w-6 transform transition-transform ${expandedFAQ === faq.id ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {expandedFAQ === faq.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <p className="text-slate-400 font-medium text-lg leading-relaxed pb-6">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Area */}
      <footer className="py-20 border-t border-white/5">
        <div className="container mx-auto px-4 text-center space-y-8 text-slate-500 font-black text-xs tracking-widest uppercase">
          <Link to="/" className="inline-flex items-center gap-2 group mb-4">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <img src="/logo.png" alt="V" className="h-6 w-auto invert" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-white">VETLINK</span>
          </Link>
          <p>© 2026 VETLINK. BUILT FOR RWANDA. POWERED BY PASSION.</p>
          <div className="flex justify-center gap-8 italic">
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-primary transition-colors">Terms</Link>
            <Link to="/support" className="hover:text-primary transition-colors">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
