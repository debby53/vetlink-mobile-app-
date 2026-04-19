import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../theme/app_colors.dart';
import '../../widgets/app_drawer.dart';
import '../../services/session_store.dart';
import '../../services/api_client.dart';
import '../../models/models.dart';

class AdminDashboard extends StatefulWidget {
  final UserSession session;
  const AdminDashboard({super.key, required this.session});

  @override
  State<AdminDashboard> createState() => _AdminDashboardState();
}

class _AdminDashboardState extends State<AdminDashboard> {
  bool _loading = true;
  int _userCount = 0;
  int _caseCount = 0;

  @override
  void initState() {
    super.initState();
    _loadStats();
  }

  Future<void> _loadStats() async {
    try {
      final client = ApiClient(baseUrl: defaultApiBase, token: widget.session.token);
      final List<UserDTO> users = await client.getActiveUsers();
      final List<CaseDTO> cases = await client.getAllCases();
      
      if (!mounted) return;
      setState(() {
        _userCount = users.length;
        _caseCount = cases.length;
        _loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Admin Dashboard')),
      drawer: const AppDrawer(),
      body: _loading 
        ? const Center(child: CircularProgressIndicator())
        : SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(12)),
              child: Row(
                children: [
                  const Icon(Icons.admin_panel_settings, color: Colors.white, size: 48),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                         const Text('System Overview', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                         Text('All services operational', style: TextStyle(color: Colors.white.withValues(alpha: 0.8))),
                      ],
                    ),
                  )
                ],
              ),
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(child: _StatCard(title: 'Total Users', count: '$_userCount', icon: Icons.group, onTap: () => context.push('/admin/users'))),
                const SizedBox(width: 16),
                Expanded(child: _StatCard(title: 'All Logged Cases', count: '$_caseCount', icon: Icons.local_hospital, color: AppColors.secondary, onTap: () {})),
              ],
            ),
             const SizedBox(height: 24),
             Card(
               child: ListTile(
                 title: const Text('System Audit Logs'),
                 trailing: const Icon(Icons.chevron_right),
                 onTap: () {},
               ),
             )
          ],
        ),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String title;
  final String count;
  final IconData icon;
  final Color color;
  final VoidCallback onTap;

  const _StatCard({required this.title, required this.count, required this.icon, this.color = AppColors.primary, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          border: Border.all(color: AppColors.border),
          borderRadius: BorderRadius.circular(12)
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: color),
            const SizedBox(height: 16),
            Text(count, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
            Text(title, style: const TextStyle(color: AppColors.textMuted)),
          ],
        ),
      ),
    );
  }
}
