package bartr.controller;

import bartr.dto.auth.AuthenticatedUser;
import bartr.dto.message.MessageResponse;
import bartr.dto.message.SendMessageRequest;
import bartr.model.Message;
import bartr.service.MessageService;
import bartr.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "*")
public class MessageController {
    private final MessageService messageService;
    private final UserService userService;

    public MessageController(MessageService messageService, UserService userService) {
        this.messageService = messageService;
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<MessageResponse> sendMessage(
        @Valid @RequestBody SendMessageRequest request,
        Authentication authentication
    ) {
        Long currentUserId = resolveCurrentUserId(authentication);
        Message message = messageService.sendMessage(
            request.getListingId(),
            currentUserId,
            request.getReceiverId(),
            request.getContent()
        );
        return ResponseEntity.ok(mapToResponse(message));
    }

    @GetMapping("/inbox")
    public ResponseEntity<List<MessageResponse>> inbox(Authentication authentication) {
        Long currentUserId = resolveCurrentUserId(authentication);
        List<MessageResponse> responses = messageService.getInbox(currentUserId).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/sent")
    public ResponseEntity<List<MessageResponse>> sent(Authentication authentication) {
        Long currentUserId = resolveCurrentUserId(authentication);
        List<MessageResponse> responses = messageService.getSent(currentUserId).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/listing/{listingId}")
    public ResponseEntity<List<MessageResponse>> listingConversation(
        @PathVariable Long listingId,
        @RequestParam(value = "participantId", required = false) Long participantId,
        Authentication authentication
    ) {
        Long currentUserId = resolveCurrentUserId(authentication);
        List<Message> messages;

        if (participantId != null) {
            messages = messageService.getConversation(listingId, currentUserId, participantId);
        } else {
            messages = messageService.getMessagesForListing(listingId, currentUserId);
        }

        List<MessageResponse> responses = messages.stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MessageResponse> getMessage(
        @PathVariable Long id,
        Authentication authentication
    ) {
        Long currentUserId = resolveCurrentUserId(authentication);
        Message message = messageService.getMessageById(id, currentUserId);
        return ResponseEntity.ok(mapToResponse(message));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<MessageResponse> markAsRead(
        @PathVariable Long id,
        Authentication authentication
    ) {
        Long currentUserId = resolveCurrentUserId(authentication);
        Message message = messageService.markAsRead(id, currentUserId);
        return ResponseEntity.ok(mapToResponse(message));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMessage(
        @PathVariable Long id,
        Authentication authentication
    ) {
        Long currentUserId = resolveCurrentUserId(authentication);
        messageService.deleteMessage(id, currentUserId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/unread/count")
    public ResponseEntity<Long> unreadCount(Authentication authentication) {
        Long currentUserId = resolveCurrentUserId(authentication);
        return ResponseEntity.ok(messageService.getUnreadCount(currentUserId));
    }

    private Long resolveCurrentUserId(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthenticatedUser authUser)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required.");
        }
        return userService.getUserByFirebaseUid(authUser.getFirebaseUid()).getId();
    }

    private MessageResponse mapToResponse(Message message) {
        MessageResponse response = new MessageResponse();
        response.setId(message.getId());
        response.setListingId(message.getListing().getId());
        response.setListingTitle(message.getListing().getTitle());
        response.setSenderId(message.getSender().getId());
        response.setSenderName(message.getSender().getName());
        response.setSenderEmail(message.getSender().getEmail());
        response.setReceiverId(message.getReceiver().getId());
        response.setReceiverName(message.getReceiver().getName());
        response.setReceiverEmail(message.getReceiver().getEmail());
        response.setContent(message.getContent());
        response.setRead(message.isRead());
        response.setSentAt(message.getSentDate());
        return response;
    }
}
