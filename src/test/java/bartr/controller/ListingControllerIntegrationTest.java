package bartr.controller;

import bartr.repository.ListingRepository;
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

import java.util.Iterator;
import java.util.Locale;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ListingControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ListingRepository listingRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void verifySeedDataPresent() {
        assertThat(listingRepository.count()).isGreaterThan(0);
    }

    @Test
    void getAllListingsReturnsSeedData() throws Exception {
        MvcResult result = mockMvc.perform(get("/api/listings")
                .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andReturn();

        JsonNode payload = parseArrayResponse(result);
        assertThat(payload).isNotNull();
        assertThat(payload.size()).isEqualTo((int) listingRepository.count());
    }

    @Test
    void filterByCategoryReturnsMatchingListings() throws Exception {
        String category = "Electronics";
        MvcResult result = mockMvc.perform(get("/api/listings")
                .param("category", category)
                .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andReturn();

        JsonNode payload = parseArrayResponse(result);
        assertThat(payload).isNotNull();
        assertThat(payload.size()).isGreaterThan(0);

        for (JsonNode node : payload) {
            String value = node.get("category").asText();
            assertThat(value).isEqualToIgnoringCase(category);
        }
    }

    @Test
    void searchListingsMatchesAcrossFields() throws Exception {
        String searchTerm = "coffee";
        MvcResult result = mockMvc.perform(get("/api/listings")
                .param("search", searchTerm)
                .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andReturn();

        JsonNode payload = parseArrayResponse(result);
        assertThat(payload).isNotNull();
        assertThat(payload.size()).isGreaterThan(0);

        for (JsonNode node : payload) {
            String haystack = concatenateFields(node);
            assertThat(haystack.toLowerCase(Locale.ROOT)).contains(searchTerm.toLowerCase(Locale.ROOT));
        }
    }

    @Test
    void searchWithCategoryAppliesBothFilters() throws Exception {
        String category = "Electronics";
        String searchTerm = "guitar";
        MvcResult result = mockMvc.perform(get("/api/listings")
                .param("category", category)
                .param("search", searchTerm)
                .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andReturn();

        JsonNode payload = parseArrayResponse(result);
        assertThat(payload).isNotNull();
        assertThat(payload.size()).isGreaterThan(0);

        for (JsonNode node : payload) {
            String value = node.get("category").asText();
            assertThat(value).isEqualToIgnoringCase(category);

            String haystack = concatenateFields(node);
            assertThat(haystack.toLowerCase(Locale.ROOT)).contains(searchTerm.toLowerCase(Locale.ROOT));
        }
    }

    private JsonNode parseArrayResponse(MvcResult result) throws Exception {
        String content = result.getResponse().getContentAsString();
        JsonNode root = objectMapper.readTree(content);
        assertThat(root.isArray()).isTrue();
        return root;
    }

    private String concatenateFields(JsonNode node) {
        StringBuilder builder = new StringBuilder();
        Iterator<String> fieldNames = node.fieldNames();
        while (fieldNames.hasNext()) {
            String fieldName = fieldNames.next();
            JsonNode value = node.get(fieldName);
            if (value.isTextual()) {
                builder.append(value.asText()).append(' ');
            }
        }
        return builder.toString();
    }
}
