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
import java.util.Set;

@Component
public class JwtFilter implements Filter {

    private static final Set<String> VALID_ROLES =
            Set.of("CLIENT", "OWNER", "ADMIN");

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

        String path = httpRequest.getRequestURI()
                .substring(httpRequest.getContextPath().length());

        String method = httpRequest.getMethod();

        if ("OPTIONS".equals(method) || isPublicPath(path, method)) {
            chain.doFilter(request, response);
            return;
        }

        String authHeader = httpRequest.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
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
        Integer userId;

        try {
            if (!jwtService.isTokenValid(token)) {
                throw new IllegalArgumentException("Invalid token");
            }

            userId = jwtService.extractUserId(token);

            if (userId == null || userId <= 0) {
                throw new IllegalArgumentException("Invalid user ID");
            }
        } catch (Exception exception) {
            sendJsonError(
                    httpResponse,
                    HttpServletResponse.SC_UNAUTHORIZED,
                    "Invalid or expired token",
                    null,
                    "INVALID_TOKEN"
            );
            return;
        }

        User user = userRepository.findById(userId).orElse(null);

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

        // Never fall back to the role stored in an old token.
        String role = user.getRole();

        if (role == null || !VALID_ROLES.contains(role)) {
            sendJsonError(
                    httpResponse,
                    HttpServletResponse.SC_FORBIDDEN,
                    "Your account does not have a valid role",
                    null,
                    "ACCESS_DENIED"
            );
            return;
        }

        httpRequest.setAttribute("userId", user.getId());
        httpRequest.setAttribute("role", role);

        if (isAdminPath(path, method) && !"ADMIN".equals(role)) {
            denyAccess(httpResponse, "Access denied: ADMIN only");
            return;
        }

        if (isOwnerOrAdminPath(path, method)
                && !"OWNER".equals(role)
                && !"ADMIN".equals(role)) {

            denyAccess(httpResponse, "Access denied: OWNER or ADMIN only");
            return;
        }

        if (isOwnerPath(path, method) && !"OWNER".equals(role)) {
            denyAccess(httpResponse, "Access denied: OWNER only");
            return;
        }

        if (isClientPath(path, method) && !"CLIENT".equals(role)) {
            denyAccess(httpResponse, "Access denied: CLIENT only");
            return;
        }

        chain.doFilter(request, response);
    }

    private boolean isAdminPath(String path, String method) {
        return path.equals("/admin")
                || path.startsWith("/admin/")
                || path.equals("/bookings/admin")
                || path.startsWith("/bookings/accept/")
                || path.startsWith("/bookings/decline/")
                || path.matches("/users/\\d+/freeze")
                || path.matches("/users/\\d+/unfreeze")
                || path.equals("/reviews/admin")
                || (
                    "DELETE".equals(method)
                    && path.matches("/reviews/\\d+")
                );
    }

    private boolean isOwnerOrAdminPath(String path, String method) {
        return "POST".equals(method)
                && (
                    path.equals("/businesses/add")
                    || path.equals("/services/add")
                    || path.equals("/business-hours/save")
                );
    }

    private boolean isOwnerPath(String path, String method) {
        return "GET".equals(method)
                && (
                    path.equals("/bookings/owner")
                    || path.equals("/reviews/owner")
                    || path.equals("/owner/dashboard")
                );
    }

    private boolean isClientPath(String path, String method) {
        return (
                    "POST".equals(method)
                    && path.equals("/reviews/create")
                )
                || (
                    "GET".equals(method)
                    && path.equals("/reviews/client")
                );
    }

    private boolean isPublicPath(String path, String method) {
        if ("POST".equals(method)
                && (
                    path.equals("/users/login")
                    || path.equals("/users/register")
                )) {
            return true;
        }

        if (!"GET".equals(method) && !"HEAD".equals(method)) {
            return false;
        }

        // Public page files do not grant access to protected API data.
        return path.equals("/")
                || path.matches("/[A-Za-z0-9-]+\\.html")
                || path.startsWith("/css/")
                || path.startsWith("/js/")
                || path.startsWith("/images/")
                || path.equals("/favicon.ico")
                || path.equals("/favicon.svg")
                || path.equals("/apple-touch-icon.png")
                || path.equals("/icon-192.png")
                || path.equals("/icon-512.png")
                || path.equals("/site.webmanifest")
                || path.equals("/robots.txt")
                || path.equals("/sitemap.xml");
    }

    private void denyAccess(
            HttpServletResponse response,
            String message
    ) throws IOException {
        sendJsonError(
                response,
                HttpServletResponse.SC_FORBIDDEN,
                message,
                null,
                "ACCESS_DENIED"
        );
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

        json.append("{\"message\":\"")
                .append(escapeJson(message))
                .append("\"");

        if (reason != null) {
            json.append(",\"reason\":\"")
                    .append(escapeJson(reason))
                    .append("\"");
        }

        json.append(",\"code\":\"")
                .append(escapeJson(code))
                .append("\"}");

        response.getWriter().write(json.toString());
    }

    private String escapeJson(String value) {
        if (value == null) {
            return "";
        }

        StringBuilder escaped = new StringBuilder();

        for (char character : value.toCharArray()) {
            switch (character) {
                case '"' -> escaped.append("\\\"");
                case '\\' -> escaped.append("\\\\");
                default -> {
                    if (character < 0x20) {
                        escaped.append(
                                String.format("\\u%04x", (int) character)
                        );
                    } else {
                        escaped.append(character);
                    }
                }
            }
        }

        return escaped.toString();
    }
}