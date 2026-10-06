package com.hussein.booky.security;

import com.hussein.booky.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.security.SecureRandom;
import java.util.Base64;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtServiceTest {

    private static final String VALID_SECRET = randomSecret(32);

    private static String randomSecret(int byteLength) {
        byte[] bytes = new byte[byteLength];
        new SecureRandom().nextBytes(bytes);
        return Base64.getEncoder().encodeToString(bytes);
    }

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService(VALID_SECRET);
    }

    @Test
    void rejectsSecretsShorterThan32Bytes() {
        String shortSecret = randomSecret(16);

        assertThatThrownBy(() -> new JwtService(shortSecret))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void generatedTokenRoundTripsUserClaims() {
        User user = new User("Hussein", "hussein@example.com",
                "hashed-password", "70123456", "OWNER");
        user.setId(42);

        String token = jwtService.generateToken(user);

        assertThat(jwtService.isTokenValid(token)).isTrue();
        assertThat(jwtService.extractEmail(token))
                .isEqualTo("hussein@example.com");
        assertThat(jwtService.extractUserId(token)).isEqualTo(42);
        assertThat(jwtService.extractRole(token)).isEqualTo("OWNER");
    }

    @Test
    void tokenSignedWithADifferentKeyIsInvalid() {
        JwtService otherService = new JwtService(randomSecret(32));

        User user = new User("Hussein", "hussein@example.com",
                "hashed-password", "70123456", "OWNER");
        user.setId(1);

        String token = otherService.generateToken(user);

        assertThat(jwtService.isTokenValid(token)).isFalse();
    }

    @Test
    void malformedTokenIsInvalid() {
        assertThat(jwtService.isTokenValid("not-a-real-token")).isFalse();
    }
}
