import 'package:flutter/material.dart';
import '../../services/session_store.dart';
import '../../theme/app_colors.dart';
import 'package:go_router/go_router.dart';
import '../../widgets/app_drawer.dart';

class VetDashboard extends StatelessWidget {
  final UserSession session;

  const VetDashboard({super.key, required this.session});

  // Handled by AppDrawer

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Veterinarian Dashboard'),
      ),
      drawer: const AppDrawer(),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [Color(0xFF2B3A67), Color(0xFF496A81)]),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  const Icon(Icons.verified, color: Colors.white, size: 48),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Dr. ${session.name}', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold, color: Colors.white)),
                        const Text('Licensed Veterinarian', style: TextStyle(color: Colors.white70)),
                      ],
                    ),
                  )
                ],
              ),
            ),
            const SizedBox(height: 24),
            Text('Emergency Cases', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold, color: AppColors.destructive)),
            const SizedBox(height: 12),
            Card(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
                side: const BorderSide(color: AppColors.destructive, width: 1),
              ),
              child: ListTile(
                leading: const Icon(Icons.warning, color: AppColors.destructive),
                title: const Text('Cattle with suspect anthrax', style: TextStyle(fontWeight: FontWeight.bold)),
                subtitle: const Text('5 km away • Reported 10m ago'),
                trailing: FilledButton(
                    style: FilledButton.styleFrom(backgroundColor: AppColors.destructive),
                    onPressed: () => context.push('/vet/emergency'),
                    child: const Text('Respond'),
                ),
              ),
            ),
            const SizedBox(height: 24),
            Text('CAHW Supervision Requests', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            Card(
              child: ListTile(
                leading: CircleAvatar(backgroundColor: AppColors.accent.withValues(alpha: 0.2), child: const Icon(Icons.help_outline, color: AppColors.accent)),
                title: const Text('Complex delivery - Goat', style: TextStyle(fontWeight: FontWeight.bold)),
                subtitle: const Text('Requested by: CAHW John Doe'),
                trailing: TextButton(onPressed: () => context.push('/vet/supervision'), child: const Text('Provide Guidance')),
              ),
            )
          ],
        ),
      ),
    );
  }
}
