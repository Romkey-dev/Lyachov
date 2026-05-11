import React, { useEffect } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { loadNotes } from '../store/notesSlice';
import { GeoNote } from '../types';

interface NotesListScreenProps {
  navigation: any;
}

const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleString();
};

const NoteItem = ({ note, onPress }: { note: GeoNote; onPress: () => void }) => {
  return (
    <TouchableOpacity style={styles.noteCard} onPress={onPress}>
      <View style={styles.noteHeader}>
        <Text style={styles.noteTitle}>{note.title || 'Без названия'}</Text>
        <Text style={styles.noteDate}>{formatDate(note.createdAt)}</Text>
      </View>
      <Text style={styles.noteContent} numberOfLines={2}>
        {note.content}
      </Text>
      {note.address ? <Text style={styles.noteAddress}>{note.address}</Text> : null}
      {note.photoUri ? <Text style={styles.photoIndicator}>Фото есть</Text> : null}
    </TouchableOpacity>
  );
};

const NotesListScreen: React.FC<NotesListScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { items: notes, loading, error } = useAppSelector(state => state.notes);

  useEffect(() => {
    dispatch(loadNotes());
  }, [dispatch]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>GeoNotes</Text>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => dispatch(loadNotes())}>
            <Text style={styles.retryText}>Повторить</Text>
          </TouchableOpacity>
        </View>
      ) : notes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Заметок пока нет.</Text>
          <Text style={styles.emptySubtext}>Нажмите +, чтобы создать первую гео-заметку.</Text>
        </View>
      ) : (
        <FlatList
          data={notes}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <NoteItem
              note={item}
              onPress={() => navigation.navigate('NoteDetail', { noteId: item.id })}
            />
          )}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddNote')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 18,
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: '700',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: 16,
  },
  noteCard: {
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  noteDate: {
    fontSize: 12,
    color: '#707070',
    marginLeft: 8,
  },
  noteContent: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  noteAddress: {
    fontSize: 12,
    color: '#007AFF',
  },
  photoIndicator: {
    marginTop: 8,
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#D32F2F',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  fabText: {
    color: 'white',
    fontSize: 32,
    lineHeight: 34,
    fontWeight: '700',
  },
});

export default NotesListScreen;
