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

@RestController
@RequestMapping("/api/campaigns")
// We set global CORS in SecurityConfig, but this is also good for clarity
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
        
        // 1. Get the authenticated user's ID (the UUID) from the JWT.
        String organizerId = jwt.getSubject();

        // 2. Call the service to create the campaign
        Campaign createdCampaign = campaignService.createCampaign(request, organizerId);

        // 3. Return a "201 Created" response
        return ResponseEntity
            .created(URI.create("/api/campaigns/" + createdCampaign.getId()))
            .body(createdCampaign);
    }
}