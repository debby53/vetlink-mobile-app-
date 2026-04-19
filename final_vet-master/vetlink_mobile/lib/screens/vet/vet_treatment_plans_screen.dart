import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import '../../widgets/app_drawer.dart';

class VetTreatmentPlansScreen extends StatelessWidget {
  const VetTreatmentPlansScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Active Treatment Plans')),
      drawer: const AppDrawer(),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {},
        icon: const Icon(Icons.add),
        label: const Text('New Plan'),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: const [
          _PlanCard(
            title: 'Mastitis Recovery Protocol',
            patient: 'Bessie (Cow)',
            duration: '14 Days',
            progress: 0.5,
          ),
          _PlanCard(
            title: 'Rabies Vaccination Schedule',
            patient: 'Max (Dog)',
            duration: '3 Days',
            progress: 0.1,
          )
        ],
      )
    );
  }
}

class _PlanCard extends StatelessWidget {
  final String title;
  final String patient;
  final String duration;
  final double progress;

  const _PlanCard({required this.title, required this.patient, required this.duration, required this.progress});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(child: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16))),
                Chip(label: Text(duration), backgroundColor: AppColors.secondary.withValues(alpha: 0.1)),
              ],
            ),
            const SizedBox(height: 8),
            Text('Patient: $patient', style: const TextStyle(color: AppColors.textMuted)),
            const SizedBox(height: 16),
            LinearProgressIndicator(value: progress, backgroundColor: AppColors.border, color: AppColors.primary),
            const SizedBox(height: 8),
            Text('${(progress * 100).toInt()}% Compliant', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }
}
