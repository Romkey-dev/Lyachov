package com.example.expensetracker.db

import app.cash.sqldelight.db.SqlDriver
import com.example.expensetracker.ExpenseDatabase
import com.example.expensetracker.models.Budget
import com.example.expensetracker.models.Category
import com.example.expensetracker.models.CategoryStats
import com.example.expensetracker.models.Expense
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.withContext
import kotlinx.datetime.DatePeriod
import kotlinx.datetime.Instant
import kotlinx.datetime.LocalDate
import kotlinx.datetime.TimeZone

class Database(
    driver: SqlDriver
) {
    private val database = ExpenseDatabase(driver)

    private val categoryQueries = database.categoryQueries
    private val expenseQueries = database.expenseQueries
    private val budgetQueries = database.budgetQueries

    suspend fun addCategory(category: Category) = withContext(Dispatchers.Default) {
        categoryQueries.insertCategory(
            id = category.id,
            name = category.name,
            color = category.color,
            icon = category.icon,
            isDefault = if (category.isDefault) 1L else 0L
        )
    }

    suspend fun addExpense(expense: Expense) = withContext(Dispatchers.Default) {
        expenseQueries.insertExpense(
            id = expense.id,
            title = expense.title,
            amount = expense.amount,
            categoryId = expense.categoryId,
            date = expense.date.toEpochMilliseconds(),
            note = expense.note,
            isSynced = if (expense.isSynced) 1L else 0L
        )
    }

    fun getAllCategories(): Flow<List<Category>> {
        return categoryQueries.selectAllCategories().asFlow().mapToList().map { rows ->
            rows.map { row ->
                Category(
                    id = row.id,
                    name = row.name,
                    color = row.color,
                    icon = row.icon,
                    isDefault = row.isDefault == 1L
                )
            }
        }
    }

    fun getAllExpenses(): Flow<List<Expense>> {
        return expenseQueries.selectAllExpenses().asFlow().mapToList().map { rows ->
            rows.map { row ->
                Expense(
                    id = row.id,
                    title = row.title,
                    amount = row.amount,
                    categoryId = row.categoryId,
                    date = Instant.fromEpochMilliseconds(row.date),
                    note = row.note ?: "",
                    isSynced = row.isSynced == 1L
                )
            }
        }
    }

    suspend fun deleteExpense(id: Long) = withContext(Dispatchers.Default) {
        expenseQueries.deleteById(id)
    }

    suspend fun addBudget(categoryId: Long, amount: Double, month: Instant) = withContext(Dispatchers.Default) {
        budgetQueries.insertBudget(
            id = month.toEpochMilliseconds(),
            categoryId = categoryId,
            limit = amount,
            month = month.toEpochMilliseconds()
        )
    }

    suspend fun getCategoryStats(year: Int, month: Int): List<CategoryStats> = withContext(Dispatchers.Default) {
        val categories = categoryQueries.selectAllCategories().executeAsList().map { row ->
            Category(
                id = row.id,
                name = row.name,
                color = row.color,
                icon = row.icon,
                isDefault = row.isDefault == 1L
            )
        }

        val startOfMonth = Instant.fromEpochMilliseconds(
            kotlinx.datetime.LocalDate(year, month, 1)
                .atStartOfDayIn(TimeZone.UTC)
                .toEpochMilliseconds()
        )
        val endOfMonth = Instant.fromEpochMilliseconds(
            kotlinx.datetime.LocalDate(year, month, 1)
                .plus(kotlinx.datetime.DatePeriod(months = 1))
                .atStartOfDayIn(TimeZone.UTC)
                .toEpochMilliseconds()
        )

        categories.map { category ->
            val totalSpent = expenseQueries.sumByCategory(category.id, startOfMonth.toEpochMilliseconds(), endOfMonth.toEpochMilliseconds()).executeAsOneOrNull() ?: 0.0
            val budget = budgetQueries.getBudgetByCategory(category.id).executeAsOneOrNull()?.limit
            CategoryStats(
                category = category,
                totalSpent = totalSpent,
                budget = budget,
                transactionCount = expenseQueries.countByCategory(category.id, startOfMonth.toEpochMilliseconds(), endOfMonth.toEpochMilliseconds()).executeAsOne()
            )
        }
    }
}
