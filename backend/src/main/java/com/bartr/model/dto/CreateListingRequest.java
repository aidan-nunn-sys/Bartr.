package com.bartr.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
public class CreateListingRequest {
    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 100, message = "Title must be between 3 and 100 characters")
    private String title;

    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    private String description;

    @NotBlank(message = "Have item is required")
    @Size(min = 2, max = 100, message = "Have item must be between 2 and 100 characters")
    private String haveItem;

    @NotBlank(message = "Want item is required")
    @Size(min = 2, max = 100, message = "Want item must be between 2 and 100 characters")
    private String wantItem;

    @Size(max = 500, message = "Have description cannot exceed 500 characters")
    private String haveDescription;

    @Size(max = 500, message = "Want description cannot exceed 500 characters")
    private String wantDescription;

    // Getters
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getHaveItem() { return haveItem; }
    public String getWantItem() { return wantItem; }
    public String getHaveDescription() { return haveDescription; }
    public String getWantDescription() { return wantDescription; }

    // Setters
    public void setTitle(String title) { this.title = title; }
    public void setDescription(String description) { this.description = description; }
    public void setHaveItem(String haveItem) { this.haveItem = haveItem; }
    public void setWantItem(String wantItem) { this.wantItem = wantItem; }
    public void setHaveDescription(String haveDescription) { this.haveDescription = haveDescription; }
    public void setWantDescription(String wantDescription) { this.wantDescription = wantDescription; }
}
