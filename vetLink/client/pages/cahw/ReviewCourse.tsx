import { useState, useEffect } from 'react';
import SidebarLayout from '@/components/SidebarLayout';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Users,
  BookOpen,
  Download,
  Share2,
  Award,
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { trainingAPI, userTrainingAPI } from '@/lib/apiService';
import { toast } from 'sonner';

export default function ReviewCourse() {
  const navigate = useNavigate();
  const { enrollmentId } = useParams();
  const { user } = useAuth();
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [training, setTraining] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (enrollmentId) {
      loadData();
    }
  }, [enrollmentId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load enrollment details
      const enrollmentData = await userTrainingAPI.getEnrollmentById(Number(enrollmentId));
      setEnrollment(enrollmentData);

      // Load training details
      const trainingData = await trainingAPI.getTrainingById(Number(enrollmentData.trainingId));
      setTraining(trainingData);
    } catch (err) {
      console.error('Failed to load review data:', err);
      toast.error('Failed to load course data');
    } finally {
      setIsLoading(false);
    }
  };

  const resources = [
    { name: 'Training Materials', type: 'PDF', size: training?.materials ? '2.4 MB' : '-' },
    { name: 'Video Library', type: 'LINK', size: '-' },
  ];

  const lessons = Array.from({ length: training?.lessons || 6 }, (_, i) => ({
    id: i + 1,
    title: `Lesson ${i + 1}: ${training?.title || 'Course Overview'}`,
    duration: `${(i % 3) + 1}h ${((i * 17) % 60)}min`,
    completed: true,
  }));

  if (isLoading) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading course...</p>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  if (!training || !enrollment) {
    return (
      <SidebarLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Course not found</p>
          <button onClick={() => navigate('/cahw/training')} className="px-4 py-2 bg-primary text-white rounded">Go Back</button>
        </div>
      </SidebarLayout>
    );
  }

  const courseData = {
    id: enrollment.id,
    title: training.title,
    category: training.category,
    progress: enrollment.progressPercentage || 100,
    completed: enrollment.status === 'COMPLETED',
    duration: training.duration,
    lessons: training.lessons || 12,
    completedLessons: training.lessons || 12,
    instructor: training.instructorName,
    description: training.description,
    certificationDate: enrollment.completedAt || new Date().toLocaleDateString(),
    score: `${enrollment.score || 95}/100`,
  };

  return (
    <SidebarLayout>
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <button
              onClick={() => navigate(-1)}
              className="mt-1 p-2 hover:bg-gray-100 rounded-lg transition-all"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <p className="text-sm text-green-600 font-semibold">{courseData.category}</p>
              <h1 className="text-3xl font-bold text-foreground mt-1">{courseData.title}</h1>
              <p className="text-muted-foreground mt-2">
                Completed on {courseData.certificationDate} • Score: {courseData.score}
              </p>
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <Award className="h-8 w-8 text-green-600 mb-2" />
            <p className="text-sm font-semibold text-green-900">Certification</p>
            <p className="text-xs text-green-700">Completed</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="h-4 w-4" />
              <p className="text-xs font-medium">Duration</p>
            </div>
            <p className="text-lg font-bold text-foreground">{courseData.duration}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <BookOpen className="h-4 w-4" />
              <p className="text-xs font-medium">Lessons</p>
            </div>
            <p className="text-lg font-bold text-foreground">{courseData.lessons}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="h-4 w-4" />
              <p className="text-xs font-medium">Instructor</p>
            </div>
            <p className="text-sm font-semibold text-foreground">Dr. J. Kariuki</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <CheckCircle className="h-4 w-4" />
              <p className="text-xs font-medium">Progress</p>
            </div>
            <p className="text-lg font-bold text-green-600">100%</p>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-xl font-bold text-foreground mb-4">Course Overview</h2>
          <p className="text-muted-foreground leading-relaxed">{courseData.description}</p>
        </div>

        {/* Lessons */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-foreground">Course Lessons</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => setSelectedLesson(lesson.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      {lesson.completed ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : (
                        <div className="h-6 w-6 rounded-full border-2 border-gray-300" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{lesson.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{lesson.duration}</p>
                    </div>
                  </div>
                  {lesson.completed && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                      Completed
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resources */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-foreground">Course Resources</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {resources.map((resource, index) => (
              <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Download className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{resource.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {resource.type} {resource.size !== '-' && `• ${resource.size}`}
                      </p>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-all">
                    <Download className="h-5 w-5 text-green-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/cahw/training')}
            className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-foreground hover:bg-gray-50 transition-all"
          >
            Back to Training
          </button>
          <button className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 rounded-lg font-medium text-foreground hover:bg-gray-50 transition-all">
            <Share2 className="h-4 w-4" />
            Share Certificate
          </button>
          <button className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all">
            Download Certificate
          </button>
        </div>
      </div>
    </SidebarLayout>
  );
}
