import React, { useEffect } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { removeNote } from '../store/notesSlice';

interface NoteDetailScreenProps {
  navigation: any;
  route: any;
}

const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleString();
};

const NoteDetailScreen: React.FC<NoteDetailScreenProps> = ({ navigation, route }) => {
  const { noteId } = route.params;
  const dispatch = useAppDispatch();
  const note = useAppSelector(state => state.notes.items.find(item => item.id === noteId));

  useEffect(() => {
    if (!note) {
      navigation.goBack();
    }
  }, [note, navigation]);

  const handleDelete = () => {
    Alert.alert('Удаление заметки', 'Вы уверены, что хотите удалить эту заметку?', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: async () => {
          await dispatch(removeNote(noteId));
          navigation.goBack();
        },
      },
    ]);
  };

  if (!note) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>Заметка не найдена.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{note.title || 'Без названия'}</Text>
      <Text style={styles.date}>{formatDate(note.createdAt)}</Text>
      <Text style={styles.address}>{note.address || 'Местоположение не указано'}</Text>
      <Text style={styles.body}>{note.content}</Text>
      {note.photoUri ? <Image source={{ uri: note.photoUri }} style={styles.photo} /> : null}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: note.latitude,
            longitude: note.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker coordinate={{ latitude: note.latitude, longitude: note.longitude }} />
        </MapView>
      </View>
      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.deleteText}>Удалить заметку</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#333',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: '#777',
    marginBottom: 12,
  },
  address: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 18,
  },
  body: {
    fontSize: 16,
    color: '#333',
    marginBottom: 18,
    lineHeight: 24,
  },
  photo: {
    width: '100%',
    height: 220,
    borderRadius: 14,
    marginBottom: 18,
  },
  mapContainer: {
    height: 250,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 18,
  },
  map: {
    flex: 1,
  },
  deleteButton: {
    backgroundColor: '#D32F2F',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  deleteText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default NoteDetailScreen;
