import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SidebarLayout from "@/components/SidebarLayout";
import { useAuth } from "@/lib/AuthContext";
import { trainingAPI } from "@/lib/apiService";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Upload,
  CheckCircle,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

interface Training {
  id: number;
  title: string;
  category: string;
  instructor: string;
  duration: string;
  lessons: number;
  uploadedBy: string;
  uploadedDate: string;
  enrolledCAHWs: number;
  status: "active" | "archived";
}

export default function AdminTrainingManagement() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [trainings, setTrainings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadTrainings();
  }, []);

  const loadTrainings = async () => {
    setIsLoading(true);
    try {
      const trainingData = await trainingAPI.getPublishedTrainings();
      setTrainings(trainingData);
    } catch (err: any) {
      console.error('Error loading trainings:', err);
      toast.error('Failed to load trainings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTraining = (id: number) => {
    if (confirm("Are you sure you want to delete this training?")) {
      setTrainings(trainings.filter((t) => t.id !== id));
      toast.success("Training deleted successfully");
    }
  };

  const handleArchiveTraining = (id: number) => {
    setTrainings(
      trainings.map((t) =>
        t.id === id
          ? { ...t, status: t.status === "active" ? "archived" : "active" }
          : t,
      ),
    );
    toast.success("Training status updated");
  };

  const handleViewDetails = (id: number) => {
    toast.info("Opening training details...");
    navigate(`/admin/training/${id}`);
  };

  return (
    <SidebarLayout>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">
              Training Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage all training courses available to CAHWs
            </p>
          </div>
          <button
            onClick={() => {
              toast.success("Opening upload form...");
              navigate("/admin/training/new");
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all font-medium"
          >
            <Plus className="h-5 w-5" />
            Add Training
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-muted-foreground mb-1">
              Total Trainings
            </p>
            <p className="text-3xl font-bold text-foreground">
              {trainings.length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-muted-foreground mb-1">Active Courses</p>
            <p className="text-3xl font-bold text-green-600">
              {trainings.filter((t) => t.status === "active").length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-muted-foreground mb-1">
              Total Enrollments
            </p>
            <p className="text-3xl font-bold text-blue-600">
              {trainings.reduce((sum, t) => sum + t.enrolledCAHWs, 0)}
            </p>
          </div>
        </div>

        {/* Trainings Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Course Title
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Instructor
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Enrollments
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {trainings.map((training) => (
                <tr
                  key={training.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-foreground">
                        {training.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {training.duration} • {training.lessons} lessons
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    {training.category}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    {training.instructor}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    {training.enrolledCAHWs}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${training.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                        }`}
                    >
                      {training.status === "active" ? "Active" : "Archived"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewDetails(training.id)}
                        className="p-2 hover:bg-gray-200 rounded transition-all"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => {
                          toast.info("Redirecting to edit form...");
                          navigate(
                            `/veterinarian/training/${training.id}/edit`,
                          );
                        }}
                        className="p-2 hover:bg-gray-200 rounded transition-all"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4 text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleArchiveTraining(training.id)}
                        className="p-2 hover:bg-gray-200 rounded transition-all"
                        title={
                          training.status === "active" ? "Archive" : "Restore"
                        }
                      >
                        <CheckCircle
                          className={`h-4 w-4 ${training.status === "active"
                            ? "text-green-600"
                            : "text-gray-400"
                            }`}
                        />
                      </button>
                      <button
                        onClick={() => handleDeleteTraining(training.id)}
                        className="p-2 hover:bg-red-100 rounded transition-all"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {trainings.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No trainings yet
            </h3>
            <p className="text-muted-foreground mb-4">
              Start by uploading your first training course
            </p>
            <button
              onClick={() => navigate("/admin/training/new")}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all inline-flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Upload Training
            </button>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
