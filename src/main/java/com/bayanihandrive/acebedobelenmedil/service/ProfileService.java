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
        return profileRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new RuntimeException("Profile not found"));
    }

    @Transactional
    public Profile updateProfile(String userId, UpdateProfileRequest request) {
        Profile profile = getProfile(userId);

        if (request.fullName() != null) profile.setFullName(request.fullName());
        if (request.avatarUrl() != null) profile.setAvatarUrl(request.avatarUrl());
        if (request.username() != null) profile.setUsername(request.username()); // Add check for uniqueness in a real app
        if (request.phone() != null) profile.setPhone(request.phone());

        return profileRepository.save(profile);
    }
}