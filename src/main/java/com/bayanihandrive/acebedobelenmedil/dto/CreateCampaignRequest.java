package com.bayanihandrive.acebedobelenmedil.dto;

import com.bayanihandrive.acebedobelenmedil.model.CampaignCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.Instant;

// This can be a 'record' for less boilerplate
public record CreateCampaignRequest(
    
    @NotBlank(message = "Title is required")
    @Size(min = 5, max = 100, message = "Title must be between 5 and 100 characters")
    String title,
    
    @NotBlank(message = "Description is required")
    @Size(min = 20, message = "Description must be at least 20 characters")
    String description,
    
    @NotNull(message = "Goal amount is required")
    @Positive(message = "Goal amount must be positive")
    BigDecimal goalAmount,
    
    @NotNull(message = "Category is required")
    CampaignCategory category,
    
    String coverImageUrl,
    
    Instant endDate
) {}