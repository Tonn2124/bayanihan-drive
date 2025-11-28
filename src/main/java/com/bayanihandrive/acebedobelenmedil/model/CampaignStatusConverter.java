package com.bayanihandrive.acebedobelenmedil.model;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class CampaignStatusConverter implements AttributeConverter<CampaignStatus, String> {
    @Override
    public String convertToDatabaseColumn(CampaignStatus status) {
        return status == null ? null : status.name();
    }

    @Override
    public CampaignStatus convertToEntityAttribute(String dbData) {
        return dbData == null ? null : CampaignStatus.valueOf(dbData);
    }
}