package com.bayanihandrive.acebedobelenmedil.service;

import com.bayanihandrive.acebedobelenmedil.dto.DonationRequest;
import com.bayanihandrive.acebedobelenmedil.model.Donation;
import com.bayanihandrive.acebedobelenmedil.repository.DonationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class DonationService {

    private final DonationRepository donationRepository;

    @Autowired
    public DonationService(DonationRepository donationRepository) {
        this.donationRepository = donationRepository;
    }

    // We rely on the database TRIGGER we wrote to handle the wallet/campaign balance updates.
    // This service just saves the donation record, and the DB does the rest safely.
    @Transactional
    public Donation processDonation(DonationRequest request, String donorId) {
        Donation donation = new Donation();
        donation.setCampaignId(request.campaignId());
        donation.setDonorId(UUID.fromString(donorId));
        donation.setAmount(request.amount());
        donation.setMessage(request.message());
        donation.setAnonymous(request.isAnonymous());

        return donationRepository.save(donation);
    }
    
    public List<Donation> getDonationsForCampaign(Long campaignId) {
        return donationRepository.findByCampaignIdOrderByCreatedAtDesc(campaignId);
    }
}