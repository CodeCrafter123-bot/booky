package com.hussein.booky.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration

//implementing webmvcconfigurer to manage http request and responses 
public class CorsConfig implements WebMvcConfigurer {
//overriding the method to supply our own implementation  
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") //start from the root and includes every path below it 
                .allowedOrigins(
                        "http://127.0.0.1:5500",
                        "http://localhost:5500"
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(false);
    }

    //configuring the backend and the forntend ports to allow them to communicate 
    //defining the allowed method frontend can use 
    //backend accepts all header labels form the llowed frontend 
    //using false browser cannot auto send auth cookies because js sends manually the jwt 
}