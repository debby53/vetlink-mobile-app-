import { useState, useEffect, useMemo } from 'react';
import SidebarLayout from '@/components/SidebarLayout';
import {
  Download,
  FileText,
  Calendar,
  Loader2,
  TrendingUp,
  Users,
  Activity,
  BarChart3,
  PieChart,
  FileSpreadsheet,
  FileDown,
  RefreshCw
} from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { userAPI, caseAPI } from '@/lib/apiService';
import { toast } from 'sonner';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

type TimeRange = 'day' | 'week' | 'month' | 'year' | 'all';
type ExportFormat = 'csv' | 'pdf' | 'excel';

export default function Reports() {
  const { t } = useLanguage();
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [isLoading, setIsLoading] = useState(false);

  // Data States
  const [users, setUsers] = useState<any[]>([]);
  const [cases, setCases] = useState<any[]>([]);

  // Primary Color HSL(160, 84%, 39%) -> Hex approx #10B981
  const PRIMARY_COLOR = '#10B981';
  const PRIMARY_LIGHT = '#34D399';
  const PRIMARY_DARK = '#059669';

  const COLORS = [
    PRIMARY_COLOR,   // Main
    PRIMARY_LIGHT,   // Light
    PRIMARY_DARK,    // Dark
    '#6EE7B7'        // Lighter
  ];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);

    try {
      console.log('Fetching dashboard data...');
      // Use allSettled to allow partial data loading
      const results = await Promise.allSettled([
        userAPI.getActiveUsers(),
        caseAPI.getAllCases()
      ]);

      const [usersResult, casesResult] = results;

      if (usersResult.status === 'fulfilled') {
        console.log('Users loaded:', usersResult.value?.length);
        setUsers(usersResult.value || []);
      } else {
        console.error('Failed to load users:', usersResult.reason);
        toast.error('Failed to load user data');
      }

      if (casesResult.status === 'fulfilled') {
        console.log('Cases loaded:', casesResult.value?.length);
        setCases(casesResult.value || []);
      } else {
        console.error('Failed to load cases:', casesResult.reason);
        toast.error('Failed to load case data');
      }
    } catch (err) {
      console.error('Unexpected error loading dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtered Data for CHARTS Only (Trends/Growth)
  const filteredData = useMemo(() => {
    const now = new Date();
    const filterDate = new Date();

    switch (timeRange) {
      case 'day':
        filterDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        filterDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
        filterDate.setFullYear(2000);
        break;
    }

    const filteredUsers = users.filter(u => new Date(u.createdAt || u.joinDate || u.registrationDate || 0) >= filterDate);
    const filteredCases = cases.filter(c => new Date(c.createdAt || 0) >= filterDate);

    return { users: filteredUsers, cases: filteredCases };
  }, [users, cases, timeRange]);

  // Global Stats (Independent of Time Range Filter)
  const stats = useMemo(() => {
    // Use TOTAL users/cases, not filtered ones
    const farmers = users.filter((u: any) => u.role === 'FARMER').length;
    const vets = users.filter((u: any) => u.role === 'VETERINARIAN').length;
    const cahws = users.filter((u: any) => u.role === 'CAHW').length;
    const activeCases = cases.filter((c: any) => c.status !== 'COMPLETED' && c.status !== 'CLOSED').length;
    const resolvedCases = cases.filter((c: any) => c.status === 'COMPLETED' || c.status === 'CLOSED').length;

    return {
      totalUsers: users.length,
      totalCases: cases.length,
      activeCases,
      resolvedCases,
      farmers,
      veterinarians: vets,
      cahws
    };
  }, [users, cases]); // Depend on raw data, not filteredData

  // Chart Data: Case Trends
  const caseTrendData = useMemo(() => {
    const dataMap = new Map<string, { cases: number, resolved: number }>();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${months[d.getMonth()]}`;
      dataMap.set(key, { cases: 0, resolved: 0 });
    }

    filteredData.cases.forEach(c => {
      const d = new Date(c.createdAt || 0);
      const key = months[d.getMonth()];
      if (dataMap.has(key)) {
        const entry = dataMap.get(key)!;
        entry.cases += 1;
        if (c.status === 'COMPLETED' || c.status === 'CLOSED') {
          entry.resolved += 1;
        }
      }
    });

    return Array.from(dataMap.entries()).map(([name, val]) => ({ name, ...val }));
  }, [filteredData.cases]);

  // Chart Data: User Growth
  const userGrowthData = useMemo(() => {
    const monthlyData = new Map<string, { farmers: number, vets: number, cahws: number }>();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 3; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = months[d.getMonth()];
      monthlyData.set(key, { farmers: 0, vets: 0, cahws: 0 });
    }

    filteredData.users.forEach(u => {
      const d = new Date(u.createdAt || u.joinDate || 0);
      const key = months[d.getMonth()];
      if (monthlyData.has(key)) {
        const bucket = monthlyData.get(key)!;
        if (u.role === 'FARMER') bucket.farmers++;
        else if (u.role === 'VETERINARIAN') bucket.vets++;
        else if (u.role === 'CAHW') bucket.cahws++;
      }
    });

    return Array.from(monthlyData.entries()).map(([name, val]) => ({ name, ...val }));
  }, [filteredData.users]);


  // Chart Data: Case Types
  const caseTypeData = useMemo(() => {
    const typeCounts: Record<string, number> = {};
    if (filteredData.cases.length === 0) return [];

    filteredData.cases.forEach(c => {
      const type = c.caseType || 'Other';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    return Object.entries(typeCounts).map(([name, value]) => ({ name, value }));
  }, [filteredData.cases]);

  // Chart Data: User Distribution (Total)
  const userDistributionData = useMemo(() => [
    { name: 'Farmers', value: stats.farmers },
    { name: 'Veterinarians', value: stats.veterinarians },
    { name: 'CAHWs', value: stats.cahws },
  ], [stats]);

  const generateReport = async (reportType: string, format: ExportFormat) => {
    setIsGenerating(reportType);
    try {
      let data: any[] = [];
      let headers: string[] = [];
      let fileName = '';

      switch (reportType) {
        case 'users':
          data = users; // Export ALL users
          headers = ['ID', 'Name', 'Email', 'Role', 'Status', 'Joined Date', 'Location'];
          fileName = `users_report_${new Date().toISOString().split('T')[0]}`;
          break;
        case 'cases':
          data = cases; // Export ALL cases
          headers = ['ID', 'Title', 'Type', 'Farmer ID', 'Status', 'Severity', 'Created At'];
          fileName = `cases_report_${new Date().toISOString().split('T')[0]}`;
          break;
        case 'analytics':
          data = [stats];
          headers = ['Total Users', 'Total Cases', 'Active Cases', 'Resolved Cases', 'Farmers', 'Veterinarians', 'CAHWs'];
          fileName = `analytics_report_${new Date().toISOString().split('T')[0]}`;
          break;
      }

      if (format === 'csv') {
        exportToCSV(data, headers, fileName, reportType);
      } else if (format === 'excel') {
        exportToExcel(data, headers, fileName);
      } else if (format === 'pdf') {
        exportToPDF(data, headers, fileName);
      }

      toast.success(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report generated successfully`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate report');
    } finally {
      setIsGenerating(null);
    }
  };

  const exportToCSV = (data: any[], headers: string[], fileName: string, reportType: string) => {
    let csvContent = '';

    if (reportType === 'users') {
      csvContent = [
        headers.join(','),
        ...data.map((u: any) => [
          u.id,
          `"${u.name}"`,
          u.email,
          u.role,
          u.status || (u.active ? 'ACTIVE' : 'INACTIVE'),
          u.createdAt || u.joinDate || new Date().toISOString(),
          `"${u.locationName || ''}"`
        ].join(','))
      ].join('\n');
    } else if (reportType === 'cases') {
      csvContent = [
        headers.join(','),
        ...data.map((c: any) => [
          c.id,
          `"${c.title}"`,
          c.caseType,
          c.farmerId,
          c.status,
          c.severity || 'N/A',
          c.createdAt
        ].join(','))
      ].join('\n');
    } else if (reportType === 'analytics') {
      csvContent = [
        headers.join(','),
        Object.values(data[0]).join(',')
      ].join('\n');
    }

    downloadFile(csvContent, `${fileName}.csv`, 'text/csv;charset=utf-8;');
  };

  const exportToExcel = (data: any[], headers: string[], fileName: string) => {
    // For a real implementation, use a library like xlsx
    toast.info('Excel export feature coming soon. Using CSV format instead.');
    exportToCSV(data, headers, fileName, 'users');
  };

  const exportToPDF = (data: any[], headers: string[], fileName: string) => {
    // For a real implementation, use a library like jsPDF
    toast.info('PDF export feature coming soon. Using CSV format instead.');
    exportToCSV(data, headers, fileName, 'users');
  };

  const downloadFile = (content: string, fileName: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const timeRanges: { value: TimeRange; label: string }[] = [
    { value: 'day', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' },
    { value: 'all', label: 'All Time' },
  ];

  const exportFormats: { value: ExportFormat; label: string; icon: any }[] = [
    { value: 'csv', label: 'CSV', icon: FileSpreadsheet },
    { value: 'excel', label: 'Excel', icon: FileSpreadsheet },
    { value: 'pdf', label: 'PDF', icon: FileDown },
  ];

  return (
    <SidebarLayout>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
                <BarChart3 className="h-7 w-7 text-white" />
              </div>
              {t('reports')} & Analytics
            </h1>
            <p className="text-muted-foreground mt-2">Comprehensive system insights and data exports</p>
          </div>
          <button
            onClick={loadDashboardData}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-lg hover:border-primary transition-all shadow-sm"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Time Range Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">Time Range:</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {timeRanges.map((range) => (
                <button
                  key={range.value}
                  onClick={() => setTimeRange(range.value)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${timeRange === range.value
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-gray-100 text-foreground hover:bg-gray-200'
                    }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Total Users</p>
            <p className="text-3xl font-bold text-foreground mt-1">{stats.totalUsers}</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Activity className="h-6 w-6 text-primary" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Total Cases</p>
            <p className="text-3xl font-bold text-foreground mt-1">{stats.totalCases}</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Active Cases</p>
            <p className="text-3xl font-bold text-foreground mt-1">{stats.activeCases}</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <span className="text-sm font-medium text-primary">
                {stats.totalCases > 0 ? Math.round((stats.resolvedCases / stats.totalCases) * 100) : 0}%
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Resolved Rate</p>
            <p className="text-3xl font-bold text-foreground mt-1">{stats.resolvedCases}</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Case Trends */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Case Trends Over Time
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={caseTrendData}>
                <defs>
                  <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PRIMARY_COLOR} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={PRIMARY_COLOR} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PRIMARY_LIGHT} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={PRIMARY_LIGHT} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="cases" stroke={PRIMARY_COLOR} fillOpacity={1} fill="url(#colorCases)" />
                <Area type="monotone" dataKey="resolved" stroke={PRIMARY_LIGHT} fillOpacity={1} fill="url(#colorResolved)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* User Growth */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              User Growth by Role
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="farmers" fill={PRIMARY_COLOR} />
                <Bar dataKey="vets" fill={PRIMARY_LIGHT} />
                <Bar dataKey="cahws" fill={PRIMARY_DARK} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Case Types Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              Case Types Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPie>
                <Pie
                  data={caseTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {caseTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPie>
            </ResponsiveContainer>
          </div>

          {/* User Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              User Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPie>
                <Pie
                  data={userDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {userDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPie>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Export Reports Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Export Reports
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Users Report */}
            <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-primary transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Users Report</h3>
                  <p className="text-xs text-muted-foreground">All registered users</p>
                </div>
              </div>
              <div className="space-y-2">
                {exportFormats.map((format) => {
                  const Icon = format.icon;
                  return (
                    <button
                      key={format.value}
                      onClick={() => generateReport('users', format.value)}
                      disabled={isGenerating === 'users'}
                      className="w-full flex items-center justify-between px-4 py-2 bg-gray-50 hover:bg-primary/5 rounded-lg transition-all text-sm font-medium disabled:opacity-50"
                    >
                      <span className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {format.label}
                      </span>
                      {isGenerating === 'users' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cases Report */}
            <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-primary transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Cases Report</h3>
                  <p className="text-xs text-muted-foreground">All animal health cases</p>
                </div>
              </div>
              <div className="space-y-2">
                {exportFormats.map((format) => {
                  const Icon = format.icon;
                  return (
                    <button
                      key={format.value}
                      onClick={() => generateReport('cases', format.value)}
                      disabled={isGenerating === 'cases'}
                      className="w-full flex items-center justify-between px-4 py-2 bg-gray-50 hover:bg-primary/5 rounded-lg transition-all text-sm font-medium disabled:opacity-50"
                    >
                      <span className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {format.label}
                      </span>
                      {isGenerating === 'cases' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Analytics Report */}
            <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-primary transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Analytics Report</h3>
                  <p className="text-xs text-muted-foreground">System statistics</p>
                </div>
              </div>
              <div className="space-y-2">
                {exportFormats.map((format) => {
                  const Icon = format.icon;
                  return (
                    <button
                      key={format.value}
                      onClick={() => generateReport('analytics', format.value)}
                      disabled={isGenerating === 'analytics'}
                      className="w-full flex items-center justify-between px-4 py-2 bg-gray-50 hover:bg-primary/5 rounded-lg transition-all text-sm font-medium disabled:opacity-50"
                    >
                      <span className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {format.label}
                      </span>
                      {isGenerating === 'analytics' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
