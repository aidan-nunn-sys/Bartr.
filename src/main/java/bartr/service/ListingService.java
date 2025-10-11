package bartr.service;

import bartr.model.Listing;
import bartr.repository.ListingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ListingService {
    private final ListingRepository listingRepository;

    @Autowired
    public ListingService(ListingRepository listingRepository) {
        this.listingRepository = listingRepository;
    }

    public Listing createListing(Listing listing) {
        return listingRepository.save(listing);
    }

    public Listing getListingById(Long id) {
        return listingRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Listing not found with id: " + id));
    }

    public List<Listing> getAllListings() {
        return listingRepository.findAllByOrderByPostedDateDesc();
    }

    public List<Listing> getListings(String category, String searchTerm) {
        String normalizedCategory = normalizeCategory(category);
        String normalizedSearchTerm = normalizeSearchTerm(searchTerm);

        if (normalizedCategory == null && normalizedSearchTerm == null) {
            return getAllListings();
        }

        return listingRepository.searchListings(normalizedCategory, normalizedSearchTerm);
    }

    public List<Listing> getListingsByCategory(String category) {
        String normalizedCategory = normalizeCategory(category);
        if (normalizedCategory == null) {
            return getAllListings();
        }
        return listingRepository.findByCategoryIgnoreCase(normalizedCategory);
    }

    public List<Listing> searchListings(String searchTerm) {
        String normalizedSearchTerm = normalizeSearchTerm(searchTerm);
        if (normalizedSearchTerm == null) {
            return getAllListings();
        }
        return listingRepository.searchListings(null, normalizedSearchTerm);
    }

    public List<Listing> getListingsByUserId(Long userId) {
        return listingRepository.findByOwnerId(userId);
    }

    public Listing updateListing(Long id, Listing listingDetails) {
        Listing listing = getListingById(id);
        listing.setTitle(listingDetails.getTitle());
        listing.setDescription(listingDetails.getDescription());
        listing.setImage(listingDetails.getImage());
        listing.setLocation(listingDetails.getLocation());
        listing.setTradeFor(listingDetails.getTradeFor());
        listing.setCategory(listingDetails.getCategory());
        return listingRepository.save(listing);
    }

    public void deleteListing(Long id) {
        listingRepository.deleteById(id);
    }

    private String normalizeCategory(String category) {
        if (category == null) {
            return null;
        }
        String trimmed = category.trim();
        if (trimmed.isEmpty() || trimmed.equalsIgnoreCase("All")) {
            return null;
        }
        return trimmed;
    }

    private String normalizeSearchTerm(String searchTerm) {
        if (searchTerm == null) {
            return null;
        }
        String trimmed = searchTerm.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
