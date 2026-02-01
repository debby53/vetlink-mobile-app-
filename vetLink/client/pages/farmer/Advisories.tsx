import { useNavigate } from 'react-router-dom';
import SidebarLayout from '@/components/SidebarLayout';
import { useLanguage } from '@/lib/LanguageContext';
import { Zap, Stethoscope, Heart, Info, ArrowRight } from 'lucide-react';

export default function Advisories() {
    const { t } = useLanguage();
    const navigate = useNavigate();

    const advisoryOptions = [
        {
            title: t('feedAdvisor') || 'Feed Advisory',
            description: 'Get customized ration plans for your livestock to ensure optimal health and productivity.',
            icon: Zap,
            path: '/farmer/rations',
            color: 'bg-green-100 text-green-700',
            btnColor: 'bg-green-600 hover:bg-green-700'
        },
        {
            title: t('treatmentAdvisory') || 'Treatment Advisory',
            description: 'Access guidelines and best practices for common treatments and animal care.',
            icon: Stethoscope,
            path: '#', // Placeholder for now, or create a specific page
            color: 'bg-blue-100 text-blue-700',
            btnColor: 'bg-blue-600 hover:bg-blue-700',
            comingSoon: true
        },
        {
            title: t('generalHealthTips') || 'General Health Tips',
            description: 'Daily tips and preventative measures to keep your farm disease-free.',
            icon: Heart,
            path: '#',
            color: 'bg-purple-100 text-purple-700',
            btnColor: 'bg-purple-600 hover:bg-purple-700',
            comingSoon: true
        },
        {
            title: 'Disease Outbreaks',
            description: 'Stay updated on recent disease outbreaks in your region.',
            icon: Info,
            path: '#',
            color: 'bg-red-100 text-red-700',
            btnColor: 'bg-red-600 hover:bg-red-700',
            comingSoon: true
        }
    ];

    return (
        <SidebarLayout>
            <div className="max-w-7xl mx-auto p-6 space-y-8">
                <div>
                    <h1 className="text-4xl font-bold text-foreground mb-2">
                        {t('advisories') || 'Advisories'}
                    </h1>
                    <p className="text-muted-foreground">
                        Expert advice and tools to manage your farm better.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {advisoryOptions.map((option, index) => {
                        const Icon = option.icon;
                        return (
                            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all flex flex-col">
                                <div className="p-6 flex-1">
                                    <div className={`w-12 h-12 rounded-lg ${option.color} flex items-center justify-center mb-4`}>
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground mb-2">{option.title}</h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed">
                                        {option.description}
                                    </p>
                                </div>
                                <div className="p-6 pt-0 mt-auto">
                                    {option.comingSoon ? (
                                        <button
                                            disabled
                                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-400 font-medium cursor-not-allowed"
                                        >
                                            Coming Soon
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => navigate(option.path)}
                                            className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-all ${option.btnColor}`}
                                        >
                                            Open Tool
                                            <ArrowRight className="h-4 w-4" />
                                        </button>
                                    )}

                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </SidebarLayout>
    );
}
