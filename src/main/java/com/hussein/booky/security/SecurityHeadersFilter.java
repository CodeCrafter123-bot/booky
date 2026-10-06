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

// Adds standard browser security headers to every response, including the
// error responses written by RateLimitFilter and JwtFilter (runs first).
@Component
@Order(0)
public class SecurityHeadersFilter implements Filter {

    @Override
    public void doFilter(
            ServletRequest request,
            ServletResponse response,
            FilterChain chain
    ) throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        // Stop browsers guessing content types.
        httpResponse.setHeader("X-Content-Type-Options", "nosniff");

        // Booky pages must never be embedded in another site (clickjacking).
        httpResponse.setHeader("X-Frame-Options", "DENY");

        httpResponse.setHeader(
                "Referrer-Policy",
                "strict-origin-when-cross-origin"
        );

        // Only promise HTTPS when the visitor actually arrived over HTTPS,
        // so local http://localhost development keeps working.
        if (isHttps(httpRequest)) {
            httpResponse.setHeader(
                    "Strict-Transport-Security",
                    "max-age=31536000"
            );
        }

        chain.doFilter(request, response);
    }

    // The hosting proxy terminates TLS and reports the original scheme.
    private boolean isHttps(HttpServletRequest request) {
        return request.isSecure()
                || "https".equalsIgnoreCase(
                        request.getHeader("X-Forwarded-Proto")
                );
    }
}
