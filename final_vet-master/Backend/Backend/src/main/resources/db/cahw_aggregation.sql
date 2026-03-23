-- Database View for CAHW Reports
-- Aggregates treatments by diagnosis and sector (derived from Farm/User location)

CREATE OR REPLACE VIEW view_sector_disease_trends AS
SELECT 
    tr.diagnosis,
    COUNT(tr.id) as case_count,
    -- grouping by month
    TO_CHAR(tr.treatment_date, 'YYYY-MM') as month,
    -- In a real schema, we would join with Farm -> Sector
    -- For now, we aggregate generally or strictly by the available columns
    tr.protocol_id
FROM 
    treatment_records tr
GROUP BY 
    tr.diagnosis, 
    TO_CHAR(tr.treatment_date, 'YYYY-MM'),
    tr.protocol_id;

-- Secure function to get anonymized stats
-- Prevents access to individual records
CREATE OR REPLACE FUNCTION get_disease_stats(start_date TIMESTAMP, end_date TIMESTAMP)
RETURNS TABLE (
    diagnosis_name VARCHAR,
    total_cases BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        diagnosis, 
        COUNT(*) 
    FROM 
        treatment_records
    WHERE 
        treatment_date BETWEEN start_date AND end_date
    GROUP BY 
        diagnosis;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
