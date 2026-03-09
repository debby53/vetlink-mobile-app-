import { useState, useEffect } from "react";
import SidebarLayout from "@/components/SidebarLayout";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { caseAPI, userAPI, animalAPI, certificationAPI } from "@/lib/apiService";
import { formatDate } from "@/lib/dateUtils";
import { toast } from "sonner";
import {
  ArrowLeft,
  MapPin,
  Clock,
  AlertCircle,
  PhoneCall,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Search,
  Filter,
  Lock,
  ArrowUp,
} from "lucide-react";

export default function NearbyCases() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterUrgency, setFilterUrgency] = useState("all");
  const [cases, setCases] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCertified, setIsCertified] = useState(false);

  // Modal states
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [selectedCaseForModal, setSelectedCaseForModal] = useState<number | null>(null);
  const [escalationReason, setEscalationReason] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    checkCertificationAndLoadCases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleMarkAsReceived = async (caseId: number) => {
    try {
      await caseAPI.markCaseAsReceived(caseId, user?.id);
      setCases(cases.map(c => c.id === caseId ? { ...c, status: 'RECEIVED' } : c));
      toast.success('Case marked as received - farmer notified');
    } catch (err: any) {
      toast.error(err.message || 'Failed to mark case as received');
    }
  };

  const handleMarkAsCompleted = async (caseId: number) => {
    setSelectedCaseForModal(caseId);
    setShowCompletionModal(true);
  };

  const submitCompletion = async () => {
    if (!diagnosis.trim() || !treatment.trim()) {
      toast.error('Please fill in both diagnosis and treatment');
      return;
    }

    if (!selectedCaseForModal) return;

    setIsSubmitting(true);
    try {
      await caseAPI.markCaseAsCompleted(selectedCaseForModal, {
        diagnosis,
        treatment,
        cahwId: user?.id
      });
      setCases(cases.map(c => c.id === selectedCaseForModal ? { ...c, status: 'COMPLETED' } : c));
      toast.success('Case marked as completed and farmer notified');
      setShowCompletionModal(false);
      setDiagnosis("");
      setTreatment("");
      setSelectedCaseForModal(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to mark case as completed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEscalateCase = async (caseId: number) => {
    setSelectedCaseForModal(caseId);
    setShowEscalateModal(true);
    setEscalationReason("");
  };

  const submitEscalation = async () => {
    if (!escalationReason.trim()) {
      toast.error('Please provide an escalation reason');
      return;
    }

    if (!selectedCaseForModal) return;

    setIsSubmitting(true);
    try {
      await caseAPI.escalateCase(selectedCaseForModal, escalationReason);
      setCases(cases.map(c => c.id === selectedCaseForModal ? { ...c, isEscalated: true } : c));
      toast.success('Case escalated successfully! Veterinarians in your sector have been notified');
      setShowEscalateModal(false);
      setEscalationReason("");
      setSelectedCaseForModal(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to escalate case');
    } finally {
      setIsSubmitting(false);
    }
  };

  const checkCertificationAndLoadCases = async () => {
    if (!user?.id || !user?.locationId) {
      toast.error("User location not found");
      return;
    }

    setIsLoading(true);
    try {
      // Check if user is certified
      const certs = await certificationAPI.getCertificationsByUserId(user.id);
      if (certs && certs.length > 0) {
        setIsCertified(true);
      } else {
        toast.error("You must be certified to view and assist cases");
        setIsCertified(false);
        setIsLoading(false);
        return;
      }

      // Load cases available in the CAHW's location using the new endpoint
      const allCases = await caseAPI.getCasesByCAHWLocation(user.id);
      const casesWithDetails = await Promise.all(
        allCases.map(async (caze: any) => {
          const farmer = await userAPI.getUserById(caze.farmerId);
          const animal = await animalAPI.getAnimalById(caze.animalId);
          return {
            id: caze.id,
            farmerId: caze.farmerId,
            farmer: farmer?.name || "Unknown",
            phone: farmer?.phone || "+254000000000",
            animal: caze.animalName || animal?.name || "Animal",
            issue: caze.title || caze.issue || "",
            distance: Math.round((Math.random() * 5 + 0.5) * 10) / 10 + " km",
            urgency:
              caze.severity > 7
                ? "critical"
                : caze.severity > 5
                  ? "high"
                  : caze.severity > 2
                    ? "medium"
                    : "low",
            status: caze.status,
            isEscalated: Boolean(caze.isEscalated),
            location: caze.locationName || "Location unavailable",
            lastUpdated: formatDate(caze.updatedAt || caze.createdAt),
          };
        }),
      );
      setCases(casesWithDetails);
    } catch (err: any) {
      console.error("Error loading cases:", err);
      toast.error("Failed to load cases");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCases = cases.filter((caseItem) => {
    const matchesSearch =
      caseItem.farmer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseItem.animal.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseItem.issue.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterUrgency === "all" || caseItem.urgency === filterUrgency;
    return matchesSearch && matchesFilter;
  });

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-300";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "low":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case "critical":
      case "high":
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  return (
    <SidebarLayout>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Certification Alert */}
        {!isCertified && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
            <Lock className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900">Certification Required</p>
              <p className="text-sm text-amber-800 mt-1">You must complete and pass training certifications to view and assist cases in your location.</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <button
              onClick={() => navigate("/dashboard/cahw")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Nearby Cases</h1>
              <p className="text-muted-foreground mt-1">Cases from farmers near you that need assistance</p>
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-sm font-medium text-green-900">Available Cases</p>
            <p className="text-2xl font-bold text-green-600">{isCertified ? filteredCases.length : 0}</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by farmer, animal, or issue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
            />
          </div>
          <select
            value={filterUrgency}
            onChange={(e) => setFilterUrgency(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
          >
            <option value="all">All Urgencies</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Not Certified Message */}
        {!isCertified && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <Lock className="h-12 w-12 text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-red-900 mb-2">Access Restricted</h3>
            <p className="text-red-800 mb-4">You need to complete training certifications to view and assist cases in your location.</p>
            <button
              onClick={() => navigate('/cahw/training')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              View Certifications
            </button>
          </div>
        )}

        {/* Cases Grid */}
        {isCertified && (
          <div className="grid gap-4">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading cases...</div>
            ) : (
              filteredCases.map((caseItem) => (
                <div
                  key={caseItem.id}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-foreground">{caseItem.farmer}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getUrgencyColor(caseItem.urgency)} flex items-center gap-1`}>
                            {getUrgencyIcon(caseItem.urgency)}
                            {caseItem.urgency.charAt(0).toUpperCase() + caseItem.urgency.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{caseItem.issue}</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{caseItem.distance}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{caseItem.lastUpdated}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">{caseItem.animal}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <span className="font-medium">{caseItem.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-gray-200 flex-wrap">
                      {caseItem.status === 'OPEN' && (
                        <button
                          onClick={() => handleMarkAsReceived(caseItem.id)}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg font-medium transition-all flex-1 min-w-[150px]"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Mark Received
                        </button>
                      )}
                      {(caseItem.status === 'OPEN' || caseItem.status === 'RECEIVED' || caseItem.status === 'IN_PROGRESS') && (
                        <button
                          onClick={() => handleMarkAsCompleted(caseItem.id)}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg font-medium transition-all flex-1 min-w-[150px]"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Mark Completed
                        </button>
                      )}
                      {(caseItem.status === 'RECEIVED' || caseItem.status === 'IN_PROGRESS') && !caseItem.isEscalated && (
                        <button
                          onClick={() => handleEscalateCase(caseItem.id)}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-lg font-medium transition-all flex-1 min-w-[150px]"
                        >
                          <ArrowUp className="h-4 w-4" />
                          Escalate to Vet
                        </button>
                      )}
                      {caseItem.isEscalated && (
                        <div className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg font-medium text-sm">
                          <AlertTriangle className="h-4 w-4" />
                          Escalated
                        </div>
                      )}
                      <a href={`tel:${caseItem.phone}`} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-lg font-medium transition-all min-w-[150px]">
                        <PhoneCall className="h-4 w-4" />
                        Call
                      </a>
                      <button
                        onClick={() => {
                          toast.success(`Opening message with ${caseItem.farmer}...`);
                          navigate(`/cahw/messages?case=${caseItem.id}&farmer=${caseItem.farmerId}`, { state: { case: caseItem } });
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg font-medium transition-all min-w-[150px]"
                      >
                        <MessageSquare className="h-4 w-4" />
                        Message
                      </button>
                      <button
                        onClick={() => {
                          toast.success(`Loading case details...`);
                          navigate(`/farmer/details/${caseItem.id}`, { state: { case: caseItem } });
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-foreground rounded-lg font-medium transition-all min-w-[150px]"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}

            {filteredCases.length === 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No cases found</h3>
                <p className="text-muted-foreground">{searchQuery ? "No cases match your search criteria." : "No nearby cases available at the moment."}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Escalate Case Modal */}
      {showEscalateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-amber-100 p-3 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Escalate Case</h2>
                <p className="text-sm text-muted-foreground">Send this case to veterinarians for expert assistance</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">Case:</span> {cases.find(c => c.id === selectedCaseForModal)?.issue}
              </p>
              <p className="text-sm text-blue-900 mt-1">
                <span className="font-semibold">Animal:</span> {cases.find(c => c.id === selectedCaseForModal)?.animal}
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Reason for Escalation *
                </label>
                <textarea
                  value={escalationReason}
                  onChange={(e) => setEscalationReason(e.target.value)}
                  placeholder="Explain why this case needs veterinarian expertise..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                  rows={5}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowEscalateModal(false);
                  setEscalationReason("");
                  setSelectedCaseForModal(null);
                }}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-foreground hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={submitEscalation}
                disabled={isSubmitting || !escalationReason.trim()}
                className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ArrowUp className="h-4 w-4" />
                {isSubmitting ? 'Escalating...' : 'Escalate Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mark Completed Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Mark Case as Completed</h2>
                <p className="text-sm text-muted-foreground">Document your diagnosis and treatment</p>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-900">
                <span className="font-semibold">Case:</span> {cases.find(c => c.id === selectedCaseForModal)?.issue}
              </p>
              <p className="text-sm text-green-900 mt-1">
                <span className="font-semibold">Animal:</span> {cases.find(c => c.id === selectedCaseForModal)?.animal}
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Diagnosis *
                </label>
                <textarea
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="What is the diagnosis? (e.g., Bacterial infection, Dehydration)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Treatment *
                </label>
                <textarea
                  value={treatment}
                  onChange={(e) => setTreatment(e.target.value)}
                  placeholder="What treatment was provided? (e.g., Antibiotics, Rest, Medication dosage)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCompletionModal(false);
                  setDiagnosis("");
                  setTreatment("");
                  setSelectedCaseForModal(null);
                }}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-foreground hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={submitCompletion}
                disabled={isSubmitting || !diagnosis.trim() || !treatment.trim()}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                {isSubmitting ? 'Saving...' : 'Complete Case'}
              </button>
            </div>
          </div>
        </div>
      )}
    </SidebarLayout>
  );
}
