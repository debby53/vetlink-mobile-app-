import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SidebarLayout from "@/components/SidebarLayout";
import { useAuth } from "@/lib/AuthContext";
import { userAPI, caseAPI } from "@/lib/apiService";
import {
  Users,
  MessageSquare,
  Heart,
  Award,
  Plus,
  MapPin,
  Phone,
  Mail,
  Star,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function CommunityEngagement() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "farmers" | "workshops" | "impact"
  >("farmers");
  const [farmers, setFarmers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadFarmers();
  }, [user?.id]);

  const loadFarmers = async () => {
    setIsLoading(true);
    try {
      const farmersList = await userAPI.getUsersByRole('FARMER');
      const farmersWithCases = await Promise.all(
        farmersList.map(async (farmer: any) => {
          const cases = await caseAPI.getCasesByFarmerId(farmer.id);
          return {
            id: farmer.id,
            name: farmer.name,
            location: farmer.location || "Unknown Location",
            animals: 0,
            lastContact: "Recently",
            status: "active",
            rating: 4.7,
            cases: cases.length,
          };
        })
      );
      setFarmers(farmersWithCases.slice(0, 10));
    } catch (err: any) {
      console.error('Error loading farmers:', err);
      toast.error('Failed to load farmers');
    } finally {
      setIsLoading(false);
    }
  };

  const workshops = [
    {
      id: 1,
      title: "Basic Animal Nutrition",
      date: "2024-01-25",
      location: "Kigali Community Center",
      attendees: 24,
      status: "upcoming",
      description: "Learn about proper nutrition for cattle, goats, and sheep",
    },
    {
      id: 2,
      title: "Disease Prevention Techniques",
      date: "2024-02-08",
      location: "Musanze Market",
      attendees: 18,
      status: "upcoming",
      description: "Practical workshop on preventing common livestock diseases",
    },
    {
      id: 3,
      title: "Vaccination Best Practices",
      date: "2024-01-18",
      location: "Regional Vet Hospital",
      attendees: 32,
      status: "completed",
      description: "Hands-on training on proper vaccination techniques",
    },
  ];

  const stats = [
    {
      label: "Farmers Served",
      value: 156,
      icon: Users,
      color: "text-blue-500",
    },
    {
      label: "Community Events",
      value: 12,
      icon: Heart,
      color: "text-red-500",
    },
    {
      label: "Success Stories",
      value: 48,
      icon: CheckCircle,
      color: "text-green-500",
    },
    {
      label: "Community Rating",
      value: "4.7",
      icon: Star,
      color: "text-yellow-500",
    },
  ];

  const contactFarmer = (farmer: any) => {
    toast.success(`Opening message to ${farmer.name}...`);
    navigate(`/cahw/messages?farmer=${farmer.id}`, { state: { farmer } });
  };

  const scheduleVisit = (farmer: any) => {
    toast.success(`Scheduling visit with ${farmer.name}...`);
    navigate(`/cahw/schedule-visit?farmer=${farmer.id}`, { state: { farmer } });
  };

  return (
    <SidebarLayout>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              Community Engagement
            </h1>
            <p className="text-muted-foreground">
              Connect with farmers and organize community health initiatives
            </p>
          </div>
          <button
            onClick={() => {
              toast.success("Opening workshop creation form...");
              navigate("/cahw/create-workshop");
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all font-medium"
          >
            <Plus className="h-5 w-5" />
            New Workshop
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {stat.value}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50">
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          {["farmers", "workshops", "impact"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-all ${
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "farmers"
                ? "My Farmers"
                : tab === "workshops"
                  ? "Workshops"
                  : "Impact"}
            </button>
          ))}
        </div>

        {/* Farmers Tab */}
        {activeTab === "farmers" && (
          <div className="grid grid-cols-1 gap-4">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading farmers...</div>
            ) : farmers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No farmers found</div>
            ) : (
              farmers.map((farmer) => (
                <div
                  key={farmer.id}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all"
                >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        {farmer.name}
                      </h3>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-medium text-foreground">
                          {farmer.rating}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {farmer.location}
                      </span>
                      <span>{farmer.animals} animals</span>
                      <span>{farmer.cases} cases handled</span>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      farmer.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {farmer.status === "active" ? "Active" : "Inactive"}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  Last contact: {farmer.lastContact}
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => contactFarmer(farmer)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-all"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Contact
                  </button>
                  <button
                    onClick={() => scheduleVisit(farmer)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-all"
                  >
                    <Heart className="h-4 w-4" />
                    Schedule Visit
                  </button>
                </div>
              </div>
            ))
            )}
          </div>
        )}

        {/* Workshops Tab */}
        {activeTab === "workshops" && (
          <div className="space-y-4">
            {workshops.map((workshop) => (
              <div
                key={workshop.id}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {workshop.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {workshop.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        📅 {new Date(workshop.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {workshop.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {workshop.attendees} attendees
                      </span>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                      workshop.status === "upcoming"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {workshop.status === "upcoming" ? "Upcoming" : "Completed"}
                  </span>
                </div>

                <button
                  onClick={() => {
                    toast.info(`Registered for ${workshop.title}`);
                  }}
                  className={`w-full py-2 rounded-lg font-medium text-sm transition-all ${
                    workshop.status === "completed"
                      ? "bg-gray-100 text-gray-600 cursor-not-allowed"
                      : "bg-primary text-white hover:bg-primary/90"
                  }`}
                  disabled={workshop.status === "completed"}
                >
                  {workshop.status === "completed" ? "Completed" : "Register"}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Impact Tab */}
        {activeTab === "impact" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Success Stories
              </h3>
              <div className="space-y-3">
                <div className="bg-white/50 rounded p-3">
                  <p className="text-sm font-medium text-green-900">
                    Emergency Response
                  </p>
                  <p className="text-xs text-green-800 mt-1">
                    Saved 12 cattle from disease outbreak
                  </p>
                </div>
                <div className="bg-white/50 rounded p-3">
                  <p className="text-sm font-medium text-green-900">
                    Community Training
                  </p>
                  <p className="text-xs text-green-800 mt-1">
                    Trained 48 farmers in vaccination techniques
                  </p>
                </div>
                <div className="bg-white/50 rounded p-3">
                  <p className="text-sm font-medium text-green-900">
                    Health Advocacy
                  </p>
                  <p className="text-xs text-green-800 mt-1">
                    Reduced disease incidents by 35%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <Award className="h-5 w-5" />
                Achievements
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🏆</span>
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Community Helper Badge
                    </p>
                    <p className="text-xs text-blue-800">
                      Awarded for outstanding service
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⭐</span>
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      5-Star Rating
                    </p>
                    <p className="text-xs text-blue-800">
                      From 156 satisfied farmers
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📈</span>
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Community Impact
                    </p>
                    <p className="text-xs text-blue-800">
                      Served over 150 farmers this year
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
