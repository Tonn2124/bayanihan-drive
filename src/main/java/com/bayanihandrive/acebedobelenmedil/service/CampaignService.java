package com.bayanihandrive.acebedobelenmedil.service;

import com.bayanihandrive.acebedobelenmedil.dto.CreateCampaignRequest;
import com.bayanihandrive.acebedobelenmedil.model.Campaign;
import com.bayanihandrive.acebedobelenmedil.model.CampaignStatus;
import com.bayanihandrive.acebedobelenmedil.repository.CampaignRepository;
import com.bayanihandrive.acebedobelenmedil.repository.ProfileRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.UUID;
import java.util.List;

@Service
public class CampaignService {

    private final CampaignRepository campaignRepository;
    private final ProfileRepository profileRepository;

    @Autowired
    public CampaignService(CampaignRepository campaignRepository, ProfileRepository profileRepository) {
        this.campaignRepository = campaignRepository;
        this.profileRepository = profileRepository;
    }

    public Campaign createCampaign(CreateCampaignRequest request, String organizerId) {
        Campaign campaign = new Campaign();

        // 1. Map data from DTO
        campaign.setTitle(request.title());
        campaign.setDescription(request.description());
        campaign.setGoalAmount(request.goalAmount());
        campaign.setCategory(request.category());
        campaign.setCoverImageUrl(request.coverImageUrl());
        campaign.setEndDate(request.endDate());

        // 2. Set server-controlled data
        campaign.setOrganizerId(UUID.fromString(organizerId)); // Set the owner
        campaign.setCurrentAmount(BigDecimal.ZERO); // New campaigns start at 0
        campaign.setActive(true); // New campaigns are active by default

        // 3. Save to database
        return campaignRepository.save(campaign);
    }
    


    public Campaign getCampaignById(Long id) {
        return campaignRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Campaign not found with id: " + id));
    }

    public List<Campaign> getCampaignsByOrganizer(String organizerId) {
        return campaignRepository.findByOrganizerId(UUID.fromString(organizerId));
    }

    // --- ADMIN METHODS ---

    public boolean isAdmin(String userId) {
        return profileRepository.findById(UUID.fromString(userId))
                .map(profile -> "ADMIN".equalsIgnoreCase(profile.getRole()))
                .orElse(false);
    }

    public List<Campaign> getPendingCampaigns() {
        return campaignRepository.findByStatus(CampaignStatus.PENDING);
    }

    public Campaign verifyCampaign(Long campaignId, boolean approve) {
        Campaign campaign = getCampaignById(campaignId);
        campaign.setStatus(approve ? CampaignStatus.APPROVED : CampaignStatus.REJECTED);
        return campaignRepository.save(campaign);
    }

    // Update this to use the new repository method
    public List<Campaign> getAllActiveCampaigns() {
        return campaignRepository.findAllActiveAndApproved();
    }

    // --- ADD SEARCH METHOD ---
    public List<Campaign> searchCampaigns(String query, String category) {
        // If category is "ALL" or empty, send null to repository to ignore the filter
        String categoryFilter = (category != null && !category.equalsIgnoreCase("ALL")) ? category.toLowerCase() : null;
        String searchQuery = (query != null) ? query : "";
        
        return campaignRepository.searchCampaigns(searchQuery, categoryFilter);
    }
}