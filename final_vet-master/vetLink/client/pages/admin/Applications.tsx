import SidebarLayout from '@/components/SidebarLayout';
import AdminApplicationManager from '@/components/AdminApplicationManager';
import { useLanguage } from '@/lib/LanguageContext';

export default function AdminApplications() {
    const { t } = useLanguage();

    return (
        <SidebarLayout>
            <div className="max-w-7xl mx-auto p-6 space-y-6">
                <div>
                    <h1 className="text-4xl font-bold text-foreground">User Applications</h1>
                    <p className="text-muted-foreground mt-1">Review and approve user registrations</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <AdminApplicationManager />
                </div>
            </div>
        </SidebarLayout>
    );
}
