package com.bayanihandrive.acebedobelenmedil.service;

import com.bayanihandrive.acebedobelenmedil.dto.UpdateProfileRequest;
import com.bayanihandrive.acebedobelenmedil.model.Profile;
import com.bayanihandrive.acebedobelenmedil.repository.ProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class ProfileService {

    private final ProfileRepository profileRepository;

    @Autowired
    public ProfileService(ProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
    }

    public Profile getProfile(String userId) {
        // Convert String ID from Token to UUID
        return profileRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new RuntimeException("Profile not found"));
    }

    @Transactional
    public Profile updateProfile(String userId, UpdateProfileRequest request) {
        Profile profile = getProfile(userId);

        // 1. Update Full Name
        if (request.fullName() != null && !request.fullName().isEmpty()) {
            profile.setFullName(request.fullName());
        }

        // 2. Update Avatar URL (Crucial for the image upload feature)
        if (request.avatarUrl() != null && !request.avatarUrl().isEmpty()) {
            profile.setAvatarUrl(request.avatarUrl());
        }

        // 3. Update Username
        if (request.username() != null && !request.username().isEmpty()) {
            // Note: In a production app, you should check if this username is already taken by someone else
            profile.setUsername(request.username());
        }

        // We removed Phone update logic to match the Frontend changes

        return profileRepository.save(profile);
    }
}