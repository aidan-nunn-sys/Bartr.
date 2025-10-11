package com.bartr.service;

import com.bartr.model.entity.Listing;
import com.bartr.model.entity.Match;
import com.bartr.model.entity.MatchStatus;
import com.bartr.repository.ListingRepository;
import com.bartr.repository.MatchRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MatchService {
    private final ListingRepository listingRepository;
    private final MatchRepository matchRepository;

    public MatchService(ListingRepository listingRepository, MatchRepository matchRepository) {
        this.listingRepository = listingRepository;
        this.matchRepository = matchRepository;
    }

    @Transactional(readOnly = true)
    public List<Match> findPotentialMatches(Long listingId) {
        Listing listing = listingRepository.findById(listingId)
            .orElseThrow(() -> new RuntimeException("Listing not found"));

        // Get potential matches based on item descriptions
        List<Listing> potentialMatches = listingRepository.findPotentialMatches(
            listing.getId(),
            listing.getWantItem(),
            listing.getHaveItem()
        );

        // Score and filter matches
        return potentialMatches.stream()
            .map(potentialListing -> calculateMatch(listing, potentialListing))
            .filter(match -> match.getMatchScore() >= 0.5) // Minimum match threshold
            .collect(Collectors.toList());
    }

    private Match calculateMatch(Listing listing1, Listing listing2) {
        double score = calculateMatchScore(listing1, listing2);
        
        Match match = new Match();
        match.setListing1(listing1);
        match.setListing2(listing2);
        match.setMatchScore(score);
        match.setStatus(MatchStatus.PENDING);
        
        return match;
    }

    private double calculateMatchScore(Listing listing1, Listing listing2) {
        double itemMatchScore = calculateItemMatchScore(listing1, listing2);
        double locationScore = calculateLocationScore(listing1, listing2);
        
        // Weights for different factors (can be tuned)
        double itemWeight = 0.7;
        double locationWeight = 0.3;
        
        return (itemMatchScore * itemWeight) + (locationScore * locationWeight);
    }

    private double calculateItemMatchScore(Listing listing1, Listing listing2) {
        // Check if items match in both directions
        boolean directMatch = containsIgnoreCase(listing1.getHaveItem(), listing2.getWantItem());
        boolean reverseMatch = containsIgnoreCase(listing1.getWantItem(), listing2.getHaveItem());
        
        if (directMatch && reverseMatch) {
            return 1.0; // Perfect match
        } else if (directMatch || reverseMatch) {
            return 0.7; // Partial match
        }
        
        // Calculate fuzzy match score using item descriptions
        double haveWantScore = calculateFuzzyMatch(listing1.getHaveItem(), listing2.getWantItem());
        double wantHaveScore = calculateFuzzyMatch(listing1.getWantItem(), listing2.getHaveItem());
        
        return Math.max(haveWantScore, wantHaveScore);
    }

    private double calculateLocationScore(Listing listing1, Listing listing2) {
        // For MVP, if both users have locations, check if they're in the same area
        String location1 = listing1.getUser().getLocation();
        String location2 = listing2.getUser().getLocation();
        
        if (location1 == null || location2 == null) {
            return 0.5; // Neutral score if location not specified
        }
        
        return location1.equalsIgnoreCase(location2) ? 1.0 : 0.3;
    }

    private double calculateFuzzyMatch(String text1, String text2) {
        if (text1 == null || text2 == null) {
            return 0.0;
        }
        
        // Convert to lowercase for comparison
        text1 = text1.toLowerCase();
        text2 = text2.toLowerCase();
        
        // Split into words and calculate overlap
        String[] words1 = text1.split("\\s+");
        String[] words2 = text2.split("\\s+");
        
        int matches = 0;
        for (String word1 : words1) {
            for (String word2 : words2) {
                if (word1.length() > 3 && (word1.contains(word2) || word2.contains(word1))) {
                    matches++;
                }
            }
        }
        
        // Calculate score based on word overlap
        int totalWords = Math.max(words1.length, words2.length);
        return totalWords > 0 ? (double) matches / totalWords : 0.0;
    }

    private boolean containsIgnoreCase(String text, String search) {
        return text != null && search != null && 
               text.toLowerCase().contains(search.toLowerCase());
    }

    @Transactional
    public Match createMatch(Long listing1Id, Long listing2Id) {
        // Verify listings exist and calculate score
        Listing listing1 = listingRepository.findById(listing1Id)
            .orElseThrow(() -> new RuntimeException("Listing 1 not found"));
        Listing listing2 = listingRepository.findById(listing2Id)
            .orElseThrow(() -> new RuntimeException("Listing 2 not found"));
            
        // Check if match already exists
        if (matchRepository.existsByListing1AndListing2(listing1, listing2)) {
            throw new RuntimeException("Match already exists between these listings");
        }
        
        Match match = calculateMatch(listing1, listing2);
        return matchRepository.save(match);
    }
}