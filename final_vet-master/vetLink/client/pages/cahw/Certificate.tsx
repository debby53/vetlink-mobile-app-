import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SidebarLayout from "@/components/SidebarLayout";
import { Award, Download, Share2, ArrowRight, CheckCircle } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { trainingAPI, userTrainingAPI } from "@/lib/apiService";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Certificate() {
  const { enrollmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [enrollment, setEnrollment] = useState<any>(null);
  const [training, setTraining] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCopiedAlert, setShowCopiedAlert] = useState(false);

  useEffect(() => {
    loadCertificateData();
  }, [enrollmentId]);

  const loadCertificateData = async () => {
    setIsLoading(true);
    try {
      // Load enrollment details
      const enrollmentData = await userTrainingAPI.getEnrollmentById(Number(enrollmentId));
      setEnrollment(enrollmentData);

      // Load training details
      const trainingData = await trainingAPI.getTrainingById(Number(enrollmentData.trainingId));
      setTraining(trainingData);
    } catch (err) {
      console.error("Failed to load certificate data:", err);
      toast.error("Failed to load certificate data");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadCertificate = async () => {
    setIsLoading(true);
    try {
      const element = document.getElementById("certificate");
      if (element) {
        // Create a simple text-based download without external dependencies
        const certificateText = `
CERTIFICATE OF COMPLETION
VetLink Training Platform

This is to certify that
${user?.name}

Has successfully completed the training course:
${training?.title}

Instructor: ${training?.instructorName}
Duration: ${training?.duration}
Completion Date: ${enrollment?.completedAt}
Score: ${enrollment?.score}/100
Certificate ID: ${enrollmentId}

Congratulations on your achievement!
        `;
        
        const element = document.createElement("a");
        const file = new Blob([certificateText], { type: "text/plain" });
        element.href = URL.createObjectURL(file);
        element.download = `${user?.name}_certificate_${training?.title}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      }
    } catch (err) {
      console.error("Failed to download certificate:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const shareCertificate = () => {
    const text = `🎉 I just completed "${training?.title}" on VetLink! Instructor: ${training?.instructorName}. Score: ${enrollment?.score}/100 #VetLink #Training`;
    if (navigator.share) {
      navigator.share({
        title: "VetLink Certificate",
        text: text,
      });
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(text);
      setShowCopiedAlert(true);
    }
  };

  return (
    <SidebarLayout>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Success Message */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 flex gap-4">
          <div className="flex-shrink-0">
            <Award className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-green-900 mb-1">
              Congratulations!
            </h2>
            <p className="text-green-800">
              You have successfully completed the training course. Your certificate of completion has been generated.
            </p>
          </div>
        </div>

        {/* Certificate */}
        <div
          id="certificate"
          className="bg-white rounded-lg shadow-lg overflow-hidden"
        >
          <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 p-12 text-white text-center min-h-96 flex flex-col items-center justify-center border-8 border-yellow-500">
            {/* Decorative elements */}
            <div className="absolute top-8 left-8 w-16 h-16 border-2 border-yellow-500 rounded-full opacity-30" />
            <div className="absolute bottom-8 right-8 w-20 h-20 border-2 border-yellow-500 rounded-full opacity-30" />

            <div className="relative z-10 space-y-6">
              <Award className="h-16 w-16 mx-auto mb-4" />

              <div>
                <p className="text-lg font-light mb-2 tracking-wider">
                  CERTIFICATE OF COMPLETION
                </p>
                <h1 className="text-4xl font-bold mb-4">VetLink Training</h1>
              </div>

              <div className="border-t-2 border-b-2 border-yellow-500 py-6 px-8">
                <p className="text-sm font-light mb-2">This is to certify that</p>
                <p className="text-3xl font-bold">{user?.name}</p>
                <p className="text-sm font-light mt-2">has successfully completed the course</p>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-semibold">{training?.title}</h2>
                <p className="text-sm">Instructor: {training?.instructorName}</p>
                <p className="text-sm">Duration: {training?.duration}</p>
                <p className="text-sm">
                  Score: <span className="font-bold text-lg">{enrollment?.score}/100</span>
                </p>
              </div>

              <div className="text-sm font-light mt-4">
                <p>Completed on: {enrollment?.completedAt}</p>
                <p className="mt-2">Certificate ID: {enrollmentId}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={downloadCertificate}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium disabled:opacity-50"
          >
            <Download className="h-5 w-5" />
            {isLoading ? "Downloading..." : "Download PDF"}
          </button>

          <button
            onClick={shareCertificate}
            className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all font-medium"
          >
            <Share2 className="h-5 w-5" />
            Share Certificate
          </button>

          <button
            onClick={() => navigate("/cahw/trainings")}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all font-medium"
          >
            Continue Learning
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>

        {/* Course Details */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h3 className="text-lg font-bold text-foreground">Course Details</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Course Title</p>
              <p className="font-medium text-foreground">{training?.title}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Instructor</p>
              <p className="font-medium text-foreground">{training?.instructorName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Duration</p>
              <p className="font-medium text-foreground">{training?.duration}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Final Score</p>
              <p className="font-medium text-foreground">{enrollment?.score}/100</p>
            </div>
          </div>
        </div>

        {/* Copied Alert Dialog */}
        <AlertDialog open={showCopiedAlert} onOpenChange={setShowCopiedAlert}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Copied to Clipboard
              </AlertDialogTitle>
              <AlertDialogDescription>
                Certificate details have been successfully copied to your clipboard. You can now paste and share it!
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex gap-3 justify-end pt-4">
              <AlertDialogAction
                onClick={() => setShowCopiedAlert(false)}
                className="bg-green-600 hover:bg-green-700"
              >
                OK
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </SidebarLayout>
  );
}
