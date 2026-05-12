package com.example.expensetracker.utils

import android.icu.text.DateFormat
import android.icu.text.NumberFormat
import java.util.Locale

actual class CurrencyFormatter {
    private val numberFormatter = NumberFormat.getCurrencyInstance(Locale.getDefault())
    private val monthFormatter = DateFormat.getDateInstance(DateFormat.MONTH_DAY, Locale.getDefault())

    actual fun formatAmount(amount: Double): String {
        return numberFormatter.format(amount)
    }

    actual fun formatMonth(year: Int, month: Int): String {
        val date = java.util.Calendar.getInstance().apply {
            set(java.util.Calendar.YEAR, year)
            set(java.util.Calendar.MONTH, month - 1)
            set(java.util.Calendar.DAY_OF_MONTH, 1)
        }.time
        return monthFormatter.format(date)
    }
}
