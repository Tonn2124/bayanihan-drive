package com.bayanihandrive.acebedobelenmedil.controller;

import com.bayanihandrive.acebedobelenmedil.model.Campaign;
import com.bayanihandrive.acebedobelenmedil.service.CampaignService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {

    private final CampaignService campaignService;

    @Autowired
    public AdminController(CampaignService campaignService) {
        this.campaignService = campaignService;
    }

    @GetMapping("/campaigns/pending")
    public ResponseEntity<List<Campaign>> getPendingCampaigns(@AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        if (!campaignService.isAdmin(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(campaignService.getPendingCampaigns());
    }

    @GetMapping("/campaigns")
    public ResponseEntity<List<Campaign>> getAllCampaigns(
            @RequestParam(required = false) String status,
            @AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        if (!campaignService.isAdmin(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(campaignService.getAllCampaignsForAdmin(status));
    }

    @DeleteMapping("/campaigns/{id}")
    public ResponseEntity<Void> deleteCampaign(
            @PathVariable Long id,
            @AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        if (!campaignService.isAdmin(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        campaignService.deleteCampaign(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/campaigns/{id}/verify")
    public ResponseEntity<Campaign> verifyCampaign(
            @PathVariable Long id,
            @RequestParam boolean approve,
            @AuthenticationPrincipal Jwt jwt) {
        
        String userId = jwt.getSubject();
        if (!campaignService.isAdmin(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        return ResponseEntity.ok(campaignService.verifyCampaign(id, approve));
    }
}