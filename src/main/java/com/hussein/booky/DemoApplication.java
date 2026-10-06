package com.hussein.booky;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.TimeZone;

@SpringBootApplication
public class DemoApplication {

    public static void main(String[] args) {
        // Hosting servers run in UTC. Stored timestamps (reviews, freezes,
        // notifications) must use the same Lebanon time as the rest of Booky.
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Beirut"));

        SpringApplication.run(DemoApplication.class, args);
    }
}