import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { GeoNote } from '../types';
import * as database from '../utils/database';

export const loadNotes = createAsyncThunk('notes/loadNotes', async () => {
  const notes = await database.getNotes();
  return notes;
});

export const saveNote = createAsyncThunk('notes/saveNote', async (note: GeoNote) => {
  if (note.id) {
    await database.updateNote(note);
  } else {
    await database.addNote(note);
  }
  return note;
});

export const removeNote = createAsyncThunk('notes/removeNote', async (id: string) => {
  await database.deleteNote(id);
  return id;
});

interface NotesState {
  items: GeoNote[];
  loading: boolean;
  error: string | null;
}

const initialState: NotesState = {
  items: [],
  loading: false,
  error: null,
};

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loadNotes.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadNotes.fulfilled, (state, action: PayloadAction<GeoNote[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(loadNotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Не удалось загрузить заметки';
      })
      .addCase(saveNote.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveNote.fulfilled, (state, action: PayloadAction<GeoNote>) => {
        state.loading = false;
        const existingIndex = state.items.findIndex(item => item.id === action.payload.id);
        if (existingIndex !== -1) {
          state.items[existingIndex] = action.payload;
        } else {
          state.items.unshift(action.payload);
        }
      })
      .addCase(saveNote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Не удалось сохранить заметку';
      })
      .addCase(removeNote.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeNote.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.items = state.items.filter(note => note.id !== action.payload);
      })
      .addCase(removeNote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Не удалось удалить заметку';
      });
  },
});

export const { clearError } = notesSlice.actions;
export default notesSlice.reducer;
