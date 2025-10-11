package bartr.repository;

import bartr.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByReceiverIdOrderBySentDateDesc(Long receiverId);
    List<Message> findBySenderIdOrderBySentDateDesc(Long senderId);
    List<Message> findByListingId(Long listingId);
}