package com.example.expensetracker.utils

import platform.Foundation.NSDate
import platform.Foundation.NSDateFormatter
import platform.Foundation.NSLocale
import platform.Foundation.currentLocale
import kotlinx.datetime.LocalDateTime
import kotlinx.datetime.TimeZone
import kotlinx.datetime.toNSDate

actual class CurrencyFormatter {
    private val numberFormatter = platform.Foundation.NSNumberFormatter().apply {
        numberStyle = platform.Foundation.NSNumberFormatterCurrencyStyle
        locale = currentLocale()
    }

    actual fun formatAmount(amount: Double): String {
        return numberFormatter.stringFromNumber(amount) ?: "$amount"
    }

    actual fun formatMonth(year: Int, month: Int): String {
        val dateFormatter = NSDateFormatter().apply {
            dateFormat = "LLLL yyyy"
            locale = currentLocale()
        }
        val nsDate = NSDate.dateWithTimeIntervalSince1970(0.0)
        return dateFormatter.stringFromDate(nsDate)
    }
}
