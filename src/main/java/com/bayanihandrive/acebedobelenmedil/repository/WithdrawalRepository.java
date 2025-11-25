package com.bayanihandrive.acebedobelenmedil.repository;

import com.bayanihandrive.acebedobelenmedil.model.Withdrawal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface WithdrawalRepository extends JpaRepository<Withdrawal, Long> {
    
    // This method was missing and caused the error in getWithdrawalsByOrganizer
    List<Withdrawal> findByOrganizerIdOrderByCreatedAtDesc(UUID organizerId);
    
    // You might also need this one later if you filter by campaign
    List<Withdrawal> findByCampaignIdOrderByCreatedAtDesc(Long campaignId);
}