package com.vetLiink.Backend.service;

import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {
    
    private final Map<String, OtpEntry> otpStorage = new ConcurrentHashMap<>();
    private final long OTP_EXPIRY_DURATION = 5 * 60 * 1000; // 5 minutes

    public String generateOtp(String phoneNumber) {
        // Generate 6-digit OTP
        String otp = String.format("%06d", new Random().nextInt(1000000));
        
        // Store OTP with expiration
        otpStorage.put(phoneNumber, new OtpEntry(otp, System.currentTimeMillis() + OTP_EXPIRY_DURATION));
        
        // Console Log for Development (Free/Student Mode)
        System.out.println("==============================================");
        System.out.println("🔐 SIMULATED SMS OTP");
        System.out.println("To: " + phoneNumber);
        System.out.println("Code: " + otp);
        System.out.println("==============================================");
        
        return otp;
    }

    public boolean validateOtp(String phoneNumber, String otp) {
        OtpEntry entry = otpStorage.get(phoneNumber);
        
        if (entry == null) {
            return false;
        }

        if (System.currentTimeMillis() > entry.expiryTime) {
            otpStorage.remove(phoneNumber);
            return false;
        }

        if (entry.otp.equals(otp)) {
            otpStorage.remove(phoneNumber); // Clear OTP after successful use
            return true;
        }

        return false;
    }

    private static class OtpEntry {
        String otp;
        long expiryTime;

        OtpEntry(String otp, long expiryTime) {
            this.otp = otp;
            this.expiryTime = expiryTime;
        }
    }
}
