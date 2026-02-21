package com.shopease.service;

import com.shopease.entity.Product;
import com.shopease.exception.BadRequestException;
import com.shopease.exception.ResourceNotFoundException;
import com.shopease.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryService categoryService;

    @Transactional(readOnly = true)
    public Page<Product> getProducts(Long categoryId, BigDecimal minPrice, BigDecimal maxPrice, String search,
            Pageable pageable) {
        if (categoryId != null || minPrice != null || maxPrice != null || search != null) {
            return productRepository.findWithFilters(categoryId, minPrice, maxPrice, search, pageable);
        }
        return productRepository.findByActiveTrue(pageable);
    }

    @Transactional(readOnly = true)
    public Product getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        if (!product.isActive()) {
            throw new ResourceNotFoundException("Product is no longer available");
        }
        return product;
    }

    @Transactional
    public Product createProduct(Product product, Long categoryId) {
        if (productRepository.existsBySku(product.getSku())) {
            throw new BadRequestException("SKU already exists");
        }

        product.setCategory(categoryService.getCategoryById(categoryId));
        return productRepository.save(product);
    }

    @Transactional
    public Product updateProduct(Long id, Product productDetails, Long categoryId) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (!product.getSku().equals(productDetails.getSku()) &&
                productRepository.existsBySku(productDetails.getSku())) {
            throw new BadRequestException("SKU already exists");
        }

        product.setName(productDetails.getName());
        product.setSku(productDetails.getSku());
        product.setDescription(productDetails.getDescription());
        product.setPrice(productDetails.getPrice());
        product.setSalePrice(productDetails.getSalePrice());
        product.setStockQuantity(productDetails.getStockQuantity());

        if (categoryId != null) {
            product.setCategory(categoryService.getCategoryById(categoryId));
        }

        return productRepository.save(product);
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        product.setActive(false); // Soft delete
        productRepository.save(product);
    }
}
