package com.bayanihandrive.acebedobelenmedil.model;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.hibernate.annotations.ColumnTransformer;
import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;

@Entity
@Table(name = "campaigns")
public class Campaign {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // This is the link to the auth.users table (and public.profiles)
    @Column(name = "organizer_id", nullable = false)
    private UUID organizerId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "goal_amount", nullable = false)
    private BigDecimal goalAmount;

    @Column(name = "current_amount", nullable = false)
    private BigDecimal currentAmount;


    @Column(name = "category", nullable = false)
    @Convert(converter = CampaignCategoryConverter.class) 

    @ColumnTransformer(write = "?::campaign_category")
    private CampaignCategory category;

    @Column(name = "cover_image_url")
    private String coverImageUrl;

    @ElementCollection
    @CollectionTable(name = "campaign_images", joinColumns = @JoinColumn(name = "campaign_id"))
    @Column(name = "image_url")
    private List<String> images = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(name = "urgency")
    private CampaignUrgency urgency;

    @CreationTimestamp // Automatically set by Hibernate
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "end_date")
    private Instant endDate;

    @Column(name = "is_active")
    private boolean isActive;

    // Getters and Setters...
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public UUID getOrganizerId() { return organizerId; }
    public void setOrganizerId(UUID organizerId) { this.organizerId = organizerId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getGoalAmount() { return goalAmount; }
    public void setGoalAmount(BigDecimal goalAmount) { this.goalAmount = goalAmount; }
    public BigDecimal getCurrentAmount() { return currentAmount; }
    public void setCurrentAmount(BigDecimal currentAmount) { this.currentAmount = currentAmount; }
    public CampaignCategory getCategory() { return category; }
    public void setCategory(CampaignCategory category) { this.category = category; }
    public String getCoverImageUrl() { return coverImageUrl; }
    public void setCoverImageUrl(String coverImageUrl) { this.coverImageUrl = coverImageUrl; }
    public List<String> getImages() { return images; }
    public void setImages(List<String> images) { this.images = images; }
    public CampaignUrgency getUrgency() { return urgency; }
    public void setUrgency(CampaignUrgency urgency) { this.urgency = urgency; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getEndDate() { return endDate; }
    public void setEndDate(Instant endDate) { this.endDate = endDate; }
    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    //WITHDRAWAL FEAETURE
    @Column(name = "withdrawn_amount")
    private BigDecimal withdrawnAmount = BigDecimal.ZERO;


    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @ColumnTransformer(write = "?::campaign_status")
    private CampaignStatus status = CampaignStatus.PENDING;

    
    public BigDecimal getWithdrawnAmount() { return withdrawnAmount; }
    public void setWithdrawnAmount(BigDecimal withdrawnAmount) { this.withdrawnAmount = withdrawnAmount; }
    
    
    public BigDecimal getAvailableBalance() {
        return currentAmount.subtract(withdrawnAmount);
    }

    public CampaignStatus getStatus() { 
        return status; 
    }
    
    public void setStatus(CampaignStatus status) { 
        this.status = status; 
    }

    
}