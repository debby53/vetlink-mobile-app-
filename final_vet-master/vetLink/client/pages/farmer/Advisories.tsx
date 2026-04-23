import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarLayout from '@/components/SidebarLayout';
import { useLanguage } from '@/lib/LanguageContext';
import { Zap, Stethoscope, Heart, Info, ArrowRight, AlertTriangle, Pill, ShieldCheck, Search } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { caseAPI } from '@/lib/apiService';
import { toast } from 'sonner';

export default function Advisories() {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [outbreaks, setOutbreaks] = useState<any[]>([]);
    const [isLoadingOutbreaks, setIsLoadingOutbreaks] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadOutbreaks();
    }, []);

    const loadOutbreaks = async () => {
        setIsLoadingOutbreaks(true);
        try {
            // Fetch cases that might indicate outbreaks (High Severity)
            // Ideally backend would have a dedicated endpoint, but filtering cases works for now
            const allCases = await caseAPI.getAllCases();
            const highSeverity = allCases.filter((c: any) =>
                (c.severity === 'HIGH' || c.severity === 'CRITICAL') &&
                (c.status === 'PENDING' || c.status === 'IN_PROGRESS')
            );
            setOutbreaks(highSeverity);
        } catch (error) {
            console.error('Failed to load outbreaks:', error);
        } finally {
            setIsLoadingOutbreaks(false);
        }
    };

    const treatments = [
        { name: t('mastitis'), symptoms: t('mastitisSymptoms'), treatment: t('mastitisTreatment'), prevention: t('mastitisPrevention') },
        { name: t('fmd'), symptoms: t('fmdSymptoms'), treatment: t('fmdTreatment'), prevention: t('fmdPrevention') },
        { name: t('ecf'), symptoms: t('ecfSymptoms'), treatment: t('ecfTreatment'), prevention: t('ecfPrevention') },
        { name: t('bloat'), symptoms: t('bloatSymptoms'), treatment: t('bloatTreatment'), prevention: t('bloatPrevention') },
        { name: t('worms'), symptoms: t('wormsSymptoms'), treatment: t('wormsTreatment'), prevention: t('wormsPrevention') },
    ];

    const filteredTreatments = treatments.filter(tr =>
        tr.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tr.symptoms.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const healthTips = [
        { title: t('cleanWaterAccess'), content: t('cleanWaterAccessDesc') },
        { title: t('vaccinationSchedule'), content: t('vaccinationScheduleDesc') },
        { title: t('nutritionalBalance'), content: t('nutritionalBalanceDesc') },
        { title: t('hygieneHousing'), content: t('hygieneHousingDesc') },
        { title: t('quarantineNewAnimals'), content: t('quarantineNewAnimalsDesc') },
    ];

    return (
        <SidebarLayout>
            <div className="max-w-7xl mx-auto p-6 space-y-8">
                <div>
                    <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
                        <ShieldCheck className="h-10 w-10 text-primary" />
                        {t('advisoryTitle')}
                    </h1>
                    <p className="text-muted-foreground">
                        {t('advisorySubtitle')}
                    </p>
                </div>

                <Tabs defaultValue="treatment" className="w-full">
                    <TabsList className="grid w-full grid-cols-1 md:grid-cols-4 h-auto">
                        <TabsTrigger value="ration" onClick={() => navigate('/farmer/rations')} className="py-3">
                            <Zap className="mr-2 h-4 w-4" /> {t('feedAndRations')}
                        </TabsTrigger>
                        <TabsTrigger value="treatment" className="py-3">
                            <Pill className="mr-2 h-4 w-4" /> {t('treatmentGuide')}
                        </TabsTrigger>
                        <TabsTrigger value="tips" className="py-3">
                            <Heart className="mr-2 h-4 w-4" /> {t('healthTips')}
                        </TabsTrigger>
                        <TabsTrigger value="outbreaks" className="py-3">
                            <AlertTriangle className="mr-2 h-4 w-4" /> {t('outbreaks')} ({outbreaks.length})
                        </TabsTrigger>
                    </TabsList>

                    {/* Content for Feed is redirected, but we keep tab for consistency */}

                    <TabsContent value="treatment" className="mt-6 space-y-6">
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-blue-50 p-6 rounded-xl border border-blue-100">
                            <div>
                                <h3 className="text-lg font-bold text-blue-900">{t('commonTreatmentsDatabase')}</h3>
                                <p className="text-blue-700">{t('searchTreatmentsDesc')}</p>
                            </div>
                            <div className="relative w-full md:w-96">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-blue-500" />
                                <Input
                                    placeholder={t('searchPlaceholderTreatments')}
                                    className="pl-10 bg-white border-blue-200"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {filteredTreatments.map((item, idx) => (
                                <div key={idx} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                    <h4 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                                        <Stethoscope className="h-5 w-5 text-primary" />
                                        {item.name}
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                                        <div className="bg-red-50 p-4 rounded-lg">
                                            <span className="font-semibold text-red-700 block mb-1">{t('symptoms')}</span>
                                            <p className="text-sm text-red-600">{item.symptoms}</p>
                                        </div>
                                        <div className="bg-green-50 p-4 rounded-lg">
                                            <span className="font-semibold text-green-700 block mb-1">{t('recommendedTreatment')}</span>
                                            <p className="text-sm text-green-600">{item.treatment}</p>
                                        </div>
                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <span className="font-semibold text-blue-700 block mb-1">{t('prevention')}</span>
                                            <p className="text-sm text-blue-600">{item.prevention}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {filteredTreatments.length === 0 && (
                                <div className="text-center py-10 text-muted-foreground">
                                    {t('noTreatmentsFound')} "{searchTerm}"
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="tips" className="mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {healthTips.map((tip, idx) => (
                                <Card key={idx} className="hover:shadow-lg transition-all border-l-4 border-l-purple-500">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-purple-700">
                                            <Heart className="h-5 w-5" />
                                            {tip.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-600 leading-relaxed">
                                            {tip.content}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="outbreaks" className="mt-6">
                        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
                            <h3 className="text-lg font-bold text-red-800 flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5" />
                                {t('activeDiseaseAlerts')}
                            </h3>
                            <p className="text-red-600 mt-1">
                                {t('activeDiseaseAlertsDesc')}
                            </p>
                        </div>

                        {isLoadingOutbreaks ? (
                            <div className="text-center py-10">Loading alerts...</div>
                        ) : (
                            <div className="space-y-4">
                                {outbreaks.length > 0 ? outbreaks.map((outbreak) => (
                                    <div key={outbreak.id} className="flex items-start gap-4 bg-white p-6 rounded-xl border border-red-100 shadow-sm">
                                        <div className="bg-red-100 p-3 rounded-full shrink-0">
                                            <AlertTriangle className="h-6 w-6 text-red-600" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-gray-900">{outbreak.title}</h4>
                                            <div className="flex gap-2 mt-1 mb-2">
                                                <Badge variant="destructive">{t('criticalAlert')}</Badge>
                                                <Badge variant="outline">{outbreak.caseType}</Badge>
                                                <span className="text-xs text-muted-foreground flex items-center self-center">
                                                    {new Date(outbreak.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-gray-600">{outbreak.description}</p>
                                            {outbreak.locationName && (
                                                <p className="text-sm text-gray-500 mt-2">📍 {t('reportedIn')}: {outbreak.locationName}</p>
                                            )}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-12 bg-green-50 rounded-xl border border-green-100">
                                        <ShieldCheck className="h-12 w-12 text-green-500 mx-auto mb-3" />
                                        <h3 className="text-lg font-bold text-green-900">{t('noActiveOutbreaks')}</h3>
                                        <p className="text-green-700">{t('noActiveOutbreaksDesc')}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </SidebarLayout>
    );
}
