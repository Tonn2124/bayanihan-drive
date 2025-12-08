package com.bayanihandrive.acebedobelenmedil.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateReportRequest(
    @NotNull Long campaignId,
    @NotBlank String reason,
    @NotBlank String proofUrl
) {}
