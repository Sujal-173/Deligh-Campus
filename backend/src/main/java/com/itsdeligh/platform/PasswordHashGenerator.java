package com.itsdeligh.platform;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordHashGenerator {

    public static void main(String[] args) {

        String password = "M.shukla@itsdeligh605";

        BCryptPasswordEncoder encoder =
                new BCryptPasswordEncoder();

        String hash = encoder.encode(password);

        System.out.println();
        System.out.println("Password Hash:");
        System.out.println(hash);
        System.out.println();
    }
}