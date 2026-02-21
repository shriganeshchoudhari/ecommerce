package com.shopease.service;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.shopease.entity.*;
import com.shopease.exception.BadRequestException;
import com.shopease.exception.ResourceNotFoundException;
import com.shopease.repository.OrderRepository;
import com.shopease.repository.PaymentRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.util.HexFormat;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final CartService cartService;
    private final AddressService addressService;

    @Value("${app.razorpay.key-id}")
    private String keyId;

    @Value("${app.razorpay.key-secret}")
    private String keySecret;

    private RazorpayClient razorpayClient;

    @PostConstruct
    public void init() {
        if (keyId != null && !keyId.isEmpty() && keySecret != null && !keySecret.isEmpty()) {
            try {
                razorpayClient = new RazorpayClient(keyId, keySecret);
            } catch (RazorpayException e) {
                throw new RuntimeException("Could not initialize Razorpay SDK", e);
            }
        }
    }

    @Transactional
    public Order placeOrderFromCart(User user, Long addressId, String notes) {
        Cart cart = cartService.getCartByUserId(user.getId());

        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }

        Address shippingAddress = addressService.getAddressByIdAndUser(addressId, user.getId());

        Order order = new Order();
        order.setUser(user);
        order.setShippingAddress(shippingAddress);
        order.setNotes(notes);
        order.setStatus(Order.OrderStatus.PENDING);

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();
            if (product.getStockQuantity() < cartItem.getQuantity()) {
                throw new BadRequestException("Not enough stock for product: " + product.getName());
            }

            // Deduct stock
            product.setStockQuantity(product.getStockQuantity() - cartItem.getQuantity());

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setProductName(product.getName());
            orderItem.setProductImageUrl(
                    product.getImages().isEmpty() ? null : product.getImages().get(0).getImageUrl());
            orderItem.setQuantity(cartItem.getQuantity());

            BigDecimal currentPrice = product.getSalePrice() != null ? product.getSalePrice() : product.getPrice();
            orderItem.setUnitPrice(currentPrice);

            totalAmount = totalAmount.add(orderItem.getSubtotal());
            order.getItems().add(orderItem);
        }

        BigDecimal discountAmount = BigDecimal.ZERO;

        if (cart.getCoupon() != null && cart.getCoupon().isValid()) {
            Coupon coupon = cart.getCoupon();
            if (coupon.getMinOrderAmount() == null || totalAmount.compareTo(coupon.getMinOrderAmount()) >= 0) {
                if ("PERCENTAGE".equalsIgnoreCase(coupon.getDiscountType())) {
                    discountAmount = totalAmount.multiply(coupon.getDiscountValue())
                            .divide(new BigDecimal("100"), 2, java.math.RoundingMode.HALF_UP);
                } else if ("FIXED".equalsIgnoreCase(coupon.getDiscountType())) {
                    discountAmount = coupon.getDiscountValue();
                }

                if (discountAmount.compareTo(totalAmount) > 0) {
                    discountAmount = totalAmount;
                }

                order.setCoupon(coupon);
            }
        }

        order.setDiscountAmount(discountAmount);
        order.setTotalAmount(totalAmount.subtract(discountAmount));

        // Empty the cart
        cart.getItems().clear();
        cart.setCoupon(null);

        return orderRepository.save(order);
    }

    @Transactional
    public Payment createRazorpayOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (order.getStatus() != Order.OrderStatus.PENDING) {
            throw new BadRequestException("Cannot initiate payment for order in status: " + order.getStatus());
        }

        if (razorpayClient == null) {
            // For development without keys
            return createMockPayment(order);
        }

        try {
            JSONObject options = new JSONObject();
            // Razorpay considers amount in paise (multiply by 100)
            options.put("amount", order.getTotalAmount().multiply(new BigDecimal("100")).intValue());
            options.put("currency", "INR");
            options.put("receipt", "txn_" + order.getId());

            com.razorpay.Order razorpayOrder = razorpayClient.orders.create(options);

            Payment payment = new Payment();
            payment.setOrder(order);
            payment.setAmount(order.getTotalAmount());
            payment.setRazorpayOrderId(razorpayOrder.get("id"));
            payment.setStatus(Payment.PaymentStatus.PENDING);

            order.setPayment(payment);
            return paymentRepository.save(payment);

        } catch (RazorpayException e) {
            throw new RuntimeException("Error creating Razorpay order: " + e.getMessage());
        }
    }

    private Payment createMockPayment(Order order) {
        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setAmount(order.getTotalAmount());
        payment.setRazorpayOrderId("mock_order_" + order.getId());
        payment.setStatus(Payment.PaymentStatus.PENDING);
        order.setPayment(payment);
        return paymentRepository.save(payment);
    }

    @Transactional
    public Payment verifyPayment(Long orderId, String razorpayOrderId, String razorpayPaymentId,
            String razorpaySignature) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for order"));

        if (!payment.getRazorpayOrderId().equals(razorpayOrderId)) {
            throw new BadRequestException("Invalid Razorpay Order ID");
        }

        if (razorpayClient != null) {
            try {
                String payload = razorpayOrderId + "|" + razorpayPaymentId;
                Mac mac = Mac.getInstance("HmacSHA256");
                SecretKeySpec secretKey = new SecretKeySpec(keySecret.getBytes(), "HmacSHA256");
                mac.init(secretKey);
                byte[] byteMac = mac.doFinal(payload.getBytes());
                String expectedSignature = HexFormat.of().formatHex(byteMac);

                if (!expectedSignature.equals(razorpaySignature)) {
                    payment.setStatus(Payment.PaymentStatus.FAILED);
                    paymentRepository.save(payment);
                    throw new BadRequestException("Payment signature verification failed");
                }
            } catch (Exception e) {
                throw new RuntimeException("Error verifying payment signature", e);
            }
        }

        payment.setStatus(Payment.PaymentStatus.SUCCESS);
        payment.setRazorpayPaymentId(razorpayPaymentId);
        payment.setRazorpaySignature(razorpaySignature);
        payment.setPaidAt(java.time.LocalDateTime.now());

        Order order = payment.getOrder();
        order.setStatus(Order.OrderStatus.CONFIRMED);

        return paymentRepository.save(payment);
    }
}
