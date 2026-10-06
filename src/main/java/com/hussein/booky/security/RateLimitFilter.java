package com.hussein.booky.security;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

// Limits repeated hits on login/register per client IP to blunt brute-force
// and credential-stuffing attempts. In-memory, fixed-window - fine for a
// single instance. Runs before JwtFilter (lower @Order value = earlier).
@Component
@Order(1)
public class RateLimitFilter implements Filter {

    private static final int MAX_ATTEMPTS = 10;
    private static final Duration WINDOW = Duration.ofMinutes(15);

    private final Map<String, Window> attemptsByKey = new ConcurrentHashMap<>();

    @Override
    public void doFilter(
            ServletRequest request,
            ServletResponse response,
            FilterChain chain
    ) throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        if (isLimitedEndpoint(httpRequest)
                && isRateLimited(rateLimitKey(httpRequest))) {

            httpResponse.setStatus(429);
            httpResponse.setContentType("application/json");
            httpResponse.setCharacterEncoding("UTF-8");
            httpResponse.getWriter().write(
                    "{\"message\":\"Too many attempts. Please try again later.\",\"code\":\"RATE_LIMITED\"}"
            );
            return;
        }

        chain.doFilter(request, response);
    }

    private boolean isLimitedEndpoint(HttpServletRequest request) {
        if (!"POST".equals(request.getMethod())) {
            return false;
        }

        String path = request.getRequestURI()
                .substring(request.getContextPath().length());

        return path.equals("/users/login") || path.equals("/users/register");
    }

    private String rateLimitKey(HttpServletRequest request) {
        return clientIp(request) + ":" + request.getRequestURI();
    }

    // Behind a reverse proxy (Render/Railway/etc.), getRemoteAddr() is the
    // proxy's own address for every request, which would put every client
    // in the same bucket. Prefer the client IP the proxy forwarded.
    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");

        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }

        return request.getRemoteAddr();
    }

    private boolean isRateLimited(String key) {
        Instant now = Instant.now();

        Window window = attemptsByKey.compute(key, (ignored, existing) -> {
            if (existing == null || existing.expired(now)) {
                return new Window(now);
            }

            existing.count++;
            return existing;
        });

        return window.count > MAX_ATTEMPTS;
    }

    private static final class Window {
        private final Instant start;
        private int count = 1;

        Window(Instant start) {
            this.start = start;
        }

        boolean expired(Instant now) {
            return now.isAfter(start.plus(WINDOW));
        }
    }
}
