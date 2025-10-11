package com.bartr.repository;

import com.bartr.model.entity.Match;
import com.bartr.model.entity.Listing;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MatchRepository extends JpaRepository<Match, Long> {
    List<Match> findByListing1OrListing2(Listing listing1, Listing listing2);
    
    boolean existsByListing1AndListing2(Listing listing1, Listing listing2);
}