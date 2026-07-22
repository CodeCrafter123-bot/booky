package com.hussein.booky.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Configuration
public class SecurityConfig {

    @Bean
    //craeting the object once managing it and amke it available for other classes 
    public BCryptPasswordEncoder passwordEncoder() {
        //creating the password encoder 
        return new BCryptPasswordEncoder();
    }
}