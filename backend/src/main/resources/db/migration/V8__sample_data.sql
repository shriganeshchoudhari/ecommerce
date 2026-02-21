-- ============================================================
-- V8: Comprehensive Sample Data (10+ records per entity)
-- ============================================================
-- NOTE: All user passwords are BCrypt hash of 'Password123!'

-- ============================================================
-- 1. USERS (2 Admins + 10 Customers)
-- ============================================================
INSERT INTO users (name, email, password, role, enabled, created_at) VALUES
('Super Admin',    'admin@shopease.com',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN',    TRUE, NOW()),
('Admin Test',     'admin_test@shopease.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN',    TRUE, NOW()),
('Rahul Sharma',   'rahul@shopease.com',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'CUSTOMER', TRUE, NOW()),
('Priya Patel',    'priya@shopease.com',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'CUSTOMER', TRUE, NOW()),
('Amit Kumar',     'amit@shopease.com',      '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'CUSTOMER', TRUE, NOW()),
('Sneha Joshi',    'sneha@shopease.com',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'CUSTOMER', TRUE, NOW()),
('Vikram Singh',   'vikram@shopease.com',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'CUSTOMER', TRUE, NOW()),
('Divya Nair',     'divya@shopease.com',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'CUSTOMER', TRUE, NOW()),
('Rajesh Mehta',   'rajesh@shopease.com',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'CUSTOMER', TRUE, NOW()),
('Anjali Gupta',   'anjali@shopease.com',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'CUSTOMER', TRUE, NOW()),
('Sanjay Desai',   'sanjay@shopease.com',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'CUSTOMER', TRUE, NOW()),
('Meera Krishnan', 'meera@shopease.com',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'CUSTOMER', TRUE, NOW())
ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- 2. CATEGORIES (10 categories)
-- ============================================================
INSERT INTO categories (name, slug, description, image_url) VALUES
('Electronics',        'electronics',     'Gadgets, phones, laptops and more',              'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400'),
('Fashion',            'fashion',         'Clothing, footwear and accessories',              'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400'),
('Home & Kitchen',     'home-kitchen',    'Furniture, appliances and decor',                'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400'),
('Books',              'books',           'Bestsellers, textbooks and fiction',              'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400'),
('Sports & Fitness',   'sports-fitness',  'Equipment, apparel and supplements',              'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400'),
('Beauty & Personal',  'beauty-personal', 'Skincare, makeup and grooming',                  'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400'),
('Toys & Games',       'toys-games',      'Board games, action figures and learning toys',  'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400'),
('Automotive',         'automotive',      'Car accessories, tools and spares',               'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400'),
('Food & Grocery',     'food-grocery',    'Fresh produce, packaged foods and beverages',     'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400'),
('Health & Wellness',  'health-wellness', 'Vitamins, supplements and medical devices',       'https://images.unsplash.com/photo-1544991936-9464fa57a96f?w=400')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 3. PRODUCTS (20 products across categories)
-- ============================================================
INSERT INTO products (sku, name, description, price, sale_price, stock_quantity, category_id, average_rating, review_count, active, created_at, updated_at)
VALUES
('SKU-PHONE-001', 'Samsung Galaxy S24 Ultra',    'Latest flagship with 200MP camera and S Pen',                89999.00,  79999.00, 50,  (SELECT id FROM categories WHERE slug='electronics'),    4.7, 128, TRUE, NOW(), NOW()),
('SKU-PHONE-002', 'iPhone 15 Pro Max',            'Apple A17 chip, titanium design, 48MP camera',             134990.00, 124990.00, 30, (SELECT id FROM categories WHERE slug='electronics'),   4.8, 256, TRUE, NOW(), NOW()),
('SKU-LAPT-001',  'Dell XPS 15 Laptop',           '13th Gen i7, 16GB RAM, 512GB SSD, 4K OLED',               129999.00, 109999.00, 20, (SELECT id FROM categories WHERE slug='electronics'),   4.5, 89,  TRUE, NOW(), NOW()),
('SKU-EARB-001',  'Sony WH-1000XM5 Headphones',  'Industry-leading noise cancellation, 30hr battery',          29990.00,  24990.00, 75, (SELECT id FROM categories WHERE slug='electronics'),   4.6, 215, TRUE, NOW(), NOW()),
('SKU-WTCH-001',  'Apple Watch Series 9',          'GPS + Cellular, Always-On Retina display',                  41900.00,  38900.00, 40, (SELECT id FROM categories WHERE slug='electronics'),   4.7, 180, TRUE, NOW(), NOW()),
('SKU-SHRT-001',  'Levi''s Classic T-Shirt Pack', '100% cotton premium round-neck tee, pack of 3',              1999.00,   1499.00, 200,(SELECT id FROM categories WHERE slug='fashion'),       4.3, 310, TRUE, NOW(), NOW()),
('SKU-JEAN-001',  'Levi''s 511 Slim Fit Jeans',   'Mid-rise slim-fit stretch denim',                            3999.00,   2999.00, 150,(SELECT id FROM categories WHERE slug='fashion'),       4.4, 195, TRUE, NOW(), NOW()),
('SKU-SNKR-001',  'Nike Air Max 270',              'Cushioned running shoe with Max Air unit',                  12995.00,   9995.00, 80, (SELECT id FROM categories WHERE slug='fashion'),       4.5, 142, TRUE, NOW(), NOW()),
('SKU-BOOK-001',  'Atomic Habits',                 'Build good habits and break bad ones — James Clear',           499.00,    399.00, 300,(SELECT id FROM categories WHERE slug='books'),        4.8, 520, TRUE, NOW(), NOW()),
('SKU-BOOK-002',  'The Psychology of Money',       'Morgan Housel on wealth, greed, and happiness',                449.00,    349.00, 250,(SELECT id FROM categories WHERE slug='books'),        4.7, 380, TRUE, NOW(), NOW()),
('SKU-SOFA-001',  'Nilkamal 3-Seater Sofa',        'Premium fabric sofa with hardwood frame, Grey',            24999.00,  19999.00, 15, (SELECT id FROM categories WHERE slug='home-kitchen'),  4.2, 65,  TRUE, NOW(), NOW()),
('SKU-AIRP-001',  'Philips Air Fryer 4.1L',        '1400W, digital display, 7 presets, non-stick basket',       6990.00,   5490.00, 60, (SELECT id FROM categories WHERE slug='home-kitchen'),  4.4, 230, TRUE, NOW(), NOW()),
('SKU-YOGA-001',  'Boldfit Yoga Mat 6mm',           'Anti-slip, extra thick, with carry strap',                    799.00,    599.00, 400,(SELECT id FROM categories WHERE slug='sports-fitness'),4.3, 415, TRUE, NOW(), NOW()),
('SKU-DUMB-001',  'Kore Adjustable Dumbbell Set',   '2-24 kg adjustable, replaces 9 sets of weights',           12999.00,  10999.00, 25, (SELECT id FROM categories WHERE slug='sports-fitness'),4.5, 88,  TRUE, NOW(), NOW()),
('SKU-CREM-001',  'Cetaphil Moisturizing Cream',    'Non-greasy, sensitive skin formula, 500g',                    799.00,    649.00, 500,(SELECT id FROM categories WHERE slug='beauty-personal'),4.6,680, TRUE, NOW(), NOW()),
('SKU-VITC-001',  'Himalaya Vitamin C 500mg',       '60 tablets, immune booster, antioxidant',                     349.00,    299.00, 600,(SELECT id FROM categories WHERE slug='health-wellness'),4.4,340, TRUE, NOW(), NOW()),
('SKU-BPMO-001',  'Omron HEM-7120 BP Monitor',      'Automatic upper arm blood pressure monitor',                 1999.00,   1699.00, 90, (SELECT id FROM categories WHERE slug='health-wellness'),4.5,485, TRUE, NOW(), NOW()),
('SKU-LEGO-001',  'LEGO Creator 3-in-1 Set',        'Build a dragon, fish or crab — 160 pieces',                  1299.00,    999.00, 120,(SELECT id FROM categories WHERE slug='toys-games'),   4.7, 195, TRUE, NOW(), NOW()),
('SKU-CARW-001',  '3M Car Wax Polish Kit',           'Professional shine, UV protect, complete kit',                1199.00,    899.00, 180,(SELECT id FROM categories WHERE slug='automotive'),   4.3, 115, TRUE, NOW(), NOW()),
('SKU-OATS-001',  'Quaker Oats 2kg Pack',            'Whole grain rolled oats, high fibre, quick cook',               399.00,    329.00,1000,(SELECT id FROM categories WHERE slug='food-grocery'), 4.5, 780, TRUE, NOW(), NOW())
ON CONFLICT (sku) DO NOTHING;

-- ============================================================
-- 4. PRODUCT IMAGES (one primary image per product)
-- ============================================================
INSERT INTO product_images (product_id, image_url, is_primary, sort_order)
SELECT p.id, img.url, TRUE, 0
FROM products p
JOIN (VALUES
  ('SKU-PHONE-001', 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500'),
  ('SKU-PHONE-002', 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500'),
  ('SKU-LAPT-001',  'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=500'),
  ('SKU-EARB-001',  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'),
  ('SKU-WTCH-001',  'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500'),
  ('SKU-SHRT-001',  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500'),
  ('SKU-JEAN-001',  'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500'),
  ('SKU-SNKR-001',  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'),
  ('SKU-BOOK-001',  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500'),
  ('SKU-BOOK-002',  'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=500'),
  ('SKU-SOFA-001',  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500'),
  ('SKU-AIRP-001',  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500'),
  ('SKU-YOGA-001',  'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500'),
  ('SKU-DUMB-001',  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500'),
  ('SKU-CREM-001',  'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500'),
  ('SKU-VITC-001',  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500'),
  ('SKU-BPMO-001',  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500'),
  ('SKU-LEGO-001',  'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=500'),
  ('SKU-CARW-001',  'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=500'),
  ('SKU-OATS-001',  'https://images.unsplash.com/photo-1495716968375-6823bc5f0166?w=500')
) AS img(sku, url) ON p.sku = img.sku
ON CONFLICT DO NOTHING;

-- ============================================================
-- 5. COUPONS (10 promo codes)
-- ============================================================
INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, valid_from, valid_until, active) VALUES
('WELCOME20',  'PERCENTAGE', 20.00,     NULL, '2026-01-01 00:00:00', '2026-12-31 23:59:59', TRUE),
('SAVE500',    'FIXED',     500.00,  2000.00, '2026-01-01 00:00:00', '2026-12-31 23:59:59', TRUE),
('SUMMER10',   'PERCENTAGE', 10.00,   500.00, '2026-06-01 00:00:00', '2026-08-31 23:59:59', TRUE),
('FLAT200',    'FIXED',     200.00,   999.00, '2026-01-01 00:00:00', '2026-06-30 23:59:59', TRUE),
('NEWUSER15',  'PERCENTAGE', 15.00,     NULL, '2026-01-01 00:00:00', '2026-12-31 23:59:59', TRUE),
('HOLI25',     'PERCENTAGE', 25.00,  1000.00, '2026-03-10 00:00:00', '2026-03-15 23:59:59', TRUE),
('DIWALI30',   'PERCENTAGE', 30.00,  1500.00, '2026-10-15 00:00:00', '2026-10-25 23:59:59', TRUE),
('TECH100',    'FIXED',    1000.00,  5000.00, '2026-01-01 00:00:00', '2026-12-31 23:59:59', TRUE),
('WINTER26',   'PERCENTAGE', 26.00,   500.00, '2026-11-01 00:00:00', '2026-12-31 23:59:59', TRUE),
('FLASH50',    'PERCENTAGE', 50.00, 10000.00, '2026-02-21 00:00:00', '2026-02-28 23:59:59', TRUE)
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- 6. ADDRESSES (one address per customer)
-- ============================================================
INSERT INTO addresses (user_id, full_name, phone, line1, city, state, pincode, country, is_default)
VALUES
((SELECT id FROM users WHERE email='rahul@shopease.com'),  'Rahul Sharma',   '9876541230', '12 Banjara Hills, Road No 3',  'Hyderabad', 'Telangana',   '500034', 'India', TRUE),
((SELECT id FROM users WHERE email='priya@shopease.com'),  'Priya Patel',    '9876541231', '45 Koregaon Park',              'Pune',       'Maharashtra', '411001', 'India', TRUE),
((SELECT id FROM users WHERE email='amit@shopease.com'),   'Amit Kumar',     '9876541232', '7 Lajpat Nagar II',             'New Delhi',  'Delhi',       '110024', 'India', TRUE),
((SELECT id FROM users WHERE email='sneha@shopease.com'),  'Sneha Joshi',    '9876541233', '23 Indiranagar, 100 Ft Road',   'Bengaluru',  'Karnataka',   '560038', 'India', TRUE),
((SELECT id FROM users WHERE email='vikram@shopease.com'), 'Vikram Singh',   '9876541234', '89 Sector 15, Chandigarh',      'Chandigarh', 'Punjab',      '160015', 'India', TRUE),
((SELECT id FROM users WHERE email='divya@shopease.com'),  'Divya Nair',     '9876541235', '56 Marine Lines',               'Mumbai',     'Maharashtra', '400002', 'India', TRUE),
((SELECT id FROM users WHERE email='rajesh@shopease.com'), 'Rajesh Mehta',   '9876541236', '34 C Scheme',                   'Jaipur',     'Rajasthan',   '302001', 'India', TRUE),
((SELECT id FROM users WHERE email='anjali@shopease.com'), 'Anjali Gupta',   '9876541237', '11 Nungambakkam',               'Chennai',    'Tamil Nadu',  '600034', 'India', TRUE),
((SELECT id FROM users WHERE email='sanjay@shopease.com'), 'Sanjay Desai',   '9876541238', '78 Bodakdev',                   'Ahmedabad',  'Gujarat',     '380054', 'India', TRUE),
((SELECT id FROM users WHERE email='meera@shopease.com'),  'Meera Krishnan', '9876541239', '5 Kakkanad, IT Park Road',      'Kochi',      'Kerala',      '682037', 'India', TRUE)
ON CONFLICT DO NOTHING;
