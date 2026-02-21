package com.shopease.controller;

import com.shopease.entity.Payment;
import com.shopease.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/initiate")
    public ResponseEntity<Payment> initiatePayment(@RequestBody Map<String, Long> payload) {
        Long orderId = payload.get("orderId");
        return ResponseEntity.ok(paymentService.createRazorpayOrder(orderId));
    }

    @PostMapping("/verify")
    public ResponseEntity<Payment> verifyPayment(@RequestBody Map<String, String> payload) {
        Long orderId = Long.valueOf(payload.get("orderId"));
        String razorpayOrderId = payload.get("razorpayOrderId");
        String razorpayPaymentId = payload.get("razorpayPaymentId");
        String razorpaySignature = payload.get("razorpaySignature");

        return ResponseEntity
                .ok(paymentService.verifyPayment(orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature));
    }
}
