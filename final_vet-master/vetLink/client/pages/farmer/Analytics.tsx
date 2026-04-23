import { useState, useEffect } from 'react';
import SidebarLayout from '@/components/SidebarLayout';
import { useAuth } from '@/lib/AuthContext';
import { caseAPI } from '@/lib/apiService';
import { useLanguage } from '@/lib/LanguageContext';
import { TrendingUp, BarChart3, PieChart as PieChartIcon, ArrowUp, ArrowDown, Activity, Heart } from 'lucide-react';
import { toast } from 'sonner';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';

export default function FarmerAnalytics() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('month');
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadAnalytics();
    }
  }, [user?.id]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      if (!user?.id) {
        toast.error('User not authenticated');
        return;
      }

      const cases = await caseAPI.getCasesByFarmerId(Number(user.id));

      // Calculate analytics
      const thisMonth = new Date();
      const thisMonthStart = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1);
      const lastMonthStart = new Date(thisMonth.getFullYear(), thisMonth.getMonth() - 1, 1);
      const lastMonthEnd = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 0);

      const casesThisMonth = cases.filter(c => {
        const caseDate = new Date(c.createdAt || '');
        return caseDate >= thisMonthStart;
      }).length;

      const casesLastMonth = cases.filter(c => {
        const caseDate = new Date(c.createdAt || '');
        return caseDate >= lastMonthStart && caseDate <= lastMonthEnd;
      }).length;

      const resolvedCases = cases.filter(c => c.status === 'RESOLVED').length;
      const resolutionRate = cases.length > 0 ? Math.round((resolvedCases / cases.length) * 100) : 0;

      // Calculate monthly data for the last 6 months
      const monthlyData = [];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        const monthlyCases = cases.filter(c => {
          const caseDate = new Date(c.createdAt || '');
          return caseDate >= monthStart && caseDate <= monthEnd;
        });

        // resolved count
        const resolvedCount = monthlyCases.filter(c => c.status === 'RESOLVED').length;

        monthlyData.push({
          name: months[date.getMonth()],
          total: monthlyCases.length,
          resolved: resolvedCount,
          active: monthlyCases.length - resolvedCount
        });
      }

      // Analyze case types
      const caseTypeMap: any = {};
      cases.forEach(c => {
        const type = c.caseType || 'General';
        caseTypeMap[type] = (caseTypeMap[type] || 0) + 1;
      });

      const processedCaseTypes = Object.entries(caseTypeMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a: any, b: any) => b.value - a.value);

      setAnalyticsData({
        casesThisMonth,
        casesLastMonth,
        resolutionRate,
        totalCases: cases.length,
        monthlyData,
        caseTypes: processedCaseTypes,
      });
    } catch (err) {
      console.error('Error loading analytics:', err);
      toast.error('Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  const stats = [
    {
      label: t('casesThisMonth'),
      value: analyticsData?.casesThisMonth.toString() || '0',
      change: `${analyticsData?.casesThisMonth - analyticsData?.casesLastMonth >= 0 ? '+' : ''}${analyticsData?.casesThisMonth - analyticsData?.casesLastMonth || 0} from last month`,
      trend: (analyticsData?.casesThisMonth || 0) >= (analyticsData?.casesLastMonth || 0) ? 'up' : 'down',
      icon: Heart,
      color: 'text-rose-500',
      bg: 'bg-rose-50'
    },
    {
      label: t('resolutionRate'),
      value: `${analyticsData?.resolutionRate || 0}%`,
      change: 'Success rate',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50'
    },
    {
      label: t('avgResponseTime'),
      value: '2.1h',
      change: 'Average response',
      trend: 'up',
      icon: Activity,
      color: 'text-blue-500',
      bg: 'bg-blue-50'
    },
    {
      label: t('successfulTreatments'),
      value: (analyticsData?.totalCases || 0).toString(),
      change: 'Total cases',
      trend: 'up',
      icon: BarChart3,
      color: 'text-violet-500',
      bg: 'bg-violet-50'
    },
  ];

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <SidebarLayout>
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1 flex items-center gap-3">
              {t('farmAnalytics')}
            </h1>
            <p className="text-gray-500">
              {t('analyticsSubtitle')}
            </p>
          </div>
          <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
            {['week', 'month', 'year'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${timeRange === range
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
                  }`}
              >
                {t(range === 'week' ? 'thisWeek' : range === 'month' ? 'thisMonth' : range === 'year' ? 'thisYear' : range)}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-500">Loading insights...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={index}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/80 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-500 font-medium mb-1">
                          {stat.label}
                        </p>
                        <p className="text-3xl font-bold text-gray-900">
                          {stat.value}
                        </p>
                      </div>
                      <div className={`p-3 rounded-xl ${stat.bg} group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {stat.trend === 'up' ? (
                        <ArrowUp className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <ArrowDown className="h-4 w-4 text-rose-500" />
                      )}
                      <span className="text-gray-500 font-medium">{stat.change}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Main Chart */}
              <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      {t('monthlyCaseTrend')}
                    </h2>
                    <p className="text-sm text-gray-500">Overview of cases vs resolutions</p>
                  </div>
                </div>

                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analyticsData?.monthlyData}>
                      <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        cursor={{ stroke: '#10b981', strokeWidth: 1, strokeDasharray: '3 3' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="total"
                        stroke="#10b981"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorTotal)"
                      />
                      <Area
                        type="monotone"
                        dataKey="resolved"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        fill="none"
                        strokeDasharray="5 5"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pie Chart */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
                <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-primary" />
                  {t('caseTypes')}
                </h2>

                <div className="flex-1 min-h-[250px] relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData?.caseTypes}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {analyticsData?.caseTypes.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '8px' }} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Center Text */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{analyticsData?.totalCases || 0}</p>
                      <p className="text-xs text-gray-500">Total Cases</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-6 relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="font-bold text-emerald-900 mb-2 flex items-center gap-2">
                    <div className="p-2 bg-white/50 rounded-lg">✅</div>
                    {t('goodNews')}
                  </h3>
                  <p className="text-emerald-800 leading-relaxed text-sm">
                    Your farm has maintained a <span className="font-bold">{analyticsData?.resolutionRate || 0}%</span> case resolution rate.
                    This is 12% higher than the regional average!
                  </p>
                </div>
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-emerald-200/30 rounded-full blur-2xl"></div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                    <div className="p-2 bg-white/50 rounded-lg">💡</div>
                    {t('recommendation')}
                  </h3>
                  <p className="text-blue-800 leading-relaxed text-sm">
                    Consider scheduling preventive check-ups for your herd.
                    <button className="ml-2 font-semibold underline decoration-blue-300 hover:decoration-blue-500 transition-all">Schedule now</button>
                  </p>
                </div>
                <div className="absolute bottom-0 right-0 -mb-4 -mr-4 w-32 h-32 bg-blue-200/30 rounded-full blur-2xl"></div>
              </div>
            </div>
          </>
        )}
      </div>
    </SidebarLayout>
  );
}
