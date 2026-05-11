import React, { useEffect } from 'react';
import { Alert, Platform, StyleSheet, View } from 'react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { store } from './src/store';
import NotesListScreen from './src/screens/NotesListScreen';
import AddNoteScreen from './src/screens/AddNoteScreen';
import NoteDetailScreen from './src/screens/NoteDetailScreen';
import { initDatabase } from './src/utils/database';

const Stack = createStackNavigator();

export default function App() {
  useEffect(() => {
    initDatabase().catch(error => {
      Alert.alert('Ошибка базы данных', error.message || 'Не удалось инициализировать БД');
    });
  }, []);

  return (
    <Provider store={store}>
      <NavigationContainer>
        <View style={styles.container}>
          <Stack.Navigator initialRouteName="NotesList">
            <Stack.Screen name="NotesList" component={NotesListScreen} options={{ title: 'GeoNotes' }} />
            <Stack.Screen name="AddNote" component={AddNoteScreen} options={{ title: 'Новая заметка' }} />
            <Stack.Screen name="NoteDetail" component={NoteDetailScreen} options={{ title: 'Детали заметки' }} />
          </Stack.Navigator>
          <StatusBar style={Platform.OS === 'ios' ? 'dark' : 'auto'} />
        </View>
      </NavigationContainer>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
