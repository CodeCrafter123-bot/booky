package com.hussein.booky.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.PrintWriter;
import java.io.StringWriter;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class RateLimitFilterTest {

    private RateLimitFilter filter;
    private FilterChain chain;

    @BeforeEach
    void setUp() {
        filter = new RateLimitFilter();
        chain = mock(FilterChain.class);
    }

    private HttpServletRequest loginRequestFrom(String ip) {
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getMethod()).thenReturn("POST");
        when(request.getRequestURI()).thenReturn("/users/login");
        when(request.getContextPath()).thenReturn("");
        when(request.getRemoteAddr()).thenReturn(ip);
        return request;
    }

    private HttpServletResponse responseCapturing(StringWriter body) throws Exception {
        HttpServletResponse response = mock(HttpServletResponse.class);
        when(response.getWriter()).thenReturn(new PrintWriter(body));
        return response;
    }

    @Test
    void allowsRequestsUnderTheLimit() throws Exception {
        HttpServletRequest request = loginRequestFrom("10.0.0.1");
        HttpServletResponse response = responseCapturing(new StringWriter());

        for (int i = 0; i < 10; i++) {
            filter.doFilter(request, response, chain);
        }

        verify(chain, times(10)).doFilter(request, response);
        verify(response, never()).setStatus(429);
    }

    @Test
    void blocksTheRequestAfterTheLimitIsExceeded() throws Exception {
        HttpServletRequest request = loginRequestFrom("10.0.0.2");
        HttpServletResponse response = responseCapturing(new StringWriter());

        for (int i = 0; i < 10; i++) {
            filter.doFilter(request, response, chain);
        }

        filter.doFilter(request, response, chain);

        verify(chain, times(10)).doFilter(request, response);
        verify(response).setStatus(429);
    }

    @Test
    void tracksEachIpIndependently() throws Exception {
        HttpServletRequest fromFirstIp = loginRequestFrom("10.0.0.3");
        HttpServletRequest fromSecondIp = loginRequestFrom("10.0.0.4");
        HttpServletResponse response = responseCapturing(new StringWriter());

        for (int i = 0; i < 10; i++) {
            filter.doFilter(fromFirstIp, response, chain);
        }

        // A different IP should not be affected by the first IP's usage.
        filter.doFilter(fromSecondIp, response, chain);

        verify(chain, times(11)).doFilter(any(), eq(response));
        verify(response, never()).setStatus(429);
    }

    @Test
    void usesTheForwardedClientIpBehindAProxy() throws Exception {
        HttpServletRequest request = loginRequestFrom("127.0.0.1");
        when(request.getHeader("X-Forwarded-For")).thenReturn("203.0.113.5, 127.0.0.1");
        HttpServletResponse response = responseCapturing(new StringWriter());

        for (int i = 0; i < 11; i++) {
            filter.doFilter(request, response, chain);
        }

        verify(response).setStatus(429);
    }

    @Test
    void doesNotLimitUnrelatedEndpoints() throws Exception {
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getMethod()).thenReturn("GET");
        when(request.getRequestURI()).thenReturn("/businesses");
        when(request.getContextPath()).thenReturn("");

        HttpServletResponse response = responseCapturing(new StringWriter());

        for (int i = 0; i < 20; i++) {
            filter.doFilter(request, response, chain);
        }

        verify(chain, times(20)).doFilter(request, response);
        verify(response, never()).setStatus(429);
    }
}
