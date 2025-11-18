package com.bayanihandrive.acebedobelenmedil.repository;

import com.bayanihandrive.acebedobelenmedil.model.Campaign;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CampaignRepository extends JpaRepository<Campaign, Long> {
    
    // Spring Data JPA automatically creates a query for this method name
    List<Campaign> findByOrganizerId(UUID organizerId);
    
    List<Campaign> findByIsActive(boolean isActive);
}