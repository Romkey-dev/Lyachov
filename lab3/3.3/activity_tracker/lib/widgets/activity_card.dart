import 'package:flutter/material.dart';
import '../models/activity.dart';
import 'package:intl/intl.dart';

class ActivityCard extends StatelessWidget {
  final ActivityRecord activity;
  final VoidCallback? onTap;
  final VoidCallback? onDelete;

  const ActivityCard({
    Key? key,
    required this.activity,
    this.onTap,
    this.onDelete,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final dateFormat = DateFormat('dd MMM yyyy, HH:mm');
    final durationHours = activity.duration.inHours;
    final durationMinutes = activity.duration.inMinutes % 60;
    final durationSeconds = activity.duration.inSeconds % 60;
    final durationFormat = '${durationHours.toString().padLeft(2, '0')}:${durationMinutes.toString().padLeft(2, '0')}:${durationSeconds.toString().padLeft(2, '0')}';

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Верхняя строка с иконкой и заголовком
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: activity.type.color.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(
                      activity.type.icon,
                      color: activity.type.color,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          activity.type.displayName,
                          style: theme.textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          dateFormat.format(activity.startTime),
                          style: theme.textTheme.bodySmall,
                        ),
                      ],
                    ),
                  ),
                  if (onDelete != null)
                    IconButton(
                      icon: const Icon(Icons.delete_outline),
                      onPressed: onDelete,
                      color: Colors.grey,
                    ),
                ],
              ),
              const SizedBox(height: 12),

              // Статистика
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _buildStatItem(
                    icon: Icons.timer,
                    value: durationFormat,
                    label: 'Длительность',
                  ),
                  _buildStatItem(
                    icon: Icons.directions_walk,
                    value: activity.steps.toString(),
                    label: 'Шаги',
                  ),
                  _buildStatItem(
                    icon: Icons.straighten,
                    value: '${activity.distance.toStringAsFixed(2)} км',
                    label: 'Дистанция',
                  ),
                  _buildStatItem(
                    icon: Icons.local_fire_department,
                    value: '${activity.calories.toStringAsFixed(0)} ккал',
                    label: 'Калории',
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatItem({
    required IconData icon,
    required String value,
    required String label,
  }) {
    return Column(
      children: [
        Icon(icon, size: 16, color: Colors.grey),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 12,
          ),
        ),
        Text(
          label,
          style: const TextStyle(
            fontSize: 10,
            color: Colors.grey,
          ),
        ),
      ],
    );
  }
}
