import { useState } from 'react';
import SidebarLayout from '@/components/SidebarLayout';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  Lock,
  Clock,
  BookOpen,
  CheckCircle,
  TrendingUp,
  Zap,
} from 'lucide-react';

export default function ContinueLearning() {
  const navigate = useNavigate();
  const [currentLesson, setCurrentLesson] = useState(1);

  const courseData = {
    id: 2,
    title: 'Basic Animal Health Care',
    category: 'Health Care',
    progress: 75,
    completed: false,
    duration: '10 hours',
    lessons: 20,
    completedLessons: 15,
    nextLesson: 16,
  };

  const lessons = [
    { id: 1, title: 'Introduction to Health Care', duration: '45 min', completed: true, locked: false },
    { id: 2, title: 'Vital Signs and Monitoring', duration: '50 min', completed: true, locked: false },
    { id: 3, title: 'Common Injuries and Treatment', duration: '1h 10min', completed: true, locked: false },
    { id: 4, title: 'Nutrition and Feeding', duration: '55 min', completed: true, locked: false },
    { id: 5, title: 'Wound Care and Prevention', duration: '1h 5min', completed: true, locked: false },
    { id: 6, title: 'Reproductive Health Care', duration: '1h 15min', completed: true, locked: false },
    { id: 7, title: 'Stress Management in Animals', duration: '45 min', completed: true, locked: false },
    { id: 8, title: 'Hygiene and Sanitation', duration: '50 min', completed: true, locked: false },
    { id: 9, title: 'Pain Management Basics', duration: '1h 20min', completed: true, locked: false },
    { id: 10, title: 'Emergency Response', duration: '55 min', completed: true, locked: false },
    { id: 11, title: 'Health Records Management', duration: '40 min', completed: true, locked: false },
    { id: 12, title: 'Communication with Veterinarians', duration: '35 min', completed: true, locked: false },
    { id: 13, title: 'Preventative Care Strategies', duration: '1h 10min', completed: true, locked: false },
    { id: 14, title: 'Disease Prevention in Groups', duration: '1h', completed: true, locked: false },
    { id: 15, title: 'Seasonal Health Considerations', duration: '45 min', completed: true, locked: false },
    { id: 16, title: 'Advanced Assessment Techniques', duration: '1h 25min', completed: false, locked: false },
    { id: 17, title: 'Case Study Analysis 1', duration: '50 min', completed: false, locked: false },
    { id: 18, title: 'Case Study Analysis 2', duration: '50 min', completed: false, locked: false },
    { id: 19, title: 'Practical Exam Preparation', duration: '1h 30min', completed: false, locked: false },
    { id: 20, title: 'Final Assessment', duration: '1h', completed: false, locked: true },
  ];

  const currentLessonData = lessons.find(l => l.id === currentLesson);

  return (
    <SidebarLayout>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
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
                {courseData.completedLessons} of {courseData.lessons} lessons completed
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Progress</p>
            <p className="text-3xl font-bold text-green-600">{courseData.progress}%</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-foreground">Course Progress</span>
            <span className="text-sm font-medium text-muted-foreground">{courseData.completedLessons}/{courseData.lessons}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-green-600 h-full rounded-full transition-all"
              style={{ width: `${courseData.progress}%` }}
            />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <div className="bg-black rounded-lg overflow-hidden mb-6">
              <div className="aspect-video bg-gray-900 flex items-center justify-center">
                <Play className="h-16 w-16 text-white opacity-50" />
              </div>
            </div>

            {currentLessonData && (
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {currentLessonData.title}
                </h2>
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">{currentLessonData.duration}</span>
                  </div>
                  {currentLessonData.completed && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Completed
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground mb-6">
                  This lesson covers essential techniques and knowledge you'll need for your certification exam. Pay special attention to the key concepts highlighted in the video.
                </p>
                <div className="flex gap-3">
                  <button className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-foreground hover:bg-gray-50 transition-all">
                    Previous
                  </button>
                  <button className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all">
                    {currentLessonData.completed ? 'Next Lesson' : 'Mark as Complete & Continue'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Lessons Sidebar */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden h-fit">
            <div className="p-6 border-b border-gray-200">
              <h3 className="font-bold text-foreground">Course Lessons</h3>
            </div>
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {lessons.map((lesson) => (
                <button
                  key={lesson.id}
                  onClick={() => !lesson.locked && setCurrentLesson(lesson.id)}
                  className={`w-full p-4 text-left hover:bg-green-50 transition-colors ${
                    currentLesson === lesson.id ? 'bg-green-50 border-l-4 border-green-600' : ''
                  } ${lesson.locked ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {lesson.locked ? (
                        <Lock className="h-5 w-5 text-gray-400" />
                      ) : lesson.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{lesson.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{lesson.duration}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-green-900">Time Spent</p>
                <p className="text-2xl font-bold text-green-600 mt-1">7.5 hours</p>
              </div>
              <Clock className="h-8 w-8 text-green-600 opacity-50" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">Estimated Completion</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">2 weeks</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600 opacity-50" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-purple-900">Performance</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">Excellent</p>
              </div>
              <Zap className="h-8 w-8 text-purple-600 opacity-50" />
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
