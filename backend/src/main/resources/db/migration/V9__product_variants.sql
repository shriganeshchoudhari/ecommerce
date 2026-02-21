-- V9: Product Variants
-- Adds a product_variants table for Size/Color/Material variant support

CREATE TABLE product_variants (
    id               BIGSERIAL PRIMARY KEY,
    product_id       BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    size             VARCHAR(50),
    color            VARCHAR(50),
    sku_suffix       VARCHAR(30),
    stock_quantity   INT NOT NULL DEFAULT 0,
    price_override   NUMERIC(12,2),
    active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);

-- Seed sample variants for the Samsung Galaxy S24 Ultra (SKU-PHONE-001)
INSERT INTO product_variants (product_id, size, color, sku_suffix, stock_quantity, price_override, active)
SELECT p.id, v.size, v.color, v.sku_suffix, v.stock_quantity, v.price_override, TRUE
FROM products p
JOIN (VALUES
  ('Titanium Gray',  NULL, 'TGRAY',  20, NULL::NUMERIC),
  ('Phantom Black',  NULL, 'PBLACK', 15, 82999.00),
  ('Cream',          NULL, 'CREAM',  10, 84999.00)
) AS v(color, size, sku_suffix, stock_quantity, price_override) ON p.sku = 'SKU-PHONE-001';

-- Sample variants for Levi''s Classic T-Shirt (SKU-SHRT-001)
INSERT INTO product_variants (product_id, size, color, sku_suffix, stock_quantity, price_override, active)
SELECT p.id, v.size, v.color, v.sku_suffix, v.stock_quantity, v.price_override, TRUE
FROM products p
JOIN (VALUES
  ('S',  'White',  'S-WHT',  50, NULL::NUMERIC),
  ('M',  'White',  'M-WHT',  60, NULL),
  ('L',  'White',  'L-WHT',  45, NULL),
  ('XL', 'White',  'XL-WHT', 30, NULL),
  ('S',  'Black',  'S-BLK',  40, NULL),
  ('M',  'Black',  'M-BLK',  55, NULL),
  ('L',  'Black',  'L-BLK',  35, NULL)
) AS v(size, color, sku_suffix, stock_quantity, price_override) ON p.sku = 'SKU-SHRT-001';

-- Sample variants for Nike Air Max 270 (SKU-SNKR-001)
INSERT INTO product_variants (product_id, size, color, sku_suffix, stock_quantity, price_override, active)
SELECT p.id, v.size, v.color, v.sku_suffix, v.stock_quantity, v.price_override, TRUE
FROM products p
JOIN (VALUES
  ('7',  'Black/White', '7-BW',  10, NULL::NUMERIC),
  ('8',  'Black/White', '8-BW',  12, NULL),
  ('9',  'Black/White', '9-BW',  15, NULL),
  ('10', 'Black/White', '10-BW', 8,  NULL),
  ('8',  'White/Red',   '8-WR',  10, 10995.00),
  ('9',  'White/Red',   '9-WR',  12, 10995.00)
) AS v(size, color, sku_suffix, stock_quantity, price_override) ON p.sku = 'SKU-SNKR-001';
