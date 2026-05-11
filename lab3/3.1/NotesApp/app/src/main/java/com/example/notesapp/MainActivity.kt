package com.example.notesapp

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import com.example.notesapp.data.NoteDatabase
import com.example.notesapp.data.NoteRepository
import com.example.notesapp.ui.NotesApp
import com.example.notesapp.ui.NotesViewModel
import com.example.notesapp.ui.NotesViewModelFactory

class MainActivity : ComponentActivity() {

    private val viewModel: NotesViewModel by viewModels {
        NotesViewModelFactory(NoteRepository(NoteDatabase.getDatabase(this).noteDao()))
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            NotesApp(viewModel = viewModel)
        }
    }
}
