package com.vetLiink.Backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentConfigDTO {
    private String checkoutId;
    private Long trainingId;
    private Integer amount; // in smallest currency unit e.g., cents
    private String currency;
    private String provider; // e.g., MOCK
    private String publicKey; // for client-side initialization
}
