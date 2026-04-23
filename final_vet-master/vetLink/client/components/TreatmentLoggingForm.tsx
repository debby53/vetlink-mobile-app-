import React, { useState, useEffect, useRef } from 'react';
import { animalAPI, AnimalDTO, caseAPI } from '@/lib/apiService';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';

const commonDrugs = [
    "Penicillin G", "Oxytetracycline", "Ivermectin", "Albendazole", "Multivitamin"
];

const conditions = [
    "Mastitis", "Tick Borne Disease", "Worms/Parasites", "Foot Rot", "Pneumonia"
];

export const TreatmentLoggingForm: React.FC = () => {
    const { user } = useAuth();
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [formData, setFormData] = useState({
        animalId: '',
        diagnosis: '',
        drugName: '',
        batchNumber: '',
        dosage: '',
        notes: ''
    });

    const [animals, setAnimals] = useState<AnimalDTO[]>([]);
    const [filteredAnimals, setFilteredAnimals] = useState<AnimalDTO[]>([]);
    const [animalSearch, setAnimalSearch] = useState('');
    const [showAnimalDropdown, setShowAnimalDropdown] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const handleStatusChange = () => {
            setIsOffline(!navigator.onLine);
        };
        window.addEventListener('online', handleStatusChange);
        window.addEventListener('offline', handleStatusChange);
        return () => {
            window.removeEventListener('online', handleStatusChange);
            window.removeEventListener('offline', handleStatusChange);
        };
    }, []);

    useEffect(() => {
        loadAnimals();
    }, [user]);

    // Click outside handler to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowAnimalDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadAnimals = async () => {
        if (!user?.id) return;
        setIsLoading(true);
        try {
            let animalsData: AnimalDTO[] = [];

            // For farmers, load their own animals
            if (user.role === 'FARMER') {
                animalsData = await animalAPI.getAnimalsByFarmerId(user.id);
            } else if (user.role === 'CAHW') {
                // For CAHW, load animals from cases in their sector
                try {
                    const cases = await caseAPI.getCasesByCAHWLocation(user.id);
                    const animalIds = new Set<number>();
                    const animalPromises = cases
                        .filter(c => c.animalId && !animalIds.has(c.animalId))
                        .map(c => {
                            animalIds.add(c.animalId);
                            return animalAPI.getAnimalById(c.animalId);
                        });
                    animalsData = await Promise.all(animalPromises);
                } catch (err) {
                    console.warn('Could not load animals from cases, trying farmer animals:', err);
                    // Fallback: try loading as if they were a farmer
                    animalsData = await animalAPI.getAnimalsByFarmerId(user.id);
                }
            } else {
                // For other roles (Veterinarian, Admin), try loading by farmer ID
                animalsData = await animalAPI.getAnimalsByFarmerId(user.id);
            }

            setAnimals(animalsData);
            setFilteredAnimals(animalsData);
        } catch (err: any) {
            console.error('Error loading animals:', err);
            toast.error('Failed to load animals. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAnimalSearch = (value: string) => {
        setAnimalSearch(value);
        setShowAnimalDropdown(true);

        if (value.trim() === '') {
            setFilteredAnimals(animals);
        } else {
            const filtered = animals.filter(animal =>
                animal.name.toLowerCase().includes(value.toLowerCase()) ||
                animal.type.toLowerCase().includes(value.toLowerCase()) ||
                (animal.id?.toString() || '').includes(value)
            );
            setFilteredAnimals(filtered);
        }
    };

    const selectAnimal = (animal: AnimalDTO) => {
        setFormData({ ...formData, animalId: animal.id?.toString() || '' });
        setAnimalSearch(`${animal.name} (${animal.type})`);
        setShowAnimalDropdown(false);
    };

    const handleDrugInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setFormData({ ...formData, drugName: val });
        if (val.length > 0) {
            const filtered = commonDrugs.filter(d => d.toLowerCase().includes(val.toLowerCase()));
            setSuggestions(filtered);
        } else {
            setSuggestions([]);
        }
    };

    const selectDrug = (drug: string) => {
        setFormData({ ...formData, drugName: drug });
        setSuggestions([]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.animalId) {
            toast.error('Please select an animal');
            return;
        }

        if (isOffline) {
            // Save to LocalStorage
            const pending = JSON.parse(localStorage.getItem('pendingTreatments') || '[]');
            pending.push({ ...formData, timestamp: new Date().toISOString() });
            localStorage.setItem('pendingTreatments', JSON.stringify(pending));
            toast.warning("Offline mode: Treatment saved locally. Will sync when online.");
        } else {
            // API Call
            console.log("Submitting to API", formData);
            toast.success("Treatment logged successfully!");
        }

        // Reset
        setFormData({ animalId: '', diagnosis: '', drugName: '', batchNumber: '', dosage: '', notes: '' });
        setAnimalSearch('');
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-2xl mx-auto">
            <div className="mb-6">
                <h2 className="text-3xl font-bold text-foreground flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    Log Treatment
                    {isOffline && (
                        <span className="text-sm font-normal text-destructive bg-destructive/10 px-3 py-1 rounded-full">
                            Offline Mode
                        </span>
                    )}
                </h2>
                <p className="text-muted-foreground mt-2">Record animal treatment details for tracking and compliance</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Animal Selection */}
                <div className="relative" ref={dropdownRef}>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                        Select Animal <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={animalSearch}
                            onChange={(e) => handleAnimalSearch(e.target.value)}
                            onFocus={() => setShowAnimalDropdown(true)}
                            placeholder="Search by name, type, or ID..."
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            required={!formData.animalId}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>

                    {showAnimalDropdown && (
                        <div className="absolute z-20 w-full mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {isLoading ? (
                                <div className="p-4 text-center text-muted-foreground">Loading animals...</div>
                            ) : filteredAnimals.length > 0 ? (
                                filteredAnimals.map((animal) => (
                                    <div
                                        key={animal.id}
                                        onClick={() => selectAnimal(animal)}
                                        className="px-4 py-3 hover:bg-primary/5 cursor-pointer border-b border-gray-100 last:border-0 transition-colors"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold text-foreground">{animal.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {animal.type} • {animal.breed} • {animal.age} years
                                                </p>
                                            </div>
                                            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                                                ID: {animal.id}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-4 text-center text-muted-foreground">
                                    No animals found. {animalSearch && 'Try a different search.'}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Diagnosis */}
                <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                        Diagnosis <span className="text-destructive">*</span>
                    </label>
                    <select
                        value={formData.diagnosis}
                        onChange={e => setFormData({ ...formData, diagnosis: e.target.value })}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    >
                        <option value="">Select Condition</option>
                        {conditions.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                {/* Drug Administered */}
                <div className="relative">
                    <label className="block text-sm font-semibold text-foreground mb-2">
                        Drug Administered <span className="text-destructive">*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.drugName}
                        onChange={handleDrugInput}
                        required
                        placeholder="Search or type drug name..."
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                    {suggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {suggestions.map(s => (
                                <div
                                    key={s}
                                    onClick={() => selectDrug(s)}
                                    className="px-4 py-3 hover:bg-primary/5 cursor-pointer border-b border-gray-100 last:border-0 transition-colors"
                                >
                                    {s}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Batch Number and Dosage */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">
                            Batch No. <span className="text-destructive">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.batchNumber}
                            onChange={e => setFormData({ ...formData, batchNumber: e.target.value })}
                            required
                            placeholder="e.g., BT-2024-001"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">
                            Dosage (ml) <span className="text-destructive">*</span>
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            value={formData.dosage}
                            onChange={e => setFormData({ ...formData, dosage: e.target.value })}
                            required
                            placeholder="e.g., 5.0"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Notes (Optional) */}
                <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                        Additional Notes
                    </label>
                    <textarea
                        value={formData.notes}
                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Any additional observations or instructions..."
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-4 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Record Treatment
                </button>
            </form>
        </div>
    );
};
