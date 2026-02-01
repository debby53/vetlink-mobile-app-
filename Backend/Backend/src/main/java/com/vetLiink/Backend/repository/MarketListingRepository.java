package com.vetLiink.Backend.repository;

import com.vetLiink.Backend.entity.MarketListing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MarketListingRepository extends JpaRepository<MarketListing, Long> {
    
    List<MarketListing> findByStatus(MarketListing.ListingStatus status);
    
    // Simple filter search
    List<MarketListing> findByTypeAndStatus(MarketListing.ListingType type, MarketListing.ListingStatus status);

    // Full-Text Search using Postgres native capabilities (Requires native query)
    @Query(value = "SELECT * FROM market_listings WHERE status = 'ACTIVE' AND " +
           "to_tsvector('english', title || ' ' || description) @@ plainto_tsquery('english', :query)", 
           nativeQuery = true)
    List<MarketListing> searchActiveListings(@Param("query") String query);
}
