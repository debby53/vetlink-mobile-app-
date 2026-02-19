import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarLayout from '@/components/SidebarLayout';
import { Plus, Search, Filter, Eye, Archive, Trash2, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';
import { useLanguage } from '@/lib/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { caseAPI, animalAPI, CaseDTO, AnimalDTO } from '@/lib/apiService';
import { formatDate } from '@/lib/dateUtils';

export default function FarmerCases() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [caseToDelete, setCaseToDelete] = useState<number | null>(null);
  const [cases, setCases] = useState<any[]>([]);
  const [animals, setAnimals] = useState<{ [key: number]: AnimalDTO }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCases();
  }, [user?.id]);

  const loadCases = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);
    try {
      const casesData = await caseAPI.getCasesByFarmerId(user.id);
      setCases(casesData);

      // Load animal details for each case
      const animalsMap: { [key: number]: AnimalDTO } = {};
      for (const caze of casesData) {
        if (caze.animalId && !animalsMap[caze.animalId]) {
          try {
            const animal = await animalAPI.getAnimalById(caze.animalId);
            animalsMap[caze.animalId] = animal;
          } catch (err) {
            console.error(`Failed to load animal ${caze.animalId}:`, err);
          }
        }
      }
      setAnimals(animalsMap);
    } catch (err: any) {
      console.error('Failed to load cases:', err);
      setError(err.message || 'Failed to load cases');
      toast.error('Failed to load cases');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (caseId: number) => {
    setCaseToDelete(caseId);
  };

  const confirmDelete = async () => {
    if (!caseToDelete) return;

    try {
      await caseAPI.deleteCase(caseToDelete);
      setCases(cases.filter(c => c.id !== caseToDelete));
      toast.success(t('caseDeleted') || 'Case deleted successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete case');
    } finally {
      setCaseToDelete(null);
    }
  };

  const filteredCases = cases.filter((c) => {
    const animalName = animals[c.animalId]?.name || 'Unknown';
    const matchesSearch =
      animalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toString().includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || c.status?.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <SidebarLayout>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">{t('myCases')}</h1>
            <p className="text-muted-foreground mt-1">{t('trackManageCases')}</p>
          </div>
          <button
            onClick={() => {
              navigate('/farmer/cases/new');
              toast.info(t('openingNewCase'));
            }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition-all"
          >
            <Plus className="h-5 w-5" />
            {t('newCase')}
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 space-y-4">
          <div className="flex gap-4 flex-col md:flex-row">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder={t('searchPlaceholderCases')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-foreground hover:bg-gray-50 transition-all">
              <Filter className="h-5 w-5" />
              {t('filter')}
            </button>
          </div>

          {/* Status Tabs */}
          <div className="flex gap-2 flex-wrap">
            {['all', 'open', 'in_progress', 'closed'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${statusFilter === status
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-foreground hover:bg-gray-200'
                  }`}
              >
                {status === 'all' ? t('allCases') : t(status)}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-muted-foreground">{t('loading') || 'Loading cases...'}</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Cases List */}
        <div className="space-y-4">
          {filteredCases.length > 0 ? (
            filteredCases.map((c) => {
              const animal = animals[c.animalId];
              return (
                <div key={c.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-foreground">
                          {animal?.name || 'Unknown Animal'}
                        </h3>
                        {c.status === 'OPEN' && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold">
                            <Clock className="h-3 w-3" />
                            {t('open')}
                          </span>
                        )}
                        {c.status === 'CLOSED' && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold">
                            <CheckCircle className="h-3 w-3" />
                            {t('closed')}
                          </span>
                        )}
                        {c.status === 'IN_PROGRESS' && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
                            <Clock className="h-3 w-3" />
                            {t('inProgress') || 'In Progress'}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{c.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${c.severity >= 7
                      ? 'bg-red-100 text-red-800'
                      : c.severity >= 5
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                      }`}>
                      {t('severity')}: {c.severity}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-xs text-muted-foreground">{t('caseId')}</p>
                      <p className="font-semibold text-foreground">#{c.id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t('type')}</p>
                      <p className="font-semibold text-foreground">{c.caseType}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t('date')}</p>
                      <p className="font-semibold text-foreground">
                        {formatDate(c.createdAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t('status')}</p>
                      <p className="font-semibold text-foreground">{c.status}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        navigate(`/farmer/details/${c.id}`);
                        toast.info(`${t('loadingDetails')} ${c.id}`);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-all font-medium text-sm"
                    >
                      <Eye className="h-4 w-4" />
                      {t('viewDetails')}
                    </button>

                    <button
                      onClick={() => handleDeleteClick(c.id)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition-all font-medium text-sm"
                    >
                      <Trash2 className="h-4 w-4" />
                      {t('delete') || 'Delete'}
                    </button>
                  </div>
                </div>
              );
            })
          ) : !isLoading && !error ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-muted-foreground">{t('noCasesFound') || 'No cases found'}</p>
            </div>
          ) : null}
        </div>

        <AlertDialog open={!!caseToDelete} onOpenChange={(open) => !open && setCaseToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('deleteThisCase') || 'Delete Case?'}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('deleteCaseConfirmMessage') || 'This action cannot be undone.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('cancel') || 'Cancel'}</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                {t('delete') || 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </SidebarLayout >
  );
}
