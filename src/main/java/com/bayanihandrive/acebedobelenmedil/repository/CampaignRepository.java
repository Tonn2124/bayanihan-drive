package com.bayanihandrive.acebedobelenmedil.repository;

import com.bayanihandrive.acebedobelenmedil.model.Campaign;
import com.bayanihandrive.acebedobelenmedil.model.CampaignStatus; // Import this
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query; // Import this
import org.springframework.data.repository.query.Param; // Import this
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CampaignRepository extends JpaRepository<Campaign, Long> {
    
    List<Campaign> findByOrganizerId(UUID organizerId);
    
    List<Campaign> findByIsActive(boolean isActive);

    
    @Query(value = "SELECT * FROM campaigns WHERE status = CAST(:#{#status.name()} AS campaign_status)", nativeQuery = true)
    List<Campaign> findByStatus(@Param("status") CampaignStatus status);
}