-- Make case_id nullable in treatment_plans table to allow treatment plans without associated cases
ALTER TABLE treatment_plans ALTER COLUMN case_id DROP NOT NULL;
