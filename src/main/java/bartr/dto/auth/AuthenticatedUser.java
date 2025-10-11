package bartr.dto.auth;

public class AuthenticatedUser {
    private String firebaseUid;
    private String email;

    public AuthenticatedUser() {
    }

    public AuthenticatedUser(String firebaseUid, String email) {
        this.firebaseUid = firebaseUid;
        this.email = email;
    }

    public String getFirebaseUid() {
        return firebaseUid;
    }

    public void setFirebaseUid(String firebaseUid) {
        this.firebaseUid = firebaseUid;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
