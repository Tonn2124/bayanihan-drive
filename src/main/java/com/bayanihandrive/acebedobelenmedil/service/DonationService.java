package com.bayanihandrive.acebedobelenmedil.service;

import com.bayanihandrive.acebedobelenmedil.dto.DonationRequest;
import com.bayanihandrive.acebedobelenmedil.model.Donation;
import com.bayanihandrive.acebedobelenmedil.repository.DonationRepository;
import com.bayanihandrive.acebedobelenmedil.repository.ProfileRepository; // Import this
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class DonationService {

    private final DonationRepository donationRepository;
    private final ProfileRepository profileRepository; // Needed for names

    @Autowired
    public DonationService(DonationRepository donationRepository, ProfileRepository profileRepository) {
        this.donationRepository = donationRepository;
        this.profileRepository = profileRepository;
    }

    @Transactional
    public Donation processDonation(DonationRequest request, String donorId) {
        Donation donation = new Donation();
        donation.setCampaignId(request.campaignId());
        donation.setDonorId(UUID.fromString(donorId));
        donation.setAmount(request.amount());
        
        // REMOVED: donation.setMessage(request.message()); 
        
        donation.setAnonymous(request.isAnonymous());

        return donationRepository.save(donation);
    }
    
    public List<Donation> getDonationsForCampaign(Long campaignId) {
        List<Donation> donations = donationRepository.findByCampaignIdOrderByCreatedAtDesc(campaignId);

        // Logic: Populate donor names if not anonymous
        for (Donation donation : donations) {
            if (!donation.isAnonymous()) {
                profileRepository.findById(donation.getDonorId()).ifPresent(profile -> {
                    String fullName = profile.getFullName();
                    if (fullName != null && !fullName.isEmpty()) {
                        // Get First Name only
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