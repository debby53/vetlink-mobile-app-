import { useState } from 'react';
import SidebarLayout from '@/components/SidebarLayout';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Upload,
  AlertCircle,
} from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { animalAPI, healthRecordAPI } from '@/lib/apiService';
import { toast } from 'sonner';

export default function AddAnimal() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    breed: '',
    dateOfBirth: '',
    gender: '',
    weight: '',
    healthStatus: 'healthy',
    vaccinated: 'yes',
    pastMedicalHistory: '',
    notes: '',
  });

  const [specificFields, setSpecificFields] = useState<Record<string, string>>({});

  // Reset specific fields when type changes
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleInputChange(e);
    setSpecificFields({});
  };

  const handleSpecificChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSpecificFields(prev => ({ ...prev, [name]: value }));
  };

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      toast.error('User not authenticated');
      return;
    }

    setIsSubmitting(true);
    try {
      // Calculate age from date of birth
      const calculateAge = (dateString: string): number => {
        if (!dateString) return 0;
        const birthDate = new Date(dateString);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        return Math.max(0, age);
      };

      const newAnimal = await animalAPI.createAnimal({
        farmerId: user.id,
        name: formData.name,
        type: formData.type,
        breed: formData.breed,
        age: calculateAge(formData.dateOfBirth),
        gender: formData.gender,
        healthStatus: formData.healthStatus,
        specificAttributes: JSON.stringify(specificFields),
      });

      // Create initial health record if history or notes are provided
      if ((formData.pastMedicalHistory && formData.pastMedicalHistory.trim()) ||
        (formData.notes && formData.notes.trim())) {
        try {
          // Import healthRecordAPI if not already imported (it is imported in the file)
          await healthRecordAPI.createHealthRecord({
            animalId: newAnimal.id!,
            recordType: 'Initial Assessment',
            details: formData.notes || 'Initial record created during registration',
            diagnosis: formData.pastMedicalHistory || 'No past history recorded',
            treatment: `Vaccinated: ${formData.vaccinated}`,
            weight: formData.weight ? parseFloat(formData.weight) : undefined
          });
        } catch (healthErr) {
          console.error('Failed to create initial health record:', healthErr);
          // Don't fail the whole operation, just log it
        }
      }

      toast.success('Animal added successfully');
      setSubmitted(true);
      setTimeout(() => navigate('/farmer/animals'), 2000);
    } catch (err: any) {
      console.error('Error adding animal:', err);
      toast.error(err.message || 'Failed to add animal');
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <SidebarLayout>
        <div className="max-w-2xl mx-auto p-6 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">{t('animalAdded')}</h2>
            <p className="text-muted-foreground">
              {formData.name} {t('redirecting')}
            </p>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Add Animal</h1>
            <p className="text-muted-foreground mt-1">
              {t('addAnimalSubtitle')}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg border border-gray-200 space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-lg font-bold text-foreground mb-4">{t('details')}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('animalType')} *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleTypeChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  required
                >
                  <option value="">{t('selectType')}</option>
                  <option value="dairy-cow">Dairy Cow</option>
                  <option value="beef-cattle">Beef Cattle</option>
                  <option value="goat">Goat</option>
                  <option value="sheep">Sheep</option>
                  <option value="pig">Pig</option>
                  <option value="chicken">Chicken</option>
                  <option value="duck">Duck</option>
                  <option value="rabbit">Rabbit</option>
                </select>
              </div>
            </div>
          </div>

          {formData.type && (
            <>
              <div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {formData.type === 'chicken' || formData.type === 'duck'
                        ? 'Flock Name / Batch ID'
                        : formData.type === 'dairy-cow' || formData.type === 'beef-cattle'
                          ? 'Cow Name / Tag ID'
                          : t('animalName')} *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder={
                        formData.type === 'chicken' ? "e.g., Layer Batch A" :
                          formData.type === 'dairy-cow' ? "e.g., Bessie, Cow-005" :
                            "e.g., Name or ID"
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Dynamic Fields based on Type */}
                  {formData.type === 'dairy-cow' && (
                    <div className="col-span-2 grid grid-cols-2 gap-4 bg-green-50 p-4 rounded-lg border border-green-100">
                      <div className="col-span-2">
                        <h3 className="text-sm font-semibold text-green-800 mb-2">Dairy Information</h3>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Lactation Stage</label>
                        <select
                          name="lactationStage"
                          value={specificFields.lactationStage || ''}
                          onChange={handleSpecificChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                        >
                          <option value="">Select Stage</option>
                          <option value="lactating">Lactating</option>
                          <option value="dry">Dry</option>
                          <option value="heifer">Heifer</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Daily Milk (L)</label>
                        <input
                          type="number"
                          name="dailyMilk"
                          value={specificFields.dailyMilk || ''}
                          onChange={handleSpecificChange}
                          placeholder="e.g. 15"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                  )}

                  {formData.type === 'beef-cattle' && (
                    <div className="col-span-2 bg-green-50 p-4 rounded-lg border border-green-100">
                      <h3 className="text-sm font-semibold text-green-800 mb-2">Beef Information</h3>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Purpose</label>
                        <select
                          name="purpose"
                          value={specificFields.purpose || ''}
                          onChange={handleSpecificChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                        >
                          <option value="">Select Purpose</option>
                          <option value="meat">Meat</option>
                          <option value="breeding">Breeding</option>
                          <option value="draft">Draft</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {(formData.type === 'chicken' || formData.type === 'duck') && (
                    <div className="col-span-2 grid grid-cols-2 gap-4 bg-green-50 p-4 rounded-lg border border-green-100">
                      <div className="col-span-2">
                        <h3 className="text-sm font-semibold text-green-800 mb-2">Poultry Details</h3>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Production Type</label>
                        <select
                          name="productionType"
                          value={specificFields.productionType || ''}
                          onChange={handleSpecificChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                        >
                          <option value="">Select Type</option>
                          <option value="layer">Layer (Eggs)</option>
                          <option value="broiler">Broiler (Meat)</option>
                          <option value="dual">Dual Purpose</option>
                        </select>
                      </div>
                      {specificFields.productionType !== 'broiler' && (
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Daily Eggs</label>
                          <input
                            type="number"
                            name="dailyEggs"
                            value={specificFields.dailyEggs || ''}
                            onChange={handleSpecificChange}
                            placeholder="e.g. 5"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {(formData.type === 'goat' || formData.type === 'sheep') && (
                    <div className="col-span-2 bg-green-50 p-4 rounded-lg border border-green-100">
                      <h3 className="text-sm font-semibold text-green-800 mb-2">Small Ruminant Details</h3>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Primary Purpose</label>
                        <select
                          name="purpose"
                          value={specificFields.purpose || ''}
                          onChange={handleSpecificChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                        >
                          <option value="">Select Purpose</option>
                          <option value="meat">Meat</option>
                          <option value="milk">Milk</option>
                          <option value="wool">Wool/Fiber</option>
                          <option value="breeding">Breeding</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {formData.type === 'pig' && (
                    <div className="col-span-2 bg-green-50 p-4 rounded-lg border border-green-100">
                      <h3 className="text-sm font-semibold text-green-800 mb-2">Swine Details</h3>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Category</label>
                        <select
                          name="category"
                          value={specificFields.category || ''}
                          onChange={handleSpecificChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                        >
                          <option value="">Select Category</option>
                          <option value="piglet">Piglet</option>
                          <option value="weaner">Weaner</option>
                          <option value="fattener">Fattener</option>
                          <option value="sow">Sow (Breeding Female)</option>
                          <option value="boar">Boar (Breeding Male)</option>
                        </select>
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {t('breed')}
                    </label>
                    <input
                      type="text"
                      name="breed"
                      value={formData.breed}
                      onChange={handleInputChange}
                      placeholder="e.g., Friesian, Nguni"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        {t('dob')}
                      </label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        {t('gender')}
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                      >
                        <option value="">{t('selectType')}</option>
                        <option value="male">{t('male')}</option>
                        <option value="female">{t('female')}</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {t('weight')} (kg)
                    </label>
                    <input
                      type="number"
                      name="weight"
                      value={formData.weight}
                      onChange={handleInputChange}
                      placeholder="e.g., 450"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Health Information */}
              <div>
                <h2 className="text-lg font-bold text-foreground mb-4">{t('healthRecords')}</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        {t('status')}
                      </label>
                      <select
                        name="healthStatus"
                        value={formData.healthStatus}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                      >
                        <option value="healthy">{t('healthy') || 'Healthy'}</option>
                        <option value="recovering">{t('recovering') || 'Recovering'}</option>
                        <option value="under-treatment">{t('underTreatment') || 'Under Treatment'}</option>
                        <option value="at-risk">{t('atRisk') || 'At Risk'}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        {t('vaccinated')}?
                      </label>
                      <select
                        name="vaccinated"
                        value={formData.vaccinated}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                      >
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                        <option value="partial">Partially</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {t('pastHistory')}
                    </label>
                    <textarea
                      name="pastMedicalHistory"
                      value={formData.pastMedicalHistory}
                      onChange={handleInputChange}
                      placeholder="Any previous illnesses, injuries, or treatments..."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('notes')}
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Any other relevant information about the animal..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent resize-none"
                />
              </div>
            </> // Close the conditional wrapper for formData.type
          )}

          {/* Info Alert */}
          {formData.type && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">{t('quickTip')}</p>
                <p className="text-sm text-blue-800 mt-1">
                  {t('tipContent')}
                </p>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/farmer/animals')}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-foreground hover:bg-gray-50 transition-all"
            >
              {t('cancel')}
            </button>
            {formData.type && (
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Adding...' : t('addAnimal')}
              </button>
            )}
          </div>
        </form>
      </div>
    </SidebarLayout >
  );
}
