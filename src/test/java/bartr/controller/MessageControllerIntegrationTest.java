package bartr.controller;

import bartr.model.Listing;
import bartr.model.User;
import bartr.repository.ListingRepository;
import bartr.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;

@SpringBootTest
@AutoConfigureMockMvc
@org.springframework.test.context.TestPropertySource(properties = "firebase.enabled=false")
class MessageControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ListingRepository listingRepository;

    @Autowired
    private UserRepository userRepository;

    private TestUser owner;
    private TestUser buyer;
    private Listing listing;

    @BeforeEach
    void setUp() throws Exception {
        owner = registerUser("owner@example.com", "Owner Example");
        buyer = registerUser("buyer@example.com", "Buyer Example");

        User ownerEntity = userRepository.findByEmail(owner.email);
        listing = new Listing();
        listing.setTitle("Integration Test Listing");
        listing.setDescription("Test listing used for messaging integration.");
        listing.setCategory("Electronics");
        listing.setTradeFor("Open to offers");
        listing.setLocation("Downtown");
        listing.setImage("https://example.com/image.jpg");
        listing.setPostedDate(LocalDateTime.now());
        listing.setOwner(ownerEntity);
        listing = listingRepository.save(listing);
    }

    @Test
    void sendAndRetrieveMessagesFlow() throws Exception {
        // Buyer sends message to owner without specifying receiver (defaults to owner)
        MvcResult sendResult = mockMvc.perform(post("/api/messages")
                .header("Authorization", "Bearer " + buyer.accessToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(String.format("""
                    {"listingId": %d, "content": "Is this still available?"}
                """, listing.getId())))
            .andExpect(status().isOk())
            .andReturn();

        JsonNode messageNode = objectMapper.readTree(sendResult.getResponse().getContentAsString());
        Long messageId = messageNode.get("id").asLong();
        assertThat(messageNode.get("senderId").asLong()).isEqualTo(buyer.userId);
        assertThat(messageNode.get("receiverId").asLong()).isEqualTo(owner.userId);
        assertThat(messageNode.get("listingId").asLong()).isEqualTo(listing.getId());

        // Owner fetches inbox and should see the message
        MvcResult inboxResult = mockMvc.perform(get("/api/messages/inbox")
                .header("Authorization", "Bearer " + owner.accessToken)
                .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andReturn();

        JsonNode inboxArray = objectMapper.readTree(inboxResult.getResponse().getContentAsString());
        assertThat(inboxArray).isNotNull();
        assertThat(inboxArray.size()).isGreaterThanOrEqualTo(1);
        JsonNode inboxMessage = inboxArray.get(0);
        assertThat(inboxMessage.get("id").asLong()).isEqualTo(messageId);
        assertThat(inboxMessage.get("listingId").asLong()).isEqualTo(listing.getId());

        // Buyer fetches sent messages and should see the same message
        MvcResult sentResult = mockMvc.perform(get("/api/messages/sent")
                .header("Authorization", "Bearer " + buyer.accessToken)
                .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andReturn();

        JsonNode sentArray = objectMapper.readTree(sentResult.getResponse().getContentAsString());
        assertThat(sentArray).isNotNull();
        assertThat(sentArray.size()).isGreaterThanOrEqualTo(1);

        // Owner views conversation with buyer
        MvcResult conversationResult = mockMvc.perform(get("/api/messages/listing/{listingId}", listing.getId())
                .param("participantId", buyer.userId.toString())
                .header("Authorization", "Bearer " + owner.accessToken)
                .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andReturn();

        JsonNode conversationArray = objectMapper.readTree(conversationResult.getResponse().getContentAsString());
        assertThat(conversationArray).isNotNull();
        assertThat(conversationArray.size()).isGreaterThanOrEqualTo(1);

        // Owner marks message as read
        MvcResult markReadResult = mockMvc.perform(put("/api/messages/{id}/read", messageId)
                .header("Authorization", "Bearer " + owner.accessToken)
                .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andReturn();

        JsonNode readNode = objectMapper.readTree(markReadResult.getResponse().getContentAsString());
        assertThat(readNode.get("read").asBoolean()).isTrue();
    }

    @Test
    void accessingMessagesWithoutAuthReturnsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/messages/inbox"))
            .andExpect(status().isForbidden());
    }

    private TestUser registerUser(String email, String name) throws Exception {
        String uniqueEmail = email.replace("@", "+" + UUID.randomUUID() + "@");
        String payload = String.format("""
            {"name":"%s","email":"%s","password":"secret42"}
        """, name, uniqueEmail);

        MvcResult result = mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
            .andExpect(status().isCreated())
            .andReturn();

        JsonNode node = objectMapper.readTree(result.getResponse().getContentAsString());
        TestUser user = new TestUser();
        user.email = uniqueEmail;
        user.name = name;
        user.accessToken = node.get("accessToken").asText();
        user.refreshToken = node.get("refreshToken").asText();
        user.userId = node.get("user").get("id").asLong();
        return user;
    }

    private static class TestUser {
        String email;
        String name;
        String accessToken;
        String refreshToken;
        Long userId;
    }
}
