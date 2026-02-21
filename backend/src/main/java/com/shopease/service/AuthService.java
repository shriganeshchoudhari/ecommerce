package com.shopease.service;

import com.shopease.dto.request.LoginRequest;
import com.shopease.dto.request.RegisterRequest;
import com.shopease.dto.response.JwtResponse;
import com.shopease.entity.Cart;
import com.shopease.entity.User;
import com.shopease.exception.BadRequestException;
import com.shopease.repository.UserRepository;
import com.shopease.security.JwtUtils;
import com.shopease.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @Transactional
    public JwtResponse registerUser(RegisterRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            throw new BadRequestException("Error: Email is already in use!");
        }

        // Create new user's account
        User user = User.builder()
                .name(signUpRequest.getName())
                .email(signUpRequest.getEmail())
                .password(passwordEncoder.encode(signUpRequest.getPassword()))
                .role(User.Role.CUSTOMER)
                .enabled(true)
                .build();

        // Create a cart for the user
        Cart cart = new Cart();
        cart.setUser(user);
        user.setCart(cart);

        userRepository.save(user);

        // Auto-login after registration
        return authenticateUser(new LoginRequest(signUpRequest.getEmail(), signUpRequest.getPassword()));
    }

    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        return JwtResponse.builder()
                .accessToken(jwt)
                .refreshToken(jwt) // In a real app, generate a separate persistent refresh token
                .expiresIn(jwtUtils.getExpirationMs())
                .id(userDetails.getId())
                .name(userDetails.getName())
                .email(userDetails.getEmail())
                .role(userDetails.getAuthorities().iterator().next().getAuthority())
                .build();
    }
}
