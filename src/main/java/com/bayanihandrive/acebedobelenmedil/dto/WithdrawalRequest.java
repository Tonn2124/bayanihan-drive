package com.bayanihandrive.acebedobelenmedil.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record WithdrawalRequest(
    @NotNull Long campaignId,
    @NotNull @Positive BigDecimal amount,
    @NotBlank String paymentMethod,
    @NotBlank String accountDetails
) {}