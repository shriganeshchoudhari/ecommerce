package com.shopease.controller;

import com.shopease.entity.Order;
import com.shopease.entity.User;
import com.shopease.repository.UserRepository;
import com.shopease.service.OrderService;
import com.shopease.service.PaymentService;
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
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final PaymentService paymentService;
    private final UserRepository userRepository;

    private User getUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @PostMapping
    public ResponseEntity<Order> placeOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, Object> payload) {

        Long addressId = Long.valueOf(payload.get("addressId").toString());
        String notes = payload.containsKey("notes") ? payload.get("notes").toString() : null;

        Order order = paymentService.placeOrderFromCart(getUser(userDetails), addressId, notes);
        return new ResponseEntity<>(order, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Page<Order>> getUserOrders(
            @AuthenticationPrincipal UserDetails userDetails,
            Pageable pageable) {

        return ResponseEntity.ok(orderService.getUserOrders(getUser(userDetails).getId(), pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Order> cancelOrder(@PathVariable Long id) {
        // Additional check needed in a real app to ensure the order belongs to the user
        return ResponseEntity.ok(orderService.updateOrderStatus(id, Order.OrderStatus.CANCELLED));
    }
}
