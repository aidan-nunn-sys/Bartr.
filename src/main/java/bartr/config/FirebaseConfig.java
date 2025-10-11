package bartr.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.io.InputStream;

@Configuration
@EnableConfigurationProperties(FirebaseProperties.class)
public class FirebaseConfig {
    private static final Logger log = LoggerFactory.getLogger(FirebaseConfig.class);
    private final ResourceLoader resourceLoader;

    public FirebaseConfig(ResourceLoader resourceLoader) {
        this.resourceLoader = resourceLoader;
    }

    @Bean
    @ConditionalOnProperty(name = "firebase.enabled", havingValue = "true")
    public FirebaseApp firebaseApp(FirebaseProperties properties) throws IOException {
        if (!StringUtils.hasText(properties.getProjectId())) {
            throw new IllegalStateException("firebase.project-id property must be provided");
        }

        if (properties.isAuthEmulatorEnabled()) {
            System.setProperty("FIREBASE_AUTH_EMULATOR_HOST", properties.getAuthEmulatorHost());
            log.info("Configured Firebase Auth Emulator at {}", properties.getAuthEmulatorHost());
        }

        GoogleCredentials credentials = loadCredentials(properties);

        if (FirebaseApp.getApps().isEmpty()) {
            FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(credentials)
                .setProjectId(properties.getProjectId())
                .build();
            return FirebaseApp.initializeApp(options);
        }

        return FirebaseApp.getInstance();
    }

    private GoogleCredentials loadCredentials(FirebaseProperties properties) throws IOException {
        if (StringUtils.hasText(properties.getServiceAccount())) {
            Resource resource = resourceLoader.getResource(properties.getServiceAccount());
            if (!resource.exists()) {
                throw new IllegalStateException("Firebase service account file not found at: " + properties.getServiceAccount());
            }
            try (InputStream inputStream = resource.getInputStream()) {
                log.info("Loading Firebase service account from {}", properties.getServiceAccount());
                return GoogleCredentials.fromStream(inputStream);
            }
        }

        log.info("Firebase service account not configured; falling back to application default credentials.");
        return GoogleCredentials.getApplicationDefault();
    }

    @Bean
    @ConditionalOnProperty(name = "firebase.enabled", havingValue = "true")
    public FirebaseAuth firebaseAuth(FirebaseApp firebaseApp) {
        return FirebaseAuth.getInstance(firebaseApp);
    }

    @Bean
    @ConditionalOnMissingBean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
