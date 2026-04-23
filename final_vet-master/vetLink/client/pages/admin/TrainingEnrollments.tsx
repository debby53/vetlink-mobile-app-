import { useState, useEffect } from "react";
import SidebarLayout from "@/components/SidebarLayout";
import { trainingAPI } from "@/lib/apiService";
import { BookOpen, Users, TrendingUp, Eye } from "lucide-react";
import { toast } from "sonner";

interface Training {
  id: number;
  title: string;
  category: string;
  instructorName: string;
  duration: string;
  lessons: number;
  enrolledCount: number;
  completedCount: number;
  status: string;
}

export default function AdminTrainingEnrollments() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [selectedTraining, setSelectedTraining] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    loadTrainings();
  }, []);

  const loadTrainings = async () => {
    setIsLoading(true);
    try {
      const data = await trainingAPI.getPublishedTrainings();
      
      // Fetch enrollments for each training
      const trainingsWithEnrollments = await Promise.all(
        data.map(async (training: any) => {
          const enrollmentData = await trainingAPI.getTrainingEnrollments(training.id);
          const completedCount = enrollmentData.filter(
            (e: any) => e.status === "COMPLETED"
          ).length;
          return {
            id: training.id,
            title: training.title,
            category: training.category,
            instructorName: training.instructorName,
            duration: training.duration,
            lessons: training.lessons || 0,
            enrolledCount: enrollmentData.length,
            completedCount,
            status: training.status,
          };
        })
      );

      setTrainings(trainingsWithEnrollments);
    } catch (err) {
      console.error("Failed to load trainings:", err);
      toast.error("Failed to load trainings");
    } finally {
      setIsLoading(false);
    }
  };

  const viewEnrollments = async (training: any) => {
    try {
      const data = await trainingAPI.getTrainingEnrollments(training.id);
      setSelectedTraining(training);
      setEnrollments(data);
    } catch (err) {
      console.error("Failed to load enrollments:", err);
      toast.error("Failed to load enrollments");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-700";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-700";
      case "NOT_STARTED":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const filteredEnrollments =
    filterStatus === "all"
      ? enrollments
      : enrollments.filter((e) => e.status === filterStatus);

  return (
    <SidebarLayout>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-foreground">Training Enrollments</h1>
          <p className="text-muted-foreground mt-1">
            Monitor all training courses and student enrollments across the platform
          </p>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trainings List */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 overflow-hidden">
            {isLoading ? (
              <div className="p-12 text-center text-muted-foreground">Loading trainings...</div>
            ) : trainings.length === 0 ? (
              <div className="p-12 text-center">
                <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-muted-foreground">No training courses yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {trainings.map((training) => (
                  <div
                    key={training.id}
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                      selectedTraining?.id === training.id ? "bg-blue-50" : ""
                    }`}
                    onClick={() => viewEnrollments(training)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-foreground mb-1">
                          {training.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mb-2">
                          Instructor: {training.instructorName}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {training.category}
                          </span>
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {training.lessons} lessons
                          </span>
                        </div>
                      </div>

                      <div className="ml-4 text-right">
                        <div className="mb-2">
                          <p className="text-lg font-bold text-blue-600">
                            {training.enrolledCount}
                          </p>
                          <p className="text-xs text-muted-foreground">Enrolled</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-green-600">
                            {training.completedCount}
                          </p>
                          <p className="text-xs text-muted-foreground">Completed</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Enrollments Detail */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {selectedTraining ? (
              <div className="h-full flex flex-col">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-foreground line-clamp-2">
                    {selectedTraining.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {filteredEnrollments.length} enrollments
                  </p>

                  {/* Status Filter */}
                  <div className="mt-3 space-y-1">
                    <label className="text-xs font-medium text-muted-foreground block">
                      Filter by Status
                    </label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full px-2 py-1 border border-gray-200 rounded text-sm"
                    >
                      <option value="all">All</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="NOT_STARTED">Not Started</option>
                    </select>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {filteredEnrollments.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground">
                      No enrollments found
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {filteredEnrollments.map((enrollment) => (
                        <div key={enrollment.id} className="p-3 hover:bg-gray-50">
                          <p className="text-xs font-medium text-foreground truncate">
                            {enrollment.userName}
                          </p>
                          <p className="text-xs text-muted-foreground truncate mb-2">
                            {enrollment.userEmail}
                          </p>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                              <div
                                className="bg-blue-600 h-1.5 rounded-full"
                                style={{ width: `${enrollment.progressPercentage}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium">
                              {enrollment.progressPercentage}%
                            </span>
                          </div>
                          <span
                            className={`inline-block text-xs px-2 py-1 rounded ${getStatusColor(
                              enrollment.status
                            )}`}
                          >
                            {enrollment.status.replace(/_/g, " ")}
                          </span>
                          {enrollment.score && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Score: {enrollment.score}/100
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-muted-foreground flex items-center justify-center h-full">
                <div>
                  <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Select a training to view enrollments</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
