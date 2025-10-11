package com.bartr.model.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "matches")
public class Match {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "listing1_id", nullable = false)
    private Listing listing1;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "listing2_id", nullable = false)
    private Listing listing2;

    @Column(nullable = false)
    private Double matchScore;

    @Column(name = "created_at")
    private java.time.LocalDateTime createdAt;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private MatchStatus status;

    @PrePersist
    protected void onCreate() {
        createdAt = java.time.LocalDateTime.now();
        if (status == null) {
            status = MatchStatus.PENDING;
        }
    }

    // Getters
    public Long getId() { return id; }
    public Listing getListing1() { return listing1; }
    public Listing getListing2() { return listing2; }
    public Double getMatchScore() { return matchScore; }
    public java.time.LocalDateTime getCreatedAt() { return createdAt; }
    public MatchStatus getStatus() { return status; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setListing1(Listing listing1) { this.listing1 = listing1; }
    public void setListing2(Listing listing2) { this.listing2 = listing2; }
    public void setMatchScore(Double matchScore) { this.matchScore = matchScore; }
    public void setCreatedAt(java.time.LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setStatus(MatchStatus status) { this.status = status; }
}