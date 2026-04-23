-- Feed & Forage Module Schema

-- Table for Forage Catalog (User Story 2)
CREATE TABLE forage_catalog (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    scientific_name VARCHAR(255),
    description TEXT,
    planting_season VARCHAR(100), -- e.g., "September-December"
    maturity_days INTEGER,
    recommended_soil_type VARCHAR(100),
    animal_types VARCHAR(255), -- Comma separated, e.g., "Cattle,Goat"
    supplier_contacts TEXT -- JSON or Text description of where to buy
);

-- Table for Feed Ingredients (for Ration Calculation)
CREATE TABLE feed_ingredients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50), -- e.g., "Energy", "Protein", "Rougage"
    crude_protein_percent DECIMAL(5, 2) NOT NULL,
    energy_mj_per_kg DECIMAL(5, 2) NOT NULL,
    average_cost_per_kg DECIMAL(10, 2),
    is_locally_available BOOLEAN DEFAULT TRUE
);

-- Content Management for Extension Officers (User Story 3)
CREATE TABLE education_content (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content_type VARCHAR(50), -- 'VIDEO', 'PDF', 'ARTICLE'
    url VARCHAR(500) NOT NULL,
    author_id INTEGER, -- Link to User/Officer
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
