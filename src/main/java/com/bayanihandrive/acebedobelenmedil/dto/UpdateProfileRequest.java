package com.bayanihandrive.acebedobelenmedil.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

// We use a Record here so we don't need Getters/Setters.
// Accessors will be .fullName(), .username(), etc.
public record UpdateProfileRequest(
    
    @NotBlank(message = "Full Name cannot be empty")
    @Size(max = 50, message = "Full Name exceeds 50 characters")
    String fullName,

    @NotBlank(message = "Username cannot be empty")
    @Size(max = 20, message = "Username exceeds 20 characters")
    String username,

    // This field catches the Supabase URL sent from React
    String avatarUrl,

    @Size(max = 500, message = "Bio exceeds 500 characters")
    String bio
) {}