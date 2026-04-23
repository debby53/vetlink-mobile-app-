import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SidebarLayout from "@/components/SidebarLayout";
import { useAuth } from "@/lib/AuthContext";
import { trainingAPI, userTrainingAPI } from "@/lib/apiService";
import {
  BookOpen,
  CheckCircle,
  Lock,
  Play,
  Star,
  Users,
  Clock,
  Search,
  Filter,
} from "lucide-react";
import { toast } from "sonner";

interface Training {
  id: number;
  title: string;
  category: string;
  progress: number;
  completed: boolean;
  duration: string;
  lessons: number;
  completedLessons: number;
  instructor: string;
  description: string;
  enrolledCAHWs: number;
  rating: number;
  isEnrolled: boolean;
}

export default function AvailableTrainings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [trainings, setTrainings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [enrolledTrainingIds, setEnrolledTrainingIds] = useState<Set<number>>(new Set());
  const [enrollmentMap, setEnrollmentMap] = useState<Record<number, number>>({});

  useEffect(() => {
    if (user?.id) {
      loadTrainings();
      loadUserEnrollments();
    }
  }, [user?.id]);

  const loadUserEnrollments = async () => {
    try {
      if (!user?.id) return;
      const enrolledTrainings = await userTrainingAPI.getUserTrainings(user.id);
      const ids = new Set<number>();
      const map: Record<number, number> = {};
      enrolledTrainings.forEach((t: any) => {
        const trainingId = t.trainingId || t.training?.id || t.id;
        const enrollmentId = t.id;
        if (trainingId) {
          ids.add(trainingId);
          if (enrollmentId) map[trainingId] = enrollmentId;
        }
      });
      setEnrolledTrainingIds(ids);
      setEnrollmentMap(map);
    } catch (err: any) {
      console.error('Error loading user enrollments:', err);
    }
  };

  const loadTrainings = async () => {
    setIsLoading(true);
    try {
      const trainingData = await trainingAPI.getPublishedTrainings();
      setTrainings(trainingData.map((t: any) => ({
        id: t.id,
        title: t.title,
        category: t.category || 'General',
        progress: t.progress || 0,
        completed: t.progress === 100,
        duration: t.duration || '0 hours',
        lessons: t.lessons || t.totalLessons || 0,
        completedLessons: Math.floor((t.progress || 0) / 100 * (t.lessons || t.totalLessons || 0)),
        instructor: t.instructorName || t.instructor || 'VetLink',
        description: t.description || '',
        enrolledCAHWs: Math.floor(Math.random() * 50) + 10,
        rating: 4.5 + Math.random() * 0.5,
        isEnrolled: false, // Will be set by loadUserEnrollments
      })));
    } catch (err: any) {
      console.error('Error loading trainings:', err);
      toast.error('Failed to load trainings');
    } finally {
      setIsLoading(false);
    }
  };

  const categories = ["all", ...new Set(trainings.map((t) => t.category))];

  const handleEnroll = async (trainingId: number) => {
    if (!user?.id) {
      toast.error('You must be logged in to enroll');
      return;
    }

    try {
      // CAHW users enroll directly without payment
      const enrollment = await userTrainingAPI.enrollInTraining(user.id, trainingId);
      toast.success('Enrolled successfully!');
      
      // Update enrolled training IDs
      setEnrolledTrainingIds(prev => {
        const s = new Set(prev);
        s.add(trainingId);
        return s;
      });
      // store enrollment id mapping
      if (enrollment && enrollment.id) {
        setEnrollmentMap(prev => ({ ...prev, [trainingId]: enrollment.id }));
      }
      
      // Update trainings list to reflect new enrollment
      setTrainings(prev => prev.map(t => 
        t.id === trainingId ? { ...t, isEnrolled: true } : t
      ));
    } catch (err: any) {
      console.error('Error enrolling:', err);
      toast.error('Failed to enroll in training');
    }
  };

  const filteredTrainings = trainings.filter((training) => {
    const matchesSearch =
      training.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      training.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || training.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <SidebarLayout>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-foreground flex items-center gap-3 mb-2">
            <BookOpen className="h-8 w-8 text-primary" />
            Available Trainings
          </h1>
          <p className="text-muted-foreground">
            Explore and enroll in training courses created by veterinarians and
            admin
          </p>
        </div>

        {/* Search and Filter */}
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search trainings by title or topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  selectedCategory === cat
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-foreground hover:bg-gray-200"
                }`}
              >
                {cat === "all" ? "All Categories" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="text-sm text-muted-foreground">
          Showing {filteredTrainings.length} of {trainings.length} trainings
        </div>

        {/* Trainings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">Loading trainings...</div>
          ) : filteredTrainings.length === 0 ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">No trainings found</div>
          ) : (
            filteredTrainings.map((training) => {
              const isEnrolled = enrolledTrainingIds.has(training.id);
              return (
            <div
              key={training.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
            >
              {/* Card Header */}
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 border-b border-gray-200">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-foreground text-lg flex-1">
                    {training.title}
                  </h3>
                  {training.completed && (
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {training.category}
                </p>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-4">
                {/* Description */}
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {training.description}
                </p>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{training.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    <span>{training.lessons} lessons</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{training.enrolledCAHWs} enrolled</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-foreground font-medium">
                      {training.rating}
                    </span>
                  </div>
                </div>

                {/* Instructor */}
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Instructor:</span>{" "}
                  {training.instructor}
                </div>

                {/* Progress Bar (if enrolled) */}
                {isEnrolled && training.progress > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        Your Progress
                      </span>
                      <span className="font-semibold text-foreground">
                        {training.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full transition-all"
                        style={{ width: `${training.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                {isEnrolled ? (
                  <button
                    onClick={() => {
                      const enrollmentId = enrollmentMap[training.id] || training.id;
                      navigate(`/cahw/learn/${training.id}/${enrollmentId}`, {
                        state: { training },
                      });
                      toast.success(
                        `${training.completed ? "Reviewing" : "Starting"} ${training.title}...`,
                      );
                    }}
                    className="w-full py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                  >
                    <Play className="h-4 w-4" />
                    {training.completed ? "Review" : "Start Learning"}
                  </button>
                ) : (
                  <button
                    onClick={() => handleEnroll(training.id)}
                    className="w-full py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all"
                  >
                    Enroll Now
                  </button>
                )}
              </div>
            </div>
              );
            })
          )}
        </div>

        {filteredTrainings.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No trainings found
            </h3>
            <p className="text-muted-foreground">
              {searchQuery
                ? "No trainings match your search."
                : "No trainings available for this category."}
            </p>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
