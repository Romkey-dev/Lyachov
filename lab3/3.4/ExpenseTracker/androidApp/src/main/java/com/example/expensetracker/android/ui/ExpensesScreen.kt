package com.example.expensetracker.android.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.example.expensetracker.db.Database

@Composable
fun ExpensesScreen(database: Database) {
    Surface(modifier = Modifier.fillMaxSize().background(MaterialTheme.colorScheme.background)) {
        Column(
            modifier = Modifier.fillMaxSize().padding(24.dp),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(text = "Expense Tracker", style = MaterialTheme.typography.headlineMedium)
            Text(text = "KMM shared business logic demo", modifier = Modifier.padding(top = 12.dp))
            Button(onClick = { /* TODO: Открыть экран создания расхода */ }, modifier = Modifier.padding(top = 16.dp)) {
                Text(text = "Добавить расход")
            }
        }
    }
}
