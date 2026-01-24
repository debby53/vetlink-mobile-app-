import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { useLanguage } from "@/lib/LanguageContext";
import {
  Home,
  BarChart3,
  FileText,
  X,
  Activity,
  Heart,
  Users,
  BookOpen,
  Award,
  MessageSquare,
  TrendingUp,
  Zap,
  Map,
  Calendar,
} from "lucide-react";
import { useState } from "react";

export default function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  // Streamlined navigation - only essential items per role
  const navItems = {
    farmer: [
      { icon: Home, label: t('dashboard'), path: "/dashboard/farmer" },
      { icon: Heart, label: t('myCases'), path: "/farmer/cases" },
      { icon: FileText, label: t('healthRecords'), path: "/farmer/records" },
      { icon: Activity, label: t('myAnimals'), path: "/farmer/animals" },
      { icon: Calendar, label: t('scheduleVisit'), path: "/farmer/schedule-visit" },
      { icon: BarChart3, label: t('analytics'), path: "/farmer/analytics" },
      { icon: MessageSquare, label: t('messages'), path: "/farmer/messages" },
    ],
    veterinarian: [
      { icon: Home, label: t('dashboard'), path: "/dashboard/veterinarian" },
      { icon: FileText, label: t('cases'), path: "/veterinarian/cases" },
      { icon: Users, label: 'Farmers', path: "/veterinarian/patients" },
      { icon: Users, label: 'CAHWs', path: "/veterinarian/cahws" },
      {
        icon: Heart,
        label: t('treatmentPlans'),
        path: "/veterinarian/treatment-plans",
      },

      {
        icon: BookOpen,
        label: "My Courses",
        path: "/veterinarian/my-courses",
      },
      {
        icon: BookOpen,
        label: "Create Course",
        path: "/veterinarian/training/upload",
      },
      { icon: BarChart3, label: t('analytics'), path: "/veterinarian/analytics" },
      {
        icon: MessageSquare,
        label: t('messages'),
        path: "/veterinarian/messages",
      },
    ],
    cahw: [
      { icon: Home, label: t('dashboard'), path: "/dashboard/cahw" },
      { icon: BookOpen, label: t('training'), path: "/cahw/training" },
      {
        icon: Award,
        label: t('continueLearning'), // Approximation for 'Browse Courses'
        path: "/cahw/available-trainings",
      },
      { icon: Users, label: t('community'), path: "/cahw/engagement" },
      { icon: Map, label: t('nearbyCases'), path: "/cahw/nearby-cases" },
      { icon: TrendingUp, label: t('progress'), path: "/cahw/progress" },
      { icon: MessageSquare, label: t('messages'), path: "/cahw/messages" },
    ],
    admin: [
      { icon: Home, label: t('dashboard'), path: "/dashboard/admin" },
      { icon: BookOpen, label: "Training Management", path: "/admin/trainings" },
      { icon: Users, label: "Enrollments", path: "/admin/training-enrollments" },
      { icon: Users, label: t('users'), path: "/admin/users" },
      { icon: BarChart3, label: t('analytics'), path: "/admin/analytics" },
      { icon: FileText, label: t('reports'), path: "/admin/reports" },
      { icon: Zap, label: t('settings'), path: "/admin/settings" },
    ],
  };

  // Green gradient for all roles
  const bgGradient = "from-green-600 to-green-700";

  const roleIcons = {
    farmer: Activity,
    veterinarian: Heart,
    cahw: BookOpen,
    admin: Users,
  };

  if (!user) return null;

  const currentNav =
    navItems[user.role as keyof typeof navItems] || navItems.farmer;
  const RoleIcon =
    roleIcons[user.role as keyof typeof roleIcons] || roleIcons.farmer;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 lg:hidden inline-flex items-center justify-center h-14 w-14 rounded-full bg-green-600 text-white shadow-lg hover:bg-green-700 transition-all"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Home className="h-6 w-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 h-[calc(100vh-64px)] w-64 bg-white border-r border-gray-200 shadow-lg transform transition-transform duration-300 ease-in-out z-40 lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Sidebar Header with User Info */}
        <div className={`bg-gradient-to-br ${bgGradient} p-4 text-white`}>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-white/20 backdrop-blur">
              <RoleIcon className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-base truncate capitalize">{user.name}</p>
              <p className="text-xs opacity-75">{user.email || user.role}</p>
            </div>
          </div>
          <div className="mt-3 px-2 py-1 bg-white/10 rounded text-center">
            <p className="text-xs font-medium opacity-75 uppercase tracking-wide">
              {user.role === "veterinarian"
                ? "Veterinarian"
                : user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="overflow-y-auto p-3 space-y-1 h-full">
          {currentNav.map((item, index) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={index}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium text-sm ${isActive
                  ? `bg-gradient-to-r ${bgGradient} text-white shadow-md`
                  : "text-foreground hover:bg-gray-100"
                  }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside >

      {/* Mobile Overlay */}
      {
        isOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden top-16"
            onClick={() => setIsOpen(false)}
          />
        )
      }
    </>
  );
}
