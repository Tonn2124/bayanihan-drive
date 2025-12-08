package com.bayanihandrive.acebedobelenmedil.controller;

import com.bayanihandrive.acebedobelenmedil.dto.CreateReportRequest;
import com.bayanihandrive.acebedobelenmedil.model.Report;
import com.bayanihandrive.acebedobelenmedil.service.ReportService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "http://localhost:3000")
public class ReportController {

    private final ReportService reportService;

    @Autowired
    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @PostMapping
    public ResponseEntity<Void> submitReport(
            @Valid @RequestBody CreateReportRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        
        reportService.createReport(request, jwt.getSubject());
        return ResponseEntity.ok().build();
    }

    // Admin only
    @GetMapping
    public ResponseEntity<List<Report>> getAllReports(@AuthenticationPrincipal Jwt jwt) {
        // Need to check admin role here properly, but for now assuming endpoint is secured or service checks it
        // Ideally should reuse the isAdmin check from CampaignService or similar
        return ResponseEntity.ok(reportService.getAllReports());
    }
}
