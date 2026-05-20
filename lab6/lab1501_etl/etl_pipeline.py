"""
ETL Pipeline для анализа продаж интернет-магазина
Этапы: Extract → Transform → Load → Visualize
"""

import os
import logging
from datetime import datetime

import pandas as pd
import numpy as np
from sqlalchemy import create_engine
import matplotlib.pyplot as plt
import seaborn as sns

# Настройка логирования
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class SalesETLPipeline:
    """ETL пайплайн для обработки данных о продажах"""

    def __init__(self, csv_path, db_path='sales.db'):
        self.csv_path = csv_path
        self.db_path = db_path
        self.raw_data: pd.DataFrame | None = None
        self.cleaned_data: pd.DataFrame | None = None
        self.aggregated_data: pd.DataFrame | None = None

    def extract(self) -> pd.DataFrame:
        """Этап 1: Извлечение данных из CSV-файла"""
        logger.info("Начало этапа EXTRACT")

        try:
            self.raw_data = pd.read_csv(self.csv_path)
        except FileNotFoundError as exc:
            logger.error(f"Файл {self.csv_path} не найден")
            raise
        except pd.errors.EmptyDataError:
            logger.error(f"Файл {self.csv_path} пустой")
            raise
        except Exception as exc:
            logger.error(f"Ошибка при загрузке CSV: {exc}")
            raise

        logger.info(f"Загружено {len(self.raw_data)} строк, {len(self.raw_data.columns)} колонок")
        logger.info(f"Колонки: {', '.join(self.raw_data.columns.astype(str).tolist())}")
        logger.info("Типы колонок:\n%s", self.raw_data.dtypes)

        if self.raw_data.empty:
            logger.error("Данные пустые после загрузки")
            raise ValueError("CSV файл не содержит данных")

        return self.raw_data

    def transform(self) -> pd.DataFrame:
        """Этап 2: Трансформация и очистка данных"""
        logger.info("Начало этапа TRANSFORM")

        if self.raw_data is None:
            raise ValueError("Данные не были загружены. Выполните extract() сначала.")

        df = self.raw_data.copy()
        initial_rows = len(df)

        df = df.drop_duplicates()
        dropped_duplicates = initial_rows - len(df)
        logger.info(f"Удалено дубликатов: {dropped_duplicates}")

        numeric_cols = ['quantity', 'price_per_unit']
        text_cols = ['category', 'product_name', 'customer_name']

        for col in numeric_cols:
            if col in df.columns:
                median_value = df[col].median(skipna=True)
                df[col] = pd.to_numeric(df[col], errors='coerce')
                df[col] = df[col].fillna(median_value)
                logger.info(f"Заполнено пропусков в {col} медианой: {median_value}")

        for col in text_cols:
            if col in df.columns:
                df[col] = df[col].fillna('Unknown')
                missing = df[col].isna().sum()
                logger.info(f"Заполнено пропусков в {col}: {missing}")

        if 'order_date' in df.columns:
            df['order_date'] = pd.to_datetime(df['order_date'], errors='coerce')
            invalid_dates = df['order_date'].isna().sum()
            if invalid_dates > 0:
                logger.warning(f"Найдено неверных дат order_date: {invalid_dates}")

        df['quantity'] = pd.to_numeric(df['quantity'], errors='coerce')
        df['price_per_unit'] = pd.to_numeric(df['price_per_unit'], errors='coerce')

        before_anomaly = len(df)
        df = df[df['quantity'] > 0]
        df = df[df['price_per_unit'] > 0]
        anomalies_removed = before_anomaly - len(df)
        logger.info(f"Удалено аномалий (quantity <= 0 или price_per_unit <= 0): {anomalies_removed}")

        df = df.dropna(subset=['order_date', 'quantity', 'price_per_unit'])
        logger.info(f"Удалено строк с некорректными типами после преобразования: {before_anomaly - anomalies_removed - len(df)}")

        df['total_amount'] = df['quantity'] * df['price_per_unit']
        df['month_year'] = df['order_date'].dt.strftime('%Y-%m')

        self.cleaned_data = df.reset_index(drop=True)
        logger.info(f"После очистки: {len(self.cleaned_data)} строк")

        return self.cleaned_data

    def aggregate(self) -> pd.DataFrame:
        """Этап 3: Агрегация данных для аналитики"""
        logger.info("Начало этапа AGGREGATE")

        if self.cleaned_data is None:
            raise ValueError("Данные не очищены. Выполните transform() сначала.")

        df = self.cleaned_data.copy()
        self.aggregated_data = (
            df.groupby(['category', 'month_year'], as_index=False)
            .agg(
                total_quantity=('quantity', 'sum'),
                total_revenue=('total_amount', 'sum'),
                avg_price=('price_per_unit', 'mean'),
                order_count=('order_id', 'nunique')
            )
        )

        logger.info(f"Агрегировано {len(self.aggregated_data)} строк")
        return self.aggregated_data

    def load_to_sqlite(self):
        """Этап 4: Загрузка данных в SQLite базу данных"""
        logger.info("Начало этапа LOAD")

        if self.cleaned_data is None or self.aggregated_data is None:
            raise ValueError("Нет данных для загрузки. Выполните transform() и aggregate().")

        engine = create_engine(f'sqlite:///{self.db_path}')

        self.cleaned_data.to_sql('sales_cleaned', engine, if_exists='replace', index=False)
        self.aggregated_data.to_sql('sales_aggregated', engine, if_exists='replace', index=False)

        with engine.connect() as conn:
            tables = conn.execute("SELECT name FROM sqlite_master WHERE type='table';").fetchall()
            logger.info(f"Таблицы в БД: {[table[0] for table in tables]}")

        logger.info(f"Данные загружены в {self.db_path}")

    def visualize(self):
        """Этап 5: Визуализация результатов"""
        logger.info("Начало этапа VISUALIZE")

        if self.aggregated_data is None:
            raise ValueError("Нет агрегированных данных для визуализации.")

        sns.set_style('whitegrid')

        category_revenue = (
            self.aggregated_data.groupby('category', as_index=False)
            ['total_revenue'].sum().sort_values(by='total_revenue', ascending=False)
        )

        plt.figure(figsize=(10, 6))
        sns.barplot(data=category_revenue, x='category', y='total_revenue', palette='viridis')
        plt.title('Выручка по категориям товаров')
        plt.xlabel('Категория')
        plt.ylabel('Выручка (руб.)')
        plt.xticks(rotation=45)
        plt.tight_layout()
        plt.savefig('lab1501_etl/report/category_revenue.png')
        plt.close()

        plt.figure(figsize=(10, 6))
        sns.lineplot(data=self.aggregated_data, x='month_year', y='total_revenue', hue='category', marker='o')
        plt.title('Динамика выручки по месяцам и категориям')
        plt.xlabel('Месяц')
        plt.ylabel('Выручка (руб.)')
        plt.xticks(rotation=45)
        plt.tight_layout()
        plt.savefig('lab1501_etl/report/monthly_trend.png')
        plt.close()

        plt.figure(figsize=(8, 8))
        plt.pie(category_revenue['total_revenue'], labels=category_revenue['category'], autopct='%1.1f%%', startangle=140, colors=sns.color_palette('pastel'))
        plt.title('Доля категорий в общей выручке')
        plt.tight_layout()
        plt.savefig('lab1501_etl/report/category_share.png')
        plt.close()

        logger.info("Графики сохранены в lab1501_etl/report/")

    def run(self):
        """Запуск полного ETL-пайплайна"""
        logger.info("=" * 50)
        logger.info("ЗАПУСК ETL ПАЙПЛАЙНА")
        logger.info("=" * 50)

        self.extract()
        self.transform()
        self.aggregate()
        self.load_to_sqlite()
        self.visualize()

        logger.info("ETL пайплайн успешно завершён")


if __name__ == "__main__":
    pipeline = SalesETLPipeline('data/sales.csv', 'sales.db')
    pipeline.run()
