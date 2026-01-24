import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarLayout from '@/components/SidebarLayout';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/LanguageContext';
import { toast } from 'sonner';
import {
  Heart,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  ArrowRight,
  TrendingUp,
  MessageSquare,
  Activity,
  Zap,
  Target,
} from 'lucide-react';
import { caseAPI, animalAPI, CaseDTO, AnimalDTO } from '@/lib/apiService';

export default function FarmerDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [showNewCase, setShowNewCase] = useState(false);
  const [cases, setCases] = useState<CaseDTO[]>([]);
  const [animals, setAnimals] = useState<AnimalDTO[]>([]);
  const [stats, setStats] = useState({
    activeCases: 0,
    resolved: 0,
    avgResponse: '0h',
    totalAnimals: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user?.id]);

  const loadDashboardData = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const casesData = await caseAPI.getCasesByFarmerId(user.id);
      const animalsData = await animalAPI.getAnimalsByFarmerId(user.id);

      setCases(casesData);
      setAnimals(animalsData);

      // Calculate stats
      const activeCases = casesData.filter(c => c.status === 'OPEN' || c.status === 'IN_PROGRESS').length;
      const resolvedCases = casesData.filter(c => c.status === 'CLOSED').length;

      setStats({
        activeCases,
        resolved: resolvedCases,
        avgResponse: '2h', // This would typically come from backend analytics
        totalAnimals: animalsData.length,
      });
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const statsDisplay = [
    {
      label: t('activeCases'),
      value: stats.activeCases.toString(),
      change: '+1 this week',
      icon: Heart,
      color: 'text-red-500',
      bg: 'bg-red-50',
    },
    {
      label: t('resolved'),
      value: stats.resolved.toString(),
      change: '92% success rate',
      icon: CheckCircle,
      color: 'text-green-500',
      bg: 'bg-green-50',
    },
    {
      label: t('avgResponse'),
      value: stats.avgResponse,
      change: 'Faster than average',
      icon: Clock,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
    },
    {
      label: t('animals'),
      value: stats.totalAnimals.toString(),
      change: `${stats.totalAnimals} animals`,
      icon: Activity,
      color: 'text-purple-500',
      bg: 'bg-purple-50',
    },
  ];

  const recentCases = cases.slice(0, 3);

  return (
    <SidebarLayout>
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {t('welcomeBack')}, <span className="capitalize">{user?.name}</span>! 👋
          </h1>
          <p className="text-muted-foreground">
            {t('headerSubtitle')}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsDisplay.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold text-foreground mt-1">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bg}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{stat.change}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Cases */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">{t('recentCases')}</h2>
              <button
                onClick={() => setShowNewCase(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-all text-sm"
              >
                <Plus className="h-5 w-5" />
                {t('newCase')}
              </button>
            </div>

            {isLoading ? (
              <div className="p-6 text-center text-muted-foreground">
                {t('loading') || 'Loading...'}
              </div>
            ) : recentCases.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {recentCases.map((caseItem) => {
                  const animal = animals.find(a => a.id === caseItem.animalId);
                  return (
                    <div key={caseItem.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-foreground">{animal?.name || 'Unknown'}</p>
                          <p className="text-sm text-muted-foreground mt-1">{caseItem.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {caseItem.status === 'IN_PROGRESS' && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold">
                              <Clock className="h-3 w-3" />
                              {t('inProgress')}
                            </span>
                          )}
                          {caseItem.status === 'CLOSED' && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold">
                              <CheckCircle className="h-3 w-3" />
                              {t('closed')}
                            </span>
                          )}
                          {caseItem.status === 'OPEN' && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
                              <AlertCircle className="h-3 w-3" />
                              {t('open')}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>#{caseItem.id}</span>
                        <span>{caseItem.createdAt ? new Date(caseItem.createdAt).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center text-muted-foreground">
                {t('noCasesFound')}
              </div>
            )}

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <button
                onClick={() => {
                  navigate('/farmer/cases');
                  toast.info('Loading your cases');
                }}
                className="text-primary font-semibold text-sm hover:underline flex items-center gap-2"
              >
                {t('viewAllCases')}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-primary to-primary/80 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-bold text-lg">{t('quickActions')}</h3>
                <Zap className="h-6 w-6 opacity-80" />
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    navigate('/farmer/cases/new');
                    toast.info('Opening new case form');
                  }}
                  className="w-full bg-white/20 hover:bg-white/30 transition-all backdrop-blur rounded-lg px-4 py-3 text-white font-medium text-sm text-left flex items-center gap-2"
                >
                  <Heart className="h-4 w-4" />
                  {t('startAssessment')}
                </button>
                <button
                  onClick={() => {
                    navigate('/farmer/messages');
                    toast.info('Opening messages');
                  }}
                  className="w-full bg-white/20 hover:bg-white/30 transition-all backdrop-blur rounded-lg px-4 py-3 text-white font-medium text-sm text-left flex items-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  {t('chatWithVet')}
                </button>
                <button
                  onClick={() => {
                    navigate('/farmer/records');
                    toast.info('Loading your health records');
                  }}
                  className="w-full bg-white/20 hover:bg-white/30 transition-all backdrop-blur rounded-lg px-4 py-3 text-white font-medium text-sm text-left flex items-center gap-2"
                >
                  <Target className="h-4 w-4" />
                  {t('viewAssessments')}
                </button>
              </div>
            </div>

            {/* Health Alert */}
            <div className="bg-orange-50 rounded-xl p-6 shadow-sm border border-orange-200">
              <div className="flex gap-3">
                <AlertCircle className="h-6 w-6 text-orange-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-orange-900">{t('healthAlert')}</h4>
                  <p className="text-sm text-orange-800 mt-1">
                    Monitor your animals regularly for any health changes.
                  </p>
                  <button className="mt-3 text-sm font-semibold text-orange-600 hover:text-orange-700">
                    {t('getHelp')} →
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h4 className="font-semibold text-foreground mb-4">{t('thisMonth')}</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t('casesHandled')}</span>
                  <span className="font-bold text-foreground">{cases.length}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: `${Math.min((cases.length / 10) * 100, 100)}%` }}></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t('successRate')}</span>
                  <span className="font-bold text-green-600">92%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
