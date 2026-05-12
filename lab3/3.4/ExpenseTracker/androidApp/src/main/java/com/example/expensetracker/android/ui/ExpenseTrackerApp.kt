package com.example.expensetracker.android.ui

import android.content.Context
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.example.expensetracker.db.Database
import com.example.expensetracker.db.DatabaseDriverFactory

@Composable
fun ExpenseTrackerApp(context: Context) {
    val driverFactory = DatabaseDriverFactory(context)
    val database = Database(driverFactory.createDriver())

    Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
        ExpensesScreen(database = database)
    }
}
