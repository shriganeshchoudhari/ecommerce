package com.shopease.controller;

import com.shopease.entity.User;
import com.shopease.entity.WishlistItem;
import com.shopease.repository.UserRepository;
import com.shopease.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;
    private final UserRepository userRepository;

    private User getUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<List<WishlistItem>> getMyWishlist(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(wishlistService.getUserWishlist(getUser(userDetails).getId()));
    }

    @PostMapping
    public ResponseEntity<WishlistItem> addToWishlist(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, Long> payload) {
        Long productId = payload.get("productId");
        return new ResponseEntity<>(wishlistService.addToWishlist(getUser(userDetails), productId), HttpStatus.CREATED);
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> removeFromWishlist(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long productId) {
        wishlistService.removeFromWishlist(getUser(userDetails), productId);
        return ResponseEntity.noContent().build();
    }
}
