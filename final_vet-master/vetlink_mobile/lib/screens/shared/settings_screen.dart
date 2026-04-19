import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
           const Text('Preferences', style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary)),
           const SizedBox(height: 8),
           SwitchListTile(
             title: const Text('Push Notifications'),
             subtitle: const Text('Receive alerts for cases and messages'),
             value: true,
             onChanged: (v) {},
           ),
           SwitchListTile(
             title: const Text('Dark Mode'),
             subtitle: const Text('Toggle system theme'),
             value: false,
             onChanged: (v) {},
           ),
           const Divider(),
           const Text('Account', style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary)),
           const SizedBox(height: 8),
           ListTile(
             leading: const Icon(Icons.language),
             title: const Text('Language'),
             trailing: const Text('English', style: TextStyle(color: AppColors.textMuted)),
             onTap: () {},
           ),
           ListTile(
             leading: const Icon(Icons.lock),
             title: const Text('Change Password'),
             trailing: const Icon(Icons.chevron_right),
             onTap: () {},
           ),
            ListTile(
             leading: const Icon(Icons.help),
             title: const Text('Help & Support'),
             trailing: const Icon(Icons.chevron_right),
             onTap: () {},
           ),
        ],
      ),
    );
  }
}
