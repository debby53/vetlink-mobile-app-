import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../services/session_store.dart';
import '../../theme/app_colors.dart';
import '../../services/language_provider.dart';

class AppDrawer extends StatefulWidget {
  const AppDrawer({super.key});

  @override
  State<AppDrawer> createState() => _AppDrawerState();
}

class _AppDrawerState extends State<AppDrawer> {
  UserSession? _session;

  @override
  void initState() {
    super.initState();
    _loadSession();
  }

  Future<void> _loadSession() async {
    final session = await SessionStore().get();
    if (mounted) setState(() => _session = session);
  }

  void _logout() async {
    await SessionStore().clear();
    if (!mounted) return;
    context.go('/login');
  }

  @override
  Widget build(BuildContext context) {
    if (_session == null) return const Drawer(child: Center(child: CircularProgressIndicator()));

    return Drawer(
      child: Column(
        children: [
          UserAccountsDrawerHeader(
            decoration: const BoxDecoration(color: AppColors.primary),
            accountName: Text(_session!.name, style: const TextStyle(fontWeight: FontWeight.bold)),
            accountEmail: Text(_session!.email),
            currentAccountPicture: CircleAvatar(
              backgroundColor: Colors.white,
              child: Text(
                _session!.name.isNotEmpty ? _session!.name[0].toUpperCase() : 'U',
                style: const TextStyle(fontSize: 24, color: AppColors.primary, fontWeight: FontWeight.bold),
              ),
            ),
          ),
          Expanded(
            child: ListView(
              padding: EdgeInsets.zero,
              children: _buildRoleRoutes(context, _session!.role),
            ),
          ),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.settings),
            title: Text(languageProvider.t('settings')),
            onTap: () {
               Navigator.of(context).pop();
               context.push('/shared/settings');
            },
          ),
          ListTile(
            leading: const Icon(Icons.logout, color: AppColors.destructive),
            title: Text(languageProvider.t('logout'), style: const TextStyle(color: AppColors.destructive)),
            onTap: _logout,
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }

  List<Widget> _buildRoleRoutes(BuildContext context, String role) {
    switch (role) {
      case 'farmer':
        return [
          _DrawerItem(icon: Icons.dashboard, title: languageProvider.t('dashboard'), route: '/farmer'),
          _DrawerItem(icon: Icons.pets, title: languageProvider.t('my_animals'), route: '/farmer/animals'),
          _DrawerItem(icon: Icons.monitor_heart, title: languageProvider.t('health_records'), route: '/farmer/records'),
          _DrawerItem(icon: Icons.calculate, title: languageProvider.t('smart_feed_advisor'), route: '/shared/rations'),
          _DrawerItem(icon: Icons.store, title: 'Marketplace', route: '/shared/market'),
        ];
      case 'cahw':
        return [
          _DrawerItem(icon: Icons.dashboard, title: languageProvider.t('dashboard'), route: '/cahw'),
          _DrawerItem(icon: Icons.map, title: 'Nearby Cases', route: '/cahw/nearby-cases'),
          _DrawerItem(icon: Icons.school, title: 'Training & Certificates', route: '/cahw/training'),
          _DrawerItem(icon: Icons.groups, title: 'Community', route: '/cahw/community'),
        ];
      case 'veterinarian':
        return [
          _DrawerItem(icon: Icons.dashboard, title: languageProvider.t('dashboard'), route: '/vet'),
          _DrawerItem(icon: Icons.local_hospital, title: languageProvider.t('cases'), route: '/vet/cases'),
          _DrawerItem(icon: Icons.pets, title: languageProvider.t('my_patients'), route: '/vet/patients'),
          _DrawerItem(icon: Icons.assignment, title: languageProvider.t('treatment_plans'), route: '/vet/treatment-plans'),
          _DrawerItem(icon: Icons.upload_file, title: 'Upload Training', route: '/vet/training-upload'),
        ];
      case 'admin':
        return [
           _DrawerItem(icon: Icons.dashboard, title: languageProvider.t('dashboard'), route: '/admin'),
           _DrawerItem(icon: Icons.group, title: languageProvider.t('users'), route: '/admin/users'),
           _DrawerItem(icon: Icons.folder, title: 'Review Applications', route: '/admin/applications'),
        ];
      default:
        return [];
    }
  }
}

class _DrawerItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final String route;

  const _DrawerItem({required this.icon, required this.title, required this.route});

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon),
      title: Text(title),
      onTap: () {
        Navigator.of(context).pop(); // Close drawer
        context.push(route);
      },
    );
  }
}
