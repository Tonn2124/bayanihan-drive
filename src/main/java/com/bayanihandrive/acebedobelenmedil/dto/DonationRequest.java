package com.bayanihandrive.acebedobelenmedil.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record DonationRequest(
    @NotNull(message = "Campaign ID is required")
    Long campaignId,

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be greater than 0")
    BigDecimal amount,

    // REMOVED: String message,
    
    boolean isAnonymous
) {}