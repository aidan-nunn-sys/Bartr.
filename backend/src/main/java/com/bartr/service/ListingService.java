package com.bartr.service;

import com.bartr.model.dto.CreateListingRequest;
import com.bartr.model.dto.ListingResponse;
import com.bartr.model.entity.Listing;
import com.bartr.model.entity.ListingStatus;
import com.bartr.model.entity.User;
import com.bartr.exception.ResourceNotFoundException;
import com.bartr.repository.ListingRepository;
import com.bartr.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ListingService {
    private final ListingRepository listingRepository;
    private final UserRepository userRepository;

    public ListingService(ListingRepository listingRepository, UserRepository userRepository) {
        this.listingRepository = listingRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ListingResponse createListing(Long userId, CreateListingRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Listing listing = new Listing();
        listing.setUser(user);
        listing.setTitle(request.getTitle());
        listing.setDescription(request.getDescription());
        listing.setHaveItem(request.getHaveItem());
        listing.setWantItem(request.getWantItem());
        listing.setHaveDescription(request.getHaveDescription());
        listing.setWantDescription(request.getWantDescription());
        listing.setStatus(ListingStatus.ACTIVE);

        listing = listingRepository.save(listing);
        return convertToResponse(listing);
    }

    @Transactional(readOnly = true)
    public List<ListingResponse> getActiveListings() {
        return listingRepository.findAll().stream()
                .filter(listing -> listing.getStatus() == ListingStatus.ACTIVE)
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ListingResponse getListing(Long id) {
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found with id: " + id));
        return convertToResponse(listing);
    }

    private ListingResponse convertToResponse(Listing listing) {
        ListingResponse response = new ListingResponse();
        response.setId(listing.getId());
        response.setUserId(listing.getUser().getId());
        response.setUserName(listing.getUser().getName());
        response.setTitle(listing.getTitle());
        response.setDescription(listing.getDescription());
        response.setHaveItem(listing.getHaveItem());
        response.setWantItem(listing.getWantItem());
        response.setHaveDescription(listing.getHaveDescription());
        response.setWantDescription(listing.getWantDescription());
        response.setStatus(listing.getStatus().name());
        response.setCreatedAt(listing.getCreatedAt().toString());
        return response;
    }
}