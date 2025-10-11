package com.bartr.model.dto;


public class ListingResponse {
    private Long id;
    private Long userId;
    private String userName;
    private String title;
    private String description;
    private String haveItem;
    private String wantItem;
    private String haveDescription;
    private String wantDescription;
    private String status;
    private String createdAt;

    // Getters
    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public String getUserName() { return userName; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getHaveItem() { return haveItem; }
    public String getWantItem() { return wantItem; }
    public String getHaveDescription() { return haveDescription; }
    public String getWantDescription() { return wantDescription; }
    public String getStatus() { return status; }
    public String getCreatedAt() { return createdAt; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setUserId(Long userId) { this.userId = userId; }
    public void setUserName(String userName) { this.userName = userName; }
    public void setTitle(String title) { this.title = title; }
    public void setDescription(String description) { this.description = description; }
    public void setHaveItem(String haveItem) { this.haveItem = haveItem; }
    public void setWantItem(String wantItem) { this.wantItem = wantItem; }
    public void setHaveDescription(String haveDescription) { this.haveDescription = haveDescription; }
    public void setWantDescription(String wantDescription) { this.wantDescription = wantDescription; }
    public void setStatus(String status) { this.status = status; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
