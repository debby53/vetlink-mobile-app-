import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarLayout from '@/components/SidebarLayout';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/LanguageContext';
import { userAPI, caseAPI } from '@/lib/apiService';
import { toast } from 'sonner';
import {
  Users,
  BarChart3,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Search,
  ArrowRight,
  Shield,
  Activity,
  Lock,
  Settings,
  Zap,
  BookOpen,
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const allUsers = await userAPI.getActiveUsers();
      setUsers(allUsers.slice(0, 5));
    } catch (err: any) {
      console.error('Error loading users:', err);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const stats = [
    {
      label: t('totalUsers'),
      value: users.length.toString(),
      change: '+45 this month',
      icon: Users,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
    },
    {
      label: t('activeSessions'),
      value: '347',
      change: '28% of total users',
      icon: Activity,
      color: 'text-green-500',
      bg: 'bg-green-50',
    },
    {
      label: t('systemHealth'),
      value: '99.8%',
      change: 'All services operational',
      icon: Shield,
      color: 'text-purple-500',
      bg: 'bg-purple-50',
    },
    {
      label: t('alerts'),
      value: '3',
      change: '2 need attention',
      icon: AlertCircle,
      color: 'text-red-500',
      bg: 'bg-red-50',
    },
  ];

  const mappedUsers = users.map((u: any) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role?.toLowerCase() || 'user',
    status: (u.status === 'ACTIVE' || u.active === true || u.isActive === true) ? 'active' : 'inactive',
    joinDate: u.createdAt,
    activity: 'Recently',
  }));

  const systemAlerts = [
    {
      id: 1,
      title: t('databaseBackup'),
      severity: 'warning',
      timestamp: '30 minutes ago',
    },
    {
      id: 2,
      title: t('apiResponseTime'),
      severity: 'warning',
      timestamp: '1 hour ago',
    },
    {
      id: 3,
      title: t('spamDetected'),
      severity: 'critical',
      timestamp: '2 hours ago',
    },
  ];

  const analytics = [
    {
      metric: t('casesResolved'),
      value: '3,456',
      trend: '+12%',
      color: 'text-green-600',
    },
    {
      metric: t('avgResponseTime'),
      value: '2.1h',
      trend: '-5%',
      color: 'text-green-600',
    },
    {
      metric: t('userSatisfaction'),
      value: '4.6/5',
      trend: '+2%',
      color: 'text-green-600',
    },
    {
      metric: t('systemUptime'),
      value: '99.8%',
      trend: '+0.1%',
      color: 'text-green-600',
    },
  ];

  const filteredUsers = mappedUsers.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const roleColors = {
    farmer: 'bg-green-100 text-green-800',
    veterinarian: 'bg-blue-100 text-blue-800',
    cahw: 'bg-purple-100 text-purple-800',
    admin: 'bg-red-100 text-red-800',
  };

  return (
    <SidebarLayout>
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Admin {t('dashboard')} 🛠️
            </h1>
            <p className="text-muted-foreground">
              {t('adminOverview')}
            </p>
          </div>
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
          {/* Users Management */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-foreground mb-4">
                {t('userManagement')}
              </h2>

              {/* Search & Filter */}
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder={t('searchUsersPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div className="flex gap-2 flex-wrap">
                  {['all', 'farmer', 'veterinarian', 'cahw'].map((role) => (
                    <button
                      key={role}
                      onClick={() => setFilterRole(role)}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${filterRole === role
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-foreground hover:bg-gray-200'
                        }`}
                    >
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                      {t('name')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                      {t('email')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                      {t('role')}
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
                  {isLoading ? (
                    <tr><td colSpan={5} className="px-6 py-4 text-center text-muted-foreground">{t('loading')}</td></tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-4 text-center text-muted-foreground">{t('noUsersFound')}</td></tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-foreground text-sm">
                          {u.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground">
                          {u.email}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${roleColors[u.role as keyof typeof roleColors]
                              }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {u.status === 'active' ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-800 font-semibold text-xs">
                              <CheckCircle className="h-3 w-3" />
                              {t('active')}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-800 font-semibold text-xs">
                              <AlertCircle className="h-3 w-3" />
                              {t('inactive')}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => {
                              toast.info(`Managing user: ${u.name}`);
                              navigate(`/admin/users?id=${u.id}`);
                            }}
                            className="text-primary font-semibold hover:underline flex items-center gap-1"
                          >
                            Manage
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-500" />
                {t('quickActions')}
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/market')}
                  className="w-full bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-700 rounded-lg px-4 py-3 font-medium transition-all flex items-center justify-center gap-2 shadow-sm border border-yellow-200"
                >
                  <TrendingUp className="h-4 w-4" />
                  {t('manageMarket')}
                </button>
                <button
                  onClick={() => navigate('/admin/trainings')}
                  className="w-full bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 rounded-lg px-4 py-3 font-medium transition-all flex items-center justify-center gap-2 shadow-sm border border-purple-200"
                >
                  <BookOpen className="h-4 w-4" />
                  {t('manageTrainings')}
                </button>
                <button
                  onClick={() => navigate('/admin/settings')}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg px-4 py-3 font-medium transition-all flex items-center justify-center gap-2 shadow-sm border border-gray-200"
                >
                  <Settings className="h-4 w-4" />
                  {t('systemConfig')}
                </button>
              </div>
            </div>
            {/* System Alerts */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                {t('alerts')}
              </h3>
              <div className="space-y-3">
                {systemAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border ${alert.severity === 'critical'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-yellow-50 border-yellow-200'
                      }`}
                  >
                    <p className="text-sm font-medium text-foreground">
                      {alert.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {alert.timestamp}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Metrics */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                {t('keyMetrics')}
              </h3>
              <div className="space-y-4">
                {analytics.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {item.metric}
                      </p>
                      <p className="text-lg font-bold text-foreground mt-1">
                        {item.value}
                      </p>
                    </div>
                    <span className={`text-sm font-semibold ${item.color}`}>
                      {item.trend}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Security Status */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-lg">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Lock className="h-5 w-5" />
                {t('securityStatus')}
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm opacity-90">{t('sslTls')}</span>
                  <span className="text-green-300 font-semibold">{t('active')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm opacity-90">{t('dataEncryption')}</span>
                  <span className="text-green-300 font-semibold">{t('active')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm opacity-90">{t('backupStatus')}</span>
                  <span className="text-yellow-300 font-semibold">{t('pending')}</span>
                </div>
                <button
                  onClick={() => {
                    toast.info('Opening security details');
                    navigate('/admin/analytics');
                  }}
                  className="w-full mt-4 bg-white/20 hover:bg-white/30 transition-all backdrop-blur rounded-lg px-4 py-2 text-white font-medium text-sm"
                >
                  {t('viewDetails')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
