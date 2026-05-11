import * as SQLite from 'expo-sqlite';
import { GeoNote } from '../types';

const db = SQLite.openDatabase('geonotes.db');

const createTableSql = `CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  address TEXT,
  photoUri TEXT,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER
);`;

export const initDatabase = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(createTableSql, []);
      },
      error => reject(error),
      () => resolve()
    );
  });
};

export const getNotes = (): Promise<GeoNote[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM notes ORDER BY createdAt DESC',
        [],
        (_, result) => {
          const notes: GeoNote[] = [];
          for (let i = 0; i < result.rows.length; i++) {
            const row = result.rows.item(i);
            notes.push({
              id: row.id,
              title: row.title,
              content: row.content,
              latitude: row.latitude,
              longitude: row.longitude,
              address: row.address || undefined,
              photoUri: row.photoUri || undefined,
              createdAt: row.createdAt,
              updatedAt: row.updatedAt || undefined,
            });
          }
          resolve(notes);
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const addNote = (note: GeoNote): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO notes (id, title, content, latitude, longitude, address, photoUri, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          note.id,
          note.title,
          note.content,
          note.latitude,
          note.longitude,
          note.address || null,
          note.photoUri || null,
          note.createdAt,
          note.updatedAt || null,
        ],
        () => resolve(),
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const deleteNote = (id: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM notes WHERE id = ?;',
        [id],
        () => resolve(),
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const updateNote = (note: GeoNote): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE notes SET title = ?, content = ?, latitude = ?, longitude = ?, address = ?, photoUri = ?, updatedAt = ? WHERE id = ?;',
        [
          note.title,
          note.content,
          note.latitude,
          note.longitude,
          note.address || null,
          note.photoUri || null,
          note.updatedAt || note.createdAt,
          note.id,
        ],
        () => resolve(),
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};
