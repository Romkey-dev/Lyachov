import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/activity_provider.dart';
import '../providers/sensor_provider.dart';
import '../providers/theme_provider.dart';
import '../widgets/activity_card.dart';
import '../widgets/progress_ring.dart';
import '../models/activity.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Activity Tracker'),
        actions: [
          Consumer<ThemeProvider>(
            builder: (context, themeProvider, child) {
              return IconButton(
                icon: Icon(
                  themeProvider.isDarkMode
                      ? Icons.light_mode
                      : Icons.dark_mode,
                ),
                onPressed: () => themeProvider.toggleTheme(),
              );
            },
          ),
        ],
      ),
      body: Consumer2<ActivityProvider, SensorProvider>(
        builder: (context, activityProvider, sensorProvider, child) {
          if (activityProvider.isLoading) {
            return const Center(
              child: CircularProgressIndicator(),
            );
          }

          if (activityProvider.error != null) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(
                    Icons.error_outline,
                    size: 48,
                    color: Colors.red,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Ошибка: ${activityProvider.error}',
                    style: const TextStyle(color: Colors.red),
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () => activityProvider.loadActivities(),
                    child: const Text('Повторить'),
                  ),
                ],
              ),
            );
          }

          // Индикатор текущей тренировки
          if (activityProvider.currentActivity != null) {
            return _buildCurrentActivity(
              context,
              activityProvider.currentActivity!,
              sensorProvider,
            );
          }

          // Список тренировок
          return _buildActivitiesList(context, activityProvider);
        },
      ),
      floatingActionButton: Consumer<ActivityProvider>(
        builder: (context, provider, child) {
          if (provider.currentActivity != null) {
            return FloatingActionButton(
              onPressed: () => _finishActivity(context),
              backgroundColor: Colors.red,
              child: const Icon(Icons.stop),
            );
          } else {
            return FloatingActionButton(
              onPressed: () => _showStartActivityDialog(context),
              child: const Icon(Icons.play_arrow),
            );
          }
        },
      ),
    );
  }

  Widget _buildActivitiesList(
    BuildContext context,
    ActivityProvider provider,
  ) {
    if (provider.activities.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.fitness_center,
              size: 64,
              color: Colors.grey[400],
            ),
            const SizedBox(height: 16),
            Text(
              'Нет тренировок',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                color: Colors.grey,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Начните первую тренировку',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Colors.grey,
              ),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      itemCount: provider.activities.length,
      itemBuilder: (context, index) {
        final activity = provider.activities[index];
        return ActivityCard(
          activity: activity,
          onDelete: () => _confirmDelete(context, activity),
        );
      },
    );
  }

  Widget _buildCurrentActivity(
    BuildContext context,
    ActivityRecord activity,
    SensorProvider sensorProvider,
  ) {
    return Center(
      child: SingleChildScrollView(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Прогресс кольцо с шагами
            ProgressRing(
              progress: (sensorProvider.stepCount / 10000).clamp(0.0, 1.0),
              size: 150,
              color: activity.type.color,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    sensorProvider.stepCount.toString(),
                    style: const TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const Text('шагов'),
                ],
              ),
            ),
            const SizedBox(height: 32),
            Text(
              activity.type.displayName,
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 32),

            // Статистика текущей тренировки
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 32),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  _buildCurrentStat(
                    context,
                    'Дистанция',
                    '${activity.distance.toStringAsFixed(2)} км',
                    Icons.straighten,
                  ),
                  _buildCurrentStat(
                    context,
                    'Калории',
                    '${activity.calories.toStringAsFixed(0)}',
                    Icons.local_fire_department,
                  ),
                ],
              ),
            ),

            const SizedBox(height: 32),

            // Индикатор активности
            if (sensorProvider.accelerometerMagnitude > 5)
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.orange.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Text(
                  '🏃‍♂️ Активное движение',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildCurrentStat(
    BuildContext context,
    String label,
    String value,
    IconData icon,
  ) {
    return Column(
      children: [
        Icon(icon, color: Colors.blue),
        const SizedBox(height: 4),
        Text(
          value,
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        Text(
          label,
          style: Theme.of(context).textTheme.bodySmall,
        ),
      ],
    );
  }

  void _showStartActivityDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Новая тренировка'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: ActivityType.values.map((type) {
            return ListTile(
              leading: Icon(type.icon, color: type.color),
              title: Text(type.displayName),
              onTap: () {
                Navigator.pop(context);
                _startActivity(context, type);
              },
            );
          }).toList(),
        ),
      ),
    );
  }

  void _startActivity(BuildContext context, ActivityType type) {
    final activityProvider =
        Provider.of<ActivityProvider>(context, listen: false);
    final sensorProvider = Provider.of<SensorProvider>(context, listen: false);

    activityProvider.startNewActivity(type);
    sensorProvider.startTracking();
  }

  void _finishActivity(BuildContext context) async {
    final activityProvider =
        Provider.of<ActivityProvider>(context, listen: false);
    final sensorProvider = Provider.of<SensorProvider>(context, listen: false);

    activityProvider.updateCurrentActivity(
      steps: sensorProvider.stepCount,
      distance: sensorProvider.calculateDistance(),
    );

    await activityProvider.finishCurrentActivity();
    sensorProvider.stopTracking();
    sensorProvider.resetRoute();

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Тренировка сохранена')),
      );
    }
  }

  void _confirmDelete(BuildContext context, ActivityRecord activity) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Удаление'),
        content: const Text('Вы уверены, что хотите удалить эту тренировку?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Отмена'),
          ),
          TextButton(
            onPressed: () {
              Provider.of<ActivityProvider>(context, listen: false)
                  .deleteActivity(activity.id);
              Navigator.pop(context);
            },
            style: TextButton.styleFrom(
              foregroundColor: Colors.red,
            ),
            child: const Text('Удалить'),
          ),
        ],
      ),
    );
  }
}
