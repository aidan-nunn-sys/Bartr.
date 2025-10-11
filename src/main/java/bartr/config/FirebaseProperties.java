package bartr.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "firebase")
public class FirebaseProperties {
    private boolean enabled;
    private String projectId;
    private String apiKey;
    private String serviceAccount;
    private boolean authEmulatorEnabled;
    private String authEmulatorHost = "localhost:9099";

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

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

    public String getServiceAccount() {
        return serviceAccount;
    }

    public void setServiceAccount(String serviceAccount) {
        this.serviceAccount = serviceAccount;
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
