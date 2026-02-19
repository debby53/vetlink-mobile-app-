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
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
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
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type TimeRange = 'day' | 'week' | 'month' | 'year' | 'all';
type ExportFormat = 'csv' | 'pdf' | 'excel';

export default function Reports() {
  const { t } = useLanguage();
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'cases' | 'analytics'>('users');
  const [caseStatusFilter, setCaseStatusFilter] = useState<string>('all');

  // Case Resolution State
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [isResolveDialogOpen, setIsResolveDialogOpen] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  // Data States
  const [users, setUsers] = useState<any[]>([]);
  const [cases, setCases] = useState<any[]>([]);
  const [backendCaseTrends, setBackendCaseTrends] = useState<any[]>([]);
  const [backendCaseTypes, setBackendCaseTypes] = useState<any[]>([]);

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
        caseAPI.getAllCases(),
        caseAPI.getCaseTrends(),
        caseAPI.getCaseTypeDistribution()
      ]);

      const [usersResult, casesResult, trendsResult, typesResult] = results;

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

      if (trendsResult.status === 'fulfilled') {
        console.log('Trends loaded:', trendsResult.value?.length);
        setBackendCaseTrends(trendsResult.value || []);
      } else {
        console.error('Failed to load trends:', trendsResult.reason);
        // Don't toast error for trends as it might be new endpoint
      }

      if (typesResult.status === 'fulfilled') {
        console.log('Types loaded:', typesResult.value?.length);
        setBackendCaseTypes(typesResult.value || []);
      } else {
        console.error('Failed to load types:', typesResult.reason);
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
    // 1. Prepare raw data map (Map<"YYYY-MM", { cases, resolved }>)
    const rawMap = new Map<string, { cases: number, resolved: number }>();

    // Prefer backend data if available, otherwise use loaded cases
    if (backendCaseTrends.length > 0) {
      backendCaseTrends.forEach(item => {
        // item.name is "YYYY-MM"
        rawMap.set(item.name, { cases: item.cases, resolved: item.resolved });
      });
    } else {
      // Fallback: use client-side aggregation on 'cases'
      // Use ALL cases, not filteredData, because we want to build the trend for the selected range including past gaps
      cases.forEach(c => {
        if (!c.createdAt) return;
        try {
          // Handle array format [yyyy, mm, dd, ...] or ISO string
          let d: Date;
          if (Array.isArray(c.createdAt)) {
            d = new Date(c.createdAt[0], c.createdAt[1] - 1, c.createdAt[2]);
          } else {
            d = new Date(c.createdAt);
          }
          if (isNaN(d.getTime())) return;

          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          if (!rawMap.has(key)) rawMap.set(key, { cases: 0, resolved: 0 });

          const entry = rawMap.get(key)!;
          entry.cases++;
          if (c.status === 'COMPLETED' || c.status === 'RESOLVED' || c.status === 'CLOSED') {
            entry.resolved++;
          }
        } catch (e) { console.error('Date parse error', e); }
      });
    }

    // 2. Determine date range based on filter
    const now = new Date();
    const startDate = new Date();
    let dateFormat: 'day' | 'month' = 'month';

    switch (timeRange) {
      case 'day': // Last 24 hours -> hourly buckets? Or just last 7 days daily?
        // For "day", let's show last 7 days instead to make it meaningful chart
        startDate.setDate(now.getDate() - 7);
        dateFormat = 'day';
        break;
      case 'week':
        startDate.setDate(now.getDate() - 28); // 4 weeks
        dateFormat = 'day';
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 6); // Last 6 months
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
        startDate.setFullYear(2023); // Arbitrary start or min from data
        break;
    }

    // 3. Fill gaps
    const result = [];
    let current = new Date(startDate);
    // Align current to start of period
    if (dateFormat === 'month') current.setDate(1);

    while (current <= now) {
      let key = '';
      let label = '';

      if (dateFormat === 'month') {
        key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
        label = current.toLocaleString('default', { month: 'short', year: '2-digit' });
      } else {
        key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
        // For daily, we might need to adjust rawMap key strategy slightly if we supported daily
        // But backend sends YYYY-MM. 
        // If backend sends YYYY-MM, we can't really show daily trends from backend data.
        // Fallback to month grain if using backend data which is monthly.
        if (backendCaseTrends.length > 0) {
          // If backend only gives months, force month view even for shorter ranges or accept smooth line
          label = current.toLocaleDateString('default', { month: 'short', day: 'numeric' });
          // We can't map daily from monthly backend data easily. 
          // Let's stick to monthly View for robust "Trends" over time unless specific daily data requested.
          // Revert logic: Always Monthly for now to align with backend "Trends"
          key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
          label = current.toLocaleString('default', { month: 'short', year: '2-digit' });
        } else {
          // Client side can do daily? Let's stick to Monthly for consistency/simplicity of chart
          key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
          label = current.toLocaleString('default', { month: 'short', year: '2-digit' });
        }
      }

      const data = rawMap.get(key) || { cases: 0, resolved: 0 };

      // Deduplicate if we iterate daily but map to monthly keys
      // Actually, let's just step by Month for the chart to be clean
      result.push({
        name: label,
        cases: data.cases,
        resolved: data.resolved
      });

      // Increment
      if (dateFormat === 'month' || true) { // Force month step
        current.setMonth(current.getMonth() + 1);
      } else {
        current.setDate(current.getDate() + 1);
      }
    }

    // Remove duplicates if any (due to date math)
    return Array.from(new Set(result.map(r => r.name)))
      .map(name => result.find(r => r.name === name));
  }, [backendCaseTrends, cases, timeRange]);

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
    let rawData: { name: string; value: number }[] = [];

    if (backendCaseTypes.length > 0) {
      rawData = backendCaseTypes.map(item => ({
        name: item.name || 'Unknown',
        value: item.value || 0
      }));
    } else {
      // Fallback
      const typeCounts: Record<string, number> = {};
      cases.forEach(c => {
        const type = c.caseType || 'Other';
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      });
      rawData = Object.entries(typeCounts).map(([name, value]) => ({ name, value }));
    }

    // Filter out 0 values and sort appropriately
    return rawData
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [backendCaseTypes, cases]);

  // Custom Pie Label
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return percent > 0.05 ? (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs font-bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: entry.color }} />
              <span className="text-gray-600 capitalize">{entry.name}:</span>
              <span className="font-semibold text-gray-900">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Chart Data: User Distribution (Total)
  const userDistributionData = useMemo(() => [
    { name: 'Farmers', value: stats.farmers },
    { name: 'Veterinarians', value: stats.veterinarians },
    { name: 'CAHWs', value: stats.cahws },
  ], [stats]);

  // Helper to get Farmer Name
  const getFarmerName = (farmerId: any) => {
    const farmer = users.find(u => u.id == farmerId); // Use loose quality to handle string/number mismatch
    return farmer ? farmer.name : 'Unknown Farmer';
  };

  // Helper to get CAHW Name
  const getCAHWName = (cahwId: any) => {
    if (!cahwId) return 'N/A';
    const cahw = users.find(u => u.id == cahwId);
    return cahw ? cahw.name : 'Unknown CAHW';
  };

  // Helper to get Veterinarian Name
  const getVeterinarianName = (vetId: any) => {
    if (!vetId) return 'N/A';
    const vet = users.find(u => u.id == vetId);
    return vet ? vet.name : 'Unknown Vet';
  };

  const formatDate = (dateString: any) => {
    if (!dateString) return 'N/A';
    try {
      // Handle Spring Boot default array format [year, month, day, hour, minute, second]
      if (Array.isArray(dateString) && dateString.length >= 3) {
        const [year, month, day] = dateString;
        // Month is 1-based in Java array, 0-based in JS
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }

      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

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
          headers = ['ID', 'Case Title', 'Animal Type', 'Farmer Name', 'CAHW', 'Veterinarian', 'Status', 'Escalated', 'Severity', 'Created At'];
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
        exportToPDF(data, headers, fileName, reportType);
      }

      toast.success(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report generated successfully`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate report');
    } finally {
      setIsGenerating(null);
    }
  };


  const handleResolveClick = (c: any) => {
    setSelectedCase(c);
    setResolutionNotes('');
    setIsResolveDialogOpen(true);
  };

  const confirmResolve = async () => {
    if (!selectedCase) return;

    setIsResolving(true);
    try {
      // Assuming 'COMPLETED' is the status for resolved cases
      await caseAPI.markCaseAsCompleted(selectedCase.id, {
        status: 'COMPLETED',
        description: resolutionNotes ? `${selectedCase.description}\n\n[Resolution Note]: ${resolutionNotes}` : undefined
      });

      toast.success(`Case #${selectedCase.id} resolved successfully`);

      // Update local state without full reload
      setCases(prev => prev.map(c =>
        c.id === selectedCase.id ? { ...c, status: 'COMPLETED' } : c
      ));

      setIsResolveDialogOpen(false);
    } catch (err) {
      console.error('Failed to resolve case:', err);
      toast.error('Failed to resolve case');
    } finally {
      setIsResolving(false);
    }
  };

  const exportToCSV = (data: any[], headers: string[], fileName: string, reportType: string) => {
    let csvContent = '';

    // Add Metadata Header
    const title = `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`;
    const date = new Date().toLocaleString();
    const metadata = `Report Title:,${title}\nGenerated On:,"${date}"\n\n`;

    if (reportType === 'users') {
      csvContent = metadata + [
        headers.join(','),
        ...data.map((u: any) => [
          u.id,
          `"${u.name}"`,
          u.email,
          u.role,
          u.status || (u.active ? 'ACTIVE' : 'INACTIVE'),
          formatDate(u.createdAt || u.joinDate),
          `"${u.locationName || ''}"`
        ].join(','))
      ].join('\n');
    } else if (reportType === 'cases') {
      csvContent = metadata + [
        headers.join(','),
        ...data.map((c: any) => [
          c.id,
          `"${c.title}"`,
          `"${c.animalType || c.animalName || 'N/A'}"`,
          `"${getFarmerName(c.farmerId)}"`,
          `"${getCAHWName(c.cahwId)}"`,
          `"${getVeterinarianName(c.veterinarianId)}"`,
          c.status,
          c.isEscalated ? 'Yes' : 'No',
          c.severity || 'N/A',
          formatDate(c.createdAt)
        ].join(','))
      ].join('\n');
    } else if (reportType === 'analytics') {
      csvContent = metadata + [
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

  const exportToPDF = (data: any[], headers: string[], fileName: string, reportType: string) => {
    const doc = new jsPDF();
    const title = `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`;
    const date = new Date().toLocaleString();

    // Add Title
    doc.setFontSize(18);
    doc.text(title, 14, 22);

    // Add Generation Date
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated On: ${date}`, 14, 30);

    let tableRows: any[] = [];

    if (reportType === 'users') {
      tableRows = data.map((u: any) => [
        u.id,
        u.name,
        u.email,
        u.role,
        u.status || (u.active ? 'ACTIVE' : 'INACTIVE'),
        formatDate(u.createdAt || u.joinDate) || 'N/A',
        u.locationName || 'N/A'
      ]);
    } else if (reportType === 'cases') {
      tableRows = data.map((c: any) => [
        c.id,
        c.title,
        c.animalType || c.animalName || 'N/A',
        getFarmerName(c.farmerId),
        getCAHWName(c.cahwId),
        getVeterinarianName(c.veterinarianId),
        c.status,
        c.isEscalated ? 'Yes' : 'No',
        c.severity || 'N/A',
        formatDate(c.createdAt)
      ]);
    } else if (reportType === 'analytics') {
      tableRows = [Object.values(data[0])];
    }

    autoTable(doc, {
      head: [headers],
      body: tableRows,
      startY: 35,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [16, 185, 129] }, // Primary color
    });

    doc.save(`${fileName}.pdf`);
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
              {caseTrendData.length > 0 ? (
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
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                    padding={{ left: 10, right: 10 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" />
                  <Area
                    type="monotone"
                    dataKey="cases"
                    name="Total Cases"
                    stroke={PRIMARY_COLOR}
                    fillOpacity={1}
                    fill="url(#colorCases)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="resolved"
                    name="Resolved"
                    stroke={PRIMARY_DARK}
                    fillOpacity={1}
                    fill="url(#colorResolved)"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                </AreaChart>
              ) : (
                <div className="flex h-full items-center justify-center flex-col text-muted-foreground">
                  <TrendingUp className="h-10 w-10 mb-2 opacity-20" />
                  <p>No enough data for trends</p>
                </div>
              )}
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
              {caseTypeData.length > 0 ? (
                <RechartsPie>
                  <Pie
                    data={caseTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={100}
                    innerRadius={60} // Donut style
                    fill="#8884d8"
                    dataKey="value"
                    paddingAngle={5}
                  >
                    {caseTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="white" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="middle"
                    align="right"
                    layout="vertical"
                    iconType="circle"
                    formatter={(value, entry: any) => <span className="text-sm font-medium text-gray-700 ml-1">{value}</span>}
                  />
                </RechartsPie>
              ) : (
                <div className="flex h-full items-center justify-center flex-col text-muted-foreground">
                  <PieChart className="h-10 w-10 mb-2 opacity-20" />
                  <p>No case data available</p>
                </div>
              )}
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

        {/* Detailed Reports Section with Preview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              Detailed Reports
            </h2>

            {/* Tabs */}
            <div className="flex p-1 bg-gray-100 rounded-lg">
              {(['users', 'cases', 'analytics'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-md font-medium text-sm transition-all capitalize ${activeTab === tab
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Case Status Filter (only show for cases tab) */}
          {activeTab === 'cases' && (
            <div className="mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-foreground">Filter by Status:</span>
                {['all', 'OPEN', 'RECEIVED', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'RESOLVED', 'CLOSED'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setCaseStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-all ${caseStatusFilter === status
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-gray-100 text-foreground hover:bg-gray-200'
                      }`}
                  >
                    {status === 'all' ? 'All' : status}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Toolbar & Export */}
          <div className="flex items-center justify-end gap-2 mb-4">
            <span className="text-sm text-muted-foreground mr-2">Export Current View:</span>
            {exportFormats.map((format) => {
              const Icon = format.icon;
              return (
                <button
                  key={format.value}
                  onClick={() => generateReport(activeTab, format.value)}
                  disabled={isGenerating === activeTab}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all text-sm font-medium disabled:opacity-50"
                >
                  <Icon className="h-4 w-4 text-gray-600" />
                  {format.label}
                  {isGenerating === activeTab && <Loader2 className="h-3 w-3 animate-spin ml-1" />}
                </button>
              );
            })}
          </div>

          {/* Users Table */}
          {
            activeTab === 'users' && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-muted-foreground font-medium">
                    <tr>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Location</th>
                      <th className="px-4 py-3">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.slice(0, 10).map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-medium text-foreground">{u.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                          ${u.role === 'FARMER' ? 'bg-green-100 text-green-700' :
                              u.role === 'VETERINARIAN' ? 'bg-blue-100 text-blue-700' :
                                'bg-purple-100 text-purple-700'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                          ${(u.status === 'ACTIVE' || u.active) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {u.status || (u.active ? 'ACTIVE' : 'INACTIVE')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{u.locationName || 'N/A'}</td>
                        <td className="px-4 py-3 text-muted-foreground">{formatDate(u.createdAt || u.joinDate)}</td>
                      </tr>
                    ))}
                    {users.length > 10 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-3 text-center text-muted-foreground bg-gray-50">
                          Showing 10 of {users.length} users. Export to see all.
                        </td>
                      </tr>
                    )}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                          No users found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )
          }

          {/* Cases Table */}
          {
            activeTab === 'cases' && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-muted-foreground font-medium">
                    <tr>
                      <th className="px-4 py-3">Case Title</th>
                      <th className="px-4 py-3">Animal Type</th>
                      <th className="px-4 py-3">Farmer</th>
                      <th className="px-4 py-3">CAHW</th>
                      <th className="px-4 py-3">Vet</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Escalated</th>
                      <th className="px-4 py-3">Severity</th>
                      <th className="px-4 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {cases
                      .filter(c => caseStatusFilter === 'all' || c.status === caseStatusFilter)
                      .slice(0, 10)
                      .map((c) => (
                        <tr key={c.id} className="hover:bg-gray-50/50">
                          <td className="px-4 py-3 font-medium text-foreground">{c.title}</td>
                          <td className="px-4 py-3 text-muted-foreground capitalize">{c.animalType || c.animalName || 'N/A'}</td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {getFarmerName(c.farmerId) || c.farmerName}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {getCAHWName(c.cahwId)}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {getVeterinarianName(c.veterinarianId)}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                                    ${c.status === 'COMPLETED' || c.status === 'RESOLVED' || c.status === 'CLOSED' ? 'bg-green-100 text-green-700' :
                                c.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-blue-100 text-blue-700'}`}>
                              {c.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs ${c.isEscalated ? 'text-red-600 font-medium' : 'text-gray-400'}`}>
                              {c.isEscalated ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-1 rounded-full ${c.severity === 'HIGH' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                              {c.severity || 'N/A'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">
                            {formatDate(c.createdAt)}
                          </td>
                        </tr>
                      ))}
                    {cases.length === 0 && (
                      <tr><td colSpan={9} className="text-center py-8 text-muted-foreground">No cases found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )
          }

          {/* Analytics View */}
          {/* Analytics View */}
          {
            activeTab === 'analytics' && (
              <div className="p-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(stats).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                      <p className="text-2xl font-bold text-foreground">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )
          }
        </div>
      </div>


      <Dialog open={isResolveDialogOpen} onOpenChange={setIsResolveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Case #{selectedCase?.id}</DialogTitle>
            <DialogDescription>
              Mark this case as completed. You can add an optional resolution note.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">Resolution Notes</label>
            <Textarea
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="Describe how the case was resolved..."
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResolveDialogOpen(false)} disabled={isResolving}>
              Cancel
            </Button>
            <Button onClick={confirmResolve} disabled={isResolving} className='bg-primary text-white'>
              {isResolving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Resolution
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarLayout >
  );
}
