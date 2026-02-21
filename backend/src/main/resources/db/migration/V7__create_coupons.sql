CREATE TABLE coupons (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type VARCHAR(20) NOT NULL, -- PERCENTAGE, FIXED
    discount_value NUMERIC(12,2) NOT NULL,
    min_order_amount NUMERIC(12,2),
    valid_from TIMESTAMP NOT NULL,
    valid_until TIMESTAMP NOT NULL,
    active BOOLEAN DEFAULT TRUE
);

-- Add coupon link to Carts
ALTER TABLE carts
ADD COLUMN coupon_id BIGINT,
ADD CONSTRAINT fk_carts_coupon
FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE SET NULL;

-- Add coupon link to Orders
ALTER TABLE orders
ADD COLUMN coupon_id BIGINT,
ADD COLUMN discount_amount NUMERIC(12,2) DEFAULT 0.00,
ADD CONSTRAINT fk_orders_coupon
FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE SET NULL;
