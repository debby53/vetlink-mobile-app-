import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SidebarLayout from "@/components/SidebarLayout";
import {
  Play,
  CheckCircle,
  ChevronLeft,
  Volume2,
  MessageSquare,
  Award,
} from "lucide-react";
import { trainingAPI, userTrainingAPI, quizAPI } from "@/lib/apiService";
import { API_BASE } from "@/lib/apiConfig";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "sonner";
import QuizPlayer from "@/components/QuizPlayer";

interface Lesson {
  id: number;
  title: string;
  duration: string;
  completed: boolean;
  videoUrl?: string; // Add video URL to lesson interface
  transcript?: string;
  description?: string;
}

export default function LearnCourse() {
  const { trainingId, enrollmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [training, setTraining] = useState<any>(null);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [currentLesson, setCurrentLesson] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  // Quiz State
  const [showQuiz, setShowQuiz] = useState(false);
  const [hasQuiz, setHasQuiz] = useState(false);

  // State for real lessons
  const [courseLessons, setCourseLessons] = useState<any[]>([]);

  // Auto-generate dummy lessons ONLY if API returns empty
  const dummyLessons: Lesson[] = Array.from({ length: training?.lessons || 12 }, (_, i) => ({
    id: -(i + 1),
    title: `Lesson ${i + 1}: ${["Introduction", "Basics", "Intermediate", "Advanced", "Case Study"][i % 5]}`,
    duration: `${(i % 3) + 1}h ${((i * 17) % 60)}min`,
    completed: i < currentLesson || (i === currentLesson && enrollment?.progressPercentage > (currentLesson / (training?.lessons || 12) * 100)),
  }));

  const activeLessons = courseLessons.length > 0 ? courseLessons : dummyLessons;
  const activeLesson = activeLessons[currentLesson];
  
  // Check if current lesson is already completed (from API or dummy indicator)
  const isLessonCompleted = activeLesson?.completed === true;

  // Memoize the video URL to prevent infinite calls
  const [cachedVideoUrl, setCachedVideoUrl] = useState<string>('');

  // Helper to get video URL with comprehensive logging (only call once per lesson)
  const getVideoUrl = (lesson: any): string => {
    if (!lesson) {
      console.debug('❌ getVideoUrl: No lesson provided');
      return '';
    }
    
    if (lesson.id > 0) {
      // Only return a video URL if the lesson actually has a videoUrl stored
      if (lesson.videoUrl) {
        let url = lesson.videoUrl;
        
        // If it's a relative path (just filename or /api/videos/...format), construct API URL
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          // If it doesn't start with /, add /api/videos/ prefix
          if (!url.startsWith('/')) {
            url = `${API_BASE}/videos/${url}`;
          } else if (!url.startsWith('/api/')) {
            // If it starts with / but not /api/, assume it's a filename under /api/videos/
            url = `${API_BASE}/videos${url}`;
          }
        }
        
        console.log(`📝 Lesson ${lesson.id} videoUrl: ${lesson.videoUrl} → ${url}`);
        return url;
      }
      // If no videoUrl, return empty string - will show placeholder
      console.debug(`ℹ️ Lesson ${lesson.id} has no videoUrl`);
      return '';
    }
    
    // Fallback to training video
    if (training?.videoUrl) {
      let url = training.videoUrl;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        if (!url.startsWith('/')) {
          url = `${API_BASE}/videos/${url}`;
        } else if (!url.startsWith('/api/')) {
          url = `${API_BASE}/videos${url}`;
        }
      }
      console.log(`📝 Using training videoUrl: ${training.videoUrl} → ${url}`);
      return url;
    }
    
    console.debug('❌ No video URL found for lesson or training');
    return '';
  };

  // Update cached video URL when active lesson changes
  useEffect(() => {
    const url = getVideoUrl(activeLesson);
    setCachedVideoUrl(url);
    if (url) {
      console.log(`🎬 Video URL for lesson ${activeLesson?.id}: ${url}`);
    } else {
      console.warn(`⚠️ No video URL available for lesson ${activeLesson?.id}`);
    }
  }, [activeLesson?.id, activeLesson?.videoUrl, training?.videoUrl]);

  useEffect(() => {
    if (trainingId && enrollmentId) {
      loadData();
    }
  }, [trainingId, enrollmentId]);

  // Check for Quiz when lesson changes
  useEffect(() => {
    if (activeLesson && activeLesson.id > 0) {
      checkQuiz(activeLesson.id);
    } else {
      setHasQuiz(false);
    }
  }, [activeLesson]);

  const checkQuiz = async (lessonId: number) => {
    try {
      const quiz = await quizAPI.getQuiz(lessonId);
      setHasQuiz(!!quiz);
    } catch {
      setHasQuiz(false);
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const trainingData = await trainingAPI.getTrainingById(Number(trainingId));
      setTraining(trainingData);

      try {
        const lessonsData = await trainingAPI.getCourseLessons(Number(trainingId));
        setCourseLessons(lessonsData);
      } catch (err) {
        console.warn("Failed to load lessons list, using fallback:", err);
      }

      try {
        const enrollmentData = await userTrainingAPI.getEnrollmentById(Number(enrollmentId));
        setEnrollment(enrollmentData);
        // Calculate current lesson index based on progress
        const lessonCount = (courseLessons.length > 0 ? courseLessons.length : trainingData.lessons) || 12;
        const computedIndex = Math.floor((enrollmentData.progressPercentage || 0) / 100 * lessonCount);
        setCurrentLesson(Math.min(computedIndex, lessonCount - 1));
      } catch (enrollErr) {
        console.debug("Could not load enrollment details:", enrollErr);
      }

    } catch (err: any) {
      toast.error(err.message || "Failed to load course");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLessonEnd = () => {
    if (hasQuiz) {
      setShowQuiz(true);
    } else {
      handleCompleteLesson();
    }
  };

  const handleCompleteLesson = async () => {
    setShowQuiz(false); // Close quiz if open
    setIsCompleting(true);
    try {
      if (activeLesson && activeLesson.id > 0) {
        await userTrainingAPI.completeLesson(Number(enrollmentId), activeLesson.id);
      }

      // Refresh enrollment data to update progress bar and lesson states
      const updatedEnrollment = await userTrainingAPI.getEnrollmentById(Number(enrollmentId));
      setEnrollment(updatedEnrollment);
      
      // Also refresh lessons to update their completed status
      try {
        const lessonsData = await trainingAPI.getCourseLessons(Number(trainingId));
        setCourseLessons(lessonsData);
      } catch (err) {
        console.warn("Failed to refresh lessons:", err);
      }

      if (currentLesson < activeLessons.length - 1) {
        setCurrentLesson((prev) => prev + 1);
        toast.success("Lesson completed! Moving to next.");
      } else {
        // Check if enrollment is now complete
        try {
          const completionCheck = await userTrainingAPI.checkEnrollmentCompletion(Number(enrollmentId));
          if (completionCheck.isComplete) {
            toast.success("🎉 Congratulations! You have completed the entire course!");
            setTimeout(() => {
              navigate(`/cahw/trainings/${trainingId}/certificate/${enrollmentId}`);
            }, 1000);
          } else {
            toast.success("Lesson completed!");
            navigate("/cahw/trainings");
          }
        } catch (err) {
          toast.success("Congratulations! You have completed the course.");
          setTimeout(() => {
            navigate(`/cahw/trainings/${trainingId}/certificate/${enrollmentId}`);
          }, 1000);
        }
      }

    } catch (err: any) {
      toast.error(err.message || "Failed to complete lesson");
    } finally {
      setIsCompleting(false);
    }
  };

  if (isLoading || !training) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center p-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-gray-50 flex-col lg:flex-row">

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/cahw/trainings")}
                className="p-2 hover:bg-white rounded-full transition-colors"
              >
                <ChevronLeft className="h-6 w-6 text-gray-500" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{training.title}</h1>
                <p className="text-sm text-gray-500">
                  {activeLesson?.title}
                </p>
              </div>
            </div>

            {/* Video Player */}
            <div className="bg-black rounded-xl overflow-hidden shadow-lg aspect-video relative group">
              {cachedVideoUrl ? (
                <video
                  key={activeLesson?.id}
                  src={cachedVideoUrl}
                  className="w-full h-full"
                  controls
                  autoPlay={false}
                  muted={false}
                  onEnded={handleLessonEnd}
                  poster={training.thumbnailUrl || "/placeholder-video.jpg"}
                  crossOrigin="anonymous"
                  onLoadStart={() => {
                    console.log(`📹 Video loading started for lesson ${activeLesson?.id}`);
                    console.log(`   URL: ${cachedVideoUrl}`);
                    setVideoError(null);
                  }}
                  onCanPlay={() => {
                    console.log(`✅ Video can play for lesson ${activeLesson?.id}`);
                  }}
                  onLoadedMetadata={() => {
                    console.log(`✅ Video metadata loaded for lesson ${activeLesson?.id}`);
                    const videoElement = document.querySelector(`video[src="${cachedVideoUrl}"]`) as any;
                    if (videoElement) {
                      console.log(`   Duration: ${videoElement.duration}s`);
                      console.log(`   Video width/height: ${videoElement.videoWidth}x${videoElement.videoHeight}`);
                      console.log(`   Volume: ${videoElement.volume}`);
                      console.log(`   Muted: ${videoElement.muted}`);
                      console.log(`   Can play audio: ${videoElement.canPlayType('audio/mpeg')}`);
                      console.log(`   Media error: ${videoElement.error?.message || 'none'}`);
                      
                      // Deep audio track detection
                      const audioTracks = (videoElement as any).audioTracks;
                      const audioTrackCount = audioTracks?.length || 0;
                      console.log(`   Audio tracks detected: ${audioTrackCount}`);
                      
                      if (audioTrackCount > 0) {
                        for (let i = 0; i < audioTrackCount; i++) {
                          const track = audioTracks?.[i];
                          console.log(`     Track ${i}: enabled=${track?.enabled}, kind=${track?.kind}, language=${track?.language}`);
                        }
                        console.log(`✅ Audio IS present in this video - browser detected ${audioTrackCount} track(s)`);
                      } else if (audioTrackCount === 0) {
                        console.warn(`⚠️ WARNING: Video has NO audio tracks!`);
                        console.warn(`   This video was uploaded without audio.`);
                        console.warn(`   Ask your instructor to re-upload with audio, or contact support.`);
                      } else {
                        console.log(`ℹ️ Audio track detection unavailable in this browser`);
                      }
                      
                      // Ensure audio is unmuted
                      videoElement.muted = false;
                      videoElement.volume = 1;
                      
                      // Try to enable all audio tracks
                      if (audioTracks && audioTracks.length > 0) {
                        for (let i = 0; i < audioTracks.length; i++) {
                          if (audioTracks[i]) {
                            audioTracks[i].enabled = true;
                          }
                        }
                      }
                    }
                  }}
                  onPlay={() => {
                    console.log(`▶️  Video playing for lesson ${activeLesson?.id}`);
                    const videoElement = document.querySelector(`video[src="${cachedVideoUrl}"]`) as any;
                    if (videoElement) {
                      // On first play, ensure audio is properly enabled (some browsers require user interaction)
                      videoElement.muted = false;
                      videoElement.volume = 1;
                      console.log(`   Ensuring audio is enabled: muted=${videoElement.muted}, volume=${videoElement.volume}`);
                    }
                  }}
                  onError={(e) => {
                    const videoElement = e.target as HTMLVideoElement;
                    const errorCode = videoElement.error?.code;
                    const errorMessage = {
                      1: 'Video loading aborted',
                      2: 'Network error - check video URL and backend connectivity',
                      3: 'Video decoding failed',
                      4: 'Video format not supported by browser'
                    }[errorCode || 0] || 'Unknown video error';
                    
                    const errorDetails = {
                      errorCode,
                      message: errorMessage,
                      src: cachedVideoUrl,
                      mediaError: videoElement.error?.message || 'N/A'
                    };
                    
                    console.error(`❌ Video Error for lesson ${activeLesson?.id}:`, errorDetails);
                    
                    // More user-friendly error message
                    let userMessage = `Video failed to load: ${errorMessage}`;
                    if (!cachedVideoUrl) {
                      userMessage = 'No video URL available. The instructor may not have uploaded a video for this lesson.';
                    } else if (errorCode === 2) {
                      userMessage = `Network error loading video from ${cachedVideoUrl}. Check your connection or verify the video file exists on the server.`;
                    } else if (errorCode === 4) {
                      userMessage = 'The video format is not supported by your browser. Try a different browser (Chrome, Firefox, Edge) or ask the instructor to upload a different format.';
                    }
                    
                    setVideoError(userMessage);
                  }}
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-900">
                  <div className="text-center text-white">
                    <Play className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                    <p className="text-lg font-semibold mb-2">No Video Available</p>
                    <p className="text-sm text-gray-400">The instructor hasn't uploaded a video for this lesson yet.</p>
                  </div>
                </div>
              )}

              {videoError && (
                <div className="absolute inset-0 flex items-center justify-center text-white bg-black/80 z-10 flex-col gap-4">
                  <p className="text-center px-4">{videoError}</p>
                  <p className="text-sm text-gray-300 text-center px-4">If this persists, the instructor may not have uploaded a video for this lesson yet.</p>
                </div>
              )}
            </div>

            {/* Lesson Details & Transcript */}
            {activeLesson && (
              <div className="space-y-6">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {activeLesson.title}
                    </h2>
                    <p className="text-gray-600 leading-relaxed">
                      {activeLesson.description || "No description available."}
                    </p>
                  </div>

                  <button
                    onClick={handleLessonEnd}
                    disabled={isCompleting || isLessonCompleted}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all shadow-lg ${
                      isLessonCompleted
                        ? "bg-green-500 text-white hover:bg-green-600 hover:shadow-green-500/20"
                        : "bg-primary text-white hover:bg-primary/90 hover:shadow-primary/20"
                    }`}
                  >
                    {isCompleting ? "Updating..." : isLessonCompleted ? "✓ Completed" : (hasQuiz ? "Take Quiz" : "Mark Complete")}
                  </button>
                </div>

                {/* Transcript / Notes Tab */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Transcript / Notes
                  </h3>
                  <div className="prose max-w-none text-gray-600 bg-gray-50 p-4 rounded-lg max-h-60 overflow-y-auto">
                    {activeLesson.transcript ? (
                      <div className="whitespace-pre-wrap">{activeLesson.transcript}</div>
                    ) : (
                      <p className="italic text-gray-400">Transcript is generated automatically by AI after video upload.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 bg-white border-l shadow-2xl overflow-y-auto">
          <div className="p-6 border-b sticky top-0 bg-white z-10">
            <h2 className="font-bold text-lg mb-2">Course Content</h2>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${enrollment?.progressPercentage || 0}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500">
              {Math.round(enrollment?.progressPercentage || 0)}% Completed
            </p>
          </div>

          <div className="divide-y">
            {activeLessons.map((lesson, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentLesson(idx)} // Allow clicking any lesson for now, or restrict if needed
                className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors text-left ${currentLesson === idx ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
              >
                <div className="mt-1">
                  {/* In real app, check 'completed' from enrollment progress list */}
                  {lesson.completed || idx < currentLesson ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <Play className={`h-5 w-5 ${currentLesson === idx ? 'text-blue-500' : 'text-gray-400'}`} />
                  )}
                </div>
                <div>
                  <h3 className={`font-medium ${currentLesson === idx ? 'text-blue-700' : 'text-gray-900'}`}>
                    {lesson.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">{lesson.duration}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>

      {showQuiz && activeLesson && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <QuizPlayer
            lessonId={activeLesson.id}
            enrollmentId={Number(enrollmentId)}
            onPass={handleCompleteLesson}
            onCancel={() => setShowQuiz(false)}
          />
        </div>
      )}

    </SidebarLayout>
  );
}
