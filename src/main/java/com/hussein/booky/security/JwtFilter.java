package com.hussein.booky.security;
import tools.jackson.databind.ObjectMapper;
import com.hussein.booky.entity.User;
import com.hussein.booky.repository.UserRepository;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;

@Component
public class JwtFilter implements Filter {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    public JwtFilter(
            JwtService jwtService,
            UserRepository userRepository,
            ObjectMapper objectMapper
    ) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    public void doFilter(
            ServletRequest request,
            ServletResponse response,
            FilterChain chain
    ) throws IOException, ServletException {

        HttpServletRequest httpRequest =
                (HttpServletRequest) request;

        HttpServletResponse httpResponse =
                (HttpServletResponse) response;

        String path = httpRequest.getRequestURI();
        String method = httpRequest.getMethod();

        // Allow browser CORS preflight requests
        if ("OPTIONS".equals(method)) {
            chain.doFilter(request, response);
            return;
        }

        // Allow login, register, HTML, CSS and JavaScript files
        if (isPublicPath(path)) {
            chain.doFilter(request, response);
            return;
        }

        String authHeader =
                httpRequest.getHeader("Authorization");

        if (authHeader == null ||
                !authHeader.startsWith("Bearer ")) {

            sendJsonError(
                    httpResponse,
                    HttpServletResponse.SC_UNAUTHORIZED,
                    "Missing or invalid token",
                    null,
                    "INVALID_TOKEN"
            );

            return;
        }

        String token = authHeader.substring(7);

        if (!jwtService.isTokenValid(token)) {
            sendJsonError(
                    httpResponse,
                    HttpServletResponse.SC_UNAUTHORIZED,
                    "Invalid or expired token",
                    null,
                    "INVALID_TOKEN"
            );

            return;
        }

        String role = jwtService.extractRole(token);
        Integer userId = jwtService.extractUserId(token);

        User user = userRepository.findById(userId)
                .orElse(null);

        if (user == null) {
            sendJsonError(
                    httpResponse,
                    HttpServletResponse.SC_UNAUTHORIZED,
                    "User account no longer exists",
                    null,
                    "USER_NOT_FOUND"
            );

            return;
        }

        /*
         * This blocks users who were already logged in before
         * the administrator froze their account.
         */
        if (user.isFrozen()) {

            String reason = user.getFreezeReason();

            if (reason == null || reason.isBlank()) {
                reason = "Please contact the administrator";
            }

            sendJsonError(
                    httpResponse,
                    HttpServletResponse.SC_FORBIDDEN,
                    "Your account has been frozen",
                    reason,
                    "ACCOUNT_FROZEN"
            );

            return;
        }

        /*
         * Use the current role from the database instead of relying
         * only on the role stored in an older JWT.
         */
        role = user.getRole();

        httpRequest.setAttribute("role", role);
        httpRequest.setAttribute("userId", userId);

        System.out.println("PATH = " + path);
        System.out.println("ROLE = " + role);
        System.out.println("USER ID = " + userId);

        // OWNER or ADMIN only
        if ("POST".equals(method) &&
                (
                        path.equals("/businesses/add") ||
                        path.equals("/services/add")
                )) {

            if (!"OWNER".equals(role) &&
                    !"ADMIN".equals(role)) {

                sendJsonError(
                        httpResponse,
                        HttpServletResponse.SC_FORBIDDEN,
                        "Access denied: OWNER or ADMIN only",
                        null,
                        "ACCESS_DENIED"
                );

                return;
            }
        }

        // ADMIN only
        if (isAdminPath(path)) {

            if (!"ADMIN".equals(role)) {

                sendJsonError(
                        httpResponse,
                        HttpServletResponse.SC_FORBIDDEN,
                        "Access denied: ADMIN only",
                        null,
                        "ACCESS_DENIED"
                );

                return;
            }
        }

        chain.doFilter(request, response);
    }

    private boolean isAdminPath(String path) {
        return path.equals("/bookings/admin")
                || path.startsWith("/bookings/accept/")
                || path.startsWith("/bookings/decline/")
                || path.matches("/users/\\d+/freeze")
                || path.matches("/users/\\d+/unfreeze");
    }

    private boolean isPublicPath(String path) {
        return path.startsWith("/users/login")
                || path.startsWith("/users/register")
                || path.endsWith(".html")
                || path.startsWith("/css/")
                || path.startsWith("/js/");
    }

    private void sendJsonError(
            HttpServletResponse response,
            int status,
            String message,
            String reason,
            String code
    ) throws IOException {

        response.setStatus(status);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        Map<String, Object> body = new LinkedHashMap<>();

        body.put("message", message);

        if (reason != null) {
            body.put("reason", reason);
        }

        body.put("code", code);

        objectMapper.writeValue(response.getWriter(), body);
    }
}