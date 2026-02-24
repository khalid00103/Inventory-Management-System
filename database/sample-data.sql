-- ============================================
-- SAMPLE DATA FOR INVENTORY MANAGEMENT SYSTEM
-- ============================================

-- Insert sample users
-- Password: 'admin123' (hashed with bcrypt - $2b$10$)
INSERT INTO users (username, password, email, role) VALUES
('admin', '$2b$10$rKvFJYKEYHiLZm8pZWJ0GeYXJZ9vKZ8xQZ9xKZ8xQZ9xKZ8xQZ9xKa', 'admin@inventory.com', 'admin'),
('manager', '$2b$10$rKvFJYKEYHiLZm8pZWJ0GeYXJZ9vKZ8xQZ9xKZ8xQZ9xKZ8xQZ9xKa', 'manager@inventory.com', 'manager'),
('staff', '$2b$10$rKvFJYKEYHiLZm8pZWJ0GeYXJZ9vKZ8xQZ9xKZ8xQZ9xKZ8xQZ9xKa', 'staff@inventory.com', 'staff');

-- Insert sample products
INSERT INTO products (sku, name, description, category, unit_price, cost_price, current_stock, min_stock_level, reorder_point, supplier, status) VALUES
-- Electronics
('ELEC-001', 'Wireless Mouse', 'Ergonomic wireless mouse with USB receiver', 'Electronics', 29.99, 15.00, 150, 20, 30, 'TechSupply Co.', 'active'),
('ELEC-002', 'USB-C Cable 2m', 'High-speed USB-C charging cable', 'Electronics', 12.99, 5.50, 45, 30, 40, 'TechSupply Co.', 'active'),
('ELEC-003', 'Bluetooth Headphones', 'Noise-cancelling over-ear headphones', 'Electronics', 89.99, 45.00, 25, 10, 15, 'AudioPro Ltd.', 'active'),
('ELEC-004', 'Laptop Stand', 'Adjustable aluminum laptop stand', 'Electronics', 39.99, 18.00, 80, 15, 25, 'TechSupply Co.', 'active'),
('ELEC-005', 'Webcam HD', '1080p HD webcam with microphone', 'Electronics', 59.99, 28.00, 8, 10, 15, 'TechSupply Co.', 'active'),

-- Office Supplies
('OFF-001', 'A4 Paper Ream', '500 sheets premium white paper', 'Office Supplies', 8.99, 4.00, 200, 50, 75, 'Office World', 'active'),
('OFF-002', 'Ballpoint Pen (Blue)', 'Box of 50 blue ballpoint pens', 'Office Supplies', 15.99, 7.50, 12, 20, 30, 'Office World', 'active'),
('OFF-003', 'Stapler Heavy Duty', 'Metal stapler for up to 50 sheets', 'Office Supplies', 24.99, 12.00, 60, 15, 20, 'Office World', 'active'),
('OFF-004', 'Sticky Notes Pack', 'Multicolor sticky notes - 12 pads', 'Office Supplies', 9.99, 4.50, 95, 25, 35, 'Office World', 'active'),
('OFF-005', 'File Folders Box', 'Box of 25 manila file folders', 'Office Supplies', 18.99, 8.00, 5, 15, 20, 'Office World', 'active'),

-- Furniture
('FURN-001', 'Office Chair Ergonomic', 'Adjustable ergonomic office chair', 'Furniture', 249.99, 120.00, 15, 5, 8, 'ComfortSeating Inc.', 'active'),
('FURN-002', 'Desk Lamp LED', 'Adjustable LED desk lamp', 'Furniture', 34.99, 16.00, 55, 10, 15, 'LightingPro', 'active'),
('FURN-003', 'Standing Desk Converter', 'Height-adjustable desk converter', 'Furniture', 179.99, 85.00, 22, 5, 10, 'ComfortSeating Inc.', 'active'),
('FURN-004', 'Monitor Arm Mount', 'Dual monitor arm mount', 'Furniture', 79.99, 38.00, 18, 8, 12, 'TechSupply Co.', 'active'),
('FURN-005', 'Filing Cabinet 3-Drawer', 'Metal filing cabinet with lock', 'Furniture', 159.99, 75.00, 10, 3, 5, 'ComfortSeating Inc.', 'active'),

-- Accessories
('ACC-001', 'Desk Organizer', 'Bamboo desk organizer with compartments', 'Accessories', 22.99, 10.00, 75, 15, 20, 'Office World', 'active'),
('ACC-002', 'Cable Management Box', 'Large cable management solution', 'Accessories', 19.99, 9.00, 40, 10, 15, 'TechSupply Co.', 'active'),
('ACC-003', 'Mousepad Extended', 'Large gaming/office mousepad', 'Accessories', 14.99, 6.50, 110, 20, 30, 'TechSupply Co.', 'active'),
('ACC-004', 'Phone Stand Adjustable', 'Universal phone and tablet stand', 'Accessories', 16.99, 7.50, 65, 15, 20, 'TechSupply Co.', 'active'),
('ACC-005', 'Whiteboard Small', '24x36 magnetic whiteboard', 'Accessories', 29.99, 14.00, 28, 10, 15, 'Office World', 'active');

-- Insert sample stock transactions (Purchase entries)
INSERT INTO stock_transactions (product_id, transaction_type, quantity, unit_price, stock_before, stock_after, reference_number, notes, created_by) VALUES
-- Initial stock purchases (1 week ago)
(1, 'purchase', 100, 15.00, 0, 100, 'PO-2024-001', 'Initial stock purchase', 1),
(2, 'purchase', 50, 5.50, 0, 50, 'PO-2024-001', 'Initial stock purchase', 1),
(3, 'purchase', 30, 45.00, 0, 30, 'PO-2024-002', 'Initial stock purchase', 1),
(4, 'purchase', 50, 18.00, 0, 50, 'PO-2024-002', 'Initial stock purchase', 1),
(5, 'purchase', 20, 28.00, 0, 20, 'PO-2024-003', 'Initial stock purchase', 1),

-- Recent transactions (today and yesterday)
-- Sales from yesterday
(1, 'sale', -15, 29.99, 150, 135, 'SO-2024-101', 'Corporate order', 2),
(2, 'sale', -10, 12.99, 50, 40, 'SO-2024-102', 'Retail sale', 2),
(3, 'sale', -5, 89.99, 30, 25, 'SO-2024-103', 'Online order', 2),
(6, 'sale', -25, 8.99, 225, 200, 'SO-2024-104', 'Bulk order', 2),

-- Purchases from yesterday
(1, 'purchase', 50, 15.00, 135, 185, 'PO-2024-050', 'Restock order', 1),
(5, 'purchase', 10, 28.00, 10, 20, 'PO-2024-051', 'Emergency restock', 1),

-- Today's sales
(1, 'sale', -35, 29.99, 185, 150, 'SO-2024-105', 'Morning sales', 2),
(2, 'sale', -5, 12.99, 40, 35, 'SO-2024-106', 'Walk-in customer', 3),
(4, 'sale', -8, 39.99, 58, 50, 'SO-2024-107', 'Office supply order', 2),
(7, 'sale', -8, 15.99, 20, 12, 'SO-2024-108', 'Corporate bulk order', 2),

-- Today's purchases
(2, 'purchase', 10, 5.50, 35, 45, 'PO-2024-052', 'Quick restock', 1),
(10, 'sale', -5, 18.99, 10, 5, 'SO-2024-109', 'Office supplies', 2);

-- Update products table to reflect current stock
UPDATE products SET current_stock = 150 WHERE id = 1;
UPDATE products SET current_stock = 45 WHERE id = 2;
UPDATE products SET current_stock = 25 WHERE id = 3;
UPDATE products SET current_stock = 80 WHERE id = 4;
UPDATE products SET current_stock = 8 WHERE id = 5;
UPDATE products SET current_stock = 200 WHERE id = 6;
UPDATE products SET current_stock = 12 WHERE id = 7;
UPDATE products SET current_stock = 60 WHERE id = 8;
UPDATE products SET current_stock = 95 WHERE id = 9;
UPDATE products SET current_stock = 5 WHERE id = 10;
