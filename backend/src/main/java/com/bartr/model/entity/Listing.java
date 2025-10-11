package com.bartr.model.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "listings")
public class Listing {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "have_item", nullable = false)
    private String haveItem;

    @Column(name = "want_item", nullable = false)
    private String wantItem;

    @Column(name = "have_description", columnDefinition = "TEXT")
    private String haveDescription;

    @Column(name = "want_description", columnDefinition = "TEXT")
    private String wantDescription;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private ListingStatus status;

    @Column(name = "created_at")
    private java.time.LocalDateTime createdAt;

    @Column(name = "updated_at")
    private java.time.LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = java.time.LocalDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = java.time.LocalDateTime.now();
    }

    // Getters
    public Long getId() { return id; }
    public User getUser() { return user; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getHaveItem() { return haveItem; }
    public String getWantItem() { return wantItem; }
    public String getHaveDescription() { return haveDescription; }
    public String getWantDescription() { return wantDescription; }
    public ListingStatus getStatus() { return status; }
    public java.time.LocalDateTime getCreatedAt() { return createdAt; }
    public java.time.LocalDateTime getUpdatedAt() { return updatedAt; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setUser(User user) { this.user = user; }
    public void setTitle(String title) { this.title = title; }
    public void setDescription(String description) { this.description = description; }
    public void setHaveItem(String haveItem) { this.haveItem = haveItem; }
    public void setWantItem(String wantItem) { this.wantItem = wantItem; }
    public void setHaveDescription(String haveDescription) { this.haveDescription = haveDescription; }
    public void setWantDescription(String wantDescription) { this.wantDescription = wantDescription; }
    public void setStatus(ListingStatus status) { this.status = status; }
    public void setCreatedAt(java.time.LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setUpdatedAt(java.time.LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}