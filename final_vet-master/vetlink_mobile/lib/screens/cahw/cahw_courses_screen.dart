import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import '../../widgets/app_drawer.dart';

class CahwCoursesScreen extends StatelessWidget {
  const CahwCoursesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Training & Certificates')),
      drawer: const AppDrawer(),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text('Enrolled Courses', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
           const SizedBox(height: 12),
          _CourseCard(title: 'Advanced Diagnostic Triage', progress: 0.6, onContinue: () {}),
          const SizedBox(height: 32),
          Text('Available Now', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
           _CourseCard(title: 'Emergency Birthing Procedures', progress: 0.0, onContinue: () {}),
        ],
      )
    );
  }
}

class _CourseCard extends StatelessWidget {
  final String title;
  final double progress;
  final VoidCallback onContinue;

  const _CourseCard({required this.title, required this.progress, required this.onContinue});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 16),
            LinearProgressIndicator(value: progress, backgroundColor: AppColors.border, color: AppColors.primary),
            const SizedBox(height: 8),
            Text('${(progress * 100).toInt()}% Completed', style: const TextStyle(color: AppColors.textMuted, fontSize: 12)),
            const SizedBox(height: 16),
            Align(
              alignment: Alignment.centerRight,
              child: FilledButton(
                onPressed: onContinue,
                child: Text(progress > 0 ? 'Continue' : 'Enroll'),
              ),
            )
          ],
        ),
      ),
    );
  }
}
