package com.bayanihandrive.acebedobelenmedil.service;

import com.bayanihandrive.acebedobelenmedil.dto.CreateReportRequest;
import com.bayanihandrive.acebedobelenmedil.model.Report;
import com.bayanihandrive.acebedobelenmedil.repository.ReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
public class ReportService {

    private final ReportRepository reportRepository;

    @Autowired
    public ReportService(ReportRepository reportRepository) {
        this.reportRepository = reportRepository;
    }

    public void createReport(CreateReportRequest request, String reporterId) {
        UUID reporterUUID = UUID.fromString(reporterId);
        
        // 24 Hour Check
        Instant twentyFourHoursAgo = Instant.now().minus(24, ChronoUnit.HOURS);
        
        if (reportRepository.existsRecentReport(request.campaignId(), reporterUUID, twentyFourHoursAgo)) {
             throw new RuntimeException("You can only report a campaign once every 24 hours.");
        }

        Report report = new Report();
        report.setCampaignId(request.campaignId());
        report.setReporterId(reporterUUID);
        report.setReason(request.reason());
        report.setProofUrl(request.proofUrl());
        
        reportRepository.save(report);
    }

    public List<Report> getReportsForCampaign(Long campaignId) {
        return reportRepository.findByCampaignId(campaignId);
    }
    
    public List<Report> getAllReports() {
        return reportRepository.findAll();
    }
}
