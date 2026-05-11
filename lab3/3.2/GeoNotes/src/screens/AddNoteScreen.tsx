import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { saveNote } from '../store/notesSlice';
import { GeoNote } from '../types';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

interface AddNoteScreenProps {
  navigation: any;
}

const AddNoteScreen: React.FC<AddNoteScreenProps> = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [address, setAddress] = useState<string | undefined>(undefined);
  const [photoUri, setPhotoUri] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const dispatch = useAppDispatch();
  const loading = useAppSelector(state => state.notes.loading);

  useEffect(() => {
    requestPermissions();
    getCurrentLocation();
  }, []);

  const requestPermissions = async () => {
    await ImagePicker.requestCameraPermissionsAsync();
    await Location.requestForegroundPermissionsAsync();
  };

  const getCurrentLocation = async () => {
    setIsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Разрешение', 'Требуется разрешение на геолокацию.');
        setIsLoading(false);
        return;
      }
      const locationResult = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
      const coords = {
        latitude: locationResult.coords.latitude,
        longitude: locationResult.coords.longitude,
      };
      setLocation(coords);
      const [reverse] = await Location.reverseGeocodeAsync(coords);
      setAddress(
        reverse
          ? `${reverse.city || reverse.region || ''}${reverse.street ? ', ' + reverse.street : ''}`.trim()
          : undefined
      );
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось получить местоположение.');
    } finally {
      setIsLoading(false);
    }
  };

  const takePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Разрешение', 'Требуется разрешение на камеру.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({ quality: 0.6, allowsEditing: false });
      if (!result.canceled && result.assets.length > 0) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось сделать фото.');
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Заполните поля', 'Введите заголовок и текст заметки.');
      return;
    }
    if (!location) {
      Alert.alert('Геолокация', 'Ожидается определение местоположения.');
      return;
    }

    const note: GeoNote = {
      id: uuidv4(),
      title: title.trim(),
      content: content.trim(),
      latitude: location.latitude,
      longitude: location.longitude,
      address,
      photoUri,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    try {
      await dispatch(saveNote(note)).unwrap();
      navigation.goBack();
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось сохранить заметку.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.form}>
      <Text style={styles.label}>Заголовок</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        style={styles.input}
        placeholder="Введите название заметки"
      />

      <Text style={styles.label}>Содержание</Text>
      <TextInput
        value={content}
        onChangeText={setContent}
        style={[styles.input, styles.textArea]}
        placeholder="Введите текст"
        multiline
      />

      <View style={styles.locationContainer}>
        <Text style={styles.locationText}>{address || 'Местоположение не определено'}</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={getCurrentLocation}>
          <Text style={styles.refreshButtonText}>Обновить</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
        <Text style={styles.photoButtonText}>Сделать фото</Text>
      </TouchableOpacity>
      {photoUri ? <Image source={{ uri: photoUri }} style={styles.preview} /> : null}

      <TouchableOpacity
        style={[styles.saveButton, (!title.trim() || !content.trim() || !location || loading) && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={!title.trim() || !content.trim() || !location || loading}
      >
        <Text style={styles.saveButtonText}>{loading ? 'Сохранение...' : 'Сохранить заметку'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  form: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  locationContainer: {
    marginBottom: 16,
  },
  locationText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  refreshButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#e1f5fe',
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#007AFF',
    fontSize: 12,
    fontWeight: '700',
  },
  photoButton: {
    backgroundColor: '#e1f5fe',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  photoButtonText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  preview: {
    width: '100%',
    height: 220,
    borderRadius: 14,
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#999',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddNoteScreen;
