package bartr.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    private final FirebaseAuthenticationFilter authenticationFilter;

    public SecurityConfig(FirebaseAuthenticationFilter authenticationFilter) {
        this.authenticationFilter = authenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Auth endpoints - public
                .requestMatchers(HttpMethod.POST, "/api/auth/**").permitAll()
                
                // API endpoints that need authentication
                .requestMatchers("/api/profile/**", "/api/messages/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/listings/**").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/listings/**").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/listings/**").authenticated()
                
                // Everything else is public (HTML pages, static files, GET listings, etc.)
                .anyRequest().permitAll()
            )
            .addFilterBefore(authenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}