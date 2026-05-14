package com.passport.screening.controller;

import com.passport.screening.model.User;
import com.passport.screening.service.AuthService;
import com.passport.screening.service.CustomUserDetailsService;
import com.passport.screening.service.GoogleAuthService;
import com.passport.screening.service.JwtService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8000"})
public class GoogleAuthController {

    private static final Logger logger = LoggerFactory.getLogger(GoogleAuthController.class);

    @Autowired
    private GoogleAuthService googleAuthService;

    @Autowired
    private JwtService jwtService;
    
    @Autowired
    private  CustomUserDetailsService userDetailsService;

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> request) {
        try {
            String idToken = request.get("idToken");

            if (idToken == null || idToken.isEmpty()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "ID token is required");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            User user = googleAuthService.findOrCreateGoogleUser(idToken);

            if (user == null) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Failed to process Google authentication");
                return ResponseEntity.status(401).body(errorResponse);
            }
            UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
            String token = jwtService.generateToken(userDetails);

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("username", user.getUsername());
            response.put("email", user.getEmail());
            response.put("provider", user.getProvider());

            logger.info("User {} successfully authenticated via Google", user.getUsername());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Google authentication failed: {}", e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Google authentication failed: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}
