package com.shopease.controller;

import com.shopease.dto.response.ApiResponse;
import com.shopease.entity.Category;
import com.shopease.entity.Order;
import com.shopease.entity.Product;
import com.shopease.entity.User;
import com.shopease.repository.OrderRepository;
import com.shopease.repository.UserRepository;
import com.shopease.service.CategoryService;
import com.shopease.service.OrderService;
import com.shopease.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final ProductService productService;
    private final CategoryService categoryService;
    private final OrderService orderService;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    // --- PRODUCTS ---
    @PostMapping("/products")
    public ResponseEntity<Product> createProduct(@RequestBody Map<String, Object> payload) {
        // Simple manual mapping for demo purposes. Real impl would use MapStruct DTO.
        Product p = new Product();
        p.setName(payload.get("name").toString());
        p.setSku(payload.get("sku").toString());
        p.setDescription(payload.get("description").toString());
        p.setPrice(new java.math.BigDecimal(payload.get("price").toString()));
        p.setStockQuantity(Integer.parseInt(payload.get("stockQuantity").toString()));

        Long categoryId = Long.valueOf(payload.get("categoryId").toString());
        return new ResponseEntity<>(productService.createProduct(p, categoryId), HttpStatus.CREATED);
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product productDetails) {
        Long categoryId = productDetails.getCategory() != null ? productDetails.getCategory().getId() : null;
        return ResponseEntity.ok(productService.updateProduct(id, productDetails, categoryId));
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<ApiResponse> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(new ApiResponse(true, "Product deleted"));
    }

    // --- CATEGORIES ---
    @PostMapping("/categories")
    public ResponseEntity<Category> createCategory(@RequestBody Category category) {
        return new ResponseEntity<>(categoryService.createCategory(category), HttpStatus.CREATED);
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<Category> updateCategory(@PathVariable Long id, @RequestBody Category category) {
        return ResponseEntity.ok(categoryService.updateCategory(id, category));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<ApiResponse> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(new ApiResponse(true, "Category deleted"));
    }

    // --- ORDERS ---
    @GetMapping("/orders")
    public ResponseEntity<Page<Order>> getAllOrders(Pageable pageable) {
        return ResponseEntity.ok(orderService.getAllOrders(pageable));
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        Order.OrderStatus status = Order.OrderStatus.valueOf(payload.get("status"));
        return ResponseEntity.ok(orderService.updateOrderStatus(id, status));
    }

    // --- DASHBOARD STATS ---
    @GetMapping("/dashboard/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalOrders", orderRepository.count());
        // Simple mock revenue
        stats.put("totalRevenue", 150000);
        return ResponseEntity.ok(stats);
    }
}
