import 'package:flutter/material.dart';

// Модель для статистики пользователя
class UserStats {
  final int totalSteps;
  final double totalDistance;
  final int totalCalories;
  final int totalWorkouts;
  final double averagePace;

  UserStats({
    required this.totalSteps,
    required this.totalDistance,
    required this.totalCalories,
    required this.totalWorkouts,
    required this.averagePace,
  });

  // Конструктор по умолчанию
  UserStats.initial()
      : totalSteps = 0,
        totalDistance = 0.0,
        totalCalories = 0,
        totalWorkouts = 0,
        averagePace = 0.0;
}

// Модель для дневной статистики
class DailyStats {
  final DateTime date;
  final int steps;
  final double distance;
  final int calories;
  final int workouts;

  DailyStats({
    required this.date,
    required this.steps,
    required this.distance,
    required this.calories,
    required this.workouts,
  });
}
