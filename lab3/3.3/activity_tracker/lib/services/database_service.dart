import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import '../models/activity.dart';
import '../models/user_stats.dart';

class DatabaseService {
  static final DatabaseService _instance = DatabaseService._internal();
  factory DatabaseService() => _instance;
  DatabaseService._internal();

  static Database? _database;

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDatabase();
    return _database!;
  }

  Future<Database> _initDatabase() async {
    String path = join(await getDatabasesPath(), 'activity_tracker.db');
    return await openDatabase(
      path,
      version: 1,
      onCreate: _onCreate,
    );
  }

  Future<void> _onCreate(Database db, int version) async {
    // Создание таблицы для тренировок
    await db.execute('''
      CREATE TABLE activities(
        id TEXT PRIMARY KEY,
        type INTEGER NOT NULL,
        startTime INTEGER NOT NULL,
        endTime INTEGER,
        steps INTEGER NOT NULL,
        distance REAL NOT NULL,
        calories REAL NOT NULL,
        averageHeartRate REAL,
        route TEXT
      )
    ''');

    // Создание таблицы для дневной статистики
    await db.execute('''
      CREATE TABLE daily_stats(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date INTEGER NOT NULL,
        steps INTEGER NOT NULL,
        distance REAL NOT NULL,
        calories INTEGER NOT NULL,
        workouts INTEGER NOT NULL,
        UNIQUE(date)
      )
    ''');
  }

  // Сохранение тренировки
  Future<void> insertActivity(ActivityRecord activity) async {
    final db = await database;
    await db.insert(
      'activities',
      activity.toMap(),
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  // Получение всех тренировок
  Future<List<ActivityRecord>> getAllActivities() async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      'activities',
      orderBy: 'startTime DESC',
    );

    return List.generate(maps.length, (i) {
      return ActivityRecord.fromMap(maps[i]);
    });
  }

  // Получение тренировок за дату
  Future<List<ActivityRecord>> getActivitiesByDate(DateTime date) async {
    final db = await database;

    DateTime startOfDay = DateTime(date.year, date.month, date.day);
    DateTime endOfDay = startOfDay.add(const Duration(days: 1));

    final List<Map<String, dynamic>> maps = await db.query(
      'activities',
      where: 'startTime >= ? AND startTime < ?',
      whereArgs: [startOfDay.millisecondsSinceEpoch, endOfDay.millisecondsSinceEpoch],
      orderBy: 'startTime DESC',
    );

    return List.generate(maps.length, (i) {
      return ActivityRecord.fromMap(maps[i]);
    });
  }

  // Удаление тренировки
  Future<void> deleteActivity(String id) async {
    final db = await database;
    await db.delete(
      'activities',
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  // Получение суммарной статистики
  Future<UserStats> getUserStats() async {
    final db = await database;

    // Получить все записи
    final List<Map<String, dynamic>> maps = await db.query('activities');

    int totalSteps = 0;
    double totalDistance = 0.0;
    int totalCalories = 0;
    int totalWorkouts = maps.length;
    double totalPace = 0.0;

    for (var map in maps) {
      totalSteps += map['steps'];
      totalDistance += map['distance'];
      totalCalories += (map['calories'] as num).toInt();

      // Расчет темпа (если есть endTime)
      if (map['endTime'] != null) {
        final start = DateTime.fromMillisecondsSinceEpoch(map['startTime']);
        final end = DateTime.fromMillisecondsSinceEpoch(map['endTime']);
        final duration = end.difference(start);
        if (duration.inMinutes > 0 && map['distance'] > 0) {
          totalPace += duration.inMinutes / map['distance'];
        }
      }
    }

    double averagePace = totalWorkouts > 0 ? totalPace / totalWorkouts : 0;

    return UserStats(
      totalSteps: totalSteps,
      totalDistance: totalDistance,
      totalCalories: totalCalories,
      totalWorkouts: totalWorkouts,
      averagePace: averagePace,
    );
  }
}
