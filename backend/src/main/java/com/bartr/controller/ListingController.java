package com.bartr.controller;

import com.bartr.model.dto.CreateListingRequest;
import com.bartr.model.dto.ListingResponse;
import com.bartr.service.ListingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/listings")
public class ListingController {
    private final ListingService listingService;

    public ListingController(ListingService listingService) {
        this.listingService = listingService;
    }

    @PostMapping
    public ResponseEntity<ListingResponse> createListing(
            @RequestHeader("X-User-Id") Long userId,  // Temporary, will be replaced with proper auth
            @Valid @RequestBody CreateListingRequest request) {
        return ResponseEntity.ok(listingService.createListing(userId, request));
    }

    @GetMapping
    public ResponseEntity<List<ListingResponse>> getActiveListings() {
        return ResponseEntity.ok(listingService.getActiveListings());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ListingResponse> getListing(@PathVariable Long id) {
        return ResponseEntity.ok(listingService.getListing(id));
    }
}