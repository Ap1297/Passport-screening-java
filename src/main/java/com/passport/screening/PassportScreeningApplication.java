package com.passport.screening;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class PassportScreeningApplication {

    public static void main(String[] args) {
        SpringApplication.run(PassportScreeningApplication.class, args);
    }
}
