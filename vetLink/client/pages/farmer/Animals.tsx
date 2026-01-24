import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarLayout from '@/components/SidebarLayout';
import { Plus, Search, Heart, AlertCircle, Edit, Trash2 } from 'lucide-react';
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

  const filteredAnimals = animals.filter((a) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.breed.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getHealthColor = (health: string) => {
    switch (health?.toLowerCase()) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'recovering':
        return 'bg-yellow-100 text-yellow-800';
      case 'caution':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <SidebarLayout>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">{t('myAnimals')}</h1>
            <p className="text-muted-foreground mt-1">{t('pageSubtitleRecords')}</p>
          </div>
          <button
            onClick={() => {
              navigate('/farmer/animals/add');
              toast.info(t('openingAddAnimal'));
            }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition-all"
          >
            <Plus className="h-5 w-5" />
            {t('addAnimal')}
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder={t('searchPlaceholderAnimals')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
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

        {/* Animals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAnimals.length > 0 ? (
            filteredAnimals.map((animal) => (
              <div key={animal.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-foreground">{animal.name}</h3>
                      <p className="text-sm text-muted-foreground">{animal.type} - {animal.breed}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getHealthColor(animal.healthStatus)}`}>
                      {t(animal.healthStatus)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-xs text-muted-foreground">{t('age')}</p>
                      <p className="font-semibold text-foreground">{animal.age} {t('years')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t('weight')}</p>
                      <p className="font-semibold text-foreground">{animal.weight || 'N/A'} kg</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground">{t('registered')}</p>
                      <p className="font-semibold text-foreground">
                        {animal.createdAt ? new Date(animal.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-foreground mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    {t('gender')}: {animal.gender}
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        navigate(`/farmer/records`);
                        toast.info(t('viewingHealthRecords'));
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-all font-medium text-sm"
                    >
                      <Heart className="h-4 w-4" />
                      {t('viewHealth')}
                    </button>
                    <button
                      onClick={() => setDeleteAnimalId(animal.id!)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition-all font-medium text-sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : !isLoading && !error ? (
            <div className="col-span-2 text-center py-12 bg-white rounded-lg">
              <p className="text-muted-foreground">{t('noAnimalsFound')}</p>
            </div>
          ) : null}
        </div>
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
