import 'package:flutter/material.dart';
import '../models/activity.dart';

class SensorService extends ChangeNotifier {
  // Шагомер
  int _stepCount = 0;
  int get stepCount => _stepCount;

  // Геолокация
  double? _currentLatitude;
  double? _currentLongitude;
  double? get currentLatitude => _currentLatitude;
  double? get currentLongitude => _currentLongitude;
  final List<LatLng> _route = [];
  List<LatLng> get route => List.unmodifiable(_route);

  // Акселерометр (для определения активности)
  double _accelerometerMagnitude = 0.0;
  double get accelerometerMagnitude => _accelerometerMagnitude;

  bool _isTracking = false;
  bool get isTracking => _isTracking;

  SensorService() {
    _initSensors();
  }

  void _initSensors() {
    // Инициализация симуляции датчиков
    // В реальном приложении здесь будут подписки на события датчиков
  }

  void startTracking() {
    _isTracking = true;
    _route.clear();
    notifyListeners();
  }

  void stopTracking() {
    _isTracking = false;
    notifyListeners();
  }

  void resetRoute() {
    _route.clear();
    notifyListeners();
  }

  // Установить значения датчиков для отладки
  void setStepCount(int steps) {
    _stepCount = steps;
    notifyListeners();
  }

  void setAccelerometerMagnitude(double magnitude) {
    _accelerometerMagnitude = magnitude;
    notifyListeners();
  }

  void setLocation(double latitude, double longitude) {
    _currentLatitude = latitude;
    _currentLongitude = longitude;
    if (_isTracking) {
      _route.add(LatLng(latitude, longitude));
    }
    notifyListeners();
  }

  // Расчет пройденного расстояния по маршруту (в км)
  double calculateDistance() {
    if (_route.isEmpty) return 0.0;

    double totalDistance = 0.0;
    for (int i = 0; i < _route.length - 1; i++) {
      totalDistance += _calculateDistanceBetween(
        _route[i].latitude,
        _route[i].longitude,
        _route[i + 1].latitude,
        _route[i + 1].longitude,
      );
    }
    return totalDistance / 1000; // в километрах
  }

  // Формула гаверсинуса для расчета расстояния между точками
  double _calculateDistanceBetween(
    double lat1,
    double lon1,
    double lat2,
    double lon2,
  ) {
    const double R = 6371e3; // радиус Земли в метрах
    double phi1 = lat1 * (3.14159 / 180);
    double phi2 = lat2 * (3.14159 / 180);
    double deltaPhi = (lat2 - lat1) * (3.14159 / 180);
    double deltaLambda = (lon2 - lon1) * (3.14159 / 180);

    double a = (deltaPhi / 2).sin() * (deltaPhi / 2).sin() +
        phi1.cos() * phi2.cos() * (deltaLambda / 2).sin() * (deltaLambda / 2).sin();
    double c = 2 * a.sqrt().atan2((1 - a).sqrt());

    return R * c; // расстояние в метрах
  }

  // Определение типа активности по данным датчиков
  ActivityType detectActivityType() {
    // Используем магнитуду акселерометра для определения
    if (_accelerometerMagnitude < 3) {
      return ActivityType.gym; // Силовые тренировки или отдых
    } else if (_accelerometerMagnitude < 6) {
      return ActivityType.walking; // Ходьба
    } else if (_accelerometerMagnitude < 10) {
      return ActivityType.running; // Бег
    } else {
      return ActivityType.cycling; // Велосипед (имитация)
    }
  }

  // Расчет калорий
  double calculateCalories(Duration duration) {
    // Упрощенная формула: вес (75 кг) * MET * время в часах
    double met;
    final activityType = detectActivityType();
    
    switch (activityType) {
      case ActivityType.walking:
        met = 3.5;
        break;
      case ActivityType.running:
        met = 8.0;
        break;
      case ActivityType.cycling:
        met = 6.0;
        break;
      case ActivityType.gym:
        met = 4.0;
        break;
    }

    double weight = 75.0; // стандартный вес
    double hours = duration.inMinutes / 60.0;

    return weight * met * hours;
  }

  @override
  void dispose() {
    super.dispose();
  }
}
