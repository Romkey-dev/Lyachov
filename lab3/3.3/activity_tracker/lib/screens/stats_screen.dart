import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/activity_provider.dart';

class StatsScreen extends StatelessWidget {
  const StatsScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Статистика'),
      ),
      body: Consumer<ActivityProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          final stats = _calculateStats(provider.activities);

          return SingleChildScrollView(
            child: Column(
              children: [
                // Карточки с общей статистикой
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: GridView.count(
                    crossAxisCount: 2,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    crossAxisSpacing: 16,
                    mainAxisSpacing: 16,
                    childAspectRatio: 1.5,
                    children: [
                      _buildStatCard(
                        context,
                        'Шаги',
                        '${stats['totalSteps']}',
                        Icons.directions_walk,
                        Colors.blue,
                      ),
                      _buildStatCard(
                        context,
                        'Дистанция',
                        '${stats['totalDistance']} км',
                        Icons.straighten,
                        Colors.green,
                      ),
                      _buildStatCard(
                        context,
                        'Калории',
                        '${stats['totalCalories']}',
                        Icons.local_fire_department,
                        Colors.orange,
                      ),
                      _buildStatCard(
                        context,
                        'Тренировки',
                        '${stats['totalWorkouts']}',
                        Icons.fitness_center,
                        Colors.purple,
                      ),
                    ],
                  ),
                ),

                // Статистика по типам тренировок
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Разбор по типам',
                            style: Theme.of(context).textTheme.titleMedium,
                          ),
                          const SizedBox(height: 16),
                          _buildActivityTypeStats(provider.activities),
                        ],
                      ),
                    ),
                  ),
                ),

                // Последние тренировки
                if (provider.activities.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: Card(
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Последние тренировки',
                              style: Theme.of(context).textTheme.titleMedium,
                            ),
                            const SizedBox(height: 16),
                            _buildRecentActivitiesList(
                              provider.activities.take(5).toList(),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildStatCard(
    BuildContext context,
    String label,
    String value,
    IconData icon,
    Color color,
  ) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: color, size: 28),
            const SizedBox(height: 8),
            Text(
              value,
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            Text(
              label,
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActivityTypeStats(activities) {
    if (activities.isEmpty) {
      return const Text('Нет данных');
    }

    Map<String, int> typeCount = {};
    for (var activity in activities) {
      final type = activity.type.displayName;
      typeCount[type] = (typeCount[type] ?? 0) + 1;
    }

    return Column(
      children: typeCount.entries.map((entry) {
        return Padding(
          padding: const EdgeInsets.symmetric(vertical: 8),
          child: Row(
            children: [
              Expanded(
                child: Text(entry.key),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.blue.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  '${entry.value} тренировок',
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  Widget _buildRecentActivitiesList(activities) {
    return Column(
      children: activities.map((activity) {
        return Padding(
          padding: const EdgeInsets.symmetric(vertical: 8),
          child: Row(
            children: [
              Icon(activity.type.icon, color: activity.type.color),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      activity.type.displayName,
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                    Text(
                      '${activity.steps} шагов • ${activity.distance.toStringAsFixed(2)} км',
                      style: const TextStyle(fontSize: 12, color: Colors.grey),
                    ),
                  ],
                ),
              ),
              Text(
                '${activity.calories.toStringAsFixed(0)} ккал',
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  Map<String, dynamic> _calculateStats(List activities) {
    int totalSteps = 0;
    double totalDistance = 0.0;
    int totalCalories = 0;
    int totalWorkouts = activities.length;

    for (var activity in activities) {
      totalSteps += activity.steps;
      totalDistance += activity.distance;
      totalCalories += activity.calories.toInt();
    }

    return {
      'totalSteps': totalSteps,
      'totalDistance': totalDistance.toStringAsFixed(2),
      'totalCalories': totalCalories,
      'totalWorkouts': totalWorkouts,
    };
  }
}
