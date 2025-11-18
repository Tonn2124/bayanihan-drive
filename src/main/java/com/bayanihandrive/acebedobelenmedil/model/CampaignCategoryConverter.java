package com.bayanihandrive.acebedobelenmedil.model;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class CampaignCategoryConverter implements AttributeConverter<CampaignCategory, String> {

    @Override
    public String convertToDatabaseColumn(CampaignCategory category) {
        if (category == null) {
            return null;
        }
        return category.getValue(); // Converts MEDICAL to "medical"
    }

    @Override
    public CampaignCategory convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        return CampaignCategory.fromValue(dbData); // Converts "medical" to MEDICAL
    }
}