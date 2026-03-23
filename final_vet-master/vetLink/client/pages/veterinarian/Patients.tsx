import { useState, useEffect } from 'react';
import SidebarLayout from '@/components/SidebarLayout';
import { Search, Phone, Mail, MapPin, Heart } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { userAPI, animalAPI, caseAPI, UserDTO } from '@/lib/apiService';

export default function Patients() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState<any[]>([]);

  useEffect(() => {
    const loadPatients = async () => {
      try {
        const farmers: UserDTO[] = await userAPI.getUsersByRole('farmer');
        const enriched: any[] = [];
        for (const f of farmers) {
          try {
            const animals = await animalAPI.getAnimalsByFarmerId(f.id as number);
            const cases = await caseAPI.getCasesByFarmerId(f.id as number);
            const activeCases = cases.filter((c) => c.status !== 'resolved').length;
            enriched.push({
              id: f.id,
              farmer: f.name,
              phone: '',
              email: f.email,
              location: f.locationName || '',
              animals: animals.length,
              activeCases,
              lastVisit: '',
            });
          } catch (inner) {
            console.error('Failed to enrich farmer', inner);
            enriched.push({ id: f.id, farmer: f.name, email: f.email, animals: 0, activeCases: 0, location: f.locationName || '' });
          }
        }
        setPatients(enriched);
      } catch (err) {
        console.error('Failed to load farmers', err);
      }
    };
    loadPatients();
  }, [user?.id]);

  const filteredPatients = patients.filter((p) =>
    (p.farmer || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.location || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SidebarLayout>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-foreground">Farmers</h1>
          <p className="text-muted-foreground mt-1">Manage and track farmer accounts</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, email, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Patients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPatients.length > 0 ? (
            filteredPatients.map((patient) => (
              <div key={patient.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{patient.farmer}</h3>
                    <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
                      <MapPin className="h-4 w-4" />
                      {patient.location}
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
                    {patient.animals} Animals
                  </span>
                </div>

                <div className="space-y-2 mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-primary" />
                    <span className="text-foreground">{patient.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-primary" />
                    <span className="text-foreground">{patient.email}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Active Cases</p>
                    <p className="font-bold text-lg text-foreground">{patient.activeCases}</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Last Visit</p>
                    <p className="font-bold text-foreground text-sm">
                      {new Date(patient.lastVisit).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-all font-medium text-sm">
                    View Profile
                  </button>
                  <button className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-foreground hover:bg-gray-50 transition-all font-medium text-sm">
                    Call
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-12 bg-white rounded-lg">
              <p className="text-muted-foreground">No patients found</p>
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}
