import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarLayout from '@/components/SidebarLayout';
import { useLanguage } from '@/lib/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { Plus, Search, Calendar, Check, X, AlertCircle, MapPin, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { visitAPI, userAPI, animalAPI, caseAPI, VisitDTO, AnimalDTO, UserDTO, CaseDTO } from '@/lib/apiService';

export default function ScheduleVisit() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewVisit, setShowNewVisit] = useState(false);
  const [visits, setVisits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [animals, setAnimals] = useState<{ [key: number]: AnimalDTO }>({});
  const [farmers, setFarmers] = useState<{ [key: number]: UserDTO }>({});
  const [veterinarians, setVeterinarians] = useState<{ [key: number]: UserDTO }>({});
  const [cases, setCases] = useState<CaseDTO[]>([]);
  
  const [formData, setFormData] = useState({
    farmerId: '',
    veterinarianId: user?.id || '',
    animalId: '',
    caseId: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '10:00',
    purpose: '',
    notes: '',
    location: '',
  });

  const isVeterinarian = user?.role === 'veterinarian';

  const filteredVisits = visits.filter((v) =>
    (v.farmerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (v.animalName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (v.purpose || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const deleteVisit = async (id: number) => {
    if (!confirm(t('confirmDelete') || 'Delete this visit?')) return;
    try {
      await visitAPI.deleteVisit(id);
      setVisits((prev) => prev.filter((v) => v.id !== id));
      toast.success('Visit deleted successfully');
    } catch (err: any) {
      console.error('Failed to delete visit:', err);
      toast.error(err.message || 'Failed to delete visit');
    }
  };

  const completeVisit = async (id: number) => {
    try {
      await visitAPI.completeVisit(id);
      setVisits((prev) =>
        prev.map((v) => (v.id === id ? { ...v, status: 'COMPLETED' } : v))
      );
      toast.success('Visit marked as completed');
    } catch (err: any) {
      console.error('Failed to complete visit:', err);
      toast.error(err.message || 'Failed to complete visit');
    }
  };

  const cancelVisit = async (id: number) => {
    try {
      await visitAPI.cancelVisit(id);
      setVisits((prev) =>
        prev.map((v) => (v.id === id ? { ...v, status: 'CANCELLED' } : v))
      );
      toast.success('Visit cancelled');
    } catch (err: any) {
      console.error('Failed to cancel visit:', err);
      toast.error(err.message || 'Failed to cancel visit');
    }
  };

  useEffect(() => {
    const loadVisits = async () => {
      if (!user?.id) return;
      setIsLoading(true);
      try {
        let visitsData: VisitDTO[] = [];
        
        if (isVeterinarian) {
          visitsData = await visitAPI.getVisitsByVeterinarianId(user.id);
        } else {
          visitsData = await visitAPI.getVisitsByFarmerId(user.id);
        }

        const enriched: any[] = [];
        const animalsMap: { [key: number]: AnimalDTO } = {};
        const farmersMap: { [key: number]: UserDTO } = {};
        const veterinariansMap: { [key: number]: UserDTO } = {};

        for (const visit of visitsData) {
          try {
            // Get farmer
            let farmer = farmersMap[visit.farmerId];
            if (!farmer) {
              farmer = await userAPI.getUserById(visit.farmerId);
              farmersMap[visit.farmerId] = farmer;
            }

            // Get veterinarian
            let veterinarian = veterinariansMap[visit.veterinarianId];
            if (!veterinarian) {
              veterinarian = await userAPI.getUserById(visit.veterinarianId);
              veterinariansMap[visit.veterinarianId] = veterinarian;
            }

            // Get animal if present
            let animal = null;
            if (visit.animalId) {
              animal = animalsMap[visit.animalId];
              if (!animal) {
                animal = await animalAPI.getAnimalById(visit.animalId);
                animalsMap[visit.animalId] = animal;
              }
            }

            enriched.push({
              ...visit,
              farmerName: farmer?.name || 'Unknown',
              veterinarianName: veterinarian?.name || 'Unknown',
              animalName: animal?.name || 'Unknown',
            });
          } catch (inner) {
            console.error('Failed to enrich visit', inner);
            enriched.push(visit);
          }
        }

        setAnimals(animalsMap);
        setFarmers(farmersMap);
        setVeterinarians(veterinariansMap);
        setVisits(enriched);
      } catch (err: any) {
        console.error('Failed to load visits:', err);
        toast.error('Failed to load visits');
      } finally {
        setIsLoading(false);
      }
    };

    loadVisits();
  }, [user?.id, isVeterinarian]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return <Clock className="h-4 w-4" />;
      case 'COMPLETED':
        return <Check className="h-4 w-4" />;
      case 'CANCELLED':
        return <X className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <SidebarLayout>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Schedule Visit</h1>
            <p className="text-muted-foreground mt-1">
              {isVeterinarian ? 'Schedule farm visits' : 'Request veterinary visits'}
            </p>
          </div>
          <button
            onClick={() => setShowNewVisit(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all"
          >
            <Plus className="h-5 w-5" />
            Schedule Visit
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search visits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-muted-foreground">Loading visits...</p>
          </div>
        )}

        {/* Visits Grid */}
        <div className="grid grid-cols-1 gap-4">
          {filteredVisits.length > 0 ? (
            filteredVisits.map((visit) => (
              <div
                key={visit.id}
                className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-foreground">
                        {isVeterinarian ? visit.farmerName : visit.veterinarianName}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                          visit.status
                        )}`}
                      >
                        {getStatusIcon(visit.status)}
                        {visit.status}
                      </span>
                    </div>
                    {visit.animalName && (
                      <p className="text-sm text-muted-foreground">Animal: {visit.animalName}</p>
                    )}
                    <p className="text-sm text-muted-foreground mt-1">{visit.purpose}</p>
                  </div>
                  <div className="flex gap-2">
                    {visit.status === 'SCHEDULED' && (
                      <>
                        <button
                          onClick={() => completeVisit(visit.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all"
                          title="Mark as completed"
                        >
                          <Check className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => cancelVisit(visit.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Cancel visit"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => deleteVisit(visit.id)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                      title="Delete visit"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                      <Calendar className="h-4 w-4" />
                      Date
                    </div>
                    <p className="font-semibold text-foreground">
                      {new Date(visit.scheduledDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                      <Clock className="h-4 w-4" />
                      Time
                    </div>
                    <p className="font-semibold text-foreground">
                      {new Date(visit.scheduledDate).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  {visit.location && (
                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                        <MapPin className="h-4 w-4" />
                        Location
                      </div>
                      <p className="font-semibold text-foreground">{visit.location}</p>
                    </div>
                  )}
                </div>

                {visit.notes && (
                  <div className="mt-4">
                    <p className="text-xs text-muted-foreground mb-1">Notes:</p>
                    <p className="text-sm text-foreground">{visit.notes}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-lg">
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No visits scheduled yet</p>
            </div>
          )}
        </div>

        {/* New Visit Modal */}
        {showNewVisit && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-foreground mb-6">Schedule Visit</h2>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!formData.farmerId || !formData.scheduledDate || !formData.purpose) {
                    toast.error('Please fill in all required fields');
                    return;
                  }

                  try {
                    const scheduledDateTime = new Date(
                      `${formData.scheduledDate}T${formData.scheduledTime}`
                    ).toISOString();

                    const visitData: VisitDTO = {
                      veterinarianId: Number(isVeterinarian ? user?.id : formData.veterinarianId),
                      farmerId: Number(isVeterinarian ? formData.farmerId : user?.id),
                      animalId: formData.animalId ? Number(formData.animalId) : undefined,
                      caseId: formData.caseId ? Number(formData.caseId) : undefined,
                      scheduledDate: scheduledDateTime,
                      purpose: formData.purpose,
                      notes: formData.notes,
                      location: formData.location,
                    };

                    const newVisit = await visitAPI.createVisit(visitData);
                    toast.success('Visit scheduled successfully');
                    setShowNewVisit(false);
                    setFormData({
                      farmerId: '',
                      veterinarianId: user?.id || '',
                      animalId: '',
                      caseId: '',
                      scheduledDate: new Date().toISOString().split('T')[0],
                      scheduledTime: '10:00',
                      purpose: '',
                      notes: '',
                      location: '',
                    });

                    // Reload visits
                    if (user?.id) {
                      let visitsData: VisitDTO[] = [];
                      if (isVeterinarian) {
                        visitsData = await visitAPI.getVisitsByVeterinarianId(user.id);
                      } else {
                        visitsData = await visitAPI.getVisitsByFarmerId(user.id);
                      }

                      const enriched: any[] = [];
                      const animalsMap: { [key: number]: AnimalDTO } = {};
                      const farmersMap: { [key: number]: UserDTO } = {};
                      const veterinariansMap: { [key: number]: UserDTO } = {};

                      for (const visit of visitsData) {
                        try {
                          let farmer = farmersMap[visit.farmerId];
                          if (!farmer) {
                            farmer = await userAPI.getUserById(visit.farmerId);
                            farmersMap[visit.farmerId] = farmer;
                          }

                          let veterinarian = veterinariansMap[visit.veterinarianId];
                          if (!veterinarian) {
                            veterinarian = await userAPI.getUserById(visit.veterinarianId);
                            veterinariansMap[visit.veterinarianId] = veterinarian;
                          }

                          let animal = null;
                          if (visit.animalId) {
                            animal = animalsMap[visit.animalId];
                            if (!animal) {
                              animal = await animalAPI.getAnimalById(visit.animalId);
                              animalsMap[visit.animalId] = animal;
                            }
                          }

                          enriched.push({
                            ...visit,
                            farmerName: farmer?.name || 'Unknown',
                            veterinarianName: veterinarian?.name || 'Unknown',
                            animalName: animal?.name || 'Unknown',
                          });
                        } catch (inner) {
                          console.error('Failed to enrich visit', inner);
                          enriched.push(visit);
                        }
                      }

                      setAnimals(animalsMap);
                      setFarmers(farmersMap);
                      setVeterinarians(veterinariansMap);
                      setVisits(enriched);
                    }
                  } catch (err: any) {
                    console.error('Failed to schedule visit:', err);
                    toast.error(err.message || 'Failed to schedule visit');
                  }
                }}
                className="space-y-4"
              >
                {isVeterinarian && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Farmer *
                    </label>
                    <input
                      type="text"
                      value={formData.farmerId}
                      onChange={(e) => setFormData({ ...formData, farmerId: e.target.value })}
                      placeholder="Enter farmer ID"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                )}

                {!isVeterinarian && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Veterinarian *
                    </label>
                    <input
                      type="text"
                      value={formData.veterinarianId}
                      onChange={(e) => setFormData({ ...formData, veterinarianId: e.target.value })}
                      placeholder="Enter veterinarian ID"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Animal
                  </label>
                  <select
                    value={formData.animalId}
                    onChange={(e) => setFormData({ ...formData, animalId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Select an animal (optional)</option>
                    {Object.values(animals).map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Case ID (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.caseId}
                    onChange={(e) => setFormData({ ...formData, caseId: e.target.value })}
                    placeholder="Enter case ID (optional)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={formData.scheduledDate}
                      onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Time *
                    </label>
                    <input
                      type="time"
                      value={formData.scheduledTime}
                      onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Purpose *
                  </label>
                  <textarea
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    placeholder="Reason for the visit"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    rows={3}
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Farm address or location"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    rows={2}
                  ></textarea>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowNewVisit(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-foreground hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-all"
                  >
                    Schedule Visit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
