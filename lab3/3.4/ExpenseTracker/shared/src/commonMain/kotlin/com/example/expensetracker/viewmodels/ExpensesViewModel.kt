package com.example.expensetracker.viewmodels

import com.example.expensetracker.db.Database
import com.example.expensetracker.models.Category
import com.example.expensetracker.models.Expense
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.launchIn
import kotlinx.coroutines.flow.onEach
import kotlinx.coroutines.launch
import kotlinx.datetime.Clock
import kotlinx.datetime.LocalDate
import kotlinx.datetime.TimeZone
import kotlinx.datetime.todayIn

class ExpensesViewModel(
    private val database: Database
) {
    private val viewModelScope = CoroutineScope(SupervisorJob() + Dispatchers.Main)

    private val _categories = MutableStateFlow<List<Category>>(emptyList())
    val categories: StateFlow<List<Category>> = _categories.asStateFlow()

    private val _expenses = MutableStateFlow<List<Expense>>(emptyList())
    val expenses: StateFlow<List<Expense>> = _expenses.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    init {
        observeData()
    }

    private fun observeData() {
        database.getAllCategories()
            .catch { throwable -> _error.value = throwable.message }
            .onEach { _categories.value = it }
            .launchIn(viewModelScope)

        database.getAllExpenses()
            .catch { throwable -> _error.value = throwable.message }
            .onEach { _expenses.value = it }
            .launchIn(viewModelScope)
    }

    fun addExpense(title: String, amount: Double, categoryId: Long, note: String) {
        viewModelScope.launch {
            if (title.isBlank() || amount <= 0.0) {
                _error.value = "Некорректные данные";
                return@launch
            }
            val expense = Expense(
                id = Clock.System.now().toEpochMilliseconds(),
                title = title,
                amount = amount,
                categoryId = categoryId,
                date = Clock.System.now(),
                note = note,
                isSynced = false
            )
            database.addExpense(expense)
        }
    }

    fun deleteExpense(id: Long) {
        viewModelScope.launch {
            database.deleteExpense(id)
        }
    }

    fun setBudget(categoryId: Long, amount: Double) {
        viewModelScope.launch {
            database.addBudget(categoryId, amount, Clock.System.now())
        }
    }

    fun clear() {
        viewModelScope.cancel()
    }
}

data class ExpensesState(
    val categories: List<Category> = emptyList(),
    val expenses: List<Expense> = emptyList(),
    val error: String? = null
) {
    val totalExpenses: Double
        get() = expenses.sumOf { it.amount }

    val topCategories: List<Pair<Category, Double>>
        get() = categories.map { category ->
            val total = expenses.filter { it.categoryId == category.id }.sumOf { it.amount }
            category to total
        }.sortedByDescending { it.second }
            .take(3)
}
