package com.bartr.model.entity;

public enum MatchStatus {
    PENDING,     // Match found but not yet accepted by both parties
    ACCEPTED,    // Both parties have accepted the match
    REJECTED,    // One or both parties rejected the match
    COMPLETED    // Trade has been completed
}