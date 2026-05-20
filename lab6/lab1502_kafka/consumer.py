"""
Kafka Consumer: Обработка событий заказов и агрегация статистики в реальном времени
"""

import json
import logging
from collections import defaultdict
from datetime import datetime

from kafka import KafkaConsumer

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class OrderStatsConsumer:
    """Консюмер для агрегации статистики заказов в реальном времени"""

    def __init__(self, bootstrap_servers='localhost:9092', topic='orders', group_id='order_stats_group'):
        self.bootstrap_servers = bootstrap_servers
        self.topic = topic
        self.group_id = group_id
        self.consumer: KafkaConsumer | None = None

        self.stats = {
            'total_orders': 0,
            'total_revenue': 0.0,
            'orders_by_category': defaultdict(int),
            'orders_by_city': defaultdict(int),
            'recent_orders': [],
            'start_time': datetime.now()
        }

    def connect(self):
        """Создание подключения к Kafka"""
        try:
            self.consumer = KafkaConsumer(
                self.topic,
                bootstrap_servers=self.bootstrap_servers,
                group_id=self.group_id,
                auto_offset_reset='earliest',
                enable_auto_commit=True,
                value_deserializer=lambda v: json.loads(v.decode('utf-8')),
                key_deserializer=lambda k: k.decode('utf-8') if k else None
            )
            logger.info(f"Connected to Kafka, subscribed to topic: {self.topic}")
        except Exception as e:
            logger.error(f"Failed to connect: {e}")
            raise

    def update_stats(self, order: dict):
        """Обновление статистики на основе полученного заказа"""
        self.stats['total_orders'] += 1
        self.stats['total_revenue'] += float(order.get('total_amount', 0.0))

        for item in order.get('items', []):
            category = item.get('category', 'Unknown')
            self.stats['orders_by_category'][category] += 1

        city = order.get('customer', {}).get('city', 'Unknown')
        self.stats['orders_by_city'][city] += 1

        self.stats['recent_orders'].append({
            'order_id': order.get('order_id'),
            'customer': order.get('customer', {}).get('name'),
            'total': order.get('total_amount'),
            'time': order.get('timestamp')
        })
        if len(self.stats['recent_orders']) > 10:
            self.stats['recent_orders'].pop(0)

    def print_stats(self):
        """Вывод текущей статистики в консоль"""
        logger.info("=" * 50)
        logger.info("ТЕКУЩАЯ СТАТИСТИКА ЗАКАЗОВ")
        logger.info(f"Всего заказов: {self.stats['total_orders']}")
        logger.info(f"Общая выручка: {self.stats['total_revenue']:,.2f} руб.")
        if self.stats['total_orders'] > 0:
            avg_check = self.stats['total_revenue'] / self.stats['total_orders']
            logger.info(f"Средний чек: {avg_check:,.2f} руб.")
        else:
            logger.info("Средний чек: 0 руб.")
        logger.info(f"Заказов по категориям: {dict(self.stats['orders_by_category'])}")
        logger.info(f"Заказов по городам: {dict(self.stats['orders_by_city'])}")
        logger.info(f"Последние 3 заказа: {self.stats['recent_orders'][-3:]}")
        logger.info("=" * 50)

    def run(self):
        """Запуск консюмера для непрерывного чтения сообщений"""
        logger.info("Starting consumer. Waiting for orders...")
        self.connect()

        try:
            if self.consumer is None:
                raise RuntimeError("Consumer is not connected")

            for message in self.consumer:
                order = message.value
                logger.info(f"Received order {order.get('order_id')} from customer {order.get('customer', {}).get('name')}")
                self.update_stats(order)
                self.print_stats()
        except KeyboardInterrupt:
            logger.info("Consumer stopped by user")
        finally:
            if self.consumer is not None:
                self.consumer.close()
            self.print_final_report()

    def print_final_report(self):
        """Финальный отчёт после остановки консюмера"""
        runtime = datetime.now() - self.stats['start_time']
        logger.info("=" * 50)
        logger.info("ФИНАЛЬНЫЙ ОТЧЁТ")
        logger.info(f"Время работы: {runtime.total_seconds():.2f} секунд")
        logger.info(f"Обработано заказов: {self.stats['total_orders']}")
        if runtime.total_seconds() > 0:
            logger.info(f"Средняя скорость: {self.stats['total_orders'] / runtime.total_seconds():.2f} заказов/сек")
        logger.info("=" * 50)


if __name__ == "__main__":
    consumer = OrderStatsConsumer()
    consumer.run()
