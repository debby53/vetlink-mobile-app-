package com.vetLiink.Backend.controller;

import com.vetLiink.Backend.dto.PaymentConfigDTO;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
@AllArgsConstructor
public class PaymentsController {

    @GetMapping("/checkout-config")
    public ResponseEntity<PaymentConfigDTO> getCheckoutConfig(@RequestParam Long trainingId) {
        // For now return a safe, validated mock config. In production integrate with provider server-side.
        if (trainingId == null || trainingId <= 0) {
            return ResponseEntity.badRequest().build();
        }

        PaymentConfigDTO cfg = new PaymentConfigDTO();
        cfg.setTrainingId(trainingId);
        cfg.setAmount(5000); // e.g., 50.00 currency units
        cfg.setCurrency("USD");
        cfg.setProvider("MOCK");
        cfg.setPublicKey("mock_public_key_please_replace");
        cfg.setCheckoutId(UUID.randomUUID().toString());

        return ResponseEntity.ok(cfg);
    }
}
