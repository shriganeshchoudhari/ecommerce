package com.shopease.controller;

import com.shopease.entity.Cart;
import com.shopease.entity.User;
import com.shopease.repository.UserRepository;
import com.shopease.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;
    private final UserRepository userRepository;

    private User getUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<Cart> getCart(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(cartService.getCartByUserId(getUser(userDetails).getId()));
    }

    @PostMapping("/items")
    public ResponseEntity<Cart> addItemToCart(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, Integer> payload) {

        Long productId = Long.valueOf(payload.get("productId"));
        int quantity = payload.getOrDefault("quantity", 1);

        return ResponseEntity.ok(cartService.addItemToCart(getUser(userDetails), productId, quantity));
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<Cart> updateItemQuantity(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long itemId,
            @RequestBody Map<String, Integer> payload) {

        int quantity = payload.get("quantity");
        return ResponseEntity.ok(cartService.updateItemQuantity(getUser(userDetails), itemId, quantity));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<Cart> removeItemFromCart(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long itemId) {

        return ResponseEntity.ok(cartService.removeItemFromCart(getUser(userDetails), itemId));
    }

    @DeleteMapping
    public ResponseEntity<Cart> clearCart(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(cartService.clearCart(getUser(userDetails)));
    }

    @PostMapping("/coupon")
    public ResponseEntity<Cart> applyCoupon(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> payload) {
        String code = payload.get("code");
        return ResponseEntity.ok(cartService.applyCoupon(getUser(userDetails), code));
    }

    @DeleteMapping("/coupon")
    public ResponseEntity<Cart> removeCoupon(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(cartService.removeCoupon(getUser(userDetails)));
    }
}
