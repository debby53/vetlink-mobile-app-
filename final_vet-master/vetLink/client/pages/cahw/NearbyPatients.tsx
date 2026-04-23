import { useState } from 'react';
import SidebarLayout from '@/components/SidebarLayout';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Heart,
  AlertCircle,
  PhoneCall,
  MessageSquare,
  Search,
  Filter,
  Zap,
} from 'lucide-react';

export default function NearbyPatients() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAnimalType, setFilterAnimalType] = useState('all');

  const nearbyPatients = [
    {
      id: 'PAT-001',
      farmer: 'John Musyoka',
      phone: '+254712345678',
      animalName: 'Bessie',
      animalType: 'dairy-cow',
      breed: 'Friesian',
      age: '3 years',
      weight: '450 kg',
      healthStatus: 'excellent',
      distance: '2.5 km',
      location: 'Kigali Village A',
      lastCheckup: '2 weeks ago',
    },
    {
      id: 'PAT-002',
      farmer: 'Mary Kipchoge',
      phone: '+254798765432',
      animalName: 'Patches',
      animalType: 'goat',
      breed: 'Alpine',
      age: '2 years',
      weight: '80 kg',
      healthStatus: 'good',
      distance: '1.8 km',
      location: 'Kigali Village B',
      lastCheckup: '1 month ago',
    },
    {
      id: 'PAT-003',
      farmer: 'Joseph Mukama',
      phone: '+254702468135',
      animalName: 'Flock A',
      animalType: 'sheep',
      breed: 'Mixed',
      age: '1-3 years',
      weight: '40-50 kg',
      healthStatus: 'fair',
      distance: '3.2 km',
      location: 'Kigali Village C',
      lastCheckup: '1.5 months ago',
    },
    {
      id: 'PAT-004',
      farmer: 'Grace Nyambi',
      phone: '+254712121212',
      animalName: 'Porky',
      animalType: 'pig',
      breed: 'Landrace',
      age: '1 year',
      weight: '120 kg',
      healthStatus: 'excellent',
      distance: '5.1 km',
      location: 'Kigali Village D',
      lastCheckup: '3 weeks ago',
    },
    {
      id: 'PAT-005',
      farmer: 'Peter Kipchoge',
      phone: '+254709876543',
      animalName: 'Bull',
      animalType: 'beef-cattle',
      breed: 'Brahman',
      age: '4 years',
      weight: '600 kg',
      healthStatus: 'needs-attention',
      distance: '4.3 km',
      location: 'Kigali Village E',
      lastCheckup: '3 months ago',
    },
    {
      id: 'PAT-006',
      farmer: 'Alice Karanja',
      phone: '+254701111111',
      animalName: 'Leghorn Flock',
      animalType: 'chicken',
      breed: 'Leghorn',
      age: '1 year',
      weight: '1.5-2 kg',
      healthStatus: 'good',
      distance: '2.8 km',
      location: 'Kigali Village F',
      lastCheckup: '2 months ago',
    },
  ];

  const filteredPatients = nearbyPatients.filter(patient => {
    const matchesSearch = patient.farmer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         patient.animalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         patient.breed.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterAnimalType === 'all' || patient.animalType === filterAnimalType;
    return matchesSearch && matchesFilter;
  });

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'good':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'fair':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'needs-attention':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getHealthStatusIcon = (status: string) => {
    switch (status) {
      case 'needs-attention':
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <Heart className="h-5 w-5" />;
    }
  };

  const animalTypes = [
    { value: 'all', label: 'All Animals' },
    { value: 'dairy-cow', label: 'Dairy Cow' },
    { value: 'beef-cattle', label: 'Beef Cattle' },
    { value: 'goat', label: 'Goat' },
    { value: 'sheep', label: 'Sheep' },
    { value: 'pig', label: 'Pig' },
    { value: 'chicken', label: 'Chicken' },
  ];

  return (
    <SidebarLayout>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <button
              onClick={() => navigate('/dashboard/cahw')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Nearby Patients</h1>
              <p className="text-muted-foreground mt-1">
                Animals from farmers near you that you can help monitor
              </p>
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-sm font-medium text-green-900">Available Patients</p>
            <p className="text-2xl font-bold text-green-600">{filteredPatients.length}</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by farmer, animal, or breed..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
            />
          </div>
          <select
            value={filterAnimalType}
            onChange={(e) => setFilterAnimalType(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
          >
            {animalTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        {/* Patients Grid */}
        <div className="grid gap-4">
          {filteredPatients.map((patient) => (
            <div
              key={patient.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-foreground">{patient.animalName}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getHealthStatusColor(patient.healthStatus)} flex items-center gap-1`}>
                        {getHealthStatusIcon(patient.healthStatus)}
                        {patient.healthStatus === 'needs-attention' ? 'Needs Attention' : patient.healthStatus.charAt(0).toUpperCase() + patient.healthStatus.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Owner: <span className="font-medium text-foreground">{patient.farmer}</span>
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-sm">
                        <p className="text-muted-foreground text-xs mb-1">Type</p>
                        <p className="font-medium text-foreground">{patient.animalType.replace('-', ' ')}</p>
                      </div>
                      <div className="text-sm">
                        <p className="text-muted-foreground text-xs mb-1">Breed</p>
                        <p className="font-medium text-foreground">{patient.breed}</p>
                      </div>
                      <div className="text-sm">
                        <p className="text-muted-foreground text-xs mb-1">Age / Weight</p>
                        <p className="font-medium text-foreground">{patient.age} / {patient.weight}</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{patient.distance}</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Location</p>
                        <p className="text-foreground">{patient.location}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Last Checkup</p>
                        <p className="text-foreground">{patient.lastCheckup}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                  <a
                    href={`tel:${patient.phone}`}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg font-medium transition-all"
                  >
                    <PhoneCall className="h-4 w-4" />
                    Call Farmer
                  </a>
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg font-medium transition-all">
                    <MessageSquare className="h-4 w-4" />
                    Message
                  </button>
                  <button
                    onClick={() => navigate(`/farmer/details/${patient.id}`)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-foreground rounded-lg font-medium transition-all"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredPatients.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No patients found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? 'No patients match your search criteria.' : 'No nearby patients available at the moment.'}
            </p>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
