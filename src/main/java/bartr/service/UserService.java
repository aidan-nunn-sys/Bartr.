package bartr.service;

import bartr.model.User;
import bartr.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class UserService {
    private final UserRepository userRepository;

    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User createUser(User user) {
        if (user.getFirebaseUid() == null || user.getFirebaseUid().isBlank()) {
            throw new IllegalArgumentException("Firebase UID is required");
        }
        return userRepository.save(user);
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    public User getUserByFirebaseUid(String firebaseUid) {
        User user = userRepository.findByFirebaseUid(firebaseUid);
        if (user == null) {
            throw new RuntimeException("User not found with firebaseUid: " + firebaseUid);
        }
        return user;
    }

    public User findUserByFirebaseUid(String firebaseUid) {
        return userRepository.findByFirebaseUid(firebaseUid);
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User updateUser(Long id, User userDetails) {
        User user = getUserById(id);
        user.setName(userDetails.getName());
        user.setEmail(userDetails.getEmail());
        user.setLocation(userDetails.getLocation());
        user.setBio(userDetails.getBio());
        user.setPhoneNumber(userDetails.getPhoneNumber());
        user.setProfileImageUrl(userDetails.getProfileImageUrl());
        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User upsertUserFromFirebaseRecord(User userPayload) {
        User existing = userRepository.findByFirebaseUid(userPayload.getFirebaseUid());
        if (existing == null) {
            return createUser(userPayload);
        }
        existing.setName(userPayload.getName());
        existing.setEmail(userPayload.getEmail());
        existing.setLocation(userPayload.getLocation());
        existing.setBio(userPayload.getBio());
        existing.setPhoneNumber(userPayload.getPhoneNumber());
        existing.setProfileImageUrl(userPayload.getProfileImageUrl());
        existing.setPasswordHash(userPayload.getPasswordHash());
        return userRepository.save(existing);
    }

    public User updateUserByFirebaseUid(String firebaseUid, User userDetails) {
        User user = getUserByFirebaseUid(firebaseUid);
        user.setName(userDetails.getName());
        user.setLocation(userDetails.getLocation());
        user.setBio(userDetails.getBio());
        user.setPhoneNumber(userDetails.getPhoneNumber());
        user.setProfileImageUrl(userDetails.getProfileImageUrl());
        if (userDetails.getPasswordHash() != null) {
            user.setPasswordHash(userDetails.getPasswordHash());
        }
        return userRepository.save(user);
    }
}
