package com.example.notesapp.ui

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.example.notesapp.data.Note
import com.example.notesapp.ui.theme.NotesAppTheme
import java.text.SimpleDateFormat
import java.util.Locale

@Composable
fun NotesApp(viewModel: NotesViewModel) {
    NotesAppTheme {
        val navController = rememberNavController()

        Surface(
            modifier = Modifier.fillMaxSize(),
            color = MaterialTheme.colorScheme.background
        ) {
            NavHost(navController = navController, startDestination = "notes_list") {
                composable("notes_list") {
                    NotesListScreen(
                        notes = viewModel.notes.collectAsState().value,
                        onAddNote = {
                            viewModel.clearDraft()
                            navController.navigate("edit_note")
                        },
                        onEditNote = {
                            viewModel.selectNote(it)
                            navController.navigate("edit_note")
                        },
                        onDeleteNote = { viewModel.deleteNote(it) }
                    )
                }
                composable("edit_note") {
                    EditNoteScreen(
                        title = viewModel.title.collectAsState().value,
                        content = viewModel.content.collectAsState().value,
                        isLoading = viewModel.isLoading.collectAsState().value,
                        onTitleChange = { viewModel.title.value = it },
                        onContentChange = { viewModel.content.value = it },
                        onSave = {
                            viewModel.saveNote {
                                navController.popBackStack()
                            }
                        },
                        onCancel = {
                            viewModel.clearDraft()
                            navController.popBackStack()
                        }
                    )
                }
            }
        }
    }
}

@Composable
fun NotesListScreen(
    notes: List<Note>,
    onAddNote: () -> Unit,
    onEditNote: (Note) -> Unit,
    onDeleteNote: (Note) -> Unit
) {
    Scaffold(
        topBar = {
            SmallTopAppBar(
                title = { Text("Менеджер заметок") }
            )
        },
        floatingActionButton = {
            FloatingActionButton(onClick = onAddNote) {
                Icon(Icons.Default.Add, contentDescription = "Добавить заметку")
            }
        }
    ) { contentPadding ->
        if (notes.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(contentPadding),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "Список заметок пуст. Нажмите +, чтобы добавить.",
                    fontSize = 16.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(contentPadding)
                    .padding(12.dp)
            ) {
                items(notes) { note ->
                    NoteCard(note = note, onEdit = { onEditNote(note) }, onDelete = { onDeleteNote(note) })
                    Spacer(modifier = Modifier.height(10.dp))
                }
            }
        }
    }
}

@Composable
fun NoteCard(note: Note, onEdit: () -> Unit, onDelete: () -> Unit) {
    Surface(
        shape = RoundedCornerShape(16.dp),
        tonalElevation = 4.dp,
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = note.title.ifEmpty { "Без названия" },
                        fontWeight = FontWeight.Bold,
                        fontSize = 18.sp
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = note.content,
                        fontSize = 14.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = formatDate(note.createdAt),
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                IconButton(onClick = onEdit) {
                    Icon(Icons.Default.Edit, contentDescription = "Редактировать заметку")
                }
                IconButton(onClick = onDelete) {
                    Icon(Icons.Default.Delete, contentDescription = "Удалить заметку")
                }
            }
        }
    }
}

fun formatDate(timestamp: Long): String {
    val dateFormat = SimpleDateFormat("dd MMM yyyy, HH:mm", Locale.getDefault())
    return dateFormat.format(timestamp)
}
