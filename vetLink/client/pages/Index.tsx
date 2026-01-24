import Header from "@/components/Header";
import { Link } from "react-router-dom";
import {
  Smartphone,
  MessageSquare,
  Globe,
  Users,
  Clock,
  TrendingUp,
  Heart,
  CheckCircle,
  ArrowRight,
  Zap,
  Search,
  Star,
  Shield,
  Activity,
  Phone,
  Leaf,
  Target,
  BarChart3,
  Cloud,
  SmartphoneNfc,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useLanguage } from "@/lib/LanguageContext";
import { Navigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
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
  const [searchFocused, setSearchFocused] = useState(false);
  const [imageHovered, setImageHovered] = useState(false);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const { isAuthenticated } = useAuth();

  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.98]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 antialiased overflow-x-hidden">
      <Header />

      {/* Modern Hero Section */}
      <section ref={heroRef} className="relative pt-20 pb-20 md:pt-28 md:pb-36 overflow-hidden">
        {/* Clean Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />

        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />

        <div className="container mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
          <motion.div
            style={{ opacity: heroOpacity, scale: heroScale }}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center"
          >
            {/* Left Content */}
            <div className="space-y-6">
              <motion.div variants={itemVariants} className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20"
                >
                  <div className="flex items-center gap-1.5">
                    <Leaf className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-semibold text-primary tracking-wide">
                      {t('connectedVeterinaryCare')}
                    </span>
                  </div>
                </motion.div>

                <div>
                  <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 leading-tight tracking-tight">
                    <span className="block">{t('heroLine1')}</span>
                    <span className="block text-primary">{t('heroLine2')}</span>
                    <span className="block">{t('heroLine3')}</span>
                  </h1>
                </div>
              </motion.div>

              <motion.p
                variants={itemVariants}
                className="text-lg text-slate-600 leading-relaxed max-w-xl"
              >
                {t('heroDesc')}
              </motion.p>

              {/* Clean Search Bar - Enhanced */}
              <motion.div
                variants={itemVariants}
                className="space-y-3"
              >
                <div className="relative">
                  <div className="relative flex items-center bg-white rounded-xl shadow-sm border border-slate-200 p-1 group hover:border-primary/50 transition-colors duration-300">
                    <Search className="absolute left-4 h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
                    <Input
                      placeholder={t('searchPlaceholderLanding')}
                      onFocus={() => setSearchFocused(true)}
                      onBlur={() => setSearchFocused(false)}
                      className="pl-11 border-none bg-transparent text-base h-12 focus-visible:ring-0"
                    />
                    <Button className="ml-2 px-6 h-10 rounded-lg bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:opacity-90 transition-all shadow-md hover:shadow-lg">
                      {t('search')}
                    </Button>
                  </div>
                  <p className="text-sm text-slate-500 mt-2 px-1">
                    Try searching for: "vaccination schedule", "sick cow symptoms", "nearest vet"
                  </p>
                </div>
              </motion.div>

              {/* Trust Badges - Enhanced */}
              <motion.div
                variants={itemVariants}
                className="flex flex-wrap items-center gap-4 pt-6"
              >
                <div className="flex items-center gap-2 text-slate-600 bg-white/50 backdrop-blur-sm px-3 py-2 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  </div>
                  <span className="text-sm font-medium">HIPAA Compliant</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 bg-white/50 backdrop-blur-sm px-3 py-2 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10">
                    <Users className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-sm font-medium">10K+ Farmers</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 bg-white/50 backdrop-blur-sm px-3 py-2 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100">
                    <Shield className="h-3 w-3 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium">Secure Platform</span>
                </div>
              </motion.div>

              {/* Quick Stats */}
              <motion.div
                variants={itemVariants}
                className="grid grid-cols-3 gap-3 pt-4"
              >
                {[
                  { value: "24/7", label: "Support", color: "text-primary" },
                  { value: "2 min", label: "Response", color: "text-green-600" },
                  { value: "100%", label: "Coverage", color: "text-blue-600" }
                ].map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
                    <div className="text-xs text-slate-500">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right Visual - Interactive Livestock Image with Dashboard Overlay */}
            <motion.div
              variants={itemVariants}
              className="relative"
              onMouseEnter={() => setImageHovered(true)}
              onMouseLeave={() => setImageHovered(false)}
            >
              {/* Main Image Container with Interactive Effects */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20">
                {/* Background Livestock Image */}
                <div className="relative h-[420px] md:h-[520px] w-full">
                  {/* Fallback gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 to-amber-50" />

                  {/* Actual livestock image - Using a beautiful Rwandan pastoral scene */}
                  <img
                    src="https://images.unsplash.com/photo-1596733430284-f7437764b1a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                    alt="Rwandan livestock - cows and goats in a pastoral setting"
                    className="absolute inset-0 w-full h-full object-cover transition-all duration-700"
                    style={{
                      transform: imageHovered ? 'scale(1.05)' : 'scale(1)',
                      filter: imageHovered ? 'brightness(1.1) saturate(1.2)' : 'brightness(1) saturate(1)'
                    }}
                  />

                  {/* Gradient overlay for better text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />

                  {/* Animated floating animals overlay */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="absolute inset-0 pointer-events-none"
                  >
                    {[1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        className="absolute"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{
                          y: [0, -8, 0],
                          opacity: [0.3, 0.5, 0.3]
                        }}
                        transition={{
                          duration: 3 + i,
                          repeat: Infinity,
                          delay: i * 0.5
                        }}
                        style={{
                          left: `${20 + i * 25}%`,
                          top: `${30 + i * 15}%`,
                        }}
                      >
                        <div className="w-3 h-3 rounded-full bg-primary/30 backdrop-blur-sm" />
                      </motion.div>
                    ))}
                  </motion.div>
                </div>

                {/* Floating Dashboard Preview - Overlay on image */}
                <motion.div
                  initial={{ x: 40, y: 40, opacity: 0 }}
                  animate={{ x: 0, y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="absolute -bottom-5 -right-5 w-full max-w-xs md:max-w-sm"
                >
                  <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-white/30 p-4 transform hover:scale-[1.02] transition-transform duration-300">
                    {/* Dashboard Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Activity className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-slate-900">Vet Dashboard</h3>
                          <p className="text-xs text-slate-500">Live monitoring</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                        ))}
                      </div>
                    </div>

                    {/* Dashboard Content */}
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Active Cases", value: "128", change: "+12%", color: "text-green-600" },
                        { label: "Response", value: "2h", change: "-30m", color: "text-blue-600" },
                        { label: "Satisfaction", value: "96%", change: "+4%", color: "text-amber-600" },
                        { label: "Online", value: "342", change: "+24", color: "text-purple-600" },
                      ].map((stat, i) => (
                        <div key={i} className="bg-white/80 rounded-lg p-3 backdrop-blur-sm">
                          <p className="text-xs text-slate-600 mb-1">{stat.label}</p>
                          <div className="flex items-end gap-1">
                            <p className="text-lg font-bold text-slate-900">{stat.value}</p>
                            <span className={`text-xs ${stat.color} font-medium`}>
                              {stat.change}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Floating Mobile Preview */}
                  <motion.div
                    initial={{ x: -40, y: 20, opacity: 0 }}
                    animate={{ x: 0, y: 0, opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="absolute -top-4 -left-4 w-40 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-white/30 p-3"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-lg bg-secondary/10 flex items-center justify-center">
                        <SmartphoneNfc className="h-3 w-3 text-secondary" />
                      </div>
                      <div>
                        <h4 className="text-xs font-medium">USSD Access</h4>
                        <p className="text-xs text-slate-500 font-mono">*789#</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-1.5 rounded-full bg-slate-200/70" />
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid - Clean & Modern */}
      <section className="py-16 bg-white">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 space-y-3"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              Everything You Need in One Platform
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Comprehensive veterinary solutions designed for Rwanda's unique needs
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <MessageSquare className="h-6 w-6" />,
                title: "Instant Consultation",
                description: "Connect with certified veterinarians in real-time via chat, voice, or video.",
                color: "bg-blue-50 text-blue-600",
                gradient: "from-blue-50 to-white"
              },
              {
                icon: <Smartphone className="h-6 w-6" />,
                title: "USSD Access",
                description: "No internet? No problem. Access services via *789# on any phone.",
                color: "bg-green-50 text-green-600",
                gradient: "from-green-50 to-white"
              },
              {
                icon: <Cloud className="h-6 w-6" />,
                title: "Health Records",
                description: "Secure digital records accessible anytime, anywhere.",
                color: "bg-purple-50 text-purple-600",
                gradient: "from-purple-50 to-white"
              },
              {
                icon: <Target className="h-6 w-6" />,
                title: "Preventive Care",
                description: "Get alerts for vaccinations, treatments, and check-ups.",
                color: "bg-orange-50 text-orange-600",
                gradient: "from-orange-50 to-white"
              },
              {
                icon: <BarChart3 className="h-6 w-6" />,
                title: "Farm Analytics",
                description: "Monitor livestock health trends and productivity insights.",
                color: "bg-indigo-50 text-indigo-600",
                gradient: "from-indigo-50 to-white"
              },
              {
                icon: <Users className="h-6 w-6" />,
                title: "Community Network",
                description: "Connect with other farmers and share experiences.",
                color: "bg-pink-50 text-pink-600",
                gradient: "from-pink-50 to-white"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className={`group bg-gradient-to-br ${feature.gradient} p-6 rounded-xl border border-slate-200 hover:border-primary/30 hover:shadow-lg transition-all duration-300`}
              >
                <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* USSD Section - Clean Design */}
      <section className="py-16 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-4"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-300">
                  <Phone className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-semibold">Universal Access</span>
                </div>

                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
                  Veterinary Care Without Internet
                </h2>

                <p className="text-lg text-slate-600 leading-relaxed">
                  Our USSD service brings professional veterinary consultation to every basic phone in Rwanda.
                  Simply dial <span className="font-bold text-primary">*789#</span> to get started.
                </p>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  {[
                    { value: "0 Rwf", label: "No Data Cost", icon: "💰" },
                    { value: "100%", label: "National Coverage", icon: "📍" },
                    { value: "24/7", label: "Always Available", icon: "⏰" },
                    { value: "2 Languages", label: "Kinyarwanda & English", icon: "🗣️" }
                  ].map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white p-4 rounded-lg border border-slate-200 hover:border-primary/30 transition-colors"
                    >
                      <div className="text-xl mb-1">{stat.icon}</div>
                      <div className="text-lg font-bold text-slate-900 mb-0.5">
                        {stat.value}
                      </div>
                      <div className="text-sm text-slate-600">
                        {stat.label}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* USSD Phone Mockup */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex justify-center"
            >
              <div className="relative w-full max-w-xs">
                <div className="bg-slate-900 rounded-[2rem] p-6 pb-8 shadow-2xl">
                  {/* Phone Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-10" />

                  <div className="space-y-4 pt-6">
                    <div className="text-center">
                      <div className="inline-block px-5 py-1.5 rounded-full bg-primary/20 mb-3">
                        <code className="text-lg font-bold text-white">*789#</code>
                      </div>
                      <p className="text-xs text-slate-400">VetLink USSD Service</p>
                    </div>

                    <div className="space-y-2">
                      {[
                        "1. Emergency Consultation",
                        "2. Find Nearest Vet",
                        "3. Schedule Check-up",
                        "4. Medication Advice",
                        "5. Health Records"
                      ].map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
                        >
                          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <span className="text-sm text-white font-medium">{item}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3">
                      <div className="h-10 w-full rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold text-base cursor-pointer hover:opacity-90 transition-all">
                        DIAL NOW
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              { value: "10,000+", label: "Farmers Served", icon: <Users />, color: "bg-primary/10 text-primary" },
              { value: "92%", label: "Satisfaction Rate", icon: <Star />, color: "bg-amber-100 text-amber-600" },
              { value: "2h", label: "Avg. Response Time", icon: <Clock />, color: "bg-blue-100 text-blue-600" },
              { value: "100%", label: "Rwanda Coverage", icon: <Globe />, color: "bg-green-100 text-green-600" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-4 rounded-xl bg-gradient-to-b from-slate-50 to-white border border-slate-200 hover:border-primary/30 transition-colors"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${stat.color} mb-3`}>
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold text-slate-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-600 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section - Enhanced without buttons */}
      <section className="py-16 bg-gradient-to-r from-primary/90 to-secondary/90">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center space-y-4"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Ready to Transform Animal Care?
            </h2>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              Join thousands of farmers and veterinarians using VetLink to improve livestock health and productivity.
            </p>

            {/* Interactive Stats Bar */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap justify-center gap-6 pt-6"
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-white">24/7</div>
                <div className="text-sm text-white/80">Support Available</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">98%</div>
                <div className="text-sm text-white/80">Problem Resolution</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">45%</div>
                <div className="text-sm text-white/80">Cost Reduction</div>
              </div>
            </motion.div>

            {/* Search Bar in CTA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="pt-4"
            >
              <div className="relative max-w-md mx-auto">
                <div className="relative flex items-center bg-white/10 backdrop-blur-sm rounded-lg p-1 border border-white/20">
                  <Search className="absolute left-3 h-4 w-4 text-white/70" />
                  <Input
                    placeholder="Search for vets, medicines, or advice..."
                    className="pl-9 border-none bg-transparent text-white placeholder-white/70 text-sm h-10 focus-visible:ring-0"
                  />
                  <Button className="ml-2 px-4 h-8 rounded-md bg-white text-primary text-sm font-semibold hover:bg-white/90 transition-colors">
                    Search
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Activity className="h-4 w-4" />
                </div>
                <span className="text-xl font-bold">VetLink</span>
              </div>
              <p className="text-sm text-slate-400">
                Revolutionizing veterinary care across Rwanda with accessible, technology-driven solutions.
              </p>
            </div>

            {[
              {
                title: "Product",
                links: ["Features", "Pricing", "USSD", "Mobile App", "API"]
              },
              {
                title: "Company",
                links: ["About", "Careers", "Blog", "Press", "Contact"]
              },
              {
                title: "Resources",
                links: ["Documentation", "Help Center", "Community", "Partners", "Status"]
              }
            ].map((column, index) => (
              <div key={index} className="space-y-3">
                <h4 className="font-semibold text-sm">{column.title}</h4>
                <ul className="space-y-2">
                  {column.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-sm text-slate-400 hover:text-white transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-500">
              © 2024 VetLink. All rights reserved.
            </p>
            <div className="flex gap-4 text-xs text-slate-500">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}