import { useState, useEffect } from 'react';
import SidebarLayout from '@/components/SidebarLayout';
import { useLanguage } from '@/lib/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { Plus, Search, Download, FileText, Calendar, User, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { healthRecordAPI, animalAPI, HealthRecordDTO, AnimalDTO } from '@/lib/apiService';

export default function HealthRecords() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewRecord, setShowNewRecord] = useState(false);
  const [editingRecord, setEditingRecord] = useState<HealthRecordDTO | null>(null);
  const [deleteRecordId, setDeleteRecordId] = useState<number | null>(null);

  const [records, setRecords] = useState<HealthRecordDTO[]>([]);
  const [animals, setAnimals] = useState<{ [key: number]: AnimalDTO }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHealthRecords();
  }, [user?.id]);

  const loadHealthRecords = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);
    try {
      // First, get all animals for this farmer
      const animalsData = await animalAPI.getAnimalsByFarmerId(user.id);
      const animalsMap: { [key: number]: AnimalDTO } = {};

      // Then, get health records for each animal
      const allRecords: HealthRecordDTO[] = [];
      for (const animal of animalsData) {
        if (animal.id) {
          animalsMap[animal.id] = animal;
          try {
            const animalRecords = await healthRecordAPI.getHealthRecordsByAnimalId(animal.id);
            allRecords.push(...animalRecords);
          } catch (err) {
            console.error(`Failed to load records for animal ${animal.id}:`, err);
          }
        }
      }

      setAnimals(animalsMap);
      setRecords(allRecords.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA; // Most recent first
      }));
    } catch (err: any) {
      console.error('Failed to load health records:', err);
      setError(err.message || 'Failed to load health records');
      toast.error('Failed to load health records');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteRecordId) return;
    try {
      await healthRecordAPI.deleteHealthRecord(deleteRecordId);
      setRecords(records.filter(r => r.id !== deleteRecordId));
      toast.success(t('recordDeleted') || 'Record deleted successfully');
      setDeleteRecordId(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete record');
    }
  };

  const handleSaveRecord = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const animalId = Number(formData.get('animalId'));
    const recordData: any = {
      animalId,
      recordType: formData.get('recordType') as string,
      details: formData.get('details') as string,
      diagnosis: formData.get('diagnosis') as string,
      treatment: formData.get('treatment') as string,
      weight: formData.get('weight') ? Number(formData.get('weight')) : undefined,
    };

    try {
      if (editingRecord?.id) {
        // Update
        const updated = await healthRecordAPI.updateHealthRecord(editingRecord.id, recordData);
        setRecords(records.map(r => r.id === updated.id ? updated : r));
        toast.success(t('recordUpdated') || 'Record updated successfully');
      } else {
        // Create
        const newRecord = await healthRecordAPI.createHealthRecord(recordData);
        setRecords([newRecord, ...records]);
        toast.success(t('recordAdded') || 'Health record added successfully');
      }
      setShowNewRecord(false);
      setEditingRecord(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save record');
    }
  };

  const filteredRecords = records.filter((r) => {
    const animal = animals[r.animalId];
    const animalName = animal?.name || 'Unknown';
    return (
      animalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.recordType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.details.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <SidebarLayout>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">{t('pageTitleRecords')}</h1>
            <p className="text-muted-foreground mt-1">{t('pageSubtitleRecords')}</p>
          </div>
          <button
            onClick={() => { setEditingRecord(null); setShowNewRecord(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all font-medium"
          >
            <Plus className="h-5 w-5" />
            {t('addRecord') || 'Add Record'}
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder={t('searchPlaceholderRecords')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-muted-foreground">{t('loading') || 'Loading records...'}</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Records Grid */}
        <div className="grid grid-cols-1 gap-4">
          {filteredRecords.length > 0 ? (
            filteredRecords.map((record) => {
              const animal = animals[record.animalId];
              return (
                <div key={record.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-foreground">{animal?.name || 'Unknown Animal'}</h3>
                        <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
                          {record.recordType}
                        </span>

                        <div className="ml-auto flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => { setEditingRecord(record); setShowNewRecord(true); }}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            title={t('edit')}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </button>
                          <button
                            onClick={() => setDeleteRecordId(record.id!)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            title={t('delete')}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{record.details}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                        <Calendar className="h-4 w-4" />
                        {t('date')}
                      </div>
                      <p className="font-semibold text-foreground">
                        {record.createdAt ? new Date(record.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                        <User className="h-4 w-4" />
                        {t('diagnosis')}
                      </div>
                      <p className="font-semibold text-foreground text-xs">{record.diagnosis}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                        <FileText className="h-4 w-4" />
                        {t('treatment')}
                      </div>
                      <p className="font-semibold text-foreground text-xs">{record.treatment ? record.treatment.substring(0, 20) : 'N/A'}...</p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : !isLoading && !error ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-muted-foreground">{t('noRecordsFound')}</p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Add/Edit Record Modal */}
      {showNewRecord && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-bold mb-4">
              {editingRecord ? (t('editRecord') || 'Edit Health Record') : (t('addRecordModalTitle') || 'Add Health Record')}
            </h2>
            <form onSubmit={handleSaveRecord}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('animal')}</label>
                  <select name="animalId" required defaultValue={editingRecord?.animalId} className="w-full p-2 border rounded-lg">
                    {Object.values(animals).map(animal => (
                      <option key={animal.id} value={animal.id}>{animal.name} ({animal.type})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">{t('recordTypeLabel') || 'Record Type'}</label>
                  <select name="recordType" required defaultValue={editingRecord?.recordType} className="w-full p-2 border rounded-lg">
                    <option value="Checkup">Regular Checkup</option>
                    <option value="Vaccination">Vaccination</option>
                    <option value="Treatment">Treatment</option>
                    <option value="Injury">Injury</option>
                    <option value="Surgery">Surgery</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">{t('diagnosis')}</label>
                  <input name="diagnosis" required defaultValue={editingRecord?.diagnosis} placeholder="e.g. Mastitis, Healthy, etc." className="w-full p-2 border rounded-lg" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">{t('treatment')}</label>
                  <input name="treatment" required defaultValue={editingRecord?.treatment} placeholder="e.g. Antibiotics, Rest, etc." className="w-full p-2 border rounded-lg" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('weight')} (kg)</label>
                    <input name="weight" type="number" step="0.1" defaultValue={editingRecord?.weight} className="w-full p-2 border rounded-lg" />
                  </div>
                  {/* Note: Temperature not in DTO currently, removed to align with type */}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">{t('details')}</label>
                  <textarea name="details" required defaultValue={editingRecord?.details} rows={3} className="w-full p-2 border rounded-lg" placeholder="Enter detailed notes here..."></textarea>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => { setShowNewRecord(false); setEditingRecord(null); }}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  {editingRecord ? (t('update') || 'Update') : (t('saveRecord') || 'Save Record')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {deleteRecordId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl animate-in fade-in zoom-in duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{t('deleteConfirmTitle') || 'Delete Record?'}</h3>
              <p className="text-sm text-gray-500 mb-6">
                {t('deleteConfirmMessage') || 'Are you sure you want to delete this health record? This action cannot be undone.'}
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setDeleteRecordId(null)}
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
