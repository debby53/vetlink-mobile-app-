import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Globe, LogIn, ChevronDown, User, LogOut, Settings, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage, Language } from '@/lib/LanguageContext';
import { useAuth } from '@/lib/AuthContext';

export default function LandingHeader() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const { user, logout } = useAuth();
    const { language, setLanguage, t } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { key: 'farmers', path: '/farmers' },
        { key: 'veterinarians', path: '/veterinarians' },
        { key: 'cahws', path: '/cahws' },
    ];

    const handleLogout = () => {
        logout();
        setShowUserMenu(false);
        navigate('/');
    };

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'py-3' : 'py-5'
                }`}
        >
            <div className="container mx-auto px-4">
                <div className={`relative flex items-center justify-between px-6 py-2 rounded-2xl transition-all duration-500 ${isScrolled
                        ? 'bg-black/40 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]'
                        : 'bg-transparent'
                    }`}>
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-3 shadow-lg shadow-primary/20">
                            <img src="/logo.png" alt="V" className="h-6 w-auto invert" />
                        </div>
                        <span className="text-2xl font-black tracking-tighter text-white">VETLINK</span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-10">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`text-sm font-bold transition-all hover:text-primary ${location.pathname === link.path ? 'text-primary' : 'text-slate-300'
                                    }`}
                            >
                                {t(link.key)}
                            </Link>
                        ))}
                    </nav>

                    {/* Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center gap-3 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10 group"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-black text-xs border border-primary/30 group-hover:scale-110 transition-transform">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-sm font-bold text-white max-w-[100px] truncate">
                                        {user.name}
                                    </span>
                                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {showUserMenu && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                            className="absolute right-0 mt-3 w-56 bg-black/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl z-50 p-2"
                                        >
                                            <div className="px-4 py-3 border-b border-white/5 mb-2">
                                                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Signed in as</p>
                                                <p className="text-sm font-bold text-white truncate">{user.email}</p>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    navigate('/dashboard');
                                                    setShowUserMenu(false);
                                                }}
                                                className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 transition-all font-bold text-sm rounded-xl"
                                            >
                                                <Globe className="h-4 w-4" />
                                                {t('dashboard')}
                                            </button>

                                            <button
                                                onClick={() => {
                                                    navigate('/settings');
                                                    setShowUserMenu(false);
                                                }}
                                                className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 transition-all font-bold text-sm rounded-xl"
                                            >
                                                <Settings className="h-4 w-4" />
                                                {t('settings')}
                                            </button>

                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all font-bold text-sm rounded-xl mt-2"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                {t('logout')}
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <>
                                <Button
                                    variant="ghost"
                                    className="text-white hover:bg-white/10 gap-2 font-bold px-6"
                                    onClick={() => navigate('/login')}
                                >
                                    <LogIn className="h-4 w-4" />
                                    {t('signIn')}
                                </Button>
                                <Button
                                    className="bg-primary hover:bg-primary/90 text-white rounded-xl px-8 py-6 font-black tracking-tight shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all h-auto"
                                    onClick={() => navigate('/signup')}
                                >
                                    {t('createAccount')}
                                </Button>
                            </>
                        )}
                        {/* Language selector */}
                        <div className="flex items-center">
                            <label htmlFor="lang-select" className="sr-only">Language</label>
                            <select
                                id="lang-select"
                                value={language}
                                onChange={(e) => setLanguage(e.target.value as Language)}
                                className="rounded-lg border border-border bg-black/20 text-white px-3 py-2 text-sm mr-2"
                            >
                                <option value="en">{t('english')}</option>
                                <option value="kinyarwanda">{t('kinyarwanda')}</option>
                                <option value="fr">{t('french')}</option>
                            </select>
                        </div>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden p-2 text-white bg-white/5 rounded-xl border border-white/10"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-full left-0 right-0 mt-4 px-4 md:hidden"
                    >
                        <div className="bg-black/95 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-8 space-y-8 shadow-2xl">
                            <nav className="flex flex-col gap-6">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.name}
                                        to={link.path}
                                        className="text-2xl font-black text-white hover:text-primary transition-colors"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                            </nav>
                            {/* Mobile language selector */}
                            <div className="pt-4">
                                <label htmlFor="mobile-lang-select" className="sr-only">Language</label>
                                <select
                                    id="mobile-lang-select"
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value as Language)}
                                    className="w-full rounded-lg border border-border bg-black/20 text-white px-3 py-2 text-sm"
                                >
                                    <option value="en">{t('english')}</option>
                                    <option value="kinyarwanda">{t('kinyarwanda')}</option>
                                    <option value="fr">{t('french')}</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-4 pt-8 border-t border-white/5">
                                {user ? (
                                    <Button className="w-full h-16 rounded-[1.5rem] bg-primary font-black text-lg" onClick={() => navigate('/dashboard')}>{t('dashboard')}</Button>
                                ) : (
                                    <>
                                        <Button className="w-full h-16 rounded-[1.5rem] bg-primary font-black text-lg" onClick={() => navigate('/signup')}>{t('signUp')}</Button>
                                        <Button variant="ghost" className="w-full h-16 rounded-[1.5rem] text-white font-bold text-lg" onClick={() => navigate('/login')}>{t('signIn')}</Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
