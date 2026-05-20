// lab5_mongodb/queries.js
// CRUD-операции и аналитика MongoDB

use shop_mongo;

// 1. READ: найти все заказы пользователя Alice с итоговой суммой
print('--- Заказы Alice с суммой ---');
db.orders.aggregate([
    {
        $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user_info'
        }
    },
    { $unwind: '$user_info' },
    { $match: { 'user_info.email': 'alice@example.com' } },
    {
        $addFields: {
            total_amount: {
                $sum: {
                    $map: {
                        input: '$items',
                        as: 'item',
                        in: { $multiply: ['$$item.quantity', '$$item.price'] }
                    }
                }
            }
        }
    },
    {
        $project: {
            _id: 1,
            user: '$user_info.full_name',
            status: 1,
            total_amount: 1,
            items: 1
        }
    }
]).pretty();

// 2. UPDATE: добавить поле discount к заказам дороже 80000 руб.
print('\n--- Обновление заказов с total_amount > 80000 ---');
db.orders.aggregate([
    {
        $addFields: {
            total_amount: {
                $sum: {
                    $map: {
                        input: '$items',
                        as: 'item',
                        in: { $multiply: ['$$item.quantity', '$$item.price'] }
                    }
                }
            }
        }
    },
    { $match: { total_amount: { $gt: 80000 } } },
    { $project: { _id: 1 } }
]).forEach(doc => {
    db.orders.updateOne({ _id: doc._id }, { $set: { discount: 10 } });
});

print('Updated documents: ' + db.orders.countDocuments({ discount: 10 }));

// 3. DELETE: удалить cancelled заказы старше 30 дней
print('\n--- Удаление cancelled заказов старше 30 дней ---');
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
const deleted = db.orders.deleteMany({
    status: 'cancelled',
    order_date: { $lt: thirtyDaysAgo }
});
print('Deleted count: ' + deleted.deletedCount);

// 4. Агрегационный пайплайн: выручка по категориям
print('\n--- Выручка по категориям ---');
db.orders.aggregate([
    { $unwind: '$items' },
    {
        $lookup: {
            from: 'products',
            localField: 'items.product_id',
            foreignField: '_id',
            as: 'product_info'
        }
    },
    { $unwind: '$product_info' },
    {
        $group: {
            _id: '$product_info.category',
            total_sold: { $sum: '$items.quantity' },
            total_revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
            average_price: { $avg: '$items.price' }
        }
    },
    { $sort: { total_revenue: -1 } },
    {
        $project: {
            category: '$_id',
            total_sold: 1,
            total_revenue: 1,
            average_price: 1,
            _id: 0
        }
    }
]).pretty();
