import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarLayout from '@/components/SidebarLayout';
import { useAuth } from '@/lib/AuthContext';
import { trainingAPI, certificationAPI } from '@/lib/apiService';
import { toast } from 'sonner';
import {
  BookOpen,
  Award,
  Users,
  TrendingUp,
  CheckCircle,
  Clock,
  Star,
  ArrowRight,
  Play,
  Lock,
  Zap,
  Target,
  AlertCircle,
  Lightbulb,
} from 'lucide-react';

export default function CAHWDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [expandedModule, setExpandedModule] = useState<number | null>(null);
  const [trainings, setTrainings] = useState<any[]>([]);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const loadData = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const trainingData = await trainingAPI.getPublishedTrainings();
      setTrainings(trainingData.slice(0, 4));
      const certData = await certificationAPI.getCertificationsByUserId(user.id);
      setCertifications(certData);
    } catch (err: any) {
      console.error('Error loading data:', err);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const stats = [
    {
      label: 'Training Hours',
      value: '48',
      change: '+8 this month',
      icon: BookOpen,
      color: 'text-purple-500',
      bg: 'bg-purple-50',
    },
    {
      label: 'Certifications',
      value: '3',
      change: '1 in progress',
      icon: Award,
      color: 'text-yellow-500',
      bg: 'bg-yellow-50',
    },
    {
      label: 'Community Members',
      value: '156',
      change: '+12 this month',
      icon: Users,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
    },
    {
      label: 'Performance Score',
      value: '92%',
      change: 'Excellent',
      icon: TrendingUp,
      color: 'text-green-500',
      bg: 'bg-green-50',
    },
  ];

  const trainingModules = trainings.map((t: any) => ({
    id: t.id,
    title: t.title,
    category: t.category || 'General',
    progress: t.progress || 0,
    completed: t.progress === 100,
    duration: t.duration || '0 hours',
    lessons: t.totalLessons || 0,
    completedLessons: Math.floor((t.progress || 0) / 100 * (t.totalLessons || 0)),
    locked: false, // Default to unlocked for now
  }));

  const certList = certifications.map((c: any) => ({
    id: c.id,
    name: c.name,
    issuer: c.issuedBy || 'VetLink Academy',
    date: c.issuedDate,
    status: c.status || 'completed',
    expiresIn: '1 year',
    progress: c.progress || 100,
  }));

  const recentActivities = [
    {
      id: 1,
      action: 'Completed lesson: Disease Diagnosis in Cattle',
      timestamp: '2 hours ago',
      icon: CheckCircle,
      color: 'text-green-500',
    },
    {
      id: 2,
      action: 'Helped 5 farmers with livestock assessments',
      timestamp: '1 day ago',
      icon: Users,
      color: 'text-blue-500',
    },
    {
      id: 3,
      action: 'Earned badge: Community Helper',
      timestamp: '3 days ago',
      icon: Star,
      color: 'text-yellow-500',
    },
    {
      id: 4,
      action: 'Started Training: Vaccination Techniques',
      timestamp: '1 week ago',
      icon: BookOpen,
      color: 'text-purple-500',
    },
  ];

  return (
    <SidebarLayout>
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-muted-foreground">
            Continue your learning journey and support your community
          </p>
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
          {/* Training Modules */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-purple-500" />
                Training Modules
              </h2>
            </div>

            <div className="divide-y divide-gray-100">
              {isLoading ? (
                <div className="p-6 text-center text-muted-foreground">Loading training modules...</div>
              ) : trainingModules.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">No training modules available</div>
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
                            <h3 className="font-semibold text-foreground">
                              {module.title}
                            </h3>
                            {module.completed && (
                              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                            )}
                            {module.locked && (
                              <Lock className="h-5 w-5 text-gray-400 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {module.category} • {module.duration}
                          </p>
                        </div>
                        <span className="text-sm font-bold text-primary">
                          {module.progress}%
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all"
                          style={{ width: `${module.progress}%` }}
                        ></div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {module.completedLessons} of {module.lessons} lessons
                        </span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedModule === module.id && (
                      <div className="mt-6 pt-6 border-t border-gray-100">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="bg-purple-50 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground mb-1">
                              Duration
                            </p>
                            <p className="font-semibold text-foreground">
                              {module.duration}
                            </p>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground mb-1">
                              Lessons
                            </p>
                            <p className="font-semibold text-foreground">
                              {module.completedLessons}/{module.lessons}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            if (!module.locked) {
                              toast.info(`${module.completed ? 'Reviewing' : 'Continuing'} ${module.title}`);
                              navigate(module.completed ? `/cahw/training/review/${module.id}` : `/cahw/training/continue/${module.id}`);
                            }
                          }}
                          disabled={module.locked}
                          className={`w-full py-2 rounded-lg font-medium transition-all text-sm flex items-center justify-center gap-2 ${module.locked
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-purple-500 text-white hover:bg-purple-600'
                            }`}
                        >
                          <Play className="h-4 w-4" />
                          {module.completed ? 'Review' : 'Continue Learning'}
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-500" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/cahw/treatments')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-3 font-medium transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <AlertCircle className="h-4 w-4" />
                  Log Treatment
                </button>
                <button
                  onClick={() => navigate('/cahw/advisories')}
                  className="w-full bg-green-500/10 hover:bg-green-500/20 text-green-700 rounded-lg px-4 py-3 font-medium transition-all flex items-center justify-center gap-2 shadow-sm border border-green-200"
                >
                  <Lightbulb className="h-4 w-4" />
                  Advisories
                </button>
                <button
                  onClick={() => navigate('/market')}
                  className="w-full bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-700 rounded-lg px-4 py-3 font-medium transition-all flex items-center justify-center gap-2 shadow-sm border border-yellow-200"
                >
                  <TrendingUp className="h-4 w-4" />
                  Marketplace
                </button>
              </div>
            </div>

            {/* Certifications */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                Certifications
              </h3>
              <div className="space-y-3">
                {certList.map((cert) => (
                  <div
                    key={cert.id}
                    className="p-3 border border-gray-100 rounded-lg hover:border-purple-200 transition-colors"
                  >
                    <p className="text-sm font-medium text-foreground">
                      {cert.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {cert.issuer}
                    </p>
                    {cert.status === 'completed' ? (
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs font-medium text-green-600 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Completed
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {cert.expiresIn}
                        </span>
                      </div>
                    ) : (
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-purple-600">
                            In Progress
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {cert.progress}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-purple-500 h-1.5 rounded-full"
                            style={{ width: `${cert.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Community Impact */}
            <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-white shadow-lg">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Target className="h-5 w-5" />
                Community Impact
              </h3>
              <div className="space-y-3">
                <div className="bg-white/20 rounded-lg p-3 backdrop-blur">
                  <p className="text-sm opacity-90">Farmers Assisted</p>
                  <p className="text-2xl font-bold">156</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 backdrop-blur">
                  <p className="text-sm opacity-90">Animals Treated</p>
                  <p className="text-2xl font-bold">428</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 backdrop-blur">
                  <p className="text-sm opacity-90">Success Rate</p>
                  <p className="text-2xl font-bold">94%</p>
                </div>
              </div>
            </div>

            {/* Performance Alert */}
            <div className="bg-blue-50 rounded-xl p-6 shadow-sm border border-blue-200">
              <div className="flex gap-3">
                <Zap className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900">Great Progress!</h4>
                  <p className="text-sm text-blue-800 mt-1">
                    You're on track to earn your Advanced Vaccination certification by next month.
                  </p>
                  <button
                    onClick={() => {
                      toast.info('Loading your progress details');
                      navigate('/cahw/progress');
                    }}
                    className="mt-3 text-sm font-semibold text-blue-600 hover:text-blue-700"
                  >
                    View Progress →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-foreground">Recent Activity</h2>
          </div>

          <div className="divide-y divide-gray-100">
            {recentActivities.map((activity) => {
              const ActivityIcon = activity.icon;
              return (
                <div key={activity.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gray-100">
                        <ActivityIcon className={`h-5 w-5 ${activity.color}`} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {activity.action}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {activity.timestamp}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
            <button
              onClick={() => {
                toast.info('Loading your activity history');
                navigate('/cahw/progress');
              }}
              className="text-primary font-semibold text-sm hover:underline flex items-center gap-2"
            >
              View All Activity
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
