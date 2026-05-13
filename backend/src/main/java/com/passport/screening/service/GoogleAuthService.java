package com.passport.screening.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.passport.screening.model.User;
import com.passport.screening.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Optional;

@Service
public class GoogleAuthService {

    private static final Logger logger = LoggerFactory.getLogger(GoogleAuthService.class);

    @Autowired
    private UserRepository userRepository;

    /**
     * Find or create a user based on Google ID token
     * Extracts claims from JWT token and creates/updates user record
     */
    public User findOrCreateGoogleUser(String idToken) {
        try {
            JsonNode claims = extractTokenClaims(idToken);

            if (claims == null) {
                logger.error("Failed to extract claims from Google token");
                return null;
            }

            String googleId = claims.get("sub").asText();
            String email = claims.get("email").asText();
            String name = claims.has("name") ? claims.get("name").asText() : email.split("@")[0];
            boolean emailVerified = claims.has("email_verified") && claims.get("email_verified").asBoolean(false);

            // Check if user exists with this email
            Optional<User> existingUser = userRepository.findByEmail(email);

            User user;
            if (existingUser.isPresent()) {
                user = existingUser.get();
                // Update provider info if not already set
                if (user.getProvider() == null) {
                    user.setProvider("google");
                    user.setProviderId(googleId);
                }
            } else {
                // Create new user
                user = new User();
                user.setEmail(email);
                user.setUsername(generateUsernameFromEmail(email));
                user.setProvider("google");
                user.setProviderId(googleId);
                user.setRole("USER");
                user.setPassword(""); // No password for OAuth users
            }

            user.setLastLogin(LocalDateTime.now());
            userRepository.save(user);

            logger.info("User authenticated via Google: {}", email);
            return user;

        } catch (Exception e) {
            logger.error("Error processing Google authentication: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Extract claims from Google ID token (JWT format)
     * This is a basic extraction - in production, verify the signature with Google's public keys
     */
    private JsonNode extractTokenClaims(String idToken) {
        try {
            // JWT format: header.payload.signature
            String[] parts = idToken.split("\\.");
            if (parts.length != 3) {
                logger.warn("Invalid token format");
                return null;
            }

            // Decode the payload (base64url)
            String payload = parts[1];
            String decodedPayload = addPaddingIfNeeded(payload);

            byte[] decoded = Base64.getUrlDecoder().decode(decodedPayload);
            String decodedString = new String(decoded);

            ObjectMapper mapper = new ObjectMapper();
            return mapper.readTree(decodedString);

        } catch (Exception e) {
            logger.error("Error extracting token claims: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Add Base64 padding if needed (Java 8 compatible)
     */
    private String addPaddingIfNeeded(String str) {
        int padding = 4 - (str.length() % 4);
        if (padding != 4) {
            for (int i = 0; i < padding; i++) {
                str += "=";
            }
        }
        return str;
    }

    /**
     * Generate unique username from email
     */
    private String generateUsernameFromEmail(String email) {
        String baseUsername = email.split("@")[0];
        String username = baseUsername;
        int counter = 1;

        // Ensure unique username
        while (userRepository.findByUsername(username).isPresent()) {
            username = baseUsername + counter;
            counter++;
        }

        return username;
    }
}

