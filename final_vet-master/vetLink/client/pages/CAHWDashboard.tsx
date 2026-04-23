import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarLayout from '@/components/SidebarLayout';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/LanguageContext';
import { caseAPI, certificationAPI, notificationAPI, userTrainingAPI } from '@/lib/apiService';
import { getRelativeTime, parseDate } from '@/lib/dateUtils';
import { toast } from 'sonner';
import {
  AlertCircle,
  ArrowRight,
  Award,
  Bell,
  BookOpen,
  CheckCircle,
  Lightbulb,
  Lock,
  Play,
  Target,
  TrendingUp,
  Users,
  Zap,
  type LucideIcon,
} from 'lucide-react';

type DashboardActivity = {
  id: string;
  action: string;
  timestamp: string;
  icon: LucideIcon;
  color: string;
  sortTime: number;
};

export default function CAHWDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [expandedModule, setExpandedModule] = useState<number | null>(null);
  const [trainings, setTrainings] = useState<any[]>([]);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [assignedCases, setAssignedCases] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<DashboardActivity[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const loadData = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const [trainingData, certData, caseData, notificationData] = await Promise.all([
        userTrainingAPI.getUserTrainings(user.id),
        certificationAPI.getCertificationsByUserId(user.id),
        caseAPI.getCasesByCAHWId(user.id),
        notificationAPI.getNotificationsByUserId(user.id),
      ]);

      setTrainings(trainingData);
      setCertifications(certData);
      setAssignedCases(caseData);
      setRecentActivities(buildRecentActivities(trainingData, certData, caseData, notificationData));
    } catch (err: any) {
      console.error('Error loading data:', err);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const inProgressTrainings = trainings.filter((training: any) => training.status === 'IN_PROGRESS').length;
  const completedTrainings = trainings.filter((training: any) => training.status === 'COMPLETED').length;
  const totalTrainingHours = trainings.reduce((sum: number, training: any) => {
    const hours = Number.parseInt((training.trainingDuration || '0').split(' ')[0], 10);
    return sum + (Number.isNaN(hours) ? 0 : hours);
  }, 0);
  const completedCases = assignedCases.filter((caze: any) =>
    ['COMPLETED', 'RESOLVED', 'CLOSED'].includes(caze.status),
  );
  const farmersAssisted = new Set(assignedCases.map((caze: any) => caze.farmerId).filter(Boolean)).size;
  const animalsTreated = new Set(completedCases.map((caze: any) => caze.animalId).filter(Boolean)).size;
  const successRate = assignedCases.length === 0 ? 0 : Math.round((completedCases.length / assignedCases.length) * 100);

  const stats = [
    {
      label: t('trainingHours'),
      value: `${totalTrainingHours}`,
      change: `${inProgressTrainings} ${t('inProgress').toLowerCase()}`,
      icon: BookOpen,
    },
    {
      label: t('certifications'),
      value: `${certifications.length}`,
      change: `${completedTrainings} ${t('completed').toLowerCase()}`,
      icon: Award,
    },
    {
      label: t('communityMembers'),
      value: `${farmersAssisted}`,
      change: `${assignedCases.length} cases handled`,
      icon: Users,
    },
    {
      label: t('performanceScore'),
      value: `${successRate}%`,
      change: `${completedCases.length} ${t('completed').toLowerCase()}`,
      icon: TrendingUp,
    },
  ];

  const trainingModules = trainings.slice(0, 4).map((training: any) => ({
    id: training.trainingId ?? training.id,
    title: training.trainingTitle || training.title,
    category: training.trainingCategory || training.category || 'General',
    progress: training.status === 'COMPLETED' ? 100 : training.progressPercentage || 0,
    completed: training.status === 'COMPLETED',
    duration: training.trainingDuration || training.duration || '0 hours',
    lessons: training.totalLessons ?? training.trainingLessons ?? 0,
    completedLessons: training.completedLessons ?? 0,
    locked: false,
    enrollmentId: training.id,
    trainingId: training.trainingId,
  }));

  const certList = certifications.map((certification: any) => ({
    id: certification.id,
    name: certification.title,
    issuer: certification.issuedBy || 'VetLink Academy',
    status: certification.isActive === false ? 'inactive' : 'completed',
  }));

  return (
    <SidebarLayout>
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {t('welcomeBack')}, {user?.name}!
          </h1>
          <p className="text-muted-foreground">{t('headerSubtitleCAHW')}</p>
        </div>

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
                    <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{stat.change}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden self-start">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-primary" />
                {t('trainingModules')}
              </h2>
            </div>

            <div className="divide-y divide-gray-100">
              {isLoading ? (
                <div className="p-6 text-center text-muted-foreground">{t('loadingTraining')}</div>
              ) : trainingModules.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">{t('noTrainingModules')}</div>
              ) : (
                trainingModules.map((module) => (
                  <div key={module.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div
                      onClick={() =>
                        setExpandedModule(expandedModule === module.id ? null : module.id)
                      }
                      className="cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground">{module.title}</h3>
                            {module.completed && (
                              <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                            )}
                            {module.locked && (
                              <Lock className="h-5 w-5 text-gray-400 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {module.category} • {module.duration}
                          </p>
                        </div>
                        <span className="text-sm font-bold text-primary">{module.progress}%</span>
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${module.progress}%` }}
                        ></div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {module.completedLessons} {t('of')} {module.lessons} {t('lessons')}
                        </span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>

                    {expandedModule === module.id && (
                      <div className="mt-6 pt-6 border-t border-gray-100">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="bg-primary/10 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground mb-1">{t('duration')}</p>
                            <p className="font-semibold text-foreground">{module.duration}</p>
                          </div>
                          <div className="bg-primary/10 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground mb-1">{t('lessons')}</p>
                            <p className="font-semibold text-foreground">
                              {module.completedLessons}/{module.lessons}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            if (!module.locked && module.trainingId && module.enrollmentId) {
                              toast.info(`${module.completed ? 'Reviewing' : 'Continuing'} ${module.title}`);
                              navigate(
                                module.completed
                                  ? `/cahw/review-course/${module.enrollmentId}`
                                  : `/cahw/learn/${module.trainingId}/${module.enrollmentId}`,
                              );
                            }
                          }}
                          disabled={module.locked}
                          className={`w-full py-2 rounded-lg font-medium transition-all text-sm flex items-center justify-center gap-2 ${
                            module.locked
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-primary text-primary-foreground hover:bg-primary/90'
                          }`}
                        >
                          <Play className="h-4 w-4" />
                          {module.completed ? t('reviewTraining') : t('continueTraining')}
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                {t('quickActions')}
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/cahw/treatments')}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-4 py-3 font-medium transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <AlertCircle className="h-4 w-4" />
                  {t('logTreatment')}
                </button>
                <button
                  onClick={() => navigate('/cahw/advisories')}
                  className="w-full bg-primary/10 hover:bg-primary/15 text-primary rounded-lg px-4 py-3 font-medium transition-all flex items-center justify-center gap-2 shadow-sm border border-primary/20"
                >
                  <Lightbulb className="h-4 w-4" />
                  {t('advisories')}
                </button>
                <button
                  onClick={() => navigate('/market')}
                  className="w-full bg-primary/10 hover:bg-primary/15 text-primary rounded-lg px-4 py-3 font-medium transition-all flex items-center justify-center gap-2 shadow-sm border border-primary/20"
                >
                  <TrendingUp className="h-4 w-4" />
                  {t('marketplace')}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                {t('certifications')}
              </h3>
              <div className="space-y-3">
                {certList.length === 0 ? (
                  <div className="text-sm text-muted-foreground">{t('noData')}</div>
                ) : (
                  certList.map((cert) => (
                    <div
                      key={cert.id}
                      className="p-3 border border-gray-100 rounded-lg hover:border-primary/30 transition-colors"
                    >
                      <p className="text-sm font-medium text-foreground">{cert.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{cert.issuer}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs font-medium text-primary flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          {cert.status === 'completed' ? t('completed') : t('inProgress')}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-primary rounded-xl p-6 text-primary-foreground shadow-lg">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Target className="h-5 w-5" />
                {t('communityImpact')}
              </h3>
              <div className="space-y-3">
                <div className="bg-primary-foreground/10 rounded-lg p-3 backdrop-blur">
                  <p className="text-sm opacity-90">{t('farmersAssisted')}</p>
                  <p className="text-2xl font-bold">{farmersAssisted}</p>
                </div>
                <div className="bg-primary-foreground/10 rounded-lg p-3 backdrop-blur">
                  <p className="text-sm opacity-90">{t('animalsTreated')}</p>
                  <p className="text-2xl font-bold">{animalsTreated}</p>
                </div>
                <div className="bg-primary-foreground/10 rounded-lg p-3 backdrop-blur">
                  <p className="text-sm opacity-90">{t('successRate')}</p>
                  <p className="text-2xl font-bold">{successRate}%</p>
                </div>
              </div>
            </div>

            <div className="bg-primary/10 rounded-xl p-6 shadow-sm border border-primary/20">
              <div className="flex gap-3">
                <Zap className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-primary">{t('greatProgress')}</h4>
                  <p className="text-sm text-primary mt-1">
                    {inProgressTrainings > 0
                      ? `${inProgressTrainings} ${t('trainingModules').toLowerCase()} ${t('inProgress').toLowerCase()}.`
                      : t('greatProgressDesc')}
                  </p>
                  <button
                    onClick={() => {
                      toast.info('Loading your progress details');
                      navigate('/cahw/progress');
                    }}
                    className="mt-3 text-sm font-semibold text-primary hover:text-primary/80"
                  >
                    {t('viewProgress')} ?
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-foreground">{t('recentActivity')}</h2>
          </div>

          <div className="divide-y divide-gray-100">
            {recentActivities.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">{t('noData')}</div>
            ) : (
              recentActivities.map((activity) => {
                const ActivityIcon = activity.icon;
                return (
                  <div key={activity.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
                          <ActivityIcon className={`h-5 w-5 ${activity.color}`} />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{activity.action}</p>
                        <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
            <button
              onClick={() => {
                toast.info('Loading your activity history');
                navigate('/cahw/progress');
              }}
              className="text-primary font-semibold text-sm hover:underline flex items-center gap-2"
            >
              {t('viewAllActivity')}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}

function buildRecentActivities(
  trainings: any[],
  certifications: any[],
  cases: any[],
  notifications: any[],
): DashboardActivity[] {
  const trainingActivities: DashboardActivity[] = trainings.map((training: any) => ({
    id: `training-${training.id}`,
    action:
      training.status === 'COMPLETED'
        ? `Completed training: ${training.trainingTitle}`
        : `Training progress updated: ${training.trainingTitle}`,
    timestamp: getRelativeTime(training.completedAt || training.enrolledAt),
    icon: training.status === 'COMPLETED' ? CheckCircle : BookOpen,
    color: 'text-primary',
    sortTime: safeTime(training.completedAt || training.enrolledAt),
  }));

  const certificationActivities: DashboardActivity[] = certifications.map((certification: any) => ({
    id: `certification-${certification.id}`,
    action: `Earned certification: ${certification.title}`,
    timestamp: getRelativeTime(certification.issuedDate),
    icon: Award,
    color: 'text-primary',
    sortTime: safeTime(certification.issuedDate),
  }));

  const caseActivities: DashboardActivity[] = cases.map((caze: any) => ({
    id: `case-${caze.id}`,
    action: `Case ${String(caze.status || 'updated').toLowerCase()}: ${caze.title || `#${caze.id}`}`,
    timestamp: getRelativeTime(caze.updatedAt || caze.createdAt),
    icon: Users,
    color: 'text-primary',
    sortTime: safeTime(caze.updatedAt || caze.createdAt),
  }));

  const notificationActivities: DashboardActivity[] = notifications.map((notification: any) => ({
    id: `notification-${notification.id}`,
    action: notification.title || notification.message || 'Notification received',
    timestamp: getRelativeTime(notification.createdAt),
    icon: Bell,
    color: 'text-primary',
    sortTime: safeTime(notification.createdAt),
  }));

  return [...trainingActivities, ...certificationActivities, ...caseActivities, ...notificationActivities]
    .sort((a, b) => b.sortTime - a.sortTime)
    .slice(0, 6);
}

function safeTime(value: any) {
  const date = parseDate(value);
  const time = date.getTime();
  return Number.isNaN(time) ? 0 : time;
}

