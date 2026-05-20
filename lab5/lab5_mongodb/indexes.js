// lab5_mongodb/indexes.js
// Создание индексов для ускорения аналитики

use shop_mongo;

db.orders.createIndex({ user_id: 1 });
db.orders.createIndex({ 'items.product_id': 1 });
db.users.createIndex({ email: 1 });
db.products.createIndex({ category: 1 });

print('Indexes created:');
printjson(db.orders.getIndexes());
printjson(db.users.getIndexes());
printjson(db.products.getIndexes());
