-- Full Text Search Setup for Market Listings

-- 1. Create a GIN index on the weighted vectors of title and description
-- This enables fast full-text searching
CREATE INDEX idx_market_listings_search 
ON market_listings 
USING GIN (to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- 2. Verify Search Query Example
-- This is the query structure used in the Repository
/*
SELECT * 
FROM market_listings 
WHERE 
    status = 'ACTIVE' 
    AND to_tsvector('english', title || ' ' || description) @@ plainto_tsquery('english', 'cow milk');
*/

-- 3. Maintenance (Vacuum Analyze to update stats)
-- VACUUM ANALYZE market_listings;
