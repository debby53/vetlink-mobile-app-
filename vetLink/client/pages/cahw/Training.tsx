import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SidebarLayout from "@/components/SidebarLayout";
import { BookOpen, CheckCircle, Lock, Play, ArrowRight, Award, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/AuthContext";
import { userTrainingAPI } from "@/lib/apiService";

export default function Training() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [expandedModule, setExpandedModule] = useState<number | null>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadUserTrainings();
    }
  }, [user?.id]);

  // Refresh training data when the page becomes visible (user returns from learn page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user?.id) {
        loadUserTrainings();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [user?.id]);

  const loadUserTrainings = async () => {
    setIsLoading(true);
    try {
      const trainings = await userTrainingAPI.getUserTrainings(user?.id || 0);
      const formattedModules = trainings.map((t: any) => ({
        id: t.id,
        title: t.trainingTitle,
        category: t.trainingCategory,
        progress: t.status === 'COMPLETED' ? 100 : t.progressPercentage || 0,
        completed: t.status === 'COMPLETED',
        duration: t.trainingDuration || '0 hours',
        lessons: t.totalLessons ?? t.trainingLessons ?? 0,
        completedLessons: t.completedLessons ?? 0,
        instructor: t.instructorName,
        trainingId: t.trainingId,
        enrollmentId: t.id,
      }));
      setModules(formattedModules);
    } catch (err) {
      console.error('Failed to load trainings:', err);
      toast.error('Failed to load trainings');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SidebarLayout>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-foreground">
            Training Modules
          </h1>
          <p className="text-muted-foreground mt-1">
            Continue your learning and professional development
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading trainings...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && modules.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No trainings yet</h3>
            <p className="text-muted-foreground mb-4">Enroll in trainings to start learning</p>
            <button onClick={() => navigate('/cahw/available-trainings')} className="px-4 py-2 bg-primary text-white rounded-lg">Enroll Now</button>
          </div>
        )}

        {/* Modules List */}
        <div className="space-y-4">
          {modules.map((module) => (
            <div
              key={module.id}
              className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all"
            >
              <div
                onClick={() =>
                  setExpandedModule(
                    expandedModule === module.id ? null : module.id,
                  )
                }
                className="p-6 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-foreground text-lg">
                        {module.title}
                      </h3>
                      {module.completed && (
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      )}
                      {module.locked && (
                        <Lock className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{module.category}</span>
                      <span>•</span>
                      <span>{module.duration}</span>
                      <span>•</span>
                      <span>by {module.instructor}</span>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-primary">
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
                  <ArrowRight
                    className={`h-4 w-4 transition-transform ${expandedModule === module.id ? "rotate-90" : ""}`}
                  />
                </div>
              </div>

              {/* Expanded Details */}
              {expandedModule === module.id && (
                <div className="border-t border-gray-100 p-6 bg-gray-50 space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <p className="text-xs text-muted-foreground mb-1">
                        Duration
                      </p>
                      <p className="font-semibold text-foreground">
                        {module.duration}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <p className="text-xs text-muted-foreground mb-1">
                        Lessons
                      </p>
                      <p className="font-semibold text-foreground">
                        {module.completedLessons}/{module.lessons}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <p className="text-xs text-muted-foreground mb-1">
                        Instructor
                      </p>
                      <p className="font-semibold text-foreground">
                        {module.instructor}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-foreground mb-3">
                      Lessons
                    </h4>
                    <div className="space-y-2">
                      {Array.from({ length: Math.min(5, Math.max(module.lessons, 0)) }).map(
                        (_, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-3 p-2 bg-white rounded-lg border border-gray-200"
                          >
                            <CheckCircle
                              className={`h-4 w-4 ${i < module.completedLessons ? "text-green-500" : "text-gray-300"}`}
                            />
                            <span className="text-sm text-foreground">
                              Lesson {i + 1}: Course Overview
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      disabled={module.locked}
                      onClick={() => {
                        if (!module.locked && module.trainingId && module.enrollmentId) {
                          if (module.completed) {
                            navigate(`/cahw/review-course/${module.enrollmentId}`, {
                              state: { module },
                            });
                          } else {
                            navigate(`/cahw/learn/${module.trainingId}/${module.enrollmentId}`, {
                              state: { module },
                            });
                          }
                          toast.success(
                            `${module.completed ? "Reviewing" : "Continuing"} ${module.title}...`,
                          );
                        }
                      }}
                      className={`py-3 rounded-lg font-semibold transition-all text-sm flex items-center justify-center gap-2 ${
                        module.locked
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : module.completed
                            ? "bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200"
                            : "bg-primary text-white hover:bg-primary/90"
                      }`}
                    >
                      <Play className="h-4 w-4" />
                      {module.completed ? "Review" : "Continue"}
                    </button>

                    {module.completed && (
                      <button
                        onClick={() => {
                          navigate(`/cahw/certificate/${module.enrollmentId}`, {
                            state: { module },
                          });
                          toast.success("Opening your certificate...");
                        }}
                        className="py-3 rounded-lg font-semibold transition-all text-sm flex items-center justify-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 hover:from-amber-100 hover:to-orange-100 border border-amber-200"
                      >
                        <Award className="h-4 w-4" />
                        Certificate
                      </button>
                    )}

                    {module.completed && (
                      <button
                        onClick={() => {
                          // Reset the enrollment status to allow resume
                          userTrainingAPI.resetEnrollment(module.enrollmentId).then(() => {
                            loadUserTrainings();
                            toast.success("Course reset! You can now resume from the beginning.");
                          }).catch((err) => {
                            console.error("Failed to reset enrollment:", err);
                            toast.error("Failed to reset course");
                          });
                        }}
                        className="py-3 rounded-lg font-semibold transition-all text-sm flex items-center justify-center gap-2 bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 col-span-2"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Resume Course
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </SidebarLayout>
  );
}
