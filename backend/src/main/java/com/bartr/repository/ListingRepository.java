package com.bartr.repository;

import com.bartr.model.entity.Listing;
import com.bartr.model.entity.ListingStatus;
import com.bartr.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ListingRepository extends JpaRepository<Listing, Long> {
    List<Listing> findByUserAndStatus(User user, ListingStatus status);
    
    @Query("SELECT l FROM Listing l WHERE l.status = 'ACTIVE' AND l.id != :excludeId " +
           "AND (LOWER(l.haveItem) LIKE LOWER(CONCAT('%', :wantItem, '%')) " +
           "OR LOWER(l.wantItem) LIKE LOWER(CONCAT('%', :haveItem, '%')))")
    List<Listing> findPotentialMatches(Long excludeId, String haveItem, String wantItem);
}