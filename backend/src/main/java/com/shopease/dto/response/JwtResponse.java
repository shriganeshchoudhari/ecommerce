package com.shopease.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class JwtResponse {
    private String accessToken;
    private String refreshToken;
    @Builder.Default
    private String tokenType = "Bearer";
    private Long expiresIn;

    // User basic info
    private Long id;
    private String name;
    private String email;
    private String role;
}
