package bartr.service;

import bartr.model.Message;
import bartr.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class MessageService {
    private final MessageRepository messageRepository;

    @Autowired
    public MessageService(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }

    public Message createMessage(Message message) {
        return messageRepository.save(message);
    }

    public Message getMessageById(Long id) {
        return messageRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Message not found with id: " + id));
    }

    public List<Message> getReceivedMessages(Long userId) {
        return messageRepository.findByReceiverIdOrderBySentDateDesc(userId);
    }

    public List<Message> getSentMessages(Long userId) {
        return messageRepository.findBySenderIdOrderBySentDateDesc(userId);
    }

    public List<Message> getMessagesByListingId(Long listingId) {
        return messageRepository.findByListingId(listingId);
    }

    public Message markAsRead(Long id) {
        Message message = getMessageById(id);
        message.setRead(true);
        return messageRepository.save(message);
    }

    public void deleteMessage(Long id) {
        messageRepository.deleteById(id);
    }
}