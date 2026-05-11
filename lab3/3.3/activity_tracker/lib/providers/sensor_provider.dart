import 'package:flutter/material.dart';
import '../services/sensor_service.dart';

class SensorProvider extends ChangeNotifier {
  final SensorService _sensorService = SensorService();

  SensorProvider() {
    _sensorService.addListener(_onSensorChanged);
  }

  void _onSensorChanged() {
    notifyListeners();
  }

  // Геттеры для данных сенсоров
  int get stepCount => _sensorService.stepCount;
  double get accelerometerMagnitude => _sensorService.accelerometerMagnitude;
  bool get isTracking => _sensorService.isTracking;
  double? get currentLatitude => _sensorService.currentLatitude;
  double? get currentLongitude => _sensorService.currentLongitude;

  // Методы управления отслеживанием
  void startTracking() {
    _sensorService.startTracking();
    notifyListeners();
  }

  void stopTracking() {
    _sensorService.stopTracking();
    notifyListeners();
  }

  void resetRoute() {
    _sensorService.resetRoute();
    notifyListeners();
  }

  // Методы для отладки и тестирования
  void setStepCount(int steps) {
    _sensorService.setStepCount(steps);
    notifyListeners();
  }

  void setAccelerometerMagnitude(double magnitude) {
    _sensorService.setAccelerometerMagnitude(magnitude);
    notifyListeners();
  }

  void setLocation(double latitude, double longitude) {
    _sensorService.setLocation(latitude, longitude);
    notifyListeners();
  }

  // Расчет расстояния
  double calculateDistance() {
    return _sensorService.calculateDistance();
  }

  @override
  void dispose() {
    _sensorService.removeListener(_onSensorChanged);
    _sensorService.dispose();
    super.dispose();
  }
}
