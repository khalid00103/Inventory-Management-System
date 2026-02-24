-- ============================================
-- INVENTORY MANAGEMENT SYSTEM - DATABASE SCHEMA
-- ============================================

-- Drop existing tables if they exist
DROP PROCEDURE IF EXISTS process_stock_transaction; 
DROP TABLE IF EXISTS stock_transactions;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;
DROP VIEW IF EXISTS low_stock_products;
DROP VIEW IF EXISTS daily_transaction_summary;
DROP VIEW IF EXISTS product_value_summary;

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    role ENUM('admin', 'manager', 'staff') DEFAULT 'staff',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- PRODUCTS TABLE
-- ============================================
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    cost_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    current_stock INT NOT NULL DEFAULT 0,
    min_stock_level INT NOT NULL DEFAULT 10,
    max_stock_level INT NOT NULL DEFAULT 1000,
    reorder_point INT NOT NULL DEFAULT 20,
    supplier VARCHAR(255),
    status ENUM('active', 'inactive', 'discontinued') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_prices CHECK (unit_price >= 0 AND cost_price >= 0),
    CONSTRAINT chk_stock CHECK (current_stock >= 0),
    CONSTRAINT chk_min_max CHECK (min_stock_level <= max_stock_level),
    
    -- Indexes for performance
    INDEX idx_sku (sku),
    INDEX idx_name (name),
    INDEX idx_category (category),
    INDEX idx_status (status),
    INDEX idx_current_stock (current_stock),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- STOCK TRANSACTIONS TABLE
-- ============================================
CREATE TABLE stock_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    transaction_type ENUM('purchase', 'sale', 'adjustment', 'return') NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(10, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    stock_before INT NOT NULL,
    stock_after INT NOT NULL,
    reference_number VARCHAR(100),
    notes TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Constraints
    CONSTRAINT chk_quantity CHECK (quantity != 0),
    CONSTRAINT chk_stock_consistency CHECK (
        (transaction_type IN ('purchase', 'return') AND stock_after = stock_before + quantity) OR
        (transaction_type IN ('sale', 'adjustment') AND stock_after = stock_before - ABS(quantity))
    ),
    
    -- Indexes for performance
    INDEX idx_product_id (product_id),
    INDEX idx_transaction_type (transaction_type),
    INDEX idx_created_at (created_at),
    INDEX idx_reference_number (reference_number),
    INDEX idx_composite_product_date (product_id, created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- STORED PROCEDURES FOR TRANSACTION SAFETY
-- ============================================

DELIMITER //

-- Procedure to handle stock transactions with automatic stock updates
CREATE PROCEDURE process_stock_transaction(
    IN p_product_id INT,
    IN p_transaction_type VARCHAR(20),
    IN p_quantity INT,
    IN p_unit_price DECIMAL(10, 2),
    IN p_reference_number VARCHAR(100),
    IN p_notes TEXT,
    IN p_created_by INT,
    OUT p_transaction_id INT,
    OUT p_new_stock INT
)
BEGIN
    DECLARE v_current_stock INT;
    DECLARE v_new_stock INT;
    DECLARE v_adjusted_quantity INT;
    
    -- Start transaction
    START TRANSACTION;
    
    -- Lock the product row for update
    SELECT current_stock INTO v_current_stock
    FROM products
    WHERE id = p_product_id
    FOR UPDATE;
    
    -- Calculate new stock based on transaction type
    IF p_transaction_type IN ('purchase', 'return') THEN
        SET v_adjusted_quantity = ABS(p_quantity);
        SET v_new_stock = v_current_stock + v_adjusted_quantity;
    ELSEIF p_transaction_type IN ('sale', 'adjustment') THEN
        SET v_adjusted_quantity = -ABS(p_quantity);
        SET v_new_stock = v_current_stock - ABS(p_quantity);
    END IF;
    
    -- Check if stock would go negative
    IF v_new_stock < 0 THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Insufficient stock for this transaction';
    END IF;
    
    -- Insert transaction record
    INSERT INTO stock_transactions (
        product_id,
        transaction_type,
        quantity,
        unit_price,
        stock_before,
        stock_after,
        reference_number,
        notes,
        created_by
    ) VALUES (
        p_product_id,
        p_transaction_type,
        v_adjusted_quantity,
        p_unit_price,
        v_current_stock,
        v_new_stock,
        p_reference_number,
        p_notes,
        p_created_by
    );
    
    SET p_transaction_id = LAST_INSERT_ID();
    
    -- Update product stock
    UPDATE products
    SET current_stock = v_new_stock,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_product_id;
    
    SET p_new_stock = v_new_stock;
    
    -- Commit transaction
    COMMIT;
END //

DELIMITER ;

-- ============================================
-- VIEWS FOR REPORTING
-- ============================================

-- View for low stock products
CREATE VIEW low_stock_products AS
SELECT 
    p.id,
    p.sku,
    p.name,
    p.category,
    p.current_stock,
    p.min_stock_level,
    p.reorder_point,
    p.unit_price,
    (p.reorder_point - p.current_stock) AS shortage_quantity
FROM products p
WHERE p.current_stock <= p.reorder_point 
  AND p.status = 'active'
ORDER BY (p.reorder_point - p.current_stock) DESC;

-- View for daily transaction summary
CREATE VIEW daily_transaction_summary AS
SELECT 
    DATE(created_at) AS transaction_date,
    transaction_type,
    COUNT(*) AS transaction_count,
    SUM(ABS(quantity)) AS total_quantity,
    SUM(total_amount) AS total_amount
FROM stock_transactions
GROUP BY DATE(created_at), transaction_type
ORDER BY transaction_date DESC, transaction_type;

-- View for product value summary
CREATE VIEW product_value_summary AS
SELECT 
    p.id,
    p.sku,
    p.name,
    p.category,
    p.current_stock,
    p.unit_price,
    p.cost_price,
    (p.current_stock * p.cost_price) AS inventory_value,
    (p.current_stock * (p.unit_price - p.cost_price)) AS potential_profit
FROM products p
WHERE p.status = 'active';
