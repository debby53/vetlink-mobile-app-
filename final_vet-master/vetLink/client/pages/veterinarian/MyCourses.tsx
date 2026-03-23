import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SidebarLayout from "@/components/SidebarLayout";
import { Edit, Trash2, Plus, Eye, BookOpen, AlertCircle, ChevronDown, ChevronUp, Send, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { trainingAPI, quizAPI } from "@/lib/apiService";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import QuizBuilder from "@/components/QuizBuilder";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Lesson {
  id: number;
  title: string;
  description?: string;
  videoUrl?: string;
  duration?: string;
  durationSeconds?: number;
  sequenceOrder?: number;
}

interface Training {
  id: number;
  title: string;
  description: string;
  category: string;
  duration: string;
  lessons: number;
  status: string;
  instructorId: number;
  createdAt?: string;
}

export default function MyCourses() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courses, setCourses] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Training | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Training>>({});

  // Lesson management states
  const [expandedCourse, setExpandedCourse] = useState<number | null>(null);
  const [lessons, setLessons] = useState<Record<number, Lesson[]>>({});
  const [loadingLessons, setLoadingLessons] = useState<Record<number, boolean>>({});
  const [editingLessonId, setEditingLessonId] = useState<number | null>(null);
  const [editingLesson, setEditingLesson] = useState<Partial<Lesson>>({});
  const [deletingLessonId, setDeletingLessonId] = useState<number | null>(null);
  const [deleteDialogLessonOpen, setDeleteDialogLessonOpen] = useState(false);

  // Quiz management states
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [activeLessonId, setActiveLessonId] = useState<number | null>(null);

  useEffect(() => {
    loadCourses();
  }, [user?.id]);

  const loadCourses = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const result = await trainingAPI.getTrainingsByInstructor(parseInt(user.id) as number);
      setCourses(result || []);
    } catch (err: any) {
      console.error("Failed to load courses:", err);
      toast.error("Failed to load your courses");
    } finally {
      setLoading(false);
    }
  };

  const loadLessons = async (courseId: number) => {
    try {
      setLoadingLessons(prev => ({ ...prev, [courseId]: true }));
      const result = await trainingAPI.getCourseLessons(courseId);
      setLessons(prev => ({ ...prev, [courseId]: result || [] }));
    } catch (err: any) {
      console.error("Failed to load lessons:", err);
      toast.error("Failed to load lessons");
    } finally {
      setLoadingLessons(prev => ({ ...prev, [courseId]: false }));
    }
  };

  const toggleCourseExpand = (courseId: number) => {
    if (expandedCourse === courseId) {
      setExpandedCourse(null);
    } else {
      setExpandedCourse(courseId);
      if (!lessons[courseId]) {
        loadLessons(courseId);
      }
    }
  };

  const handleEdit = (course: Training) => {
    setEditingId(course.id);
    setEditData({
      title: course.title,
      description: course.description,
      category: course.category,
      duration: course.duration,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    try {
      const updatedData = {
        ...courses.find(c => c.id === editingId),
        ...editData,
      };
      await trainingAPI.updateTraining(editingId, updatedData);
      toast.success("Course updated successfully");
      setEditingId(null);
      loadCourses();
    } catch (err: any) {
      console.error("Failed to update course:", err);
      toast.error("Failed to update course");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleDeleteClick = (course: Training) => {
    setCourseToDelete(course);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!courseToDelete) return;
    try {
      await trainingAPI.deleteTraining(courseToDelete.id);
      toast.success("Course deleted successfully");
      setDeleteDialogOpen(false);
      setCourseToDelete(null);
      loadCourses();
    } catch (err: any) {
      console.error("Failed to delete course:", err);
      toast.error("Failed to delete course");
    }
  };

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLessonId(lesson.id);
    setEditingLesson({ ...lesson });
  };

  const handleSaveLesson = async () => {
    if (!editingLessonId) return;
    try {
      await trainingAPI.updateLesson(editingLessonId, editingLesson);
      toast.success("Lesson updated successfully");
      setEditingLessonId(null);
      if (expandedCourse) {
        loadLessons(expandedCourse);
      }
    } catch (err: any) {
      console.error("Failed to update lesson:", err);
      toast.error("Failed to update lesson");
    }
  };

  const handleDeleteLesson = async () => {
    if (!deletingLessonId) return;
    try {
      await trainingAPI.deleteLesson(deletingLessonId);
      toast.success("Lesson deleted successfully");
      setDeleteDialogLessonOpen(false);
      setDeletingLessonId(null);
      if (expandedCourse) {
        loadLessons(expandedCourse);
      }
    } catch (err: any) {
      console.error("Failed to delete lesson:", err);
      toast.error("Failed to delete lesson");
    }
  };

  const handleOpenQuizBuilder = (lessonId: number) => {
    setActiveLessonId(lessonId);
    setShowQuizModal(true);
  };

  const handleCloseQuizBuilder = () => {
    setShowQuizModal(false);
    setActiveLessonId(null);
  };

  const handleQuizSaved = () => {
    toast.success("Quiz saved successfully!");
    handleCloseQuizBuilder();
    if (expandedCourse) {
      loadLessons(expandedCourse);
    }
  };

  const handlePublishCourse = async (course: Training) => {
    try {
      await trainingAPI.updateTraining(course.id, { status: 'PUBLISHED' });
      toast.success("Course published successfully!");
      loadCourses();
    } catch (err: any) {
      console.error("Failed to publish course:", err);
      toast.error(err?.message || "Failed to publish course");
    }
  };

  const categories = [
    "Disease Management",
    "Health Care",
    "Community",
    "Prevention",
    "Vaccination",
    "Nutrition",
    "Animal Behavior",
    "Emergency Response",
  ];

  return (
    <SidebarLayout>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">My Courses</h1>
            <p className="text-muted-foreground mt-1">Manage your training courses</p>
          </div>
          <Button
            onClick={() => navigate("/veterinarian/training/upload")}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Create New Course
          </Button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin">
              <BookOpen className="w-8 h-8" />
            </div>
            <p className="mt-4 text-muted-foreground">Loading courses...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && courses.length === 0 && (
          <div className="text-center py-12 border border-dashed rounded-lg">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first course to get started
            </p>
            <Button onClick={() => navigate("/veterinarian/training/upload")}>
              Create Course
            </Button>
          </div>
        )}

        {/* Courses Grid */}
        {!loading && courses.length > 0 && (
          <div className="space-y-4">
            {courses.map((course) => (
              <div key={course.id} className="border rounded-lg overflow-hidden">
                {editingId === course.id ? (
                  // Edit Course Mode
                  <div className="p-6 space-y-4 bg-gray-50">
                    <div>
                      <label className="text-sm font-medium">Title</label>
                      <input
                        type="text"
                        value={editData.title || ""}
                        onChange={(e) =>
                          setEditData({ ...editData, title: e.target.value })
                        }
                        className="w-full px-3 py-2 border rounded-md text-sm mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <textarea
                        value={editData.description || ""}
                        onChange={(e) =>
                          setEditData({ ...editData, description: e.target.value })
                        }
                        rows={3}
                        className="w-full px-3 py-2 border rounded-md text-sm mt-1"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Category</label>
                        <select
                          value={editData.category || ""}
                          onChange={(e) =>
                            setEditData({ ...editData, category: e.target.value })
                          }
                          className="w-full px-3 py-2 border rounded-md text-sm mt-1"
                        >
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Duration</label>
                        <input
                          type="text"
                          value={editData.duration || ""}
                          onChange={(e) =>
                            setEditData({ ...editData, duration: e.target.value })
                          }
                          placeholder="e.g., 2 hours"
                          className="w-full px-3 py-2 border rounded-md text-sm mt-1"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        onClick={handleSaveEdit}
                        className="flex-1"
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEdit}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Course Card
                  <>
                    <div
                      className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => toggleCourseExpand(course.id)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">
                              {course.title}
                            </h3>
                            <span
                              className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${course.status === "PUBLISHED"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                                }`}
                            >
                              {course.status}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {course.description}
                          </p>
                          <div className="flex flex-wrap gap-2 text-xs">
                            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">
                              {course.category}
                            </span>
                            <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded">
                              {course.duration}
                            </span>
                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">
                              {course.lessons || 0} lessons
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/veterinarian/training/${course.id}`);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(course);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {course.status === "DRAFT" && (
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePublishCourse(course);
                              }}
                            >
                              <Send className="w-4 h-4 mr-1" />
                              Publish
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(course);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          {expandedCourse === course.id ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Lessons Expansion */}
                    {expandedCourse === course.id && (
                      <div className="border-t bg-gray-50 p-4">
                        {loadingLessons[course.id] ? (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            Loading lessons...
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {lessons[course.id]?.length === 0 ? (
                              <p className="text-sm text-muted-foreground text-center py-4">
                                No lessons yet
                              </p>
                            ) : (
                              lessons[course.id]?.map((lesson) => (
                                <div
                                  key={lesson.id}
                                  className="bg-white border rounded-lg p-4"
                                >
                                  {editingLessonId === lesson.id ? (
                                    // Edit Lesson Mode
                                    <div className="space-y-3">
                                      <input
                                        type="text"
                                        value={editingLesson.title || ""}
                                        onChange={(e) =>
                                          setEditingLesson({
                                            ...editingLesson,
                                            title: e.target.value,
                                          })
                                        }
                                        placeholder="Lesson title"
                                        className="w-full px-3 py-2 border rounded-md text-sm"
                                      />
                                      <textarea
                                        value={editingLesson.description || ""}
                                        onChange={(e) =>
                                          setEditingLesson({
                                            ...editingLesson,
                                            description: e.target.value,
                                          })
                                        }
                                        placeholder="Lesson description"
                                        rows={2}
                                        className="w-full px-3 py-2 border rounded-md text-sm"
                                      />
                                      <input
                                        type="text"
                                        value={editingLesson.duration || ""}
                                        onChange={(e) =>
                                          setEditingLesson({
                                            ...editingLesson,
                                            duration: e.target.value,
                                          })
                                        }
                                        placeholder="Duration (e.g., 15 minutes)"
                                        className="w-full px-3 py-2 border rounded-md text-sm"
                                      />
                                      <div className="flex gap-2">
                                        <Button
                                          size="sm"
                                          onClick={handleSaveLesson}
                                          className="flex-1"
                                        >
                                          Save
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => setEditingLessonId(null)}
                                          className="flex-1"
                                        >
                                          Cancel
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    // View Lesson Mode
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <h4 className="font-medium text-sm">
                                          {lesson.title}
                                        </h4>
                                        {lesson.description && (
                                          <p className="text-xs text-muted-foreground mt-1">
                                            {lesson.description}
                                          </p>
                                        )}
                                        {lesson.duration && (
                                          <p className="text-xs text-gray-500 mt-1">
                                            {lesson.duration}
                                          </p>
                                        )}
                                      </div>
                                      <div className="flex gap-2">
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => handleEditLesson(lesson)}
                                        >
                                          <Edit className="w-3 h-3" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => handleOpenQuizBuilder(lesson.id)}
                                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                          title="Add or edit quiz for this lesson"
                                        >
                                          <HelpCircle className="w-3 h-3" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                          onClick={() => {
                                            setDeletingLessonId(lesson.id);
                                            setDeleteDialogLessonOpen(true);
                                          }}
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Delete Course
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{courseToDelete?.title}"? This
              action cannot be undone and will delete all associated lessons and
              data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end pt-4">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Lesson Confirmation Dialog */}
      <AlertDialog open={deleteDialogLessonOpen} onOpenChange={setDeleteDialogLessonOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Delete Lesson
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this lesson? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end pt-4">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteLesson}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Quiz Builder Modal */}
      {showQuizModal && activeLessonId && (
        <QuizBuilder lessonId={activeLessonId} onClose={handleCloseQuizBuilder} />
      )}
    </SidebarLayout>
  );
}
