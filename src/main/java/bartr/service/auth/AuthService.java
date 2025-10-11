package bartr.service.auth;

import bartr.config.FirebaseProperties;
import bartr.dto.auth.*;
import bartr.model.User;
import bartr.service.UserService;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import com.google.firebase.auth.UserRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.Nullable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientException;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthService {
    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final FirebaseAuth firebaseAuth;
    private final FirebaseProperties firebaseProperties;
    private final RestTemplate restTemplate;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    private final Map<String, String> localAccessTokens = new ConcurrentHashMap<>();
    private final Map<String, String> localRefreshTokens = new ConcurrentHashMap<>();

    public AuthService(
        @Nullable FirebaseAuth firebaseAuth,
        FirebaseProperties firebaseProperties,
        RestTemplate restTemplate,
        UserService userService,
        PasswordEncoder passwordEncoder
    ) {
        this.firebaseAuth = firebaseAuth;
        this.firebaseProperties = firebaseProperties;
        this.restTemplate = restTemplate;
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    public boolean isFirebaseEnabled() {
        return firebaseAuth != null && StringUtils.hasText(firebaseProperties.getApiKey());
    }

    public AuthResponse register(RegisterRequest request) {
        if (isFirebaseEnabled()) {
            return registerWithFirebase(request);
        }
        return registerLocally(request);
    }

    public AuthResponse login(LoginRequest request) {
        if (isFirebaseEnabled()) {
            return loginWithFirebase(request);
        }
        return loginLocally(request);
    }

    public void logout(String token) {
        verifyToken(token).ifPresent(authenticated -> {
            if (isFirebaseEnabled()) {
                try {
                    firebaseAuth.revokeRefreshTokens(authenticated.getFirebaseUid());
                } catch (FirebaseAuthException e) {
                    log.error("Failed to revoke Firebase refresh tokens for uid {}", authenticated.getFirebaseUid(), e);
                }
            } else {
                localAccessTokens.values().removeIf(uid -> uid.equals(authenticated.getFirebaseUid()));
                localAccessTokens.remove(token);
                localRefreshTokens.values().removeIf(uid -> uid.equals(authenticated.getFirebaseUid()));
            }
        });
    }

    public void sendPasswordReset(PasswordResetRequest request) {
        if (isFirebaseEnabled()) {
            sendFirebasePasswordReset(request.getEmail());
        } else {
            log.warn("Password reset requested for {} but Firebase is not configured. No email sent.", request.getEmail());
        }
    }

    public Optional<AuthenticatedUser> verifyToken(String token) {
        if (!StringUtils.hasText(token)) {
            return Optional.empty();
        }

        if (isFirebaseEnabled()) {
            try {
                FirebaseToken decoded = firebaseAuth.verifyIdToken(token);
                return Optional.of(new AuthenticatedUser(decoded.getUid(), decoded.getEmail()));
            } catch (FirebaseAuthException e) {
                log.debug("Failed to verify Firebase token", e);
                return Optional.empty();
            }
        }

        String uid = localAccessTokens.get(token);
        if (uid == null) {
            return Optional.empty();
        }
        User user = userService.getUserByFirebaseUid(uid);
        return Optional.of(new AuthenticatedUser(uid, user.getEmail()));
    }

    public UserProfileResponse getProfile(String firebaseUid) {
        User user = userService.getUserByFirebaseUid(firebaseUid);
        return mapToProfile(user);
    }

    public UserProfileResponse updateProfile(String firebaseUid, UpdateProfileRequest request) {
        User user = userService.getUserByFirebaseUid(firebaseUid);
        user.setName(request.getName());
        user.setLocation(request.getLocation());
        user.setBio(request.getBio());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setProfileImageUrl(request.getProfileImageUrl());

        User updated = userService.updateUserByFirebaseUid(firebaseUid, user);
        if (isFirebaseEnabled()) {
            updateFirebaseProfile(firebaseUid, request, updated.getEmail());
        } else if (StringUtils.hasText(request.getPhoneNumber())) {
            updated.setPhoneNumber(request.getPhoneNumber());
            userService.updateUserByFirebaseUid(firebaseUid, updated);
        }
        return mapToProfile(updated);
    }

    public void updatePassword(String firebaseUid, String newPassword) {
        if (isFirebaseEnabled()) {
            updateFirebasePassword(firebaseUid, newPassword);
        } else {
            User user = userService.getUserByFirebaseUid(firebaseUid);
            user.setPasswordHash(passwordEncoder.encode(newPassword));
            userService.updateUserByFirebaseUid(firebaseUid, user);
        }
    }

    private AuthResponse registerWithFirebase(RegisterRequest request) {
        try {
            UserRecord.CreateRequest createRequest = new UserRecord.CreateRequest()
                .setEmail(request.getEmail())
                .setPassword(request.getPassword())
                .setDisplayName(request.getName());

            if (StringUtils.hasText(request.getPhoneNumber())) {
                createRequest.setPhoneNumber(request.getPhoneNumber());
            }

            UserRecord userRecord = firebaseAuth.createUser(createRequest);
            User user = new User();
            user.setFirebaseUid(userRecord.getUid());
            user.setName(request.getName());
            user.setEmail(request.getEmail());
            user.setLocation(request.getLocation());
            user.setBio(request.getBio());
            user.setPhoneNumber(request.getPhoneNumber());
            userService.upsertUserFromFirebaseRecord(user);

            LoginRequest loginRequest = new LoginRequest();
            loginRequest.setEmail(request.getEmail());
            loginRequest.setPassword(request.getPassword());
            return loginWithFirebase(loginRequest);
        } catch (FirebaseAuthException e) {
            throw new RuntimeException("Failed to register user with Firebase: " + e.getMessage(), e);
        }
    }

    private AuthResponse registerLocally(RegisterRequest request) {
        if (userService.getUserByEmail(request.getEmail()) != null) {
            throw new IllegalArgumentException("Email is already registered");
        }
        User user = new User();
        user.setFirebaseUid("local-" + UUID.randomUUID());
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setLocation(request.getLocation());
        user.setBio(request.getBio());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        userService.createUser(user);

        return buildLocalAuthResponse(user);
    }

    private AuthResponse loginWithFirebase(LoginRequest request) {
        IdentityToolkitResponse response = performFirebasePasswordSignIn(request.getEmail(), request.getPassword());
        User user = userService.findUserByFirebaseUid(response.localId());
        if (user == null) {
            user = new User();
            user.setFirebaseUid(response.localId());
            user.setEmail(response.email());
            user.setName(response.displayName());
            userService.createUser(user);
        }
        AuthResponse authResponse = new AuthResponse();
        authResponse.setAccessToken(response.idToken());
        authResponse.setRefreshToken(response.refreshToken());
        authResponse.setExpiresIn(parseExpires(response.expiresIn()));
        authResponse.setUser(mapToProfile(user));
        return authResponse;
    }

    private AuthResponse loginLocally(LoginRequest request) {
        User user = Optional.ofNullable(userService.getUserByEmail(request.getEmail()))
            .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        if (!StringUtils.hasText(user.getPasswordHash()) || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        return buildLocalAuthResponse(user);
    }

    private void sendFirebasePasswordReset(String email) {
        Map<String, Object> payload = Map.of(
            "requestType", "PASSWORD_RESET",
            "email", email
        );

        postToIdentityToolkit("/accounts:sendOobCode", payload, Void.class);
    }

    private void updateFirebaseProfile(String firebaseUid, UpdateProfileRequest request, String email) {
        if (!isFirebaseEnabled()) {
            return;
        }
        UserRecord.UpdateRequest updateRequest = new UserRecord.UpdateRequest(firebaseUid)
            .setDisplayName(request.getName());
        if (StringUtils.hasText(request.getPhoneNumber())) {
            updateRequest.setPhoneNumber(request.getPhoneNumber());
        }
        if (StringUtils.hasText(request.getProfileImageUrl())) {
            updateRequest.setPhotoUrl(request.getProfileImageUrl());
        }
        if (StringUtils.hasText(email)) {
            updateRequest.setEmail(email);
        }
        try {
            firebaseAuth.updateUser(updateRequest);
        } catch (FirebaseAuthException e) {
            throw new RuntimeException("Failed to update Firebase profile: " + e.getMessage(), e);
        }
    }

    private void updateFirebasePassword(String firebaseUid, String newPassword) {
        try {
            firebaseAuth.updateUser(new UserRecord.UpdateRequest(firebaseUid).setPassword(newPassword));
        } catch (FirebaseAuthException e) {
            throw new RuntimeException("Failed to update Firebase password: " + e.getMessage(), e);
        }
    }

    private IdentityToolkitResponse performFirebasePasswordSignIn(String email, String password) {
        Map<String, Object> payload = Map.of(
            "email", email,
            "password", password,
            "returnSecureToken", true
        );

        IdentityToolkitResponse response = postToIdentityToolkit("/accounts:signInWithPassword", payload, IdentityToolkitResponse.class);
        if (response == null || !StringUtils.hasText(response.idToken())) {
            throw new RuntimeException("Failed to sign in with Firebase");
        }

        return response;
    }

    private <T> T postToIdentityToolkit(String path, Map<String, Object> payload, Class<T> responseType) {
        if (!StringUtils.hasText(firebaseProperties.getApiKey())) {
            throw new IllegalStateException("firebase.api-key property must be configured for authentication endpoints");
        }
        String url = "https://identitytoolkit.googleapis.com/v1" + path + "?key=" + firebaseProperties.getApiKey();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

        try {
            ResponseEntity<T> response = restTemplate.exchange(url, HttpMethod.POST, request, responseType);
            return response.getBody();
        } catch (RestClientException e) {
            throw new RuntimeException("Failed to call Firebase Identity Toolkit: " + e.getMessage(), e);
        }
    }

    private AuthResponse buildLocalAuthResponse(User user) {
        String accessToken = UUID.randomUUID().toString();
        String refreshToken = UUID.randomUUID().toString();
        localAccessTokens.put(accessToken, user.getFirebaseUid());
        localRefreshTokens.put(refreshToken, user.getFirebaseUid());

        AuthResponse response = new AuthResponse();
        response.setAccessToken(accessToken);
        response.setRefreshToken(refreshToken);
        response.setExpiresIn(3600L);
        response.setUser(mapToProfile(user));
        return response;
    }

    private UserProfileResponse mapToProfile(User user) {
        UserProfileResponse response = new UserProfileResponse();
        response.setId(user.getId());
        response.setFirebaseUid(user.getFirebaseUid());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setPhoneNumber(user.getPhoneNumber());
        response.setLocation(user.getLocation());
        response.setBio(user.getBio());
        response.setProfileImageUrl(user.getProfileImageUrl());
        response.setJoinedDate(user.getJoinedDate());
        return response;
    }

    private Long parseExpires(String expiresIn) {
        if (!StringUtils.hasText(expiresIn)) {
            return null;
        }
        try {
            return Long.parseLong(expiresIn);
        } catch (NumberFormatException e) {
            log.warn("Failed to parse expiresIn value {}", expiresIn);
            return null;
        }
    }

    private record IdentityToolkitResponse(
        String idToken,
        String refreshToken,
        String expiresIn,
        String localId,
        String email,
        String displayName
    ) {
    }
}
