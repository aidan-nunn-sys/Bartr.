package bartr.controller;

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

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void resetAuthState() {
        // No explicit reset required for local auth fallback because tests use fresh application context.
    }

    @Test
    void registerLoginAndFetchProfileUsingLocalFallback() throws Exception {
        JsonNode registerResponse = performRegister("sam@example.com", "Sam Trader");
        assertThat(registerResponse.get("accessToken").asText()).isNotBlank();
        assertThat(registerResponse.get("user").get("firebaseUid").asText()).isNotBlank();

        JsonNode loginResponse = performLogin("sam@example.com");
        assertThat(loginResponse.get("accessToken").asText()).isNotBlank();

        String accessToken = loginResponse.get("accessToken").asText();
        MvcResult profileResult = mockMvc.perform(get("/api/auth/me")
                .header("Authorization", "Bearer " + accessToken)
                .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andReturn();

        JsonNode profile = objectMapper.readTree(profileResult.getResponse().getContentAsString());
        assertThat(profile.get("email").asText()).isEqualTo("sam@example.com");
        assertThat(profile.get("name").asText()).isEqualTo("Sam Trader");
    }

    @Test
    void duplicateEmailReturnsBadRequest() throws Exception {
        String email = "duplicate-test@example.com";
        performRegister(email, "Alex Test");
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(String.format("""
                    {"name":"Alex Test","email":"%s","password":"secret42"}
                """, email)))
            .andExpect(status().isBadRequest());
    }

    @Test
    void passwordResetEndpointReturnsAcceptedWithoutFirebase() throws Exception {
        mockMvc.perform(post("/api/auth/password-reset")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"email":"reset@example.com"}
                """))
            .andExpect(status().isAccepted());
    }

    private JsonNode performRegister(String email, String name) throws Exception {
        String payload = String.format("""
            {"name":"%s","email":"%s","password":"secret42"}
        """, name, email);

        MvcResult result = mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
            .andExpect(status().isCreated())
            .andReturn();

        return objectMapper.readTree(result.getResponse().getContentAsString());
    }

    private JsonNode performLogin(String email) throws Exception {
        String payload = String.format("""
            {"email":"%s","password":"secret42"}
        """, email);

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
            .andExpect(status().isOk())
            .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString());
    }
}
