// lab5_mongodb/comparison.js
// Сравнительные запросы, аналогичные PostgreSQL

use shop_mongo;

// Топ-3 пользователя по сумме заказов
print('--- Топ-3 пользователя по сумме заказов ---');
db.orders.aggregate([
    { $unwind: '$items' },
    {
        $group: {
            _id: '$user_id',
            total_spent: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
        }
    },
    { $sort: { total_spent: -1 } },
    { $limit: 3 },
    {
        $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
        }
    },
    { $unwind: '$user' },
    {
        $project: {
            full_name: '$user.full_name',
            total_spent: 1
        }
    }
]).pretty();

// Заказы с итоговой суммой и информацией о пользователе
print('\n--- Заказы с суммой и пользователем ---');
db.orders.aggregate([
    { $unwind: '$items' },
    {
        $group: {
            _id: '$_id',
            user_id: { $first: '$user_id' },
            order_date: { $first: '$order_date' },
            status: { $first: '$status' },
            total_amount: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
        }
    },
    {
        $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user'
        }
    },
    { $unwind: '$user' },
    {
        $project: {
            order_id: '$_id',
            full_name: '$user.full_name',
            order_date: 1,
            status: 1,
            total_amount: 1,
            _id: 0
        }
    }
]).pretty();
