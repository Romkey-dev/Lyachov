package com.example.expensetracker.db

import android.content.Context
import app.cash.sqldelight.android.AndroidSqliteDriver
import com.example.expensetracker.ExpenseDatabase

actual class DatabaseDriverFactory(
    private val context: Context
) {
    actual fun createDriver() = AndroidSqliteDriver(ExpenseDatabase.Schema, context, "expense_tracker.db")
}
