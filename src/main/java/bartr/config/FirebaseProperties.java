package bartr.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "firebase")
public class FirebaseProperties {
    private String projectId;
    private String apiKey;
    private boolean authEmulatorEnabled;
    private String authEmulatorHost = "localhost:9099";

    public String getProjectId() {
        return projectId;
    }

    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public boolean isAuthEmulatorEnabled() {
        return authEmulatorEnabled;
    }

    public void setAuthEmulatorEnabled(boolean authEmulatorEnabled) {
        this.authEmulatorEnabled = authEmulatorEnabled;
    }

    public String getAuthEmulatorHost() {
        return authEmulatorHost;
    }

    public void setAuthEmulatorHost(String authEmulatorHost) {
        this.authEmulatorHost = authEmulatorHost;
    }
}
