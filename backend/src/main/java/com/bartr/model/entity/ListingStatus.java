package com.bartr.model.entity;

public enum ListingStatus {
    ACTIVE,      // Listing is active and visible to other users
    MATCHED,     // Listing has found a match and is in progress
    COMPLETED,   // Trade has been completed
    CANCELLED,   // Listing was cancelled by the user
    EXPIRED      // Listing has expired (optional, if we want to add expiry)
}