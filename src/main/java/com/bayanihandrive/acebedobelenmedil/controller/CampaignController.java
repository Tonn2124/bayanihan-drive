package com.bayanihandrive.acebedobelenmedil.controller;

import com.bayanihandrive.acebedobelenmedil.dto.CreateCampaignRequest;
import com.bayanihandrive.acebedobelenmedil.model.Campaign;
import com.bayanihandrive.acebedobelenmedil.service.CampaignService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/campaigns")
@CrossOrigin(origins = "http://localhost:3000")
public class CampaignController {

    private final CampaignService campaignService;

    @Autowired
    public CampaignController(CampaignService campaignService) {
        this.campaignService = campaignService;
    }

    @PostMapping
    public ResponseEntity<Campaign> createCampaign(
            @Valid @RequestBody CreateCampaignRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        
        String organizerId = jwt.getSubject();
        Campaign createdCampaign = campaignService.createCampaign(request, organizerId);

        return ResponseEntity
            .created(URI.create("/api/campaigns/" + createdCampaign.getId()))
            .body(createdCampaign);
    }

    // --- SEARCH & FILTER (PUBLIC) ---
    @GetMapping
    public ResponseEntity<List<Campaign>> getAllCampaigns(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String category) {
        
        if ((query != null && !query.isEmpty()) || (category != null && !category.isEmpty())) {
            return ResponseEntity.ok(campaignService.searchCampaigns(query, category));
        }
        
        return ResponseEntity.ok(campaignService.getAllActiveCampaigns());
    }

    // --- MY CAMPAIGNS (SECURED) ---
    @GetMapping("/my-campaigns")
    public ResponseEntity<List<Campaign>> getMyCampaigns(@AuthenticationPrincipal Jwt jwt) {
        String organizerId = jwt.getSubject(); 
        List<Campaign> campaigns = campaignService.getCampaignsByOrganizer(organizerId);
        return ResponseEntity.ok(campaigns);
    }

    // --- USER CAMPAIGNS (PUBLIC) ---
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Campaign>> getUserCampaigns(@PathVariable String userId) {
        List<Campaign> campaigns = campaignService.getCampaignsByOrganizer(userId);
        return ResponseEntity.ok(campaigns);
    }
    
    // --- GET SINGLE CAMPAIGN (PUBLIC) ---
    @GetMapping("/{id}")
    public ResponseEntity<Campaign> getCampaignById(@PathVariable Long id) {
        Campaign campaign = campaignService.getCampaignById(id);
        return ResponseEntity.ok(campaign);
    }

} // <--- This is the FINAL closing brace for the class.