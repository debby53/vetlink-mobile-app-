import { useState } from 'react';
import LandingHeader from '@/components/LandingHeader';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  MessageSquare,
  FileText,
  Calendar,
  MapPin,
  PlusCircle,
  ShieldCheck,
  Globe,
  Briefcase,
  Layers,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function Veterinarians() {
  const [activeTab, setActiveTab] = useState('overview');

  const dashboardMetrics = [
    { label: 'Active Cases', value: '24', icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { label: 'Resolved This Month', value: '47', icon: CheckCircle, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Avg Response Time', value: '1.8 hrs', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Resolution Rate', value: '92%', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-['Outfit'] selection:bg-primary/30 antialiased overflow-x-hidden">
      <LandingHeader />

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 md:pt-52 md:pb-40 px-4">
        {/* Deep Field Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden">
          <div className="absolute top-[10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[130px] rounded-full" />
        </div>

        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-10"
            >
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-sm font-black tracking-widest text-primary uppercase">
                <ShieldCheck className="h-4 w-4" />
                <span>Professional Infrastructure</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] uppercase">
                VET CARE <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 italic">AT SCALE.</span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-400 font-medium leading-relaxed max-w-xl">
                The terminal for modern veterinarians. Manage hundreds of cases, automate reporting, and scale your impact across Rwanda.
              </p>
              <div className="flex flex-col sm:flex-row gap-5">
                <Button className="h-18 px-10 rounded-2xl bg-white text-black font-black text-xl hover:scale-105 transition-all shadow-2xl">
                  Join the Force
                </Button>
                <Button variant="ghost" className="h-18 px-10 rounded-2xl text-white font-bold text-xl hover:bg-white/5 border border-white/10">
                  View Toolkit
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-primary rounded-[3rem] blur-2xl opacity-20" />
              <div className="bg-[#0a0a0a] border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-[0_50px_100px_rgba(0,0,0,0.5)]">
                <div className="grid grid-cols-2 gap-6">
                  {dashboardMetrics.map((m, i) => (
                    <div key={i} className="p-6 rounded-[2rem] bg-white/5 border border-white/5 hover:border-white/20 transition-all group">
                      <div className={`h-12 w-12 rounded-xl ${m.bg} flex items-center justify-center ${m.color} mb-4 group-hover:scale-110 transition-transform`}>
                        <m.icon className="h-6 w-6" />
                      </div>
                      <div className="text-3xl font-black tracking-tighter mb-1">{m.value}</div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{m.label}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 pt-8 border-t border-white/5">
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Weekly Volume</div>
                      <div className="text-xl font-bold">+12% vs last week</div>
                    </div>
                    <div className="flex gap-1 h-12 items-end">
                      {[4, 7, 5, 8, 6, 9, 7].map((h, i) => (
                        <div key={i} style={{ height: `${h * 10}%` }} className="w-4 bg-primary rounded-t-sm opacity-50 hover:opacity-100 transition-opacity" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Toolkit Bento */}
      <section className="py-32 px-4 bg-white text-black rounded-[4rem] md:rounded-[6rem] mx-4 shadow-2xl">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-24 space-y-6">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none">THE PRO TOOLKIT.</h2>
            <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto italic">Everything you need to run a high-efficiency veterinary operation.</p>
          </div>

          <div className="grid md:grid-cols-12 gap-8 auto-rows-[350px]">
            <div className="md:col-span-12 lg:col-span-8 p-12 rounded-[3.5rem] bg-slate-900 text-white flex flex-col justify-between group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/20 -skew-x-12 translate-x-1/2 pointer-events-none" />
              <div className="relative z-10 max-w-md space-y-6">
                <div className="h-16 w-16 rounded-[1.5rem] bg-primary flex items-center justify-center">
                  <BarChart3 className="h-8 w-8" />
                </div>
                <h3 className="text-5xl font-black tracking-tighter uppercase leading-[0.9]">Deep Analytics <br />& Reporting.</h3>
                <p className="text-slate-400 font-medium">Auto-generate RAB-compliant reports and track your practice performance with surgical precision.</p>
              </div>
              <div className="relative z-10 mt-8">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 font-bold px-8 h-14 rounded-xl">Explore Dashboards</Button>
              </div>
            </div>

            <div className="md:col-span-6 lg:col-span-4 p-10 rounded-[3.5rem] bg-emerald-50 border border-primary/10 flex flex-col justify-between group">
              <div className="h-16 w-16 rounded-[1.5rem] bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                <MessageSquare className="h-8 w-8" />
              </div>
              <div className="space-y-4">
                <h4 className="text-3xl font-black tracking-tighter uppercase">Omni-Channel <br />Inbox.</h4>
                <p className="text-slate-500 font-medium text-sm">Unified messaging across USSD, SMS, and WhatsApp in one clean interface.</p>
              </div>
            </div>

            <div className="md:col-span-6 lg:col-span-4 p-10 rounded-[3.5rem] bg-blue-50 border border-blue-500/10 flex flex-col justify-between group">
              <div className="h-16 w-16 rounded-[1.5rem] bg-blue-500/10 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <Calendar className="h-8 w-8" />
              </div>
              <div className="space-y-4">
                <h4 className="text-3xl font-black tracking-tighter uppercase">Smart <br />Scheduling.</h4>
                <p className="text-slate-500 font-medium text-sm">AI-optimized routes for farm visits based on urgency and location.</p>
              </div>
            </div>

            <div className="md:col-span-12 lg:col-span-8 p-12 rounded-[3.5rem] bg-slate-100 border border-slate-200 flex flex-col md:flex-row gap-12 items-center">
              <div className="space-y-6 flex-1 text-center md:text-left">
                <div className="h-16 w-16 rounded-[1.5rem] bg-white shadow-xl flex items-center justify-center text-slate-900 mx-auto md:mx-0">
                  <FileText className="h-8 w-8" />
                </div>
                <h3 className="text-4xl font-black tracking-tighter uppercase">E-Prescripts.</h3>
                <p className="text-slate-500 font-medium">Send digital prescriptions directly to farmers' phones, valid at any partner pharmacy.</p>
              </div>
              <div className="flex-1 w-full bg-white rounded-3xl p-6 shadow-2xl border border-slate-200">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-black">Rx</div>
                  <div>
                    <p className="text-xs font-black text-slate-400 tracking-widest">PRESCRIPTION #421</p>
                    <p className="font-bold">Oxytetracycline 20%</p>
                  </div>
                </div>
                <div className="space-y-2 mb-6">
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[70%]" />
                  </div>
                  <p className="text-[10px] text-right text-slate-400 font-bold uppercase tracking-widest">Dose: 1ml / 10kg</p>
                </div>
                <Button className="w-full h-12 rounded-xl bg-slate-950 text-white font-black">Issue Script</Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Case Management Loop */}
      <section className="py-40">
        <div className="container mx-auto max-w-7xl px-4 text-center">
          <h2 className="text-5xl md:text-8xl font-black tracking-tighter uppercase mb-32 leading-[0.8] mx-auto max-w-4xl">
            ONE PLATFORM. <br />
            <span className="text-slate-500 italic">TOTAL CONTROL.</span>
          </h2>

          <div className="grid md:grid-cols-4 gap-20">
            {[
              { title: 'TRIAGE', icon: <Layers className="h-10 w-10" />, desc: 'Real-time intake from USSD & App.' },
              { title: 'ANALYZE', icon: <Briefcase className="h-10 w-10" />, desc: 'Baseline AI symptoms assessment.' },
              { title: 'TREAT', icon: <Users className="h-10 w-10" />, desc: 'Consultation & digital prescription.' },
              { title: 'REPORT', icon: <ArrowRight className="h-10 w-10" />, desc: 'Case resolution & compliance logs.' },
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center space-y-8">
                <div className="h-24 w-24 rounded-[2.5rem] bg-white/5 border border-white/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  {step.icon}
                </div>
                <div className="space-y-4">
                  <h4 className="text-2xl font-black tracking-tight text-white uppercase">{step.title}</h4>
                  <p className="text-slate-500 font-medium text-sm max-w-[200px] mx-auto">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="rounded-[4rem] bg-gradient-to-br from-blue-600 to-primary p-12 md:p-32 text-center relative overflow-hidden">
            <div className="relative z-10 space-y-12">
              <h2 className="text-5xl md:text-8xl font-black text-white tracking-tighter uppercase leading-[0.8]">
                ELEVATE <br />YOUR CARE.
              </h2>
              <p className="text-2xl font-bold opacity-80 max-w-xl mx-auto text-white">Join 450+ certified veterinarians leading the agricultural revolution.</p>
              <div className="flex flex-col sm:flex-row justify-center gap-6">
                <Button className="h-20 px-16 rounded-2xl bg-white text-blue-600 font-black text-2xl hover:scale-105 transition-all shadow-2xl">
                  Create Vet Profile
                </Button>
                <Button variant="outline" className="h-20 px-16 rounded-2xl border-white/20 bg-white/10 text-white font-black text-2xl backdrop-blur-md hover:bg-white/20 transition-all">
                  Partner With Us
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Area */}
      <footer className="py-20 bg-[#050505]">
        <div className="container mx-auto px-4 text-center space-y-8">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
              <img src="/logo.png" alt="V" className="h-6 w-auto invert" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-white">VETLINK</span>
          </Link>
          <p className="text-slate-600 font-black text-[10px] uppercase tracking-[0.4em] italic leading-relaxed">Built for Rwanda. Powered by Passion. Managed by Pros.</p>
          <div className="flex justify-center gap-12 text-slate-500 font-black text-[10px] uppercase tracking-widest italic">
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-primary transition-colors">Terms</Link>
            <Link to="/support" className="hover:text-primary transition-colors">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
