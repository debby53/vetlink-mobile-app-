import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import '../../widgets/app_drawer.dart';

class VetTrainingUploadScreen extends StatelessWidget {
  const VetTrainingUploadScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Upload CAHW Training')),
      drawer: const AppDrawer(),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(
              padding: const EdgeInsets.all(32),
              decoration: BoxDecoration(
                border: Border.all(color: AppColors.border, style: BorderStyle.none),
                borderRadius: BorderRadius.circular(12),
                color: Colors.grey.shade100,
              ),
              child: const Column(
                children: [
                   Icon(Icons.cloud_upload, size: 48, color: AppColors.primary),
                   SizedBox(height: 16),
                   Text('Tap to select video/PDF files', style: TextStyle(fontWeight: FontWeight.bold)),
                   Text('Max size: 50MB per file', style: TextStyle(color: AppColors.textMuted))
                ],
              ),
            ),
            const SizedBox(height: 24),
            TextFormField(
              decoration: const InputDecoration(labelText: 'Course Title'),
            ),
            const SizedBox(height: 16),
            TextFormField(
              maxLines: 4,
              decoration: const InputDecoration(labelText: 'Description / Curriculum'),
            ),
            const SizedBox(height: 32),
            FilledButton(onPressed: () {}, child: const Text('Publish Course to CAHW Portal'))
          ],
        ),
      ),
    );
  }
}
