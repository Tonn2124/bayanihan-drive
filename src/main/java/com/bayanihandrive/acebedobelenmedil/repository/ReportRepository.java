package com.bayanihandrive.acebedobelenmedil.repository;

import com.bayanihandrive.acebedobelenmedil.model.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findByCampaignId(Long campaignId);
    boolean existsByCampaignIdAndReporterId(Long campaignId, UUID reporterId);
    // Can add check for createdAt if 24h limit is needed strictly by query
}
