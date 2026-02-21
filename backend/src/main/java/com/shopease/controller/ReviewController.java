package com.shopease.controller;

import com.shopease.entity.Review;
import com.shopease.entity.User;
import com.shopease.repository.UserRepository;
import com.shopease.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/products/{productId}/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final UserRepository userRepository;

    private User getUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<Page<Review>> getProductReviews(
            @PathVariable Long productId,
            Pageable pageable) {
        return ResponseEntity.ok(reviewService.getProductReviews(productId, pageable));
    }

    @PostMapping
    public ResponseEntity<Review> addReview(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long productId,
            @RequestBody Map<String, Object> payload) {

        int rating = Integer.parseInt(payload.get("rating").toString());
        String comment = payload.containsKey("comment") ? payload.get("comment").toString() : null;

        return new ResponseEntity<>(reviewService.addReview(getUser(userDetails), productId, rating, comment),
                HttpStatus.CREATED);
    }
}
