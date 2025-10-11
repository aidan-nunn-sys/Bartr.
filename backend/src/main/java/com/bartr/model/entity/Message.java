package com.bartr.model.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "messages")
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "match_id", nullable = false)
    private Match match;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "created_at")
    private java.time.LocalDateTime createdAt;

    @Column(name = "read_at")
    private java.time.LocalDateTime readAt;

    @PrePersist
    protected void onCreate() {
        createdAt = java.time.LocalDateTime.now();
    }

    // Getters
    public Long getId() { return id; }
    public Match getMatch() { return match; }
    public User getSender() { return sender; }
    public String getContent() { return content; }
    public java.time.LocalDateTime getCreatedAt() { return createdAt; }
    public java.time.LocalDateTime getReadAt() { return readAt; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setMatch(Match match) { this.match = match; }
    public void setSender(User sender) { this.sender = sender; }
    public void setContent(String content) { this.content = content; }
    public void setCreatedAt(java.time.LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setReadAt(java.time.LocalDateTime readAt) { this.readAt = readAt; }
}