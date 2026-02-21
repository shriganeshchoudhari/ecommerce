package com.shopease.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "product_variants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(length = 50)
    private String size; // e.g. "S", "M", "L", "XL"

    @Column(length = 50)
    private String color; // e.g. "Red", "Blue"

    @Column(name = "sku_suffix", length = 30)
    private String skuSuffix; // e.g. "RED-M"

    @Column(name = "stock_quantity", nullable = false)
    private int stockQuantity = 0;

    @Column(name = "price_override", precision = 12, scale = 2)
    private BigDecimal priceOverride; // null = use parent product price

    @Column(nullable = false)
    private boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
