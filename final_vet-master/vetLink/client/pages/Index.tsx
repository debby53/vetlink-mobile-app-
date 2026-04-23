import Header from "@/components/Header";
import { Link } from "react-router-dom";
import {
  Smartphone,
  MessageSquare,
  Globe,
  Users,
  Clock,
  Heart,
  CheckCircle,
  ArrowRight,
  Search,
  Star,
  Shield,
  Activity,
  Phone,
  BarChart3,
  Cloud,
  Award,
  Video,
  FileText,
  Target,
  Hash,
  Menu,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useLanguage } from "@/lib/LanguageContext";
import { Button } from "@/components/ui/button";
import { motion, Variants, useScroll, useTransform } from "framer-motion";
import { useState, useRef } from "react";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1]
    }
  },
};

export default function Home() {
  const { t } = useLanguage();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const { isAuthenticated } = useAuth();

  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.98]);

  return (
    <div className="min-h-screen bg-white antialiased overflow-x-hidden">
      <Header />

      {/* Hero Section - Brand Primary Green */}
      <section ref={heroRef} className="relative pt-20 pb-24 md:pt-28 md:pb-32 overflow-hidden bg-primary">
        {/* Decorative Pattern Overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        <div className="container mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
          <motion.div
            style={{ opacity: heroOpacity, scale: heroScale }}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center"
          >
            {/* Left Content */}
            <div className="space-y-8">
              <motion.div variants={itemVariants} className="space-y-6">
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30"
                >
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <span className="text-sm font-semibold text-white">
                    {t('heroBadge')}
                  </span>
                </motion.div>

                {/* Main Heading */}
                <div>
                  <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white leading-[1.1] tracking-tight">
                    <span className="block">{t('heroTitleLine1')}</span>
                    <span className="block">{t('heroTitleLine2')}</span>
                    
                  </h1>
                </div>

                {/* Description */}
                <p className="text-xl text-white/90 leading-relaxed max-w-xl">
                  {t('heroDescription')}
                </p>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                variants={itemVariants}
                className="flex flex-wrap items-center gap-4"
              >
                <Link to="/signup">
                  <Button className="h-14 px-8 text-base font-semibold rounded-xl bg-white text-primary hover:bg-white/90 shadow-xl hover:shadow-2xl transition-all">
                    {t('heroButtonStarted')}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button className="h-14 px-8 text-base font-semibold rounded-xl bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 hover:bg-white/20 transition-all">
                    <Phone className="mr-2 h-5 w-5" />
                    {t('heroButtonDial')}
                  </Button>
                </Link>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                variants={itemVariants}
                className="flex flex-wrap items-center gap-6 pt-4"
              >
                {[
                  { icon: <CheckCircle className="h-4 w-4" />, text: t('trustVets') },
                  { icon: <Shield className="h-4 w-4" />, text: t('trustSecure') },
                  { icon: <Star className="h-4 w-4" />, text: t('trustFarmers') }
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-white/90">
                    <div className="bg-white/20 p-1.5 rounded-full backdrop-blur-sm">
                      {item.icon}
                    </div>
                    <span className="text-sm font-medium">{item.text}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right Visual - Livestock Images Collage */}
            <motion.div
              variants={itemVariants}
              className="relative"
            >
              <div className="grid grid-cols-2 gap-4">
                {/* Main Large Image - Cow Portrait */}
                <div className="col-span-2 relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20 group">
                  <img
                    src="https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?q=80&w=800&auto=format&fit=crop"
                    alt="Healthy cow portrait"
                    className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-primary/20 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                            <Heart className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{t('imageOverlayHealthRate')}</p>
                            <p className="text-xs text-slate-600">{t('imageOverlayAnimals')}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">10K+</p>
                          <p className="text-xs text-slate-600">{t('imageOverlayAnimals')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Small Image 1 - Goat */}
                <div className="relative rounded-2xl overflow-hidden shadow-xl border-4 border-white/20 group">
                  <img
                    src="https://images.unsplash.com/photo-1524024973431-2ad916746881?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                    alt="Goat"
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/50 to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <p className="text-white font-bold text-sm">{t('imageOverlayGoat')}</p>
                  </div>
                </div>

                {/* Small Image 2 - Poultry */}
                <div className="relative rounded-2xl overflow-hidden shadow-xl border-4 border-white/20 group">
                  <img
                    src="https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=400&q=80"
                    alt="Poultry farming"
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/50 to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <p className="text-white font-bold text-sm">{t('imageOverlayPoultry')}</p>
                  </div>
                </div>
              </div>

              {/* Floating Stats */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="absolute -left-4 top-1/3 bg-white rounded-2xl shadow-2xl p-4 w-44"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Video className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-slate-900">24/7</p>
                    <p className="text-xs text-slate-600">{t('floatingStatVideoCalls')}</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16 space-y-4"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900">
              {t('featuresMainTitle')} <span className="text-primary">{t('featuresMainTitleHighlight')}</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              {t('featuresMainDesc')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <MessageSquare className="h-7 w-7" />,
                title: t('feature1Title'),
                description: t('feature1Desc'),
                image: "https://images.unsplash.com/photo-1623366302587-bca021d668f9?q=80&w=800&auto=format&fit=crop"
              },
              {
                icon: <Smartphone className="h-7 w-7" />,
                title: t('feature2Title'),
                description: t('feature2Desc'),
                image: "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&q=80"
              },
              {
                icon: <FileText className="h-7 w-7" />,
                title: t('feature3Title'),
                description: t('feature3Desc'),
                image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80"
              },
              {
                icon: <Target className="h-7 w-7" />,
                title: t('feature4Title'),
                description: t('feature4Desc'),
                image: "https://images.unsplash.com/photo-1596733430284-f7437764b1a9?q=80&w=800&auto=format&fit=crop"
              },
              {
                icon: <BarChart3 className="h-7 w-7" />,
                title: t('feature5Title'),
                description: t('feature5Desc'),
                image: "https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=800&q=80"
              },
              {
                icon: <Users className="h-7 w-7" />,
                title: t('feature6Title'),
                description: t('feature6Desc'),
                image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800&auto=format&fit=crop"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group bg-white rounded-2xl border border-slate-200 hover:border-primary/50 hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* Feature Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className={`absolute top-4 left-4 w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-lg`}>
                    <div className="text-primary">
                      {feature.icon}
                    </div>
                  </div>
                </div>

                {/* Feature Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* USSD Section - Clean & Professional */}
      <section className="py-24 bg-slate-50 border-y border-slate-200">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <Phone className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-primary">{t('ussdBadge')}</span>
              </div>

              <h2 className="text-5xl md:text-6xl font-extrabold text-slate-900 leading-tight">
                {t('ussdTitleLine1')} <br />
                {t('ussdTitleLine2')}
              </h2>

              <p className="text-xl text-slate-600 leading-relaxed font-normal">
                {t('ussdDescription')}
              </p>

              <div className="grid grid-cols-2 gap-6 pt-4">
                {[
                  { value: "0 Rwf", label: t('ussdStatNoData'), icon: "💰" },
                  { value: "100%", label: t('ussdStatCoverage'), icon: "📍" },
                  { value: "24/7", label: t('ussdStatAvailable'), icon: "⏰" },
                  { value: t('ussdStatLanguage'), label: "KIN & ENG", icon: "🗣️" }
                ].map((stat, index) => (
                  <div key={index} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                    <div className="text-2xl mb-3">{stat.icon}</div>
                    <div className="text-3xl font-bold text-slate-900 mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-slate-500 font-medium">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right: Realistic Phone Mockup */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex justify-center"
            >
              <div className="relative w-[300px] h-[600px] bg-black rounded-[3rem] shadow-2xl border-[12px] border-black overflow-hidden ring-1 ring-white/10">
                {/* Status Bar */}
                <div className="absolute top-0 inset-x-0 h-6 bg-black z-20 flex justify-between items-center px-6">
                  <span className="text-[10px] text-white font-medium">9:41</span>
                  <div className="flex gap-1.5">
                    <div className="w-4 h-4 rounded-full bg-black flex items-center justify-center p-0.5"><div className="w-full h-full bg-white rounded-[2px]" /></div>
                    <div className="w-4 h-4 rounded-full bg-black flex items-center justify-center p-0.5"><div className="w-full h-full bg-white rounded-[2px]" /></div>
                  </div>
                </div>

                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-b-2xl z-20" />

                {/* Screen Content - Dialer Interface */}
                <div className="w-full h-full bg-white flex flex-col relative z-0">
                  {/* Header/USSD Code Display */}
                  <div className="bg-primary/5 pb-6 pt-12 px-6 border-b border-primary/10">
                    <div className="flex justify-center mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                        <Hash className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <div className="text-center space-y-2">
                      <h3 className="text-3xl font-bold text-slate-900 tracking-tight">*789#</h3>
                      <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">VetLink USSD</p>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="flex-1 p-6 space-y-3 overflow-y-auto">
                    {[
                      { icon: <Activity className="w-4 h-4 text-primary" />, text: t('ussdMockupEmergency') },
                      { icon: <Search className="w-4 h-4 text-primary" />, text: t('ussdMockupFindVet') },
                      { icon: <Clock className="w-4 h-4 text-primary" />, text: t('ussdMockupAppointments') },
                      { icon: <FileText className="w-4 h-4 text-primary" />, text: t('ussdMockupMyRecords') },
                      { icon: <Target className="w-4 h-4 text-primary" />, text: t('ussdMockupMarketPrices') }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-primary/30 transition-all hover:bg-slate-100/80 active:scale-95 cursor-pointer">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white border border-slate-100 flex items-center justify-center shadow-sm text-xs font-bold text-slate-400">
                          {i + 1}
                        </div>
                        <span className="text-slate-700 font-medium flex-1">{item.text}</span>
                        {item.icon}
                      </div>
                    ))}
                  </div>

                  {/* Call Button area */}
                  <div className="p-6 bg-slate-50 border-t border-slate-100">
                    <div className="w-full h-14 bg-[#22c55e] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all active:scale-95 cursor-pointer group">
                      <Phone className="h-6 w-6 text-white fill-current animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section - Primary Green Brand Color */}
      <section className="py-24 bg-primary">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-10"
          >
            {[
              { value: "10,000+", label: t('statsFarmersServedLabel'), icon: <Users className="h-8 w-8" /> },
              { value: "500+", label: t('statsCertifiedVetsLabel'), icon: <Award className="h-8 w-8" /> },
              { value: "98%", label: t('statsSatisfactionLabel'), icon: <Star className="h-8 w-8" /> },
              { value: "30", label: t('statsDistrictsLabel'), icon: <Globe className="h-8 w-8" /> }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center group"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-sm mb-6 text-white group-hover:scale-110 transition-transform duration-300">
                  {stat.icon}
                </div>
                <div className="text-5xl font-extrabold text-white mb-2 tracking-tight">
                  {stat.value}
                </div>
                <div className="text-lg text-white/80 font-medium uppercase tracking-wider">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section - Redesigned: Clean, Interactive, Premium */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative rounded-[3rem] bg-gradient-to-br from-primary to-emerald-700 overflow-hidden px-6 py-20 sm:px-12 sm:py-24 text-center shadow-2xl shadow-primary/25"
          >
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.1, 0.2, 0.1],
                  rotate: [0, 45, 0]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] bg-white rounded-full blur-3xl opacity-10"
              />
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.1, 0.15, 0.1],
                  x: [0, -20, 0]
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-[20%] -left-[10%] w-[500px] h-[500px] bg-secondary rounded-full blur-3xl opacity-20"
              />
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-3xl mx-auto space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
                {t('ctaTitle')}
              </h2>
              <p className="text-xl text-primary-foreground/90 font-medium max-w-2xl mx-auto leading-relaxed">
                {t('ctaDesc')}
              </p>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block"
              >
                <Link to="/signup">
                  <Button className="h-16 px-10 text-lg font-bold rounded-2xl bg-white text-primary hover:bg-gray-50 shadow-xl transition-all flex items-center gap-3">
                    {t('ctaButton')}
                    <div className="bg-primary/10 rounded-full p-1">
                      <ArrowRight className="h-5 w-5 text-primary" />
                    </div>
                  </Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer - Consistent Primary Green */}
      <footer className="bg-primary text-white py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="bg-white/10 p-2 rounded-xl backdrop-blur-sm">
                  <img src="/logo.png" alt="VetLink Logo" className="h-10 w-auto object-contain brightness-0 invert" />
                </div>
                <span className="text-2xl font-bold tracking-tight text-white">VetLink</span>
              </div>
              <p className="text-white/80 leading-relaxed max-w-xs font-medium">
                {t('footerSlogan')}
              </p>
            </div>

            {[
              {
                title: t('footerProduct'),
                links: ["footerFeatures", "footerPricing", "footerUSSD", "footerMobileApp"]
              },
              {
                title: t('footerCompany'),
                links: ["footerAbout", "footerCareers", "footerBlog", "footerContact"]
              },
              {
                title: t('footerResources'),
                links: ["footerHelpCenter", "footerCommunity", "footerDocs", "footerStatus"]
              }
            ].map((column, index) => (
              <div key={index} className="space-y-6">
                <h4 className="font-bold text-lg tracking-wide text-white">{column.title}</h4>
                <ul className="space-y-4">
                  {column.links.map((linkKey) => (
                    <li key={linkKey}>
                      <a
                        href="#"
                        className="text-white/80 hover:text-white transition-colors hover:translate-x-1 inline-block font-medium"
                      >
                        {t(linkKey)}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-white/20 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/80 text-sm font-medium">
              {t('footerRights')}
            </p>
            <div className="flex gap-8 text-white/80 text-sm font-medium">
              <a href="#" className="hover:text-white transition-colors">{t('footerPrivacy')}</a>
              <a href="#" className="hover:text-white transition-colors">{t('footerTerms')}</a>
              <a href="#" className="hover:text-white transition-colors">{t('footerCookies')}</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}