import { useState, useEffect } from 'react';
import SidebarLayout from '@/components/SidebarLayout';
import { TrendingUp, Award, BarChart3, Calendar } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { userTrainingAPI } from '@/lib/apiService';
import { toast } from 'sonner';

export default function Progress() {
  const { user } = useAuth();
  const [userTrainings, setUserTrainings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadUserProgress();
    }
  }, [user?.id]);

  const loadUserProgress = async () => {
    setIsLoading(true);
    try {
      const trainings = await userTrainingAPI.getUserTrainings(user?.id || 0);
      setUserTrainings(trainings);
    } catch (err) {
      console.error('Failed to load user trainings:', err);
      toast.error('Failed to load progress data');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate stats from real data
  const completedTrainings = userTrainings.filter((t: any) => t.status === 'COMPLETED').length;
  const inProgressTrainings = userTrainings.filter((t: any) => t.status === 'IN_PROGRESS').length;
  const totalHours = userTrainings.reduce((acc: number, t: any) => {
    const hours = parseInt(t.trainingDuration?.split(' ')[0] || '0');
    return acc + hours;
  }, 0);

  const stats = [
    { label: 'Training Hours', value: totalHours.toString(), change: `${completedTrainings} completed`, icon: '📚' },
    { label: 'Completed Trainings', value: completedTrainings.toString(), change: `${inProgressTrainings} in progress`, icon: '✅' },
    { label: 'Certifications', value: completedTrainings.toString(), change: `${inProgressTrainings} in progress`, icon: '🏆' },
    { label: 'Overall Progress', value: totalHours > 0 ? Math.round((completedTrainings / userTrainings.length) * 100) + '%' : '0%', change: 'Keep learning!', icon: '⭐' },
  ];

  const milestones = userTrainings.map((training, idx) => ({
    id: training.id,
    title: training.trainingTitle,
    date: training.completedAt || new Date().toISOString().split('T')[0],
    description: `${training.trainingCategory} - ${training.trainingDuration}`,
    achieved: training.status === 'COMPLETED',
    progress: training.progressPercentage || 0,
  }));

  const skills = [
    { name: 'Disease Recognition', level: 95 },
    { name: 'Animal Care', level: 88 },
    { name: 'Community Engagement', level: 92 },
    { name: 'Vaccination Techniques', level: 65 },
    { name: 'Health Education', level: 85 },
    { name: 'Emergency Response', level: 78 },
  ];

  return (
    <SidebarLayout>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-foreground">My Progress</h1>
          <p className="text-muted-foreground mt-1">Track your learning and development journey</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">{stat.icon}</span>
                <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
              </div>
              <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-green-600 mt-2">{stat.change}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Milestones */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Milestones
            </h2>

            <div className="space-y-4">
              {milestones.map((milestone, index) => (
                <div
                  key={milestone.id}
                  className={`p-4 rounded-lg border ${
                    milestone.achieved
                      ? 'bg-green-50 border-green-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                        milestone.achieved
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-300 text-gray-600'
                      }`}
                    >
                      {milestone.achieved ? '✓' : index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{milestone.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {milestone.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {new Date(milestone.date).toLocaleDateString()}
                        </span>
                      </div>

                      {!milestone.achieved && milestone.progress && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-foreground">
                              Progress
                            </span>
                            <span className="text-xs font-bold text-primary">
                              {milestone.progress}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${milestone.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Skills
            </h2>

            <div className="space-y-5">
              {skills.map((skill, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-foreground text-sm">{skill.name}</p>
                    <span className="text-xs font-bold text-primary">{skill.level}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full transition-all"
                      style={{ width: `${skill.level}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Overall Score */}
        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg shadow-lg p-8 text-white">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-4xl font-bold">8.7</p>
              <p className="text-white/80 mt-2">Overall Score</p>
            </div>
            <div>
              <p className="text-4xl font-bold">85</p>
              <p className="text-white/80 mt-2">Hours Completed</p>
            </div>
            <div>
              <p className="text-4xl font-bold">3</p>
              <p className="text-white/80 mt-2">Certifications</p>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
