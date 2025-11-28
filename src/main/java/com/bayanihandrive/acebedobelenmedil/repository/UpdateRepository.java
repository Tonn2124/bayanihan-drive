package com.bayanihandrive.acebedobelenmedil.repository;

import com.bayanihandrive.acebedobelenmedil.model.Update;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UpdateRepository extends JpaRepository<Update, Long> {
    List<Update> findByCampaignIdOrderByCreatedAtDesc(Long campaignId);
}