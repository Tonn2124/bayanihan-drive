package com.bayanihandrive.acebedobelenmedil.repository;

import com.bayanihandrive.acebedobelenmedil.model.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findByCampaignId(Long campaignId);
    
    boolean existsByCampaignIdAndReporterId(Long campaignId, UUID reporterId);

    @Query("SELECT COUNT(r) > 0 FROM Report r WHERE r.campaignId = :campaignId AND r.reporterId = :reporterId AND r.createdAt > :cutoff")
    boolean existsRecentReport(@Param("campaignId") Long campaignId, @Param("reporterId") UUID reporterId, @Param("cutoff") Instant cutoff);
}
