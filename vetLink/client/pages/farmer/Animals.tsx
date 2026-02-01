import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarLayout from '@/components/SidebarLayout';
import { Plus, Search, Heart, AlertCircle, Trash2, LayoutGrid, List as ListIcon, ChevronLeft, ChevronRight, Filter, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/lib/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { animalAPI, AnimalDTO } from '@/lib/apiService';

export default function Animals() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [animals, setAnimals] = useState<AnimalDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // View & Filter States
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState('all');
  const [filterHealth, setFilterHealth] = useState('all');

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [deleteAnimalId, setDeleteAnimalId] = useState<number | null>(null);

  useEffect(() => {
    loadAnimals();
  }, [user?.id]);

  const loadAnimals = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);
    try {
      const animalsData = await animalAPI.getAnimalsByFarmerId(user.id);
      setAnimals(animalsData);
    } catch (err: any) {
      console.error('Failed to load animals:', err);
      setError(err.message || 'Failed to load animals');
      toast.error('Failed to load animals');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteAnimalId) return;
    try {
      await animalAPI.deleteAnimal(deleteAnimalId);
      setAnimals(animals.filter(a => a.id !== deleteAnimalId));
      toast.success(t('animalDeleted') || 'Animal deleted successfully');
      setDeleteAnimalId(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete animal');
    }
  };

  // Filter Logic
  const filteredAnimals = animals.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.breed.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === 'all' || a.type === filterType;
    const matchesHealth = filterHealth === 'all' || a.healthStatus === filterHealth;

    return matchesSearch && matchesType && matchesHealth;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredAnimals.length / itemsPerPage);
  const paginatedAnimals = filteredAnimals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getHealthColor = (health: string) => {
    switch (health?.toLowerCase()) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'recovering':
        return 'bg-yellow-100 text-yellow-800';
      case 'caution':
      case 'at-risk':
        return 'bg-orange-100 text-orange-800';
      case 'sick':
      case 'under-treatment':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get unique animal types for filter
  const animalTypes = Array.from(new Set(animals.map(a => a.type)));

  return (
    <SidebarLayout>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground">{t('myAnimals')}</h1>
            <p className="text-muted-foreground mt-1">{t('pageSubtitleRecords')}</p>
          </div>
          <button
            onClick={() => {
              navigate('/farmer/animals/add');
              toast.info(t('openingAddAnimal'));
            }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-all shadow-sm hover:shadow-md"
          >
            <Plus className="h-5 w-5" />
            {t('addAnimal')}
          </button>
        </div>

        {/* Filters & Controls */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-1 gap-4 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 md:max-w-xs">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('searchPlaceholderAnimals')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent bg-white"
              >
                <option value="all">All Types</option>
                {animalTypes.map(type => (
                  <option key={type} value={type}>{t(type) || type}</option>
                ))}
              </select>

              <select
                value={filterHealth}
                onChange={(e) => setFilterHealth(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent bg-white"
              >
                <option value="all">All Status</option>
                <option value="healthy">{t('healthy') || 'Healthy'}</option>
                <option value="sick">{t('sick') || 'Sick'}</option>
                <option value="recovering">{t('recovering') || 'Recovering'}</option>
                <option value="under-treatment">{t('underTreatment') || 'Under Treatment'}</option>
              </select>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <LayoutGrid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <ListIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-muted-foreground">{t('loading') || 'Loading animals...'}</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Animals Grid View */}
        {!isLoading && !error && viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {paginatedAnimals.length > 0 ? (
              paginatedAnimals.map((animal) => (
                <div key={animal.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-foreground">{animal.name}</h3>
                        <p className="text-sm text-muted-foreground capitalize">{t(animal.type) || animal.type}</p>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${getHealthColor(animal.healthStatus)}`}>
                        {t(animal.healthStatus) || animal.healthStatus}
                      </span>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t('breed')}:</span>
                        <span className="font-medium">{animal.breed}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t('age')}:</span>
                        <span className="font-medium">{animal.age} {t('years')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t('weight')}:</span>
                        <span className="font-medium">{animal.weight ? `${animal.weight} kg` : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t('gender')}:</span>
                        <span className="font-medium capitalize">{t(animal.gender) || animal.gender}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-4 border-t border-gray-50">
                      <button
                        onClick={() => {
                          navigate(`/farmer/records`);
                          toast.info(t('viewingHealthRecords'));
                        }}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-all font-medium text-sm"
                      >
                        <Heart className="h-4 w-4" />
                        {t('viewHealth')}
                      </button>
                      <button
                        onClick={() => navigate(`/farmer/animals/edit/${animal.id}`)}
                        className="inline-flex items-center justify-center p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all"
                        title={t('edit') || 'Edit'}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteAnimalId(animal.id!)}
                        className="inline-flex items-center justify-center p-2 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                <p className="text-muted-foreground">{t('noAnimalsFound')}</p>
              </div>
            )}
          </div>
        )}

        {/* Animals List View */}
        {!isLoading && !error && viewMode === 'list' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {paginatedAnimals.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {paginatedAnimals.map((animal) => (
                  <div key={animal.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-gray-100 text-xl`}>
                        {animal.type === 'dairy-cow' ? '🐄' :
                          animal.type === 'chicken' ? '🐔' :
                            animal.type === 'goat' ? '🐐' :
                              animal.type === 'sheep' ? '🐑' : '🐾'}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{animal.name}</h3>
                        <p className="text-sm text-gray-500">{t(animal.type) || animal.type} • {animal.breed}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      <div className="hidden md:block text-right">
                        <p className="text-xs text-gray-500 uppercase">{t('status')}</p>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${getHealthColor(animal.healthStatus)}`}>
                          {t(animal.healthStatus) || animal.healthStatus}
                        </span>
                      </div>
                      <div className="hidden md:block text-right">
                        <p className="text-xs text-gray-500 uppercase">{t('weight')}</p>
                        <p className="font-medium">{animal.weight ? `${animal.weight} kg` : 'N/A'}</p>
                      </div>
                      <div className="hidden md:block text-right">
                        <p className="text-xs text-gray-500 uppercase">{t('age')}</p>
                        <p className="font-medium">{animal.age} {t('years')}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/farmer/records`)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                        title={t('viewHealth')}
                      >
                        <Heart className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => navigate(`/farmer/animals/edit/${animal.id}`)}
                        className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg"
                        title={t('edit') || 'Edit'}
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setDeleteAnimalId(animal.id!)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        title={t('delete')}
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-muted-foreground">
                {t('noAnimalsFound')}
              </div>
            )}
          </div>
        )}

        {/* Pagination Controls */}
        {!isLoading && !error && filteredAnimals.length > itemsPerPage && (
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-sm font-medium text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}

      </div>

      {/* Custom Delete Confirmation Modal */}
      {deleteAnimalId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl animate-in fade-in zoom-in duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{t('deleteConfirmTitle') || 'Delete Animal?'}</h3>
              <p className="text-sm text-gray-500 mb-6">
                {t('deleteConfirmMessage') || 'Are you sure you want to delete this animal? This action cannot be undone.'}
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setDeleteAnimalId(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                >
                  {t('delete')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </SidebarLayout>
  );
}
