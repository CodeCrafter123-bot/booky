package com.hussein.booky.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration

//implementing webmvcconfigurer to manage http request and responses
public class CorsConfig implements WebMvcConfigurer {

    // Comma-separated list of allowed frontend origins.
    // Set BOOKY_ALLOWED_ORIGINS to the deployed frontend's origin(s) in production.
    @Value("${BOOKY_ALLOWED_ORIGINS:http://127.0.0.1:5500,http://localhost:5500}")
    private String allowedOrigins;

//overriding the method to supply our own implementation
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") //start from the root and includes every path below it
                .allowedOrigins(allowedOrigins.split("\\s*,\\s*"))
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(false);
    }

    //configuring the backend and the forntend ports to allow them to communicate
    //defining the allowed method frontend can use
    //backend accepts all header labels form the llowed frontend
    //using false browser cannot auto send auth cookies because js sends manually the jwt
}