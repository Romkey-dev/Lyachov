package com.example.expensetracker.models

import kotlinx.datetime.Instant
import kotlinx.serialization.Serializable

@Serializable
data class Category(
    val id: Long,
    val name: String,
    val color: String,
    val icon: String,
    val isDefault: Boolean = false
)

@Serializable
data class Expense(
    val id: Long,
    val title: String,
    val amount: Double,
    val categoryId: Long,
    val date: Instant,
    val note: String = "",
    val isSynced: Boolean = false
) {
    fun isValid(): Boolean {
        return title.isNotBlank() && amount > 0.0
    }
}

data class Budget(
    val id: Long,
    val categoryId: Long,
    val limit: Double,
    val month: Instant
)

data class CategoryStats(
    val category: Category,
    val totalSpent: Double,
    val budget: Double?,
    val transactionCount: Int
)
