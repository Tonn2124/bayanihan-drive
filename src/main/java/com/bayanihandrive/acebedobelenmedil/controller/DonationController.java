package com.bayanihandrive.acebedobelenmedil.controller;

import com.bayanihandrive.acebedobelenmedil.dto.DonationRequest;
import com.bayanihandrive.acebedobelenmedil.model.Donation;
import com.bayanihandrive.acebedobelenmedil.service.DonationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/donations")
@CrossOrigin(origins = "http://localhost:3000")
public class DonationController {

    private final DonationService donationService;

    @Autowired
    public DonationController(DonationService donationService) {
        this.donationService = donationService;
    }

    @PostMapping
    public ResponseEntity<Donation> donate(
            @Valid @RequestBody DonationRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        
        String donorId = jwt.getSubject();
        Donation donation = donationService.processDonation(request, donorId);
        
        return ResponseEntity.ok(donation);
    }
    
    @GetMapping("/campaign/{campaignId}")
    public ResponseEntity<List<Donation>> getCampaignDonations(@PathVariable Long campaignId) {
        return ResponseEntity.ok(donationService.getDonationsForCampaign(campaignId));
    }

    @GetMapping("/my-donations")
    public ResponseEntity<List<Donation>> getMyDonations(@AuthenticationPrincipal Jwt jwt) {
        String donorId = jwt.getSubject();
        return ResponseEntity.ok(donationService.getDonationsByDonor(donorId));
    }
}