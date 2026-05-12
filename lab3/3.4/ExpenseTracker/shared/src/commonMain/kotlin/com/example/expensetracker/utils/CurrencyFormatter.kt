package com.example.expensetracker.utils

expect class CurrencyFormatter() {
    fun formatAmount(amount: Double): String
    fun formatMonth(year: Int, month: Int): String
}
