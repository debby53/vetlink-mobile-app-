import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import '../../widgets/app_drawer.dart';

class AdminUsersScreen extends StatelessWidget {
  const AdminUsersScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Manage Users')),
      drawer: const AppDrawer(),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              decoration: InputDecoration(
                hintText: 'Search by name or email...',
                prefixIcon: const Icon(Icons.search),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12))
              ),
            ),
          ),
          Expanded(
            child: ListView.builder(
              itemCount: 5,
              itemBuilder: (context, index) {
                final roles = ['farmer', 'cahw', 'veterinarian', 'farmer', 'cahw'];
                return ListTile(
                  leading: CircleAvatar(child: Text(roles[index][0].toUpperCase())),
                  title: Text('User ${index + 1}'),
                  subtitle: Text(roles[index].toUpperCase()),
                  trailing: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      IconButton(icon: const Icon(Icons.edit, color: AppColors.primary), onPressed: () {}),
                      IconButton(icon: const Icon(Icons.block, color: AppColors.destructive), onPressed: () {}),
                    ],
                  ),
                );
              },
            ),
          )
        ],
      )
    );
  }
}
