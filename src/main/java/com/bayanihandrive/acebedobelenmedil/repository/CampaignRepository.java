package com.bayanihandrive.acebedobelenmedil.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.bayanihandrive.acebedobelenmedil.model.Campaign;
import com.bayanihandrive.acebedobelenmedil.model.CampaignStatus;

@Repository
public interface CampaignRepository extends JpaRepository<Campaign, Long> {
    
    List<Campaign> findByOrganizerId(UUID organizerId);
    
    List<Campaign> findByIsActive(boolean isActive);

    // --- 1. Public List (Approved & Active) ---
    @Query(value = "SELECT * FROM campaigns WHERE is_active = true AND status = CAST('APPROVED' AS campaign_status)", nativeQuery = true)
    List<Campaign> findAllActiveAndApproved();

    // --- 2. Search & Filter (FIXED HERE) ---
    // We cast c.category to TEXT to safely compare it with the incoming String parameter.
    @Query(value = "SELECT * FROM campaigns c WHERE " +
           "c.is_active = true AND c.status = CAST('APPROVED' AS campaign_status) AND " +
           "(LOWER(c.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(c.description) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "(:category IS NULL OR CAST(c.category AS text) = :category)", 
           nativeQuery = true)
    List<Campaign> searchCampaigns(@Param("query") String query, @Param("category") String category);

    // --- 3. Admin: Filter by Status ---
    @Query(value = "SELECT * FROM campaigns WHERE status = CAST(:#{#status.name()} AS campaign_status)", nativeQuery = true)
    List<Campaign> findByStatus(@Param("status") CampaignStatus status);
}