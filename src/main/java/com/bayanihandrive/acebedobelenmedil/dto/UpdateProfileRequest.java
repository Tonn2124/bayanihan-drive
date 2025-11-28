package com.bayanihandrive.acebedobelenmedil.dto;

public record UpdateProfileRequest(
    String fullName,
    String avatarUrl,
    String username, // Optional: Allow changing username
    String phone
) {}