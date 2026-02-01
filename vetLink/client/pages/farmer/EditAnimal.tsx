import { useState, useEffect } from 'react';
import SidebarLayout from '@/components/SidebarLayout';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    AlertCircle,
} from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { animalAPI } from '@/lib/apiService';
import { toast } from 'sonner';

export default function EditAnimal() {
    const { t } = useLanguage();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const [formData, setFormData] = useState({
        name: '',
        type: '',
        breed: '',
        age: '',
        gender: '',
        weight: '',
        healthStatus: 'healthy',
        specificAttributes: '',
    });

    const [specificFields, setSpecificFields] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchAnimal = async () => {
            if (!id || !user?.id) return;
            try {
                const animal = await animalAPI.getAnimalById(parseInt(id));

                // Parse specific attributes if they exist
                let parsedAttributes = {};
                if (animal.specificAttributes) {
                    try {
                        parsedAttributes = JSON.parse(animal.specificAttributes);
                    } catch (e) {
                        console.error("Failed to parse specific attributes", e);
                    }
                }
                setSpecificFields(parsedAttributes);

                setFormData({
                    name: animal.name,
                    type: animal.type,
                    breed: animal.breed,
                    age: animal.age.toString(),
                    gender: animal.gender,
                    weight: animal.weight ? animal.weight.toString() : '',
                    healthStatus: animal.healthStatus,
                    specificAttributes: animal.specificAttributes || '',
                });
            } catch (error) {
                console.error("Failed to load animal", error);
                toast.error("Failed to load animal details");
                navigate('/farmer/animals');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnimal();
    }, [id, user, navigate]);

    const handleSpecificChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setSpecificFields(prev => ({ ...prev, [name]: value }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;

        setIsSubmitting(true);
        try {
            await animalAPI.updateAnimal(parseInt(id), {
                name: formData.name,
                type: formData.type,
                breed: formData.breed,
                age: parseInt(formData.age),
                gender: formData.gender,
                healthStatus: formData.healthStatus,
                weight: formData.weight ? parseFloat(formData.weight) : undefined,
                specificAttributes: JSON.stringify(specificFields),
            });

            toast.success('Animal updated successfully');
            setTimeout(() => navigate('/farmer/animals'), 1000);
        } catch (err: any) {
            console.error('Error updating animal:', err);
            toast.error(err.message || 'Failed to update animal');
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <SidebarLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <p className="text-muted-foreground">{t('loading') || 'Loading...'}</p>
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
                        <h1 className="text-3xl font-bold text-foreground">{t('edit') || 'Edit'} {t('animal') || 'Animal'}</h1>
                        <p className="text-muted-foreground mt-1">
                            Update animal details
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
                                    {t('animalType')}
                                </label>
                                <input
                                    type="text"
                                    value={t(formData.type) || formData.type}
                                    disabled
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed capitalize"
                                />
                            </div>
                        </div>
                    </div>

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
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                                    required
                                />
                            </div>

                            {/* Dynamic Fields based on Type - Reused from AddAnimal but simplified as Type is fixed */}
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
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        {t('age')} ({t('years')})
                                    </label>
                                    <input
                                        type="number"
                                        name="age"
                                        value={formData.age}
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

                    {/* Health Details */}
                    <div>
                        <h2 className="text-lg font-bold text-foreground mb-4">{t('healthRecords')}</h2>
                        <div className="space-y-4">
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
                        </div>
                    </div>

                    {/* Alert */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                        <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium text-blue-900">{t('quickTip')}</p>
                            <p className="text-sm text-blue-800 mt-1">
                                Updating animal details helps maintain accurate records for better vet care.
                            </p>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate('/farmer/animals')}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-foreground hover:bg-gray-50 transition-all"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Updating...' : 'Update'}
                        </button>
                    </div>
                </form>
            </div>
        </SidebarLayout >
    );
}
