import { useState, useEffect } from 'react';
import SidebarLayout from '@/components/SidebarLayout';
import { TrendingUp, BarChart3, PieChart, Calendar } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { caseAPI, CaseDTO } from '@/lib/apiService';
import { toast } from 'sonner';

export default function Analytics() {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState('month');
  const [cases, setCases] = useState<CaseDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadCases = async () => {
      if (!user?.id) return;
      setIsLoading(true);
      try {
        const data = await caseAPI.getCasesByVeterinarianId(Number(user.id));
        setCases(data);
      } catch (err) {
        console.error('Failed to load cases for analytics', err);
        toast.error('Failed to load analytics');
      } finally {
        setIsLoading(false);
      }
    };
    loadCases();
  }, [user?.id, dateRange]);

  const totalCases = cases.length;
  const resolved = cases.filter((c) => c.status === 'RESOLVED').length;
  const successRate = totalCases === 0 ? 0 : Math.round((resolved / totalCases) * 100);
  
  // Calculate average response time
  const avgResponseHours = cases.length === 0 ? 'N/A' : `${((cases.reduce((sum, c) => {
    const created = c.createdAt ? new Date(c.createdAt).getTime() : 0;
    const updated = c.updatedAt ? new Date(c.updatedAt).getTime() : created;
    return sum + Math.max(0, (updated - created) / (1000 * 60 * 60));
  }, 0) / cases.length)).toFixed(1)}h`;

  // Calculate monthly data for last 6 months
  const monthlyData = [];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const monthlyCases = cases.filter(c => {
      const caseDate = new Date(c.createdAt || '');
      return caseDate >= monthStart && caseDate <= monthEnd;
    });

    monthlyData.push({
      month: months[i + (6 - 5)],
      cases: monthlyCases.length,
      resolved: monthlyCases.filter(c => c.status === 'RESOLVED').length,
    });
  }

  // Analyze case types
  const caseTypeMap: any = {};
  cases.forEach(c => {
    caseTypeMap[c.caseType] = (caseTypeMap[c.caseType] || 0) + 1;
  });

  const totalCaseTypes = (Object.values(caseTypeMap).reduce((a: any, b: any) => a + b, 0) as number) || 1;
  const casesByType = Object.entries(caseTypeMap)
    .sort((a: any, b: any) => (b[1] as number) - (a[1] as number))
    .slice(0, 4)
    .map(([type, count]: any) => ({
      type,
      count,
      percentage: Math.round(((count as number) / totalCaseTypes) * 100),
    }));

  // Calculate response time distribution
  const responseTimeDistribution = {
    underOneHour: 0,
    oneToFourHours: 0,
    fourPlusHours: 0,
  };

  cases.forEach(c => {
    const created = c.createdAt ? new Date(c.createdAt).getTime() : 0;
    const updated = c.updatedAt ? new Date(c.updatedAt).getTime() : created;
    const hours = (updated - created) / (1000 * 60 * 60);
    
    if (hours < 1) responseTimeDistribution.underOneHour++;
    else if (hours < 4) responseTimeDistribution.oneToFourHours++;
    else responseTimeDistribution.fourPlusHours++;
  });

  const total = Object.values(responseTimeDistribution).reduce((a, b) => a + b, 0) || 1;
  const underOneHourPct = Math.round((responseTimeDistribution.underOneHour / total) * 100);
  const oneToFourHoursPct = Math.round((responseTimeDistribution.oneToFourHours / total) * 100);
  const fourPlusHoursPct = Math.round((responseTimeDistribution.fourPlusHours / total) * 100);

  // Calculate performance score (0-100)
  const performanceScore = totalCases === 0 ? 0 : (
    (successRate * 0.6) +
    (Math.min(100, (100 - Math.min(parseFloat(avgResponseHours) || 0, 24) / 24 * 100)) * 0.2) +
    (cases.length > 5 ? 20 : (cases.length / 5) * 20)
  ) / 100 * 10;

  const metrics = [
    { label: 'Cases Resolved', value: String(resolved), trend: '', color: 'text-green-600' },
    { label: 'Avg Response Time', value: avgResponseHours, trend: '', color: 'text-blue-600' },
    { label: 'Success Rate', value: `${successRate}%`, trend: '', color: 'text-purple-600' },
    { label: 'Total Cases', value: String(totalCases), trend: '', color: 'text-orange-600' },
  ];

  if (isLoading) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Analytics</h1>
            <p className="text-muted-foreground mt-1">Track your performance and insights</p>
          </div>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <p className="text-sm text-muted-foreground font-medium mb-2">{metric.label}</p>
              <div className="flex items-end justify-between">
                <p className="text-3xl font-bold text-foreground">{metric.value}</p>
                <span className={`text-sm font-semibold ${metric.color}`}>{metric.trend}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cases Over Time Chart */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Cases Overview
            </h2>

            <div className="space-y-6">
              {monthlyData.map((data, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-foreground">{data.month}</span>
                    <span className="text-sm text-muted-foreground">
                      {data.resolved}/{data.cases}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-primary to-primary/80 h-3 rounded-full transition-all"
                      style={{ width: `${data.cases > 0 ? (data.resolved / data.cases) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cases by Type */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              Cases by Type
            </h2>

            <div className="space-y-4">
              {casesByType.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-foreground text-sm">{item.type}</span>
                    <span className="text-sm font-bold text-primary">{item.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{item.count} cases</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Response Time</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-foreground">Under 1 hour</span>
                  <span className="font-bold">{underOneHourPct}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${underOneHourPct}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-foreground">1-4 hours</span>
                  <span className="font-bold">{oneToFourHoursPct}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${oneToFourHoursPct}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-foreground">4+ hours</span>
                  <span className="font-bold">{fourPlusHoursPct}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: `${fourPlusHoursPct}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary to-primary/80 rounded-lg shadow-sm p-6 text-white">
            <h3 className="text-lg font-bold mb-4">Performance Score</h3>
            <div className="text-center mb-6">
              <p className="text-5xl font-bold">{performanceScore.toFixed(1)}/10</p>
              <p className="text-white/80 mt-2">
                {performanceScore >= 8.5 ? 'Excellent' : performanceScore >= 7 ? 'Very Good' : performanceScore >= 5.5 ? 'Good' : 'Needs Improvement'}
              </p>
            </div>
            <button className="w-full px-4 py-2 bg-white/20 hover:bg-white/30 transition-all backdrop-blur rounded-lg text-white font-medium">
              View Recommendations
            </button>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
