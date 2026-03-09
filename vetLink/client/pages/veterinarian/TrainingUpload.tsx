

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SidebarLayout from "@/components/SidebarLayout";
import { Upload, X, CheckCircle, Clock, FileText, Plus, Film, Trash2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { trainingAPI } from '@/lib/apiService';
import { useAuth } from "@/lib/AuthContext";
import { API_BASE } from "@/lib/apiConfig";

interface LessonDraft {
  id?: number;
  tempId: number;
  title: string;
  file?: File;
  uploadProgress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
}

import QuizBuilder from "@/components/QuizBuilder";

export default function VeterinarianTrainingUpload() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [createdTrainingId, setCreatedTrainingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for Quiz Builder
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [activeLessonId, setActiveLessonId] = useState<number | null>(null);

  const openQuizBuilder = (lessonId: number) => {
    setActiveLessonId(lessonId);
    setShowQuizModal(true);
  };


  // Step 1: Course Metadata
  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    category: "Disease Management",
    duration: "2 hours",
    instructor: "",
  });

  // Step 2: Lessons
  const [lessons, setLessons] = useState<LessonDraft[]>([]);

  const categories = [
    "Disease Management", "Health Care", "Community", "Prevention",
    "Vaccination", "Nutrition", "Animal Behavior", "Emergency Response"
  ];

  /* ---------------- Step 1: Create Course ---------------- */
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseData.title || !courseData.description || !courseData.instructor) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: courseData.title,
        description: courseData.description,
        category: courseData.category,
        duration: courseData.duration,
        lessons: 0, // Will update dynamically
        instructorId: user?.id,
        instructorName: courseData.instructor,
        status: "DRAFT", // Start as draft until lessons are added
      };

      const res = await trainingAPI.createTraining(payload);
      setCreatedTrainingId(res.id);
      setStep(2); // Move to lessons step
      toast.success("Course draft created! Now add your lessons.");
    } catch (err: any) {
      console.error("Failed to create course", err);
      toast.error(err.message || "Failed to create course");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------------- Step 2: Manage Lessons ---------------- */
  const addLessonDraft = () => {
    setLessons([
      ...lessons,
      {
        tempId: Date.now(),
        title: `Lesson ${lessons.length + 1}`,
        uploadProgress: 0,
        status: 'pending'
      }
    ]);
  };

  const removeLesson = (tempId: number) => {
    setLessons(lessons.filter(l => l.tempId !== tempId));
  };

  const updateLessonTitle = (tempId: number, newTitle: string) => {
    setLessons(lessons.map(l => l.tempId === tempId ? { ...l, title: newTitle } : l));
  };

  const handleLessonFileSelect = (tempId: number, file: File | undefined) => {
    if (file && file.size > 200 * 1024 * 1024) { // 200MB Limit
      toast.error("File size must be under 200MB");
      return;
    }
    setLessons(lessons.map(l => l.tempId === tempId ? { ...l, file } : l));
  };

  const uploadLesson = async (lesson: LessonDraft, index: number) => {
    if (!lesson.title || !lesson.file) {
      toast.error(`Please provide a title and video for Lesson ${index + 1}`);
      return;
    }

    // Update status to uploading
    setLessons(prev => prev.map(l => l.tempId === lesson.tempId ? { ...l, status: 'uploading' } : l));

    try {
      const token = localStorage.getItem('vetlink_token');

      // 1. Create Lesson Entity
      const createRes = await fetch(`${API_BASE}/trainings/${createdTrainingId}/lessons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: lesson.title,
          sequenceOrder: index + 1
        })
      });

      if (!createRes.ok) throw new Error("Failed to create lesson metadata");
      const lessonEntity = await createRes.json();
      const lessonId = lessonEntity.id;

      // 2. Upload Video
      const fd = new FormData();
      fd.append('file', lesson.file);

      const uploadRes = await fetch(`${API_BASE}/lessons/${lessonId}/video`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: fd
      });

      if (!uploadRes.ok) throw new Error("Failed to upload video");

      // Success
      setLessons(prev => prev.map(l => l.tempId === lesson.tempId ? { ...l, status: 'completed', id: lessonId } : l));
      toast.success(`${lesson.title} uploaded successfully!`);

    } catch (err: any) {
      console.error(err);
      toast.error(`Failed to upload ${lesson.title}`);
      setLessons(prev => prev.map(l => l.tempId === lesson.tempId ? { ...l, status: 'error' } : l));
    }
  };

  const handlePublishCourse = async () => {
    // Check if at least one lesson is uploaded
    if (lessons.filter(l => l.status === 'completed').length === 0) {
      toast.error("Please upload at least one lesson before publishing");
      return;
    }

    setIsSubmitting(true);
    try {
      // Update course status to PUBLISHED
      await trainingAPI.updateTraining(createdTrainingId!, { status: 'PUBLISHED', lessons: lessons.filter(l => l.status === 'completed').length });
      toast.success("🎉 Course Published Successfully!");

      // Redirect based on role
      if (user?.role === 'admin') {
        navigate("/admin/trainings");
      } else {
        navigate("/veterinarian/trainings");
      }
    } catch (err: any) {
      console.error("Publish error:", err);
      toast.error(err?.message || "Failed to publish course");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SidebarLayout>
      <div className="max-w-5xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {step === 1 ? "Create New Course" : `Add Lessons: ${courseData.title}`}
          </h1>
          <p className="text-muted-foreground">
            {step === 1 ? "Start by defining the basic details of your training course." : "Upload video lessons sequentially. Each video should be distinct."}
          </p>
        </div>

        {/* Step 1: Course Metadata Form */}
        {step === 1 && (
          <form onSubmit={handleCreateCourse} className="space-y-6 bg-white p-6 rounded-lg border">
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Course Title</label>
                <input
                  className="w-full border rounded-lg p-2"
                  value={courseData.title}
                  onChange={e => setCourseData({ ...courseData, title: e.target.value })}
                  placeholder="e.g. Advanced Cattle Care"
                  required
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  className="w-full border rounded-lg p-2"
                  rows={4}
                  value={courseData.description}
                  onChange={e => setCourseData({ ...courseData, description: e.target.value })}
                  placeholder="What will CAHWs learn?"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  className="w-full border rounded-lg p-2"
                  value={courseData.category}
                  onChange={e => setCourseData({ ...courseData, category: e.target.value })}
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Instructor Name</label>
                <input
                  className="w-full border rounded-lg p-2"
                  value={courseData.instructor}
                  onChange={e => setCourseData({ ...courseData, instructor: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:opacity-90"
              >
                {isSubmitting ? <Clock className="animate-spin h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                Next: Add Lessons
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Lesson Management */}
        {step === 2 && (
          <div className="space-y-6">

            {/* Draft Lessons List */}
            <div className="space-y-4">
              {lessons.map((lesson, idx) => (
                <div key={lesson.tempId} className="bg-white border rounded-lg p-4 flex items-start gap-4 shadow-sm">
                  <div className="bg-gray-100 p-3 rounded h-full flex items-center justify-center">
                    <span className="font-bold text-gray-500">#{idx + 1}</span>
                  </div>

                  <div className="flex-1 space-y-3">
                    <input
                      className="w-full font-semibold text-lg border-b border-transparent focus:border-primary focus:outline-none p-1"
                      value={lesson.title}
                      onChange={(e) => updateLessonTitle(lesson.tempId, e.target.value)}
                      placeholder="Lesson Title"
                      disabled={lesson.status === 'completed' || lesson.status === 'uploading'}
                    />

                    {/* File input */}
                    <div className="flex items-center gap-4">
                      {lesson.status === 'completed' ? (
                        <span className="text-green-600 flex items-center gap-2 text-sm font-medium bg-green-50 px-3 py-1 rounded-full">
                          <CheckCircle className="h-4 w-4" /> Uploaded & Transcribing
                        </span>
                      ) : (
                        <>
                          <label className="cursor-pointer flex items-center gap-2 text-sm text-primary hover:bg-blue-50 px-3 py-2 rounded transition-colors">
                            <Film className="h-4 w-4" />
                            {lesson.file ? lesson.file.name : "Select Video File"}
                            <input
                              type="file"
                              className="hidden"
                              accept="video/*"
                              onChange={(e) => handleLessonFileSelect(lesson.tempId, e.target.files?.[0])}
                              disabled={lesson.status === 'uploading'}
                            />
                          </label>
                          {lesson.file && (
                            <span className="text-xs text-muted-foreground">
                              {(lesson.file.size / (1024 * 1024)).toFixed(1)} MB
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2">
                    {lesson.status === 'pending' || lesson.status === 'error' ? (
                      <>
                        <button
                          onClick={() => uploadLesson(lesson, idx)}
                          className="bg-primary text-white text-sm px-4 py-2 rounded hover:bg-primary/90 flex items-center gap-2"
                          disabled={!lesson.file}
                        >
                          <Upload className="h-3 w-3" /> Upload
                        </button>
                        <button
                          onClick={() => removeLesson(lesson.tempId)}
                          className="text-red-500 p-2 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      lesson.status === 'completed' ? (
                        <button
                          onClick={() => openQuizBuilder(lesson.id!)}
                          className="text-green-600 border border-green-200 bg-green-50 px-3 py-1 rounded text-sm hover:bg-green-100"
                        >
                          Default Quiz
                        </button>
                      ) : (
                        <Clock className="animate-spin text-primary h-5 w-5" />
                      )
                    )}
                  </div>
                </div>
              ))}

              {/* Add New Lesson Button */}
              <button
                onClick={addLessonDraft}
                className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-primary hover:text-primary hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="h-5 w-5" /> Add Another Lesson
              </button>
            </div>

            {/* Final Actions */}
            <div className="flex justify-between pt-6 border-t">
              <button
                onClick={() => {
                  if (user?.role === 'admin') {
                    navigate("/admin/trainings");
                  } else {
                    navigate("/veterinarian/trainings");
                  }
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                Save Draft & Exit
              </button>
              <button
                onClick={handlePublishCourse}
                className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg hover:bg-green-700 transition-all flex items-center gap-2"
              >
                <CheckCircle className="h-5 w-5" /> Publish Course
              </button>
            </div>
          </div>
        )}
      </div>

      {showQuizModal && activeLessonId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <QuizBuilder
            lessonId={activeLessonId}
            onClose={() => setShowQuizModal(false)}
          />
        </div>
      )}
    </SidebarLayout>
  );
}
