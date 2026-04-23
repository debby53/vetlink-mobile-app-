import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SidebarLayout from "@/components/SidebarLayout";
import { trainingAPI } from "@/lib/apiService";
import { ChevronLeft, Users, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";

interface Enrollment {
  id: number;
  userName: string;
  userEmail: string;
  trainingTitle: string;
  status: string;
  progressPercentage: number;
  score?: number;
  enrolledAt: string;
  completedAt?: string;
}

export default function TrainingEnrollments() {
  const { trainingId } = useParams();
  const navigate = useNavigate();
  const [training, setTraining] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (trainingId) {
      loadData();
    }
  }, [trainingId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [trainingData, enrollmentData] = await Promise.all([
        trainingAPI.getTrainingById(Number(trainingId)),
        trainingAPI.getTrainingEnrollments(Number(trainingId)),
      ]);

      setTraining(trainingData);
      setEnrollments(enrollmentData);
    } catch (err) {
      console.error("Failed to load data:", err);
      toast.error("Failed to load training enrollments");
    } finally {
      setIsLoading(false);
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

  return (
    <SidebarLayout>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/veterinarian/trainings")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-4xl font-bold text-foreground">
              {training?.title || "Training Enrollments"}
            </h1>
            <p className="text-muted-foreground mt-1">
              View all students enrolled in this course
            </p>
          </div>
        </div>

        {/* Stats */}
        {training && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-muted-foreground mb-1">Total Enrollments</p>
              <p className="text-3xl font-bold text-blue-600">{enrollments.length}</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-muted-foreground mb-1">Completed</p>
              <p className="text-3xl font-bold text-green-600">
                {enrollments.filter((e) => e.status === "COMPLETED").length}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-muted-foreground mb-1">In Progress</p>
              <p className="text-3xl font-bold text-blue-600">
                {enrollments.filter((e) => e.status === "IN_PROGRESS").length}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-muted-foreground mb-1">Not Started</p>
              <p className="text-3xl font-bold text-gray-600">
                {enrollments.filter((e) => e.status === "NOT_STARTED").length}
              </p>
            </div>
          </div>
        )}

        {/* Enrollments Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-muted-foreground">Loading enrollments...</div>
          ) : enrollments.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-muted-foreground">No enrollments yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Student Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Progress
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Enrolled Date
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Completed Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {enrollments.map((enrollment) => (
                    <tr key={enrollment.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-foreground font-medium">
                        {enrollment.userName}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {enrollment.userEmail}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            enrollment.status
                          )}`}
                        >
                          {enrollment.status === "COMPLETED" && (
                            <CheckCircle className="h-4 w-4" />
                          )}
                          {enrollment.status === "IN_PROGRESS" && (
                            <Clock className="h-4 w-4" />
                          )}
                          {enrollment.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${enrollment.progressPercentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-foreground">
                            {enrollment.progressPercentage}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {enrollment.score ? `${enrollment.score}/100` : "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {new Date(enrollment.enrolledAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {enrollment.completedAt
                          ? new Date(enrollment.completedAt).toLocaleDateString()
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}
