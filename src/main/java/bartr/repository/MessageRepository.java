package bartr.repository;

import bartr.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MessageRepository extends JpaRepository<Message, Long> {
    @Query("""
        SELECT m FROM Message m
        JOIN FETCH m.sender
        JOIN FETCH m.receiver
        JOIN FETCH m.listing
        WHERE m.id = :id
    """)
    Optional<Message> findByIdWithParticipants(@Param("id") Long id);

    @Query("""
        SELECT m FROM Message m
        JOIN FETCH m.sender
        JOIN FETCH m.receiver
        JOIN FETCH m.listing
        WHERE m.receiver.id = :receiverId
        ORDER BY m.sentDate DESC
    """)
    List<Message> findInbox(@Param("receiverId") Long receiverId);

    @Query("""
        SELECT m FROM Message m
        JOIN FETCH m.sender
        JOIN FETCH m.receiver
        JOIN FETCH m.listing
        WHERE m.sender.id = :senderId
        ORDER BY m.sentDate DESC
    """)
    List<Message> findSent(@Param("senderId") Long senderId);

    @Query("""
        SELECT m FROM Message m
        JOIN FETCH m.sender
        JOIN FETCH m.receiver
        JOIN FETCH m.listing
        WHERE m.listing.id = :listingId
          AND (m.sender.id = :userId OR m.receiver.id = :userId)
        ORDER BY m.sentDate ASC
    """)
    List<Message> findListingMessagesForParticipant(
        @Param("listingId") Long listingId,
        @Param("userId") Long userId
    );

    @Query("""
        SELECT m FROM Message m
        JOIN FETCH m.sender
        JOIN FETCH m.receiver
        JOIN FETCH m.listing
        WHERE m.listing.id = :listingId
          AND (
                (m.sender.id = :userId AND m.receiver.id = :otherUserId)
             OR (m.sender.id = :otherUserId AND m.receiver.id = :userId)
          )
        ORDER BY m.sentDate ASC
    """)
    List<Message> findConversationBetweenParticipants(
        @Param("listingId") Long listingId,
        @Param("userId") Long userId,
        @Param("otherUserId") Long otherUserId
    );

    long countByReceiverIdAndReadFalse(Long receiverId);
}
