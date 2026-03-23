import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarLayout from '@/components/SidebarLayout';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/LanguageContext';
import { toast } from 'sonner';
import { caseAPI, userAPI, animalAPI, CaseDTO } from '@/lib/apiService';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Plus,
  Search,
  ArrowRight,
  BarChart3,
  Users,
  MessageSquare,
} from 'lucide-react';
import CAHWApplicationManager from '@/components/CAHWApplicationManager';

export default function VeterinarianDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [cases, setCases] = useState<CaseDTO[]>([]);
  const [farmersCount, setFarmersCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;
      setIsLoading(true);
      try {
        // Load cases assigned to veterinarian
        const assignedCases = await caseAPI.getCasesByVeterinarianId(Number(user.id));

        // Load cases in the same sector/location
        let sectorCases: CaseDTO[] = [];
        try {
          sectorCases = await caseAPI.getCasesByVeterinarianLocation(Number(user.id));
        } catch (e) {
          console.warn('Failed to fetch sector cases', e);
        }

        // Combine and dedup
        const assignedIds = new Set(assignedCases.map((c: any) => c.id));
        const newSectorCases = sectorCases.filter((c: any) => !assignedIds.has(c.id));
        const allCases = [...assignedCases, ...newSectorCases];

        setCases(allCases);

        // Load farmers served
        const farmersList = await userAPI.getUsersByRole('farmer');
        setFarmersCount(farmersList?.length || 0);

        // Fallback: Enrich cases with names if missing from backend
        // This handles the case where backend hasn't been restarted to include new fields
        let casesUpdated = false;
        const enrichedCases = [...allCases];

        // 1. Enrich Farmer Names
        if (farmersList) {
          const farmerMap = new Map(farmersList.map((f: any) => [f.id, f]));
          enrichedCases.forEach(c => {
            if (!c.farmerName && c.farmerId && farmerMap.has(c.farmerId)) {
              c.farmerName = farmerMap.get(c.farmerId).name;
              casesUpdated = true;
            }
          });
        }

        // 2. Enrich Animal Names (Fetch only missing)
        const missingAnimalIds = new Set(enrichedCases.filter(c => !c.animalName && c.animalId).map(c => c.animalId));
        if (missingAnimalIds.size > 0) {
          try {
            await Promise.all(Array.from(missingAnimalIds).map(async (id) => {
              try {
                const animal = await animalAPI.getAnimalById(id);
                enrichedCases.forEach(c => {
                  if (c.animalId === id && !c.animalName) {
                    c.animalName = animal.name;
                    casesUpdated = true;
                  }
                });
              } catch (e) {
                console.warn(`Failed to fetch animal ${id}`, e);
              }
            }));
          } catch (e) {
            console.warn('Error fetching missing animals', e);
          }
        }

        if (casesUpdated) {
          setCases(enrichedCases);
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [user?.id]);

  // Calculate statistics
  const activeCases = cases.filter((c) => c.status === 'PENDING' || c.status === 'IN_PROGRESS').length;
  const resolvedThisMonth = cases.filter((c) => {
    if (c.status !== 'RESOLVED') return false;
    const caseDate = new Date(c.updatedAt || '');
    const now = new Date();
    return caseDate.getMonth() === now.getMonth() && caseDate.getFullYear() === now.getFullYear();
  }).length;
  const successRate = cases.length === 0 ? 0 : Math.round((resolvedThisMonth / cases.length) * 100);
  const avgResponseHours = cases.length === 0 ? t('na') : `${((cases.reduce((sum, c) => {
    const created = c.createdAt ? new Date(c.createdAt).getTime() : 0;
    const updated = c.updatedAt ? new Date(c.updatedAt).getTime() : created;
    return sum + Math.max(0, (updated - created) / (1000 * 60 * 60));
  }, 0) / cases.length)).toFixed(1)}h`;

  const stats = [
    {
      label: t('activeCases'),
      value: String(activeCases),
      change: `${Math.max(0, activeCases - (cases.length > 0 ? resolvedThisMonth : 0))} ${t('pending')}`,
      icon: AlertCircle,
      color: 'text-red-500',
      bg: 'bg-red-50',
    },
    {
      label: t('resolvedThisMonth'),
      value: String(resolvedThisMonth),
      change: `${successRate}% ${t('resolutionRate')}`,
      icon: CheckCircle,
      color: 'text-green-500',
      bg: 'bg-green-50',
    },
    {
      label: t('avgResponseTime'),
      value: avgResponseHours,
      change: t('liveMonitoring'),
      icon: Clock,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
    },
    {
      label: t('farmersServed'),
      value: String(farmersCount),
      change: `+12 ${t('thisMonth')}`,
      icon: Users,
      color: 'text-purple-500',
      bg: 'bg-purple-50',
    },
  ];

  const filteredCases = cases.filter((caseItem) => {
    const matchesSearch =
      (caseItem.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (caseItem.caseType?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (String(caseItem.id).toLowerCase().includes(searchQuery.toLowerCase()) || false);
    const mappedStatus = caseItem.status === 'RESOLVED' ? 'resolved' : 'active';
    const matchesStatus = filterStatus === 'all' || mappedStatus === filterStatus;
    return matchesSearch && matchesStatus;
  }).slice(0, 8); // Limit to 8 cases for display

  // Pending follow-ups (cases with IN_PROGRESS status)
  const pendingFollowups = cases
    .filter((c) => c.status === 'IN_PROGRESS')
    .slice(0, 3);

  // Monthly stats
  const monthlyStats = {
    casesHandled: cases.length,
    farmersHelped: farmersCount,
    animalsTreated: cases.length, // Approximation, can be refined with animal count
  };

  if (isLoading) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">{t('loading')}</p>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {t('welcomeBack')}, Dr. <span className="capitalize">{user?.name}</span>! 👋
          </h1>
          <p className="text-muted-foreground">
            {t('headerSubtitleVet')}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
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
          {/* Cases List */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-foreground">{t('activeCases')}</h2>
              </div>

              {/* Search & Filter */}
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder={t('searchPlaceholderVet')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div className="flex gap-2 flex-wrap">
                  {['all', 'active', 'resolved'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${filterStatus === status
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-foreground hover:bg-gray-200'
                        }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Cases Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                      {t('caseId')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                      {t('farmer')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                      {t('animal')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                      {t('status')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                      {t('action')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCases.map((caseItem) => (
                    <tr key={caseItem.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-foreground text-sm">
                        CASE-{caseItem.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {caseItem.farmerName || t('unknown')}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {caseItem.animalName || t('na')}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {['OPEN', 'ASSIGNED', 'RECEIVED', 'PENDING', 'IN_PROGRESS'].includes(caseItem.status || '') && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 font-semibold text-xs">
                            <Clock className="h-3 w-3" />
                            {caseItem.status}
                          </span>
                        )}
                        {['RESOLVED', 'COMPLETED', 'CLOSED'].includes(caseItem.status || '') && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-800 font-semibold text-xs">
                            <CheckCircle className="h-3 w-3" />
                            {caseItem.status}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => {
                            navigate(`/veterinarian/cases/${caseItem.id}`);
                          }}
                          className="text-primary font-semibold hover:underline flex items-center gap-1"
                        >
                          {t('viewDetails')}
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            {/* Performance */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">{t('performance')}</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">{t('resolutionRate')}</span>
                    <span className="font-bold text-primary">{successRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: `${successRate}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">{t('avgResponseTime')}</span>
                    <span className="font-bold text-green-600">{avgResponseHours}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: `${Math.min(100, successRate)}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-500" />
                {t('pendingFollowups')}
              </h3>
              <div className="space-y-3">
                {pendingFollowups.length > 0 ? (
                  pendingFollowups.map((caseItem) => (
                    <div
                      key={caseItem.id}
                      className="p-3 bg-orange-50 rounded-lg border border-orange-200"
                    >
                      <p className="text-sm font-medium text-orange-900">
                        CASE-{caseItem.id}
                      </p>
                      <p className="text-xs text-orange-700 mt-1">
                        {caseItem.description || t('followupNeeded')}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">{t('noPendingFollowups')}</p>
                )}
              </div>
            </div>

            {/* CAHW Approvals */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <CAHWApplicationManager />
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-primary to-primary/80 rounded-xl p-6 text-white shadow-lg">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                {t('monthlyStats')}
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="opacity-90">{t('casesHandled')}</span>
                  <span className="font-bold">{monthlyStats.casesHandled}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-90">{t('farmersHelped')}</span>
                  <span className="font-bold">{monthlyStats.farmersHelped}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-90">{t('animalsTreated')}</span>
                  <span className="font-bold">{monthlyStats.animalsTreated}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
