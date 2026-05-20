-- lab5_postgresql/schema.sql
-- Схема и тестовые данные для интернет-магазина

DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    price DECIMAL(10,2) NOT NULL CHECK (price > 0),
    stock_quantity INTEGER DEFAULT 0
);

CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending'
);

CREATE TABLE order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(order_id),
    product_id INTEGER REFERENCES products(product_id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL
);

INSERT INTO users (email, full_name) VALUES
    ('alice@example.com', 'Alice Smith'),
    ('bob@example.com', 'Bob Johnson'),
    ('elena@example.com', 'Elena Petrova');

INSERT INTO products (name, category, price, stock_quantity) VALUES
    ('Ноутбук', 'Электроника', 75000.00, 10),
    ('Мышь', 'Электроника', 1500.00, 50),
    ('Книга SQL', 'Книги', 2500.00, 30),
    ('Клавиатура', 'Электроника', 3200.00, 25),
    ('Чехол для ноутбука', 'Аксессуары', 1900.00, 40);

INSERT INTO orders (user_id, status, order_date) VALUES
    (1, 'completed', '2026-05-10 10:15:00'),
    (2, 'completed', '2026-05-13 14:20:00'),
    (3, 'completed', '2026-05-15 16:05:00');

INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
    (1, 1, 1, 75000.00),  -- Alice: Ноутбук
    (1, 2, 2, 1500.00),   -- Alice: Мышь x2
    (1, 5, 1, 1900.00),   -- Alice: Чехол для ноутбука
    (2, 3, 1, 2500.00),   -- Bob: Книга SQL
    (2, 4, 1, 3200.00),   -- Bob: Клавиатура
    (2, 2, 3, 1500.00),   -- Bob: Мышь x3
    (3, 3, 2, 2500.00),   -- Elena: Книга SQL x2
    (3, 5, 2, 1900.00);   -- Elena: Чехол x2
