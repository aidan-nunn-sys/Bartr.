package com.bartr.model.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String name;

    private String location;
    
    @Column(nullable = false)
    private String passwordHash;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(name = "created_at")
    private java.time.LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = java.time.LocalDateTime.now();
    }

    // Getters
    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getName() { return name; }
    public String getLocation() { return location; }
    public String getPasswordHash() { return passwordHash; }
    public String getBio() { return bio; }
    public java.time.LocalDateTime getCreatedAt() { return createdAt; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setEmail(String email) { this.email = email; }
    public void setName(String name) { this.name = name; }
    public void setLocation(String location) { this.location = location; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public void setBio(String bio) { this.bio = bio; }
    public void setCreatedAt(java.time.LocalDateTime createdAt) { this.createdAt = createdAt; }
}