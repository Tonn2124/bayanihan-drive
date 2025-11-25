package com.bayanihandrive.acebedobelenmedil.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.ColumnTransformer; // <-- IMPORT THIS

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

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

    // --- THIS IS THE NEW FIX ---
    // 1. We remove columnDefinition = "campaign_category"
    @Column(name = "category", nullable = false)
    @Convert(converter = CampaignCategoryConverter.class) // This turns EDUCATION -> "education"
    // 2. We add @ColumnTransformer.
    // This forces Hibernate to cast our string ("education") to the 
    // correct "campaign_category" enum type in the SQL query.
    @ColumnTransformer(write = "?::campaign_category")
    private CampaignCategory category;

    @Column(name = "cover_image_url")
    private String coverImageUrl;

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
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getEndDate() { return endDate; }
    public void setEndDate(Instant endDate) { this.endDate = endDate; }
    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    //WITHDRAWAL FEAETURE
    @Column(name = "withdrawn_amount")
    private BigDecimal withdrawnAmount = BigDecimal.ZERO;

    
    public BigDecimal getWithdrawnAmount() { return withdrawnAmount; }
    public void setWithdrawnAmount(BigDecimal withdrawnAmount) { this.withdrawnAmount = withdrawnAmount; }
    
    
    public BigDecimal getAvailableBalance() {
        return currentAmount.subtract(withdrawnAmount);
    }
}