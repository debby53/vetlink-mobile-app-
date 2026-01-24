import { useState } from 'react';
import SidebarLayout from '@/components/SidebarLayout';
import { Download, FileText, Calendar, Filter, Loader2 } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { userAPI, caseAPI } from '@/lib/apiService';
import { toast } from 'sonner';

export default function Reports() {
  const { t } = useLanguage();
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  const generateUserReport = async () => {
    setIsGenerating('users');
    try {
      const users = await userAPI.getActiveUsers();

      // Convert to CSV
      const headers = ['ID', 'Name', 'Email', 'Role', 'Status', 'Joined Date', 'Location'];
      const csvContent = [
        headers.join(','),
        ...users.map((u: any) => [
          u.id,
          `"${u.name}"`,
          u.email,
          u.role,
          u.status || (u.active ? 'ACTIVE' : 'INACTIVE'),
          u.createdAt || u.joinDate || new Date().toISOString(),
          `"${u.locationName || ''}"`
        ].join(','))
      ].join('\n');

      downloadCSV(csvContent, `users_report_${new Date().toISOString().split('T')[0]}.csv`);
      toast.success('User report generated');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate user report');
    } finally {
      setIsGenerating(null);
    }
  };

  const generateCaseReport = async () => {
    setIsGenerating('cases');
    try {
      const cases = await caseAPI.getAllCases();

      const headers = ['ID', 'Title', 'Type', 'Farmer ID', 'Status', 'Created At'];
      const csvContent = [
        headers.join(','),
        ...cases.map((c: any) => [
          c.id,
          `"${c.title}"`,
          c.caseType,
          c.farmerId,
          c.status,
          c.createdAt
        ].join(','))
      ].join('\n');

      downloadCSV(csvContent, `cases_report_${new Date().toISOString().split('T')[0]}.csv`);
      toast.success('Case report generated');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate case report');
    } finally {
      setIsGenerating(null);
    }
  };

  const downloadCSV = (content: string, fileName: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const availableReports = [
    {
      id: 'users',
      name: 'System Users Report',
      description: 'Full list of registered users including farmers, vets, and CAHWs.',
      type: 'CSV',
      action: generateUserReport,
    },
    {
      id: 'cases',
      name: 'All Cases Report',
      description: 'Comprehensive log of all reported animal health cases and their status.',
      type: 'CSV',
      action: generateCaseReport,
    }
  ];

  return (
    <SidebarLayout>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-foreground">{t('reports')}</h1>
          <p className="text-muted-foreground mt-1">{t('systemReports')}</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Available Reports
          </h2>

          {availableReports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-foreground">{report.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                  {report.type}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-4">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Generated On</p>
                    <p className="font-semibold text-foreground flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date().toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Source</p>
                    <p className="font-semibold text-foreground">Live Database</p>
                  </div>
                </div>
                <button
                  onClick={report.action}
                  disabled={isGenerating === report.id}
                  className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-all font-medium text-sm disabled:opacity-50"
                >
                  {isGenerating === report.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  {isGenerating === report.id ? 'Generating...' : t('downloadReport')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SidebarLayout>
  );
}
