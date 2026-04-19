import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import '../../widgets/app_drawer.dart';

class NearbyCasesMapScreen extends StatelessWidget {
  const NearbyCasesMapScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Nearby Cases')),
      drawer: const AppDrawer(),
      body: Stack(
        children: [
          Container(
            color: Colors.grey.shade200,
            child: const Center(
              child: Text('Interactive Map Placeholder\n(Google Maps Context)', textAlign: TextAlign.center, style: TextStyle(color: AppColors.textMuted)),
            ),
          ),
          Positioned(
            bottom: 24,
            left: 24,
            right: 24,
            child: Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Text('3 cases within 10km', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    const SizedBox(height: 8),
                    FilledButton.icon(
                      icon: const Icon(Icons.list),
                      label: const Text('View List'),
                      onPressed: () => Navigator.of(context).pop(), // Returns to Dashboard list
                    )
                  ],
                ),
              ),
            ),
          )
        ],
      ),
    );
  }
}
