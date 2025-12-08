package com.bayanihandrive.acebedobelenmedil.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "profiles")
public class Profile {

    @Id
    private UUID id;

    private String role; // "USER" or "ADMIN"

    @Column(name = "full_name")
    private String fullName;

    @Column(name = "avatar_url")
    private String avatarUrl;

    private String username;

    private String phone;

    @Column(columnDefinition = "TEXT")
    private String bio;

    // --- CONSTRUCTORS ---
    public Profile() {
        // Default constructor required by JPA
    }

    // Fixed: Removed unused 'email' parameter
    public Profile(UUID id, String fullName, String username) {
        this.id = id;
        this.fullName = fullName;
        this.username = username;
        this.role = "USER"; // Default
    }

    // --- GETTERS AND SETTERS ---
    // Ensure these are INSIDE the class (before the final closing brace)

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

} // <--- IMPORTANT: The class must end here