import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import '../../widgets/app_drawer.dart';
import '../../services/api_client.dart';
import '../../services/session_store.dart';
import '../../models/models.dart';

class VetPatientsScreen extends StatefulWidget {
  const VetPatientsScreen({super.key});

  @override
  State<VetPatientsScreen> createState() => _VetPatientsScreenState();
}

class _VetPatientsScreenState extends State<VetPatientsScreen> {
  late Future<List<TreatmentPlanDTO>> _plansFuture;

  @override
  void initState() {
    super.initState();
    _loadPlans();
  }

  void _loadPlans() async {
    final session = await SessionStore().get();
    final client = ApiClient(baseUrl: defaultApiBase, token: session?.token);
    setState(() {
      _plansFuture = client.getTreatmentPlansByVet(session?.userId ?? 0);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Patients (Active Plans)')),
      drawer: const AppDrawer(),
      body: FutureBuilder<List<TreatmentPlanDTO>>(
        future: _plansFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
             return Center(child: Text('Failed to load patients:\n${snapshot.error}', textAlign: TextAlign.center, style: const TextStyle(color: AppColors.destructive)));
          }

          final plans = snapshot.data ?? [];
          if (plans.isEmpty) {
             return const Center(child: Text('No active treatment plans found.', style: TextStyle(color: AppColors.textMuted)));
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: plans.length,
            itemBuilder: (context, index) {
              final plan = plans[index];
              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: ListTile(
                  leading: const CircleAvatar(backgroundColor: AppColors.secondary, child: Icon(Icons.medical_services, color: Colors.white)),
                  title: Text('Case ID: #${plan.caseId ?? "N/A"}', style: const TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: Text('Treatment: ${plan.treatment}\nDuration: ${plan.duration} days | Status: ${plan.status}'),
                  isThreeLine: true,
                  trailing: IconButton(icon: const Icon(Icons.history), onPressed: () {}),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
