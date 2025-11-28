package com.bayanihandrive.acebedobelenmedil.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "profiles")
public class Profile {
    @Id
    private UUID id;
    
    private String role; // "USER" or "ADMIN"

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}