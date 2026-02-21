package com.shopease.controller;

import com.shopease.dto.request.LoginRequest;
import com.shopease.dto.request.RegisterRequest;
import com.shopease.dto.response.ApiResponse;
import com.shopease.dto.response.JwtResponse;
import com.shopease.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<JwtResponse> registerUser(@Valid @RequestBody RegisterRequest signUpRequest) {
        return new ResponseEntity<>(authService.registerUser(signUpRequest), HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        return ResponseEntity.ok(authService.authenticateUser(loginRequest));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse> logoutUser() {
        // In a stateless JWT app, client deletes token.
        // Real implementation might involve a token blacklist for refresh tokens.
        return ResponseEntity.ok(new ApiResponse(true, "Log out successful"));
    }
}
