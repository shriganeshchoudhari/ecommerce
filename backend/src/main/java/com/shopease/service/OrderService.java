package com.shopease.service;

import com.shopease.entity.Order;
import com.shopease.entity.OrderItem;
import com.shopease.entity.Payment;
import com.shopease.exception.BadRequestException;
import com.shopease.exception.ResourceNotFoundException;
import com.shopease.repository.OrderRepository;
import com.shopease.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final CartService cartService;
    private final AddressService addressService;
    private final ProductService productService;

    @Transactional(readOnly = true)
    public Page<Order> getUserOrders(Long userId, Pageable pageable) {
        return orderRepository.findByUserId(userId, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Order> getAllOrders(Pageable pageable) {
        return orderRepository.findAllByOrderByOrderedAtDesc(pageable);
    }

    @Transactional(readOnly = true)
    public Order getOrderById(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
    }

    @Transactional
    public Order updateOrderStatus(Long orderId, Order.OrderStatus status) {
        Order order = getOrderById(orderId);

        // Cancelled order restocking
        if (status == Order.OrderStatus.CANCELLED && order.getStatus() != Order.OrderStatus.CANCELLED) {
            for (OrderItem item : order.getItems()) {
                if (item.getProduct() != null) {
                    item.getProduct().setStockQuantity(item.getProduct().getStockQuantity() + item.getQuantity());
                    // Soft update, avoiding directly calling another service save if possible
                    // (managed by hibernate)
                }
            }
            if (order.getPayment() != null && order.getPayment().getStatus() == Payment.PaymentStatus.SUCCESS) {
                order.getPayment().setStatus(Payment.PaymentStatus.REFUNDED);
                paymentRepository.save(order.getPayment());
            }
        }

        order.setStatus(status);
        return orderRepository.save(order);
    }
}
