package com.shopease.controller;

import com.shopease.entity.Product;
import com.shopease.service.ProductService;
import com.shopease.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;
    private final ProductService productService;

    /**
     * GET /api/v1/products/{id}/recommendations
     * Returns up to 6 related products in the same category.
     */
    @GetMapping("/{id}/recommendations")
    public ResponseEntity<List<Product>> getRecommendations(@PathVariable Long id) {
        Product product = productService.getProductById(id);
        Long categoryId = product.getCategory() != null ? product.getCategory().getId() : null;
        if (categoryId == null)
            return ResponseEntity.ok(List.of());
        return ResponseEntity.ok(recommendationService.getRelatedProducts(id, categoryId));
    }
}
