import React, { useState } from 'react';
import './RationCalculator.css';

interface RationResult {
    dailyEnergyNeedMj: number;
    dailyProteinNeedGrams: number;
    suggestedRecipe: Record<string, number>;
    note: string;
}

export const RationCalculator: React.FC = () => {
    const [animalType, setAnimalType] = useState('COW');
    const [weight, setWeight] = useState(400); // kg
    const [productivity, setProductivity] = useState(10); // L milk or gain
    const [result, setResult] = useState<RationResult | null>(null);
    const [loading, setLoading] = useState(false);

    const handleCalculate = async () => {
        setLoading(true);
        try {
            // In a real integration, this fetches from the backend
            // const response = await fetch('/api/feed-advisory/calculate', ...);

            // Simulating API call for demonstration of the interactive component
            await new Promise(resolve => setTimeout(resolve, 800));

            // Mock computation logic (mirroring backend for immediate feedback demo)
            const maintenance = 0.5 * Math.pow(weight, 0.75);
            const production = productivity * 5;
            const totalEnergy = maintenance + production;

            // Mock Recipe
            const mockRec: Record<string, number> = {
                "Napier Grass (Fresh)": parseFloat(((weight * 0.025 * 0.7) / 0.25).toFixed(2)),
                "Maize Bran": parseFloat(((productivity > 5 ? (productivity - 5) / 2 : 0) * 0.7).toFixed(2)),
                "Cotton Seed Cake": parseFloat(((productivity > 5 ? (productivity - 5) / 2 : 0) * 0.3).toFixed(2)),
                "Mineral Salt": 0.1
            };

            setResult({
                dailyEnergyNeedMj: parseFloat(totalEnergy.toFixed(1)),
                dailyProteinNeedGrams: 1200, // Dummy
                suggestedRecipe: mockRec,
                note: `Optimized for a ${weight}kg ${animalType === 'COW' ? 'Cow' : 'Animal'}`
            });

        } catch (error) {
            console.error("Calculation failed", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="ration-calculator-container">
            <div className="ration-header">
                <h2>Smart Feed Advisor</h2>
                <p>Optimize your livestock nutrition with locally available ingredients.</p>
            </div>

            <div className="calculator-grid">
                {/* Input Section */}
                <div className="input-section">
                    <div className="input-group">
                        <label>Livestock Type</label>
                        <select
                            className="input-control"
                            value={animalType}
                            onChange={(e) => setAnimalType(e.target.value)}
                        >
                            <option value="COW">Dairy Cow</option>
                            <option value="GOAT">Dairy Goat</option>
                            <option value="BEEF">Beef Cattle</option>
                        </select>
                    </div>

                    <div className="input-group">
                        <label>Animal Weight (kg)</label>
                        <div className="slider-container">
                            <input
                                type="range"
                                min="100"
                                max="800"
                                step="10"
                                className="input-control"
                                value={weight}
                                onChange={(e) => setWeight(Number(e.target.value))}
                            />
                            <span className="slider-value">{weight} kg</span>
                        </div>
                    </div>

                    <div className="input-group">
                        <label>{animalType === 'BEEF' ? 'Daily Weight Gain (kg)' : 'Daily Milk Yield (Liters)'}</label>
                        <input
                            type="number"
                            className="input-control"
                            value={productivity}
                            onChange={(e) => setProductivity(Number(e.target.value))}
                        />
                    </div>

                    <button className="calculate-btn" onClick={handleCalculate} disabled={loading}>
                        {loading ? 'Calculating...' : 'Generate Ration Recipe'}
                    </button>
                </div>

                {/* Results Section */}
                <div className="results-section">
                    {result ? (
                        <div className="results-panel fade-in">
                            <h3>Recommended Daily Ration</h3>
                            <ul className="recipe-list">
                                {Object.entries(result.suggestedRecipe).map(([item, amount]) => (
                                    <li key={item} className="recipe-item">
                                        <span className="recipe-name">{item}</span>
                                        <span className="recipe-amount">{amount} kg</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="note-box">
                                Energy Target: {result.dailyEnergyNeedMj} MJ <br />
                                <strong>Note:</strong> {result.note}
                            </div>
                        </div>
                    ) : (
                        <div className="results-panel placeholder">
                            <p style={{ textAlign: 'center', color: '#9ca3af', marginTop: '2rem' }}>
                                Enter your animal details to see the optimal feeding plan.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
