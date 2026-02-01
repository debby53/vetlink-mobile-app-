import { useState, useEffect } from 'react';
import SidebarLayout from '@/components/SidebarLayout';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { healthRecordAPI, animalAPI, AnimalDTO } from '@/lib/apiService';
import { toast } from 'sonner';

export default function AddRecord() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recordType, setRecordType] = useState('treatment');
  const [animals, setAnimals] = useState<AnimalDTO[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    animalId: '',
    date: new Date().toISOString().split('T')[0],
    type: recordType,
    veterinarian: '',
    title: '',
    description: '',
    findings: '',
    treatment: '',
    medicines: '',
    followUp: '',
    notes: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRecordTypeChange = (type: string) => {
    setRecordType(type);
    setFormData(prev => ({ ...prev, type }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      toast.error('User not authenticated');
      return;
    }
    if (!formData.animalId) {
      toast.error('Please select an animal');
      return;
    }

    setIsSubmitting(true);
    try {
      const detailsText = `Title: ${formData.title}
Date: ${formData.date}
Veterinarian: ${formData.veterinarian || 'N/A'}
Notes: ${formData.notes}
Follow Up: ${formData.followUp || 'None'}
Description: ${formData.description}`;

      await healthRecordAPI.createHealthRecord({
        animalId: parseInt(formData.animalId),
        recordType: recordType,
        diagnosis: formData.findings || formData.description,
        treatment: formData.treatment || formData.medicines,
        details: detailsText,
        temperature: undefined,
        weight: undefined,
      });

      toast.success('Health record added successfully');
      setSubmitted(true);
      setTimeout(() => navigate('/farmer/records'), 2000);
    } catch (err: any) {
      console.error('Error adding record:', err);
      toast.error(err.message || 'Failed to add health record');
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
            <h2 className="text-2xl font-bold text-foreground mb-2">Record Added Successfully!</h2>
            <p className="text-muted-foreground">
              Health record has been saved. Redirecting...
            </p>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  useEffect(() => {
    loadAnimals();
  }, [user?.id]);

  const loadAnimals = async () => {
    if (!user?.id) return;
    try {
      const farmerAnimals = await animalAPI.getAnimalsByFarmerId(user.id);
      setAnimals(farmerAnimals);
    } catch (err: any) {
      console.error('Error loading animals:', err);
      toast.error('Failed to load animals');
    }
  };

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
            <h1 className="text-3xl font-bold text-foreground">Add Health Record</h1>
            <p className="text-muted-foreground mt-1">
              Document health events and veterinary treatments
            </p>
          </div>
        </div>

        {/* Record Type Selection */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { id: 'treatment', label: 'Treatment', icon: '💊' },
            { id: 'vaccination', label: 'Vaccination', icon: '🩹' },
            { id: 'observation', label: 'Observation', icon: '👁️' },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => handleRecordTypeChange(type.id)}
              className={`p-4 rounded-lg border-2 transition-all ${recordType === type.id
                ? 'border-green-600 bg-green-50'
                : 'border-gray-200 hover:border-gray-300'
                }`}
            >
              <div className="text-2xl mb-2">{type.icon}</div>
              <p className="font-semibold text-foreground">{type.label}</p>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg border border-gray-200 space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-lg font-bold text-foreground mb-4">Record Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Animal ID / Name *
                </label>
                <select
                  name="animalId"
                  value={formData.animalId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  required
                >
                  <option value="">Select animal...</option>
                  {animals.map((animal) => (
                    <option key={animal.id} value={animal.id}>
                      {animal.name} ({animal.type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Date of Record *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Veterinarian Name
                  </label>
                  <input
                    type="text"
                    name="veterinarian"
                    value={formData.veterinarian}
                    onChange={handleInputChange}
                    placeholder="e.g., Dr. Kariuki"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Record Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder={
                    recordType === 'treatment'
                      ? 'e.g., Treatment for mastitis'
                      : recordType === 'vaccination'
                        ? 'e.g., Annual vaccination'
                        : 'e.g., Health check observation'
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Record Details */}
          <div>
            <h2 className="text-lg font-bold text-foreground mb-4">Record Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="What happened or was observed..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent resize-none"
                />
              </div>

              {recordType === 'treatment' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Diagnosis / Findings
                    </label>
                    <textarea
                      name="findings"
                      value={formData.findings}
                      onChange={handleInputChange}
                      placeholder="What was diagnosed or found..."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Treatment Given
                    </label>
                    <textarea
                      name="treatment"
                      value={formData.treatment}
                      onChange={handleInputChange}
                      placeholder="Treatment provided..."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Medicines / Medications
                    </label>
                    <textarea
                      name="medicines"
                      value={formData.medicines}
                      onChange={handleInputChange}
                      placeholder="List medicines prescribed (name, dosage, duration)..."
                      rows={2}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Follow-up Required?
                    </label>
                    <textarea
                      name="followUp"
                      value={formData.followUp}
                      onChange={handleInputChange}
                      placeholder="Any follow-up visits or observations needed..."
                      rows={2}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent resize-none"
                    />
                  </div>
                </>
              )}

              {recordType === 'vaccination' && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Vaccine Details
                  </label>
                  <textarea
                    name="medicines"
                    value={formData.medicines}
                    onChange={handleInputChange}
                    placeholder="Vaccine name, batch number, next due date..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent resize-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Additional Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Any other important information..."
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent resize-none"
                />
              </div>
            </div>
          </div>

          {/* Info Alert */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">Keep Records Updated</p>
              <p className="text-sm text-blue-800 mt-1">
                Detailed health records help track animal wellness and improve future care decisions.
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/farmer/records')}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-foreground hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : 'Save Record'}
            </button>
          </div>
        </form>
      </div>
    </SidebarLayout>
  );
}
