import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SidebarLayout from "@/components/SidebarLayout";
import { BookOpen, Plus, Users, TrendingUp, Eye } from "lucide-react";
import { toast } from "sonner";
import { trainingAPI } from "@/lib/apiService";
import { useAuth } from "@/lib/AuthContext";

interface Training {
  id: number;
  title: string;
  category: string;
  duration: string;
  lessons: number;
  description: string;
  enrolledCount: number;
  completedCount: number;
  status: string;
}

export default function VeterinarianTrainings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadTrainings();
    }
  }, [user?.id]);

  const loadTrainings = async () => {
    setIsLoading(true);
    try {
      // Only load trainings if user is a veterinarian with an ID
      if (!user?.id) {
        toast.error("User not authenticated");
        return;
      }

      const data = await trainingAPI.getTrainingsByInstructor(Number(user?.id));
      
      // Fetch enrollments for each training
      const trainingsWithEnrollments = await Promise.all(
        data.map(async (training: any) => {
          try {
            const enrollments = await trainingAPI.getTrainingEnrollments(training.id);
            const completedCount = enrollments.filter((e: any) => e.status === "COMPLETED").length;
            return {
              id: training.id,
              title: training.title,
              category: training.category,
              duration: training.duration,
              lessons: training.lessons || 0,
              description: training.description,
              enrolledCount: enrollments.length,
              completedCount,
              status: training.status,
            };
          } catch (err) {
            console.error(`Error loading enrollments for training ${training.id}:`, err);
            return {
              id: training.id,
              title: training.title,
              category: training.category,
              duration: training.duration,
              lessons: training.lessons || 0,
              description: training.description,
              enrolledCount: 0,
              completedCount: 0,
              status: training.status,
            };
          }
        })
      );

      setTrainings(trainingsWithEnrollments);
    } catch (err) {
      console.error("Failed to load trainings:", err);
      // Show more helpful error message
      if (err instanceof Error && err.message.includes("403")) {
        toast.error("You don't have permission to view these trainings. Make sure you're logged in as a veterinarian.");
      } else {
        toast.error("Failed to load trainings");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SidebarLayout>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">My Training Courses</h1>
            <p className="text-muted-foreground mt-1">
              Manage your training courses and view student enrollments
            </p>
          </div>
          <button
            onClick={() => navigate("/veterinarian/training/upload")}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all font-medium"
          >
            <Plus className="h-5 w-5" />
            Create New Course
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Courses</p>
                <p className="text-3xl font-bold text-foreground">{trainings.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Enrollments</p>
                <p className="text-3xl font-bold text-foreground">
                  {trainings.reduce((sum, t) => sum + t.enrolledCount, 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Completions</p>
                <p className="text-3xl font-bold text-foreground">
                  {trainings.reduce((sum, t) => sum + t.completedCount, 0)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500 opacity-50" />
            </div>
          </div>
        </div>

        {/* Trainings List */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-muted-foreground">Loading trainings...</div>
          ) : trainings.length === 0 ? (
            <div className="p-12 text-center">
              <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">No training courses yet</p>
              <button
                onClick={() => navigate("/veterinarian/training/upload")}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all font-medium"
              >
                Create Your First Course
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {trainings.map((training) => (
                <div
                  key={training.id}
                  className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/veterinarian/training/${training.id}/enrollments`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-1">
                        {training.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {training.description}
                      </p>
                      <div className="flex flex-wrap gap-4">
                        <span className="text-sm text-foreground">
                          <span className="font-semibold">{training.lessons}</span> lessons
                        </span>
                        <span className="text-sm text-foreground">
                          Duration: <span className="font-semibold">{training.duration}</span>
                        </span>
                        <span className="text-sm text-foreground">
                          Category: <span className="font-semibold">{training.category}</span>
                        </span>
                        <span
                          className={`text-sm px-2 py-1 rounded ${
                            training.status === "PUBLISHED"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {training.status}
                        </span>
                      </div>
                    </div>

                    <div className="ml-6 text-right">
                      <div className="mb-4">
                        <p className="text-2xl font-bold text-blue-600">
                          {training.enrolledCount}
                        </p>
                        <p className="text-xs text-muted-foreground">Enrolled</p>
                      </div>
                      <div className="mb-4">
                        <p className="text-2xl font-bold text-green-600">
                          {training.completedCount}
                        </p>
                        <p className="text-xs text-muted-foreground">Completed</p>
                      </div>
                      <button
                        className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/veterinarian/training/${training.id}/enrollments`);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                        View Enrollments
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}
