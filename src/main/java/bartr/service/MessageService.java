package bartr.service;

import bartr.model.Listing;
import bartr.model.Message;
import bartr.model.User;
import bartr.repository.MessageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MessageService {
    private final MessageRepository messageRepository;
    private final ListingService listingService;
    private final UserService userService;

    public MessageService(
        MessageRepository messageRepository,
        ListingService listingService,
        UserService userService
    ) {
        this.messageRepository = messageRepository;
        this.listingService = listingService;
        this.userService = userService;
    }

    @Transactional
    public Message sendMessage(Long listingId, Long senderUserId, Long receiverUserId, String content) {
        if (!StringUtils.hasText(content)) {
            throw new IllegalArgumentException("Message content cannot be blank");
        }

        Listing listing = listingService.getListingById(listingId);
        User sender = userService.getUserById(senderUserId);
        User receiver = resolveReceiver(listing, sender, receiverUserId);

        if (sender.getId().equals(receiver.getId())) {
            throw new IllegalArgumentException("Cannot send a message to yourself.");
        }

        if (!userIsParticipant(sender, listing) && !userIsParticipant(receiver, listing)) {
            throw new IllegalArgumentException("At least one participant must be the listing owner.");
        }

        Message message = new Message();
        message.setListing(listing);
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setContent(content.trim());
        message.setSentDate(LocalDateTime.now());
        message.setRead(false);

        return messageRepository.save(message);
    }

    @Transactional(readOnly = true)
    public Message getMessageById(Long id, Long requestingUserId) {
        Message message = messageRepository.findByIdWithParticipants(id)
            .orElseThrow(() -> new RuntimeException("Message not found with id: " + id));

        ensureParticipant(requestingUserId, message);
        return message;
    }

    @Transactional(readOnly = true)
    public List<Message> getInbox(Long userId) {
        return messageRepository.findInbox(userId);
    }

    @Transactional(readOnly = true)
    public List<Message> getSent(Long userId) {
        return messageRepository.findSent(userId);
    }

    @Transactional(readOnly = true)
    public List<Message> getMessagesForListing(Long listingId, Long participantId) {
        listingService.getListingById(listingId);
        return messageRepository.findListingMessagesForParticipant(listingId, participantId);
    }

    @Transactional(readOnly = true)
    public List<Message> getConversation(Long listingId, Long participantId, Long otherParticipantId) {
        listingService.getListingById(listingId);
        ensureUserExists(participantId);
        ensureUserExists(otherParticipantId);
        return messageRepository.findConversationBetweenParticipants(listingId, participantId, otherParticipantId);
    }

    @Transactional
    public Message markAsRead(Long id, Long requesterId) {
        Message message = getMessageById(id, requesterId);
        if (!message.getReceiver().getId().equals(requesterId)) {
            throw new IllegalArgumentException("Only the recipient can mark this message as read.");
        }
        message.setRead(true);
        return messageRepository.save(message);
    }

    @Transactional
    public void deleteMessage(Long id, Long requesterId) {
        Message message = getMessageById(id, requesterId);
        ensureParticipant(requesterId, message);
        messageRepository.delete(message);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return messageRepository.countByReceiverIdAndReadFalse(userId);
    }

    private void ensureParticipant(Long userId, Message message) {
        if (!message.getSender().getId().equals(userId) && !message.getReceiver().getId().equals(userId)) {
            throw new IllegalArgumentException("You do not have access to this message.");
        }
    }

    private boolean userIsParticipant(User user, Listing listing) {
        return listing.getOwner() != null && listing.getOwner().getId().equals(user.getId());
    }

    private void ensureUserExists(Long userId) {
        userService.getUserById(userId);
    }

    private User resolveReceiver(Listing listing, User sender, Long receiverId) {
        if (receiverId != null) {
            return userService.getUserById(receiverId);
        }

        if (listing.getOwner() == null) {
            throw new IllegalArgumentException("Listing owner is not defined.");
        }

        if (listing.getOwner().getId().equals(sender.getId())) {
            throw new IllegalArgumentException("Receiver must be provided when the sender is the listing owner.");
        }

        return listing.getOwner();
    }
}
