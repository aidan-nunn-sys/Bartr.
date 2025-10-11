package bartr.repository;

import bartr.model.Listing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ListingRepository extends JpaRepository<Listing, Long> {
    List<Listing> findByCategoryIgnoreCase(String category);
    List<Listing> findByTitleContainingIgnoreCase(String searchTerm);
    List<Listing> findByOwnerId(Long ownerId);
    List<Listing> findAllByOrderByPostedDateDesc();

    @Query("""
        SELECT l FROM Listing l
        WHERE (:category IS NULL OR LOWER(l.category) = LOWER(:category))
          AND (
                :searchTerm IS NULL OR
                LOWER(l.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR
                LOWER(l.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR
                LOWER(l.tradeFor) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR
                LOWER(l.location) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
          )
        ORDER BY l.postedDate DESC
    """)
    List<Listing> searchListings(
        @Param("category") String category,
        @Param("searchTerm") String searchTerm
    );
}
