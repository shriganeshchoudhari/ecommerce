package com.shopease.service;

import com.shopease.entity.Product;
import com.shopease.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final ProductRepository productRepository;

    /**
     * Returns up to 6 active products from the same category,
     * excluding the queried product, sorted by rating descending.
     */
    public List<Product> getRelatedProducts(Long productId, Long categoryId) {
        return productRepository
                .findByCategoryIdAndIdNotAndActiveTrue(categoryId, productId, PageRequest.of(0, 6));
    }
}
