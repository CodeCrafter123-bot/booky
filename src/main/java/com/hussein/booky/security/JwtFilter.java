package com.hussein.booky.security;

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

@Component
public class JwtFilter implements Filter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtFilter(
            JwtService jwtService,
            UserRepository userRepository
    ) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
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

        /*
         * Allow CORS preflight requests.
         */
        if ("OPTIONS".equals(method)) {
            chain.doFilter(request, response);
            return;
        }

        /*
         * Allow login, registration and frontend static files.
         */
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

        Integer userId;
        String tokenRole;

        try {
            userId = jwtService.extractUserId(token);
            tokenRole = jwtService.extractRole(token);
        } catch (Exception exception) {
            sendJsonError(
                    httpResponse,
                    HttpServletResponse.SC_UNAUTHORIZED,
                    "Could not read authentication token",
                    null,
                    "INVALID_TOKEN"
            );

            return;
        }

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
         * Block frozen users even when they already have
         * a previously generated JWT token.
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
         * Use the role currently stored in the database.
         * This protects against old JWTs after an admin changes a role.
         */
        String role = user.getRole();

        if (role == null || role.isBlank()) {
            role = tokenRole;
        }

        httpRequest.setAttribute("userId", userId);
        httpRequest.setAttribute("role", role);

        System.out.println("PATH = " + path);
        System.out.println("METHOD = " + method);
        System.out.println("ROLE = " + role);
        System.out.println("USER ID = " + userId);

        /*
         * OWNER or ADMIN only.
         */
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

        /*
         * CLIENT only: create reviews.
         */
        if ("POST".equals(method) &&
                path.equals("/reviews/create")) {

            if (!"CLIENT".equals(role)) {
                sendJsonError(
                        httpResponse,
                        HttpServletResponse.SC_FORBIDDEN,
                        "Access denied: CLIENT only",
                        null,
                        "ACCESS_DENIED"
                );

                return;
            }
        }

        /*
         * CLIENT only: view own reviews.
         */
        if ("GET".equals(method) &&
                path.equals("/reviews/client")) {

            if (!"CLIENT".equals(role)) {
                sendJsonError(
                        httpResponse,
                        HttpServletResponse.SC_FORBIDDEN,
                        "Access denied: CLIENT only",
                        null,
                        "ACCESS_DENIED"
                );

                return;
            }
        }

        /*
         * OWNER only: view reviews for owned businesses.
         */
        if ("GET".equals(method) &&
                path.equals("/reviews/owner")) {

            if (!"OWNER".equals(role)) {
                sendJsonError(
                        httpResponse,
                        HttpServletResponse.SC_FORBIDDEN,
                        "Access denied: OWNER only",
                        null,
                        "ACCESS_DENIED"
                );

                return;
            }
        }

        /*
         * ADMIN-only endpoints.
         */
        if (isAdminPath(path, method)) {

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

    private boolean isAdminPath(
            String path,
            String method
    ) {
        return path.equals("/bookings/admin")
                || path.startsWith("/bookings/accept/")
                || path.startsWith("/bookings/decline/")
                || path.matches("/users/\\d+/freeze")
                || path.matches("/users/\\d+/unfreeze")
                || (
                    "GET".equals(method) &&
                    path.equals("/reviews/admin")
                )
                || (
                    "DELETE".equals(method) &&
                    path.matches("/reviews/\\d+")
                );
    }

    private boolean isPublicPath(String path) {
        return path.startsWith("/users/login")
                || path.startsWith("/users/register")
                || path.endsWith(".html")
                || path.startsWith("/css/")
                || path.startsWith("/js/")
                || path.startsWith("/images/")
                || path.equals("/")
                || path.equals("/favicon.ico");
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

        StringBuilder json = new StringBuilder();

        json.append("{");

        json.append("\"message\":\"")
                .append(escapeJson(message))
                .append("\"");

        if (reason != null) {
            json.append(",\"reason\":\"")
                    .append(escapeJson(reason))
                    .append("\"");
        }

        json.append(",\"code\":\"")
                .append(escapeJson(code))
                .append("\"");

        json.append("}");

        response.getWriter().write(json.toString());
    }

    private String escapeJson(String value) {
        if (value == null) {
            return "";
        }

        return value
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }
}