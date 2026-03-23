package com.vetLiink.Backend.service;

import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.ArrayList;

@Service
public class FeedAdvisoryService {

    // Inner class to represent a Ration Result
    public static class RationRecommendation {
        public double dailyEnergyNeedMj;
        public double dailyProteinNeedGrams;
        public Map<String, Double> suggestedRecipe; // Ingredient Name -> Kg amount
        public String note;

        public RationRecommendation(double energy, double protein, Map<String, Double> recipe, String note) {
            this.dailyEnergyNeedMj = energy;
            this.dailyProteinNeedGrams = protein;
            this.suggestedRecipe = recipe;
            this.note = note;
        }
    }

    public static class AnimalProfile {
        public String type; // "COW", "GOAT"
        public double weightKg;
        public double productivity; // Liters of milk or Daily Gain
    }

    /**
     * Calculates a recommended daily ration based on animal profile.
     * Uses simplified NRC guidelines for dairy cattle.
     */
    public RationRecommendation calculateRation(AnimalProfile animal) {
        if ("COW".equalsIgnoreCase(animal.type)) {
            return calculateDairyCowRation(animal);
        } else {
            // Placeholder for other animals
            return new RationRecommendation(0, 0, new HashMap<>(), "Calculation for " + animal.type + " not yet supported.");
        }
    }

    private RationRecommendation calculateDairyCowRation(AnimalProfile cow) {
        // 1. Calculate Requirements (Simplified formulas)
        // Maintenance Energy (Mj/day) approx 0.1 * Weight + 10 (Simplified)
        double maintenanceEnergy = 0.5 * Math.pow(cow.weightKg, 0.75); 
        // Production Energy: Approx 5 MJ per liter of milk
        double productionEnergy = cow.productivity * 5.0;
        double totalEnergyMj = maintenanceEnergy + productionEnergy;

        // Protein (CP): Maintenance specific + ~80g per liter milk
        double totalProteinGrams = (cow.weightKg * 0.7) + (cow.productivity * 80);

        // 2. Formulate Recipe (Simplified Algorithm using common Rwandan ingredients)
        // We act as if we have fixed ingredients: Napier Grass, Maize Bran, Cotton Seed Cake
        
        Map<String, Double> recipe = new HashMap<>();
        
        // Base forage (Napier Grass) - Assume cow eats 2.5% of bodyweight in Dry Matter (DM)
        double maxIntakeDM = cow.weightKg * 0.025; 
        
        // Let's assume Napier is 70% of the diet
        double napierDM = maxIntakeDM * 0.7;
        double napierAsFed = napierDM / 0.25; // 25% DM in fresh grass
        recipe.put("Napier Grass (Fresh)", round(napierAsFed));

        // Concentrate for production
        // Maize Bran (Energy) & Cotton Seed Cake (Protein)
        // Simple rule: 1kg concentrate mix for every 2-3 liters of milk above 5 liters
        double concentrateAmount = 0;
        if (cow.productivity > 5) {
            concentrateAmount = (cow.productivity - 5) / 2.0;
        }

        recipe.put("Maize Bran", round(concentrateAmount * 0.7)); // 70% of concentrate
        recipe.put("Cotton Seed Cake", round(concentrateAmount * 0.3)); // 30% of concentrate
        
        // Mineral Salt
        recipe.put("Mineral Salt", 0.1); // Fixed 100g

        String note = "Based on " + cow.weightKg + "kg body weight and " + cow.productivity + "L milk/day.";
        
        return new RationRecommendation(round(totalEnergyMj), round(totalProteinGrams), recipe, note);
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
