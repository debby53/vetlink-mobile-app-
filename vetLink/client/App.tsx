import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/AuthContext";
import { LanguageProvider } from "@/lib/LanguageContext";
import { NotificationProvider } from "@/lib/NotificationContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Farmers from "./pages/Farmers";
import Veterinarians from "./pages/Veterinarians";
import CAHWs from "./pages/CAHWs";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Settings from "./pages/Settings";
import Dashboard from "./pages/Dashboard";

// Dashboards
import FarmerDashboard from "./pages/FarmerDashboard";
import VeterinarianDashboard from "./pages/VeterinarianDashboard";
import CAHWDashboard from "./pages/CAHWDashboard";
import AdminDashboard from "./pages/AdminDashboard";

// Farmer Pages
import FarmerCases from "./pages/farmer/Cases";
import FarmerHealthRecords from "./pages/farmer/HealthRecords";
import FarmerAnimals from "./pages/farmer/Animals";
import FarmerMessages from "./pages/farmer/Messages";
import FarmerNewCase from "./pages/farmer/NewCase";
import FarmerAddAnimal from "./pages/farmer/AddAnimal";
import FarmerAddRecord from "./pages/farmer/AddRecord";
import FarmerViewDetails from "./pages/farmer/ViewDetails";
import FarmerAnalytics from "./pages/farmer/Analytics";

// Veterinarian Pages
import VeterinarianCases from "./pages/veterinarian/Cases";
import VeterinarianCaseDetails from "./pages/veterinarian/CaseDetails";
import VeterinarianPatients from "./pages/veterinarian/Patients";
import VeterinarianCAHWs from "./pages/veterinarian/CAHWs";
import VeterinarianAnalytics from "./pages/veterinarian/Analytics";
import VeterinarianMessages from "./pages/veterinarian/Messages";
import VeterinarianTreatmentPlans from "./pages/veterinarian/TreatmentPlans";
import VeterinarianTrainingUpload from "./pages/veterinarian/TrainingUpload";
import VeterinarianTrainings from "./pages/veterinarian/Trainings";
import TrainingEnrollments from "./pages/veterinarian/TrainingEnrollments";
import MyCourses from "./pages/veterinarian/MyCourses";
import ScheduleVisit from "./pages/ScheduleVisit";
import CAHWTraining from "./pages/cahw/Training";
import CAHWCommunity from "./pages/cahw/Community";
import CAHWProgress from "./pages/cahw/Progress";
import CAHWMessages from "./pages/cahw/Messages";
import CAHWReviewCourse from "./pages/cahw/ReviewCourse";
import CAHWContinueLearning from "./pages/cahw/ContinueLearning";
import CAHWNearbyCases from "./pages/cahw/NearbyCases";
import CAHWNearbyPatients from "./pages/cahw/NearbyPatients";
import CAHWCommunityEngagement from "./pages/cahw/CommunityEngagement";
import CAHWAvailableTrainings from "./pages/cahw/AvailableTrainings";
import LearnCourse from "./pages/cahw/LearnCourse";
import Certificate from "./pages/cahw/Certificate";

// Admin Pages
import AdminUsers from "./pages/admin/Users";
import AdminApplications from "./pages/admin/Applications";
import AdminAnalytics from "./pages/admin/Analytics";
import AdminReports from "./pages/admin/Reports";
import AdminSystemSettings from "./pages/admin/SystemSettings";
import AdminTrainingManagement from "./pages/admin/TrainingManagement";
import AdminTrainingEnrollments from "./pages/admin/TrainingEnrollments";

// Shared Pages
import Notifications from "./pages/Notifications";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <AuthProvider>
            <NotificationProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/farmers" element={<Farmers />} />
                  <Route path="/veterinarians" element={<Veterinarians />} />
                  <Route path="/cahws" element={<CAHWs />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />

                  {/* Protected Dashboard Routes */}
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/dashboard/farmer" element={<FarmerDashboard />} />
                  <Route
                    path="/dashboard/veterinarian"
                    element={<VeterinarianDashboard />}
                  />
                  <Route path="/dashboard/cahw" element={<CAHWDashboard />} />
                  <Route path="/dashboard/admin" element={<AdminDashboard />} />

                  {/* Farmer Routes */}
                  <Route path="/farmer/cases" element={<FarmerCases />} />
                  <Route
                    path="/farmer/records"
                    element={<FarmerHealthRecords />}
                  />
                  <Route path="/farmer/animals" element={<FarmerAnimals />} />
                  <Route path="/farmer/messages" element={<FarmerMessages />} />
                  <Route path="/farmer/cases/new" element={<FarmerNewCase />} />
                  <Route
                    path="/farmer/animals/add"
                    element={<FarmerAddAnimal />}
                  />
                  <Route
                    path="/farmer/records/add"
                    element={<FarmerAddRecord />}
                  />
                  <Route
                    path="/farmer/details/:id"
                    element={<FarmerViewDetails />}
                  />
                  <Route path="/farmer/analytics" element={<FarmerAnalytics />} />

                  {/* Veterinarian Routes */}
                  <Route
                    path="/veterinarian/cases"
                    element={<VeterinarianCases />}
                  />
                  <Route
                    path="/veterinarian/cases/:caseId"
                    element={<VeterinarianCaseDetails />}
                  />
                  <Route
                    path="/veterinarian/patients"
                    element={<VeterinarianPatients />}
                  />
                  <Route
                    path="/veterinarian/cahws"
                    element={<VeterinarianCAHWs />}
                  />
                  <Route
                    path="/veterinarian/analytics"
                    element={<VeterinarianAnalytics />}
                  />
                  <Route
                    path="/veterinarian/messages"
                    element={<VeterinarianMessages />}
                  />
                  <Route
                    path="/veterinarian/treatment-plans"
                    element={<VeterinarianTreatmentPlans />}
                  />
                  <Route
                    path="/veterinarian/schedule-visit"
                    element={<ScheduleVisit />}
                  />
                  <Route
                    path="/farmer/schedule-visit"
                    element={<ScheduleVisit />}
                  />
                  <Route
                    path="/schedule-visit"
                    element={<ScheduleVisit />}
                  />
                  <Route
                    path="/veterinarian/trainings"
                    element={<VeterinarianTrainings />}
                  />
                  <Route
                    path="/veterinarian/training/upload"
                    element={<VeterinarianTrainingUpload />}
                  />
                  <Route
                    path="/veterinarian/my-courses"
                    element={<MyCourses />}
                  />
                  <Route
                    path="/veterinarian/training/:trainingId/enrollments"
                    element={<TrainingEnrollments />}
                  />

                  {/* CAHW Routes */}
                  <Route path="/cahw/training" element={<CAHWTraining />} />
                  <Route
                    path="/cahw/trainings"
                    element={<CAHWAvailableTrainings />}
                  />
                  <Route
                    path="/cahw/available-trainings"
                    element={<CAHWAvailableTrainings />}
                  />
                  <Route path="/cahw/community" element={<CAHWCommunity />} />
                  <Route path="/cahw/progress" element={<CAHWProgress />} />
                  <Route path="/cahw/messages" element={<CAHWMessages />} />
                  <Route
                    path="/cahw/learn/:trainingId/:enrollmentId"
                    element={<LearnCourse />}
                  />
                  <Route
                    path="/cahw/certificate/:enrollmentId"
                    element={<Certificate />}
                  />
                  <Route
                    path="/cahw/trainings/:trainingId/certificate/:enrollmentId"
                    element={<Certificate />}
                  />
                  <Route
                    path="/cahw/training/review/:id"
                    element={<CAHWReviewCourse />}
                  />
                  <Route
                    path="/cahw/review-course/:id"
                    element={<CAHWReviewCourse />}
                  />
                  <Route
                    path="/cahw/training/continue/:id"
                    element={<CAHWContinueLearning />}
                  />
                  <Route
                    path="/cahw/nearby-cases"
                    element={<CAHWNearbyCases />}
                  />
                  <Route
                    path="/cahw/nearby-patients"
                    element={<CAHWNearbyPatients />}
                  />
                  <Route
                    path="/cahw/engagement"
                    element={<CAHWCommunityEngagement />}
                  />

                  {/* Admin Routes */}
                  <Route path="/admin/users" element={<AdminUsers />} />
                  <Route path="/admin/applications" element={<AdminApplications />} />
                  <Route path="/admin/analytics" element={<AdminAnalytics />} />
                  <Route path="/admin/reports" element={<AdminReports />} />
                  <Route
                    path="/admin/settings"
                    element={<AdminSystemSettings />}
                  />
                  <Route
                    path="/admin/trainings"
                    element={<AdminTrainingManagement />}
                  />
                  <Route
                    path="/admin/training/new"
                    element={<VeterinarianTrainingUpload />}
                  />
                  <Route
                    path="/admin/training-enrollments"
                    element={<AdminTrainingEnrollments />}
                  />

                  {/* Shared Routes */}
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/notifications" element={<Notifications />} />

                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </NotificationProvider>
          </AuthProvider>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
