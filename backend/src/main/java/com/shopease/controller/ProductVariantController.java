package com.shopease.controller;

import com.shopease.entity.ProductVariant;
import com.shopease.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductVariantController {

    private final ProductVariantRepository variantRepository;

    /**
     * GET /api/v1/products/{id}/variants
     * Returns all active variants for a product (size, color, price override).
     */
    @GetMapping("/{id}/variants")
    public ResponseEntity<List<ProductVariant>> getVariants(@PathVariable Long id) {
        return ResponseEntity.ok(variantRepository.findByProductIdAndActiveTrue(id));
    }
}
