package com.shopease.service;

import com.shopease.entity.Product;
import com.shopease.entity.Review;
import com.shopease.entity.User;
import com.shopease.exception.BadRequestException;
import com.shopease.exception.ResourceNotFoundException;
import com.shopease.repository.ProductRepository;
import com.shopease.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final ProductService productService;

    @Transactional(readOnly = true)
    public Page<Review> getProductReviews(Long productId, Pageable pageable) {
        return reviewRepository.findByProductId(productId, pageable);
    }

    @Transactional
    public Review addReview(User user, Long productId, int rating, String comment) {
        if (rating < 1 || rating > 5) {
            throw new BadRequestException("Rating must be between 1 and 5");
        }

        if (reviewRepository.existsByUserIdAndProductId(user.getId(), productId)) {
            throw new BadRequestException("You have already reviewed this product");
        }

        Product product = productService.getProductById(productId);

        // Ensure user has ordered this product
        boolean hasOrdered = user.getOrders().stream()
                .flatMap(order -> order.getItems().stream())
                .anyMatch(item -> item.getProduct() != null && item.getProduct().getId().equals(productId));

        if (!hasOrdered) {
            throw new BadRequestException("You can only review products you have purchased");
        }

        Review review = Review.builder()
                .user(user)
                .product(product)
                // In reality, link to the actual order. Using first found for simplicity
                .order(user.getOrders().stream()
                        .filter(o -> o.getItems().stream()
                                .anyMatch(i -> i.getProduct() != null && i.getProduct().getId().equals(productId)))
                        .findFirst().orElse(null))
                .rating(rating)
                .comment(comment)
                .build();

        Review savedReview = reviewRepository.save(review);
        updateProductRating(product);

        return savedReview;
    }

    @Transactional
    public void deleteReview(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        Product product = review.getProduct();
        reviewRepository.delete(review);
        updateProductRating(product);
    }

    private void updateProductRating(Product product) {
        Double avgRating = reviewRepository.findAverageRatingByProductId(product.getId());
        long count = reviewRepository.countByProductId(product.getId());

        product.setAverageRating(avgRating != null ? BigDecimal.valueOf(avgRating) : BigDecimal.ZERO);
        product.setReviewCount((int) count);
        productRepository.save(product);
    }
}
