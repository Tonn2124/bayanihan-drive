package com.bayanihandrive.acebedobelenmedil.model;

import com.fasterxml.jackson.annotation.JsonValue;

// This Java Enum maps to your `campaign_category` SQL ENUM
public enum CampaignCategory {
    COMMUNITY("community"),
    ANIMAL_WELFARE("animal_welfare"),
    MEDICAL("medical"),
    EDUCATION("education"),
    DISASTER_RELIEF("disaster_relief"),
    OTHER("other");

    private final String value;

    CampaignCategory(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    // Helper method to find the enum by its string value
    public static CampaignCategory fromValue(String value) {
        for (CampaignCategory category : values()) {
            if (category.value.equalsIgnoreCase(value)) {
                return category;
            }
        }
        throw new IllegalArgumentException("Unknown enum value: " + value);
    }
}