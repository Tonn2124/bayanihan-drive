package com.bayanihandrive.acebedobelenmedil.service;

import com.bayanihandrive.acebedobelenmedil.dto.CreateCampaignRequest;
import com.bayanihandrive.acebedobelenmedil.model.Campaign;
import com.bayanihandrive.acebedobelenmedil.repository.CampaignRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.UUID;
import java.util.List;

@Service
public class CampaignService {

    private final CampaignRepository campaignRepository;

    @Autowired
    public CampaignService(CampaignRepository campaignRepository) {
        this.campaignRepository = campaignRepository;
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
    
    public List<Campaign> getAllActiveCampaigns() {
        return campaignRepository.findByIsActive(true);
    }
}