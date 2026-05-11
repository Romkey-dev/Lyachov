package com.example.notesapp.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.notesapp.data.Note
import com.example.notesapp.data.NoteRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class NotesViewModel(private val repository: NoteRepository) : ViewModel() {

    private val _notes = MutableStateFlow<List<Note>>(emptyList())
    val notes: StateFlow<List<Note>> = _notes.asStateFlow()

    private val _currentNote = MutableStateFlow<Note?>(null)
    val currentNote: StateFlow<Note?> = _currentNote.asStateFlow()

    val title = MutableStateFlow("")
    val content = MutableStateFlow("")
    val isLoading = MutableStateFlow(false)

    init {
        viewModelScope.launch {
            repository.allNotes.collect { noteList ->
                _notes.value = noteList
            }
        }
    }

    fun selectNote(note: Note?) {
        _currentNote.value = note
        title.value = note?.title ?: ""
        content.value = note?.content ?: ""
    }

    fun saveNote(onSaved: () -> Unit) {
        val noteTitle = title.value.trim()
        val noteContent = content.value.trim()

        if (noteTitle.isEmpty() && noteContent.isEmpty()) {
            return
        }

        viewModelScope.launch {
            isLoading.value = true
            val note = Note(
                id = _currentNote.value?.id ?: 0,
                title = noteTitle,
                content = noteContent,
                createdAt = _currentNote.value?.createdAt ?: System.currentTimeMillis()
            )
            if (_currentNote.value == null) {
                repository.insertNote(note)
            } else {
                repository.updateNote(note)
            }
            isLoading.value = false
            selectNote(null)
            onSaved()
        }
    }

    fun deleteNote(note: Note) {
        viewModelScope.launch {
            repository.deleteNote(note)
        }
    }

    fun clearDraft() {
        selectNote(null)
    }
}
