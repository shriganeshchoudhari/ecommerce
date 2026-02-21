-- Seed Categories
INSERT INTO categories (name, slug, description) VALUES ('Electronics', 'electronics', 'Gadgets and gizmos') ON CONFLICT DO NOTHING;

-- Seed Products
INSERT INTO products (sku, name, description, price, stock_quantity, category_id, created_at, updated_at) 
VALUES ('TEST-SKU-1', 'Real Test Product', 'This is a real product in the DB for E2E testing', 99.99, 10, (SELECT id FROM categories WHERE slug='electronics' LIMIT 1), NOW(), NOW())
ON CONFLICT (sku) DO NOTHING;

-- Seed Product Images
INSERT INTO product_images (product_id, image_url, is_primary)
SELECT id, 'https://via.placeholder.com/300', true FROM products WHERE sku='TEST-SKU-1'
ON CONFLICT DO NOTHING;
