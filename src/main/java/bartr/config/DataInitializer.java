package bartr.config;

import bartr.model.Listing;
import bartr.model.User;
import bartr.repository.ListingRepository;
import bartr.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {
    private final UserRepository userRepository;
    private final ListingRepository listingRepository;

    public DataInitializer(UserRepository userRepository, ListingRepository listingRepository) {
        this.userRepository = userRepository;
        this.listingRepository = listingRepository;
    }

    @Override
    public void run(String... args) {
        if (listingRepository.count() > 0) {
            return;
        }

        User alex = createUser(
            "Alex Johnson",
            "alex@example.com",
            "Downtown",
            "Gadget enthusiast looking for creative trades.",
            "sample-alex-uid",
            "+11234567890"
        );

        User maya = createUser(
            "Maya Lee",
            "maya@example.com",
            "Midtown",
            "Designer with a love for sustainable fashion.",
            "sample-maya-uid",
            "+11234567891"
        );

        User jordan = createUser(
            "Jordan Smith",
            "jordan@example.com",
            "West End",
            "Home barista and weekend handyman.",
            "sample-jordan-uid",
            "+11234567892"
        );

        userRepository.saveAll(List.of(alex, maya, jordan));

        List<Listing> listings = List.of(
            createListing(
                "Electric Guitar",
                "Fender Stratocaster in excellent condition with case.",
                "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=300&fit=crop",
                "Downtown",
                "Analog synthesizer or studio gear",
                "Electronics",
                LocalDateTime.now().minusDays(1),
                alex
            ),
            createListing(
                "Tailored Blazer",
                "Custom navy blazer, size medium, hardly worn.",
                "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400&h=300&fit=crop",
                "Midtown",
                "Designer boots or statement accessories",
                "Clothing",
                LocalDateTime.now().minusDays(3),
                maya
            ),
            createListing(
                "Pour-over Coffee Kit",
                "Complete V60 pour-over set with kettle and grinder.",
                "https://images.unsplash.com/photo-1502462041640-f83adce1f36c?w=400&h=300&fit=crop",
                "West End",
                "Vintage vinyl or cocktail set",
                "Home",
                LocalDateTime.now().minusDays(5),
                jordan
            ),
            createListing(
                "Freelance Web Design Session",
                "Two-hour brand and landing page consultation.",
                "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&h=300&fit=crop",
                "Remote",
                "Photography session or copywriting help",
                "Services",
                LocalDateTime.now().minusDays(2),
                maya
            ),
            createListing(
                "Cycling Toolkit",
                "Complete bike maintenance kit with stand.",
                "https://images.unsplash.com/photo-1518895949257-7621c3c786d4?w=400&h=300&fit=crop",
                "Downtown",
                "Smart wearable or action camera",
                "Electronics",
                LocalDateTime.now().minusDays(7),
                alex
            )
        );

        listingRepository.saveAll(listings);
    }

    private User createUser(
        String name,
        String email,
        String location,
        String bio,
        String firebaseUid,
        String phoneNumber
    ) {
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setLocation(location);
        user.setBio(bio);
        user.setFirebaseUid(firebaseUid);
        user.setPhoneNumber(phoneNumber);
        return user;
    }

    private Listing createListing(
        String title,
        String description,
        String image,
        String location,
        String tradeFor,
        String category,
        LocalDateTime postedDate,
        User owner
    ) {
        Listing listing = new Listing();
        listing.setTitle(title);
        listing.setDescription(description);
        listing.setImage(image);
        listing.setLocation(location);
        listing.setTradeFor(tradeFor);
        listing.setCategory(category);
        listing.setPostedDate(postedDate);
        listing.setOwner(owner);
        return listing;
    }
}
