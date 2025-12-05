package com.bayanihandrive.acebedobelenmedil.service;

import com.bayanihandrive.acebedobelenmedil.dto.DonationRequest;
import com.bayanihandrive.acebedobelenmedil.model.Campaign;
import com.bayanihandrive.acebedobelenmedil.model.Donation;
import com.bayanihandrive.acebedobelenmedil.model.Wallet;
import com.bayanihandrive.acebedobelenmedil.repository.CampaignRepository;
import com.bayanihandrive.acebedobelenmedil.repository.DonationRepository;
import com.bayanihandrive.acebedobelenmedil.repository.ProfileRepository;
import com.bayanihandrive.acebedobelenmedil.repository.WalletRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class DonationService {

    private final DonationRepository donationRepository;
    private final CampaignRepository campaignRepository;
    private final WalletRepository walletRepository;
    private final ProfileRepository profileRepository;

    @Autowired
    public DonationService(DonationRepository donationRepository, 
                           CampaignRepository campaignRepository,
                           WalletRepository walletRepository,
                           ProfileRepository profileRepository) {
        this.donationRepository = donationRepository;
        this.campaignRepository = campaignRepository;
        this.walletRepository = walletRepository;
        this.profileRepository = profileRepository;
    }

    @Transactional
    public Donation processDonation(DonationRequest request, String donorId) {
        UUID donorUUID = UUID.fromString(donorId);
        
        // FIX: Use record accessors (no 'get' prefix)
        Campaign campaign = campaignRepository.findById(request.campaignId())
                .orElseThrow(() -> new RuntimeException("Campaign not found"));

        Wallet donorWallet = walletRepository.findByUserId(donorUUID)
                .orElseThrow(() -> new RuntimeException("Wallet not found"));

        if (donorWallet.getBalance().compareTo(request.amount()) < 0) {
            throw new RuntimeException("Insufficient funds");
        }

        // Deduct from Wallet
        donorWallet.setBalance(donorWallet.getBalance().subtract(request.amount()));
        walletRepository.save(donorWallet);

        // Add to Campaign
        campaign.setCurrentAmount(campaign.getCurrentAmount().add(request.amount()));
        campaignRepository.save(campaign);

        // Save Donation Record
        Donation donation = new Donation();
        donation.setCampaignId(request.campaignId());
        donation.setDonorId(donorUUID);
        donation.setAmount(request.amount());
        donation.setMessage(request.message());
        donation.setAnonymous(request.isAnonymous());

        return donationRepository.save(donation);
    }
    
    public List<Donation> getDonationsForCampaign(Long campaignId) {
        List<Donation> donations = donationRepository.findByCampaignIdOrderByCreatedAtDesc(campaignId);
        
        // LOGIC: Populate donor names if not anonymous
        for (Donation donation : donations) {
            if (!donation.isAnonymous()) {
                profileRepository.findById(donation.getDonorId()).ifPresent(profile -> {
                    String fullName = profile.getFullName();
                    if (fullName != null && !fullName.isEmpty()) {
                        // Get first name only
                        String firstName = fullName.split(" ")[0]; 
                        donation.setDonorName(firstName);
                    } else {
                        donation.setDonorName("Supporter");
                    }
                });
            }
        }
        return donations;
    }

    public List<Donation> getDonationsByDonor(String donorId) {
        return donationRepository.findByDonorIdOrderByCreatedAtDesc(UUID.fromString(donorId));
    }
}