-- lab5_postgresql/index_analysis.sql
-- Сравнение плана выполнения до и после создания индекса

-- План выполнения до индекса
EXPLAIN ANALYZE
SELECT * FROM order_items WHERE order_id = 1;

-- Создание индекса для ускорения поиска по order_id
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- План выполнения после создания индекса
EXPLAIN ANALYZE
SELECT * FROM order_items WHERE order_id = 1;
