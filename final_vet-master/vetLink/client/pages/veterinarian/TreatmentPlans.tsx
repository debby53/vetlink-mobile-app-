import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarLayout from '@/components/SidebarLayout';
import { useLanguage } from '@/lib/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { Heart, Plus, Edit, Trash2, CheckCircle, Clock, AlertCircle, Search, Calendar, ChevronLeft, ChevronRight, AlertTriangle, X, Syringe, Shield, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { treatmentPlanAPI, caseAPI, TreatmentPlanDTO, CaseDTO, userAPI, animalAPI } from '@/lib/apiService';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface EscalatedCase extends CaseDTO {
  farmer?: string;
  animal?: string;
}

interface ActivityType {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
}

interface PlanFormData {
  activityType: string;
  caseId?: string | number;
  startDate: string;
  duration: number;
  treatment: string;
  notes: string;
  compliance: number;
}

const ACTIVITY_TYPES: ActivityType[] = [
  { id: 'escalated-case', name: 'Escalated Case', icon: <AlertTriangle className="h-5 w-5" />, color: 'bg-red-100 text-red-700' },
  { id: 'vaccination', name: 'Vaccination', icon: <Syringe className="h-5 w-5" />, color: 'bg-blue-100 text-blue-700' },
  { id: 'health-checkup', name: 'Health Checkup', icon: <Heart className="h-5 w-5" />, color: 'bg-green-100 text-green-700' },
  { id: 'treatment', name: 'Treatment', icon: <Activity className="h-5 w-5" />, color: 'bg-purple-100 text-purple-700' },
  { id: 'prevention', name: 'Prevention', icon: <Shield className="h-5 w-5" />, color: 'bg-yellow-100 text-yellow-700' },
];

export default function TreatmentPlans() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [treatments, setTreatments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [escalatedCases, setEscalatedCases] = useState<EscalatedCase[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedCase, setSelectedCase] = useState<EscalatedCase | null>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedActivityType, setSelectedActivityType] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [treatmentToDelete, setTreatmentToDelete] = useState<number | null>(null);


  const formatLocalDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState<PlanFormData>({
    activityType: '',
    caseId: '',
    startDate: formatLocalDate(new Date()),
    duration: 7,
    treatment: '',
    notes: '',
    compliance: 85,
  });

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('default', { month: 'long', year: 'numeric' });
  };

  const getDayName = (index: number) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[index];
  };

  const handleDateClick = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(date);
    setFormData({
      ...formData,
      startDate: formatLocalDate(date),
      activityType: '',
      caseId: '',
    });
    setSelectedActivityType('');
    setSelectedCase(null);
    setShowPlanModal(true);
  };

  const handleCaseSelect = (caze: EscalatedCase) => {
    setSelectedCase(caze);
    setFormData({
      ...formData,
      caseId: String(caze.id),
    });
  };

  const getActivityTypeIcon = (typeId: string) => {
    const activity = ACTIVITY_TYPES.find((a) => a.id === typeId);
    return activity?.icon || null;
  };

  const getPlansForDate = (day: number): any[] => {
    const targetDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const targetDateStr = formatLocalDate(targetDate);
    return treatments.filter((t) => {
      // Parse the date string directly without using Date constructor to avoid timezone issues
      const planDateStr = t.startDate ? String(t.startDate).split('T')[0] : '';
      return planDateStr === targetDateStr;
    });
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const deleteTreatment = (id: number) => {
    setTreatmentToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteTreatment = async () => {
    if (treatmentToDelete === null) return;
    try {
      await treatmentPlanAPI.deleteTreatmentPlan(treatmentToDelete);
      setTreatments((prev) => prev.filter((t) => t.id !== treatmentToDelete));
      toast.success(t('treatmentDeleted') || 'Treatment plan deleted');
    } catch (err: any) {
      console.error('Failed to delete treatment plan:', err);
      toast.error(err.message || 'Failed to delete treatment plan');
    } finally {
      setDeleteDialogOpen(false);
      setTreatmentToDelete(null);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;
      setIsLoading(true);
      try {
        // Load treatment plans
        const plans = await treatmentPlanAPI.getTreatmentPlansByVeterinarianId(Number(user.id!));
        const enriched: any[] = [];
        for (const p of plans) {
          try {
            if (p.caseId) {
              const caze = await caseAPI.getCaseById(p.caseId as unknown as number);
              const farmer = caze?.farmerId ? await userAPI.getUserById(caze.farmerId) : null;
              const animal = caze?.animalId ? await animalAPI.getAnimalById(caze.animalId) : null;
              enriched.push({
                ...p,
                farmer: farmer?.name || 'Unknown',
                animal: animal?.name || 'Unknown',
                issue: caze?.title || caze?.description || '',
              });
            } else {
              // For non-escalated case activities
              enriched.push({
                ...p,
                farmer: 'General',
                animal: 'N/A',
                issue: p.treatment,
              });
            }
          } catch (inner) {
            console.error('Failed to enrich plan', inner);
            enriched.push(p);
          }
        }
        setTreatments(enriched);

        // Load escalated cases for this veterinarian
        try {
          // PRIMARY: Get escalated cases only from location
          const escalatedCases = await caseAPI.getCasesByVeterinarianLocation(Number(user.id!));
          const filtered = (escalatedCases || []).filter((c: any) => c.isEscalated === true);

          const enrichedCases: EscalatedCase[] = [];
          for (const caze of filtered) {
            try {
              const farmer = caze?.farmerId ? await userAPI.getUserById(caze.farmerId) : null;
              const animal = caze?.animalId ? await animalAPI.getAnimalById(caze.animalId) : null;
              enrichedCases.push({
                ...caze,
                farmer: farmer?.name || 'Unknown',
                animal: animal?.name || 'Unknown',
              });
            } catch (inner) {
              console.error('Failed to enrich case', inner);
              enrichedCases.push(caze);
            }
          }
          setEscalatedCases(enrichedCases);
        } catch (err) {
          console.error('Failed to load escalated cases from location:', err);
          // FALLBACK: Try to get all escalated cases globally
          try {
            const allEscalated = await caseAPI.getCasesEscalated();
            const enrichedCases: EscalatedCase[] = [];
            for (const caze of allEscalated || []) {
              try {
                const farmer = caze?.farmerId ? await userAPI.getUserById(caze.farmerId) : null;
                const animal = caze?.animalId ? await animalAPI.getAnimalById(caze.animalId) : null;
                enrichedCases.push({
                  ...caze,
                  farmer: farmer?.name || 'Unknown',
                  animal: animal?.name || 'Unknown',
                });
              } catch (inner) {
                console.error('Failed to enrich case', inner);
                enrichedCases.push(caze);
              }
            }
            setEscalatedCases(enrichedCases);
          } catch (fallbackErr) {
            console.error('All escalated case loading methods failed:', fallbackErr);
            setEscalatedCases([]);
          }
        }
      } catch (err: any) {
        console.error('Failed to load data:', err);
        toast.error('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user?.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const stats = [
    {
      label: t('activePlans'),
      value: treatments.filter((t) => t.status === 'active').length,
      color: 'text-yellow-600',
    },
    {
      label: t('completed'),
      value: treatments.filter((t) => t.status === 'completed').length,
      color: 'text-green-600',
    },
    {
      label: 'Escalated Cases',
      value: escalatedCases.length,
      color: 'text-red-600',
    },
  ];

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const calendarDays: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  return (
    <SidebarLayout>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
              <Heart className="h-8 w-8 text-primary" />
              {t('treatmentPlans')}
            </h1>
            <p className="text-muted-foreground">
              Click on a date to create a plan for escalated cases, vaccinations, health checkups, or other activities
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Main Layout: Calendar + Escalated Cases */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded-lg">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <h2 className="text-2xl font-bold text-foreground">{getMonthName(currentMonth)}</h2>
                <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-lg">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center font-semibold text-sm text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days with Plan Indicators */}
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, index) => {
                  const plansOnDay = day ? getPlansForDate(day) : [];
                  const hasPlans = plansOnDay.length > 0;

                  // Check if date is in the past
                  let isPast = false;
                  if (day) {
                    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    isPast = date < today;
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => day && !isPast && handleDateClick(day)}
                      disabled={!day || isPast}
                      className={`aspect-square rounded-lg border-2 transition-all font-medium text-sm relative
                        ${!day
                          ? 'bg-gray-50 border-gray-100 cursor-default'
                          : isPast
                            ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                            : selectedDate && selectedDate.getDate() === day && selectedDate.getMonth() === currentMonth.getMonth() && selectedDate.getFullYear() === currentMonth.getFullYear()
                              ? 'bg-primary text-white border-primary'
                              : 'bg-white border-gray-200 hover:border-primary hover:bg-primary/10 cursor-pointer'
                        }`}
                    >
                      <div className="flex flex-col items-center justify-center h-full">
                        <span>{day}</span>
                        {hasPlans && (
                          <div className="absolute bottom-1 flex gap-0.5">
                            {plansOnDay.slice(0, 3).map((plan, idx) => (
                              <div key={idx} className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                            ))}
                            {plansOnDay.length > 3 && <div className="text-xs text-foreground">+{plansOnDay.length - 3}</div>}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedDate && (
                <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  <p className="text-sm font-medium text-foreground">
                    Selected Date: <span className="text-primary font-bold">{selectedDate.toLocaleDateString()}</span>
                  </p>
                  {getPlansForDate(selectedDate.getDate()).length > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {getPlansForDate(selectedDate.getDate()).length} plan(s) scheduled for this date
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Escalated Cases Section */}
          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <h3 className="text-lg font-bold text-foreground">Escalated Cases</h3>
              </div>

              {escalatedCases.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No escalated cases available</p>
                  <p className="text-xs text-gray-400 mt-2">
                    Cases will appear here when CAHWs escalate cases to your location
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {escalatedCases.map((caze) => (
                    <button
                      key={caze.id}
                      onClick={() => handleCaseSelect(caze)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-all
                        ${selectedCase?.id === caze.id
                          ? 'bg-red-50 border-red-500'
                          : 'bg-gray-50 border-gray-200 hover:border-red-300'
                        }`}
                    >
                      <p className="font-semibold text-sm text-foreground">{caze.animal}</p>
                      <p className="text-xs text-muted-foreground mt-1">{caze.farmer}</p>
                      <p className="text-xs text-red-600 mt-1">Case #{caze.id}</p>
                      <div className="mt-2 text-xs">
                        <p className="text-muted-foreground line-clamp-2">{caze.title || caze.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form Section - Show when date and case selected */}
        {showPlanModal && selectedDate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
                <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-primary" />
                  Plans for {selectedDate.toLocaleDateString()}
                </h3>
                <button
                  onClick={() => {
                    setShowPlanModal(false);
                    setSelectedDate(null);
                    setSelectedCase(null);
                    setSelectedActivityType('');
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* Section 1: Existing Plans for This Date */}
                <div>
                  <h4 className="text-lg font-semibold text-foreground mb-4">Existing Plans</h4>
                  {getPlansForDate(selectedDate.getDate()).length === 0 ? (
                    <div className="text-center py-6 bg-gray-50 rounded-lg">
                      <AlertCircle className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No plans scheduled for this date</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto">
                      {getPlansForDate(selectedDate.getDate()).map((plan) => {
                        const activityType = ACTIVITY_TYPES.find((a) => a.id === plan.activityType);
                        return (
                          <div key={plan.id} className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  {activityType?.icon && <span className="text-lg">{activityType.icon}</span>}
                                  <p className="font-semibold text-sm text-foreground">{activityType?.name || plan.activityType}</p>
                                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${plan.status === 'ACTIVE' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                    {plan.status}
                                  </span>
                                </div>
                                <p className="text-sm text-foreground mb-2">{plan.treatment}</p>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                  <span>Duration: {plan.duration} days</span>
                                  <span>Compliance: {plan.compliance}%</span>
                                </div>
                                {plan.notes && <p className="text-xs text-muted-foreground mt-2 italic">Note: {plan.notes}</p>}
                                {plan.farmer && plan.animal && (
                                  <p className="text-xs text-muted-foreground mt-2">{plan.animal} - {plan.farmer}</p>
                                )}
                              </div>
                              <button
                                onClick={() => deleteTreatment(plan.id)}
                                className="p-2 hover:bg-red-200 text-red-600 rounded-lg transition-all"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Divider */}
                {getPlansForDate(selectedDate.getDate()).length > 0 && (
                  <div className="border-t-2 border-gray-200 pt-6">
                    <p className="text-center text-sm text-muted-foreground mb-4">Add another plan for this date</p>
                  </div>
                )}

                {/* Section 2: Create New Plan */}
                {/* Step 1: Select Activity Type */}
                <div>
                  <h4 className="text-lg font-semibold text-foreground mb-4">Create New Plan - Step 1: Select Activity Type</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {ACTIVITY_TYPES.map((activity) => (
                      <button
                        key={activity.id}
                        onClick={() => {
                          setSelectedActivityType(activity.id);
                          setFormData({ ...formData, activityType: activity.id });
                          setSelectedCase(null); // Reset selected case when changing activity
                        }}
                        className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2
                          ${selectedActivityType === activity.id
                            ? 'border-primary bg-primary/10'
                            : 'border-gray-200 hover:border-primary'
                          }`}
                      >
                        <div className="text-2xl">{activity.icon}</div>
                        <span className="text-xs font-medium text-center">{activity.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 2: Select Case (only for escalated case type) */}
                {selectedActivityType === 'escalated-case' && (
                  <div>
                    <h4 className="text-lg font-semibold text-foreground mb-4">Create New Plan - Step 2: Select Escalated Case</h4>
                    {escalatedCases.length === 0 ? (
                      <div className="text-center py-6 bg-gray-50 rounded-lg">
                        <AlertCircle className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No escalated cases available</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {escalatedCases.map((caze) => (
                          <button
                            key={caze.id}
                            onClick={() => handleCaseSelect(caze)}
                            className={`w-full text-left p-3 rounded-lg border-2 transition-all
                              ${selectedCase?.id === caze.id
                                ? 'bg-red-50 border-red-500'
                                : 'bg-gray-50 border-gray-200 hover:border-red-300'
                              }`}
                          >
                            <p className="font-semibold text-sm text-foreground">{caze.animal}</p>
                            <p className="text-xs text-muted-foreground mt-1">{caze.farmer}</p>
                            <p className="text-xs text-red-600 mt-1">Case #{caze.id}</p>
                            <div className="mt-2 text-xs">
                              <p className="text-muted-foreground line-clamp-2">{caze.title || caze.description}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3: Plan Details */}
                <div>
                  <h4 className="text-lg font-semibold text-foreground mb-4">
                    Create New Plan - Step {selectedActivityType === 'escalated-case' ? 3 : 2}: Plan Details
                  </h4>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!formData.treatment) {
                        toast.error('Please fill in treatment/activity details');
                        return;
                      }
                      if (selectedActivityType === 'escalated-case' && !formData.caseId) {
                        toast.error('Please select an escalated case');
                        return;
                      }

                      try {
                        // Validate all required fields
                        if (!formData.duration || formData.duration <= 0) {
                          toast.error('Please enter a valid duration');
                          return;
                        }
                        if (formData.compliance == null || Number(formData.compliance) < 0 || Number(formData.compliance) > 100) {
                          toast.error('Please enter a valid compliance percentage (0-100)');
                          return;
                        }

                        const newPlan = await treatmentPlanAPI.createTreatmentPlan({
                          caseId: selectedActivityType === 'escalated-case' ? Number(formData.caseId) : null,
                          veterinarianId: user?.id ? Number(user.id) : 0,
                          treatment: formData.treatment,
                          notes: formData.notes || '',
                          duration: Number(formData.duration),
                          compliance: Number(formData.compliance),
                          status: 'ACTIVE',
                          activityType: selectedActivityType,
                          startDate: formData.startDate,
                        } as any);

                        toast.success('Plan created successfully');
                        setShowPlanModal(false);
                        setSelectedDate(null);
                        setSelectedCase(null);
                        setSelectedActivityType('');
                        setFormData({
                          activityType: '',
                          caseId: '',
                          startDate: formatLocalDate(new Date()),
                          duration: 7,
                          treatment: '',
                          notes: '',
                          compliance: 85,
                        });

                        // Reload plans
                        if (user?.id) {
                          const plans = await treatmentPlanAPI.getTreatmentPlansByVeterinarianId(Number(user.id!));
                          const enriched: any[] = [];
                          for (const p of plans) {
                            try {
                              if (p.caseId) {
                                const caze = await caseAPI.getCaseById(p.caseId as unknown as number);
                                const farmer = caze?.farmerId ? await userAPI.getUserById(caze.farmerId) : null;
                                const animal = caze?.animalId ? await animalAPI.getAnimalById(caze.animalId) : null;
                                enriched.push({
                                  ...p,
                                  farmer: farmer?.name || 'Unknown',
                                  animal: animal?.name || 'Unknown',
                                  issue: caze?.title || caze?.description || '',
                                  startDate: p.startDate || '',
                                  endDate: p.endDate || p.createdAt || '',
                                });
                              } else {
                                enriched.push({
                                  ...p,
                                  farmer: 'General',
                                  animal: 'N/A',
                                  issue: p.treatment,
                                  startDate: p.startDate || '',
                                  endDate: p.endDate || p.createdAt || '',
                                });
                              }
                            } catch (inner) {
                              console.error('Failed to enrich plan', inner);
                              enriched.push(p);
                            }
                          }
                          setTreatments(enriched);
                        }
                      } catch (err: any) {
                        console.error('Failed to create plan:', err);
                        toast.error(err.message || 'Failed to create plan');
                      }
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Duration (Days) *</label>
                      <input
                        type="number"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                        required
                        min={1}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Compliance % *</label>
                      <input
                        type="number"
                        value={formData.compliance}
                        onChange={(e) => setFormData({ ...formData, compliance: Number(e.target.value) })}
                        min={0}
                        max={100}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        {selectedActivityType === 'escalated-case' ? 'Treatment' : 'Activity'} Details *
                      </label>
                      <textarea
                        value={formData.treatment}
                        onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                        placeholder={`Enter ${selectedActivityType === 'vaccination' ? 'vaccine type, dosage, and notes' : 'details for this activity'}`}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                        rows={3}
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Additional Notes</label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Special instructions or observations"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                        rows={2}
                      ></textarea>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowPlanModal(false);
                          setSelectedDate(null);
                          setSelectedCase(null);
                          setSelectedActivityType('');
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-foreground hover:bg-gray-50 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Create Plan
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Treatment Plans List */}
        <div>
          <h3 className="text-xl font-bold text-foreground mb-4">Active Treatment Plans</h3>
          {treatments.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
              <Heart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-muted-foreground">No treatment plans created yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {treatments.map((treatment) => {
                const activity = ACTIVITY_TYPES.find((a) => a.id === treatment.activityType);
                const activityName = activity?.name || 'Plan';
                return (
                  <div
                    key={treatment.id}
                    className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getActivityTypeIcon(treatment.activityType)}
                          <h4 className="font-semibold text-foreground">{treatment.animal || 'Activity Plan'}</h4>
                        </div>
                        <p className="text-xs text-muted-foreground">{treatment.farmer}</p>
                        <p className="text-xs text-primary font-medium mt-1">{activityName}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(treatment.status)}`}>
                        {treatment.status.charAt(0).toUpperCase() + treatment.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{treatment.treatment}</p>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: `${treatment.compliance}%` }}></div>
                      </div>
                      <span className="text-xs font-bold">{treatment.compliance}%</span>
                    </div>
                    <button
                      onClick={() => deleteTreatment(treatment.id)}
                      className="w-full px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      Delete
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Treatment Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this treatment plan? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteTreatment} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarLayout>
  );
}
