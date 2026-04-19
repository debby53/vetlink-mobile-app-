import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';

class EmergencyCaseScreen extends StatefulWidget {
  const EmergencyCaseScreen({super.key});

  @override
  State<EmergencyCaseScreen> createState() => _EmergencyCaseScreenState();
}

class _EmergencyCaseScreenState extends State<EmergencyCaseScreen> {
  bool _isResponding = false;
  bool _isAccepted = false;

  void _respondToEmergency() async {
    setState(() => _isResponding = true);
    
    // Simulate Network Request
    await Future.delayed(const Duration(seconds: 1));
    
    if (!mounted) return;
    
    setState(() {
      _isResponding = false;
      _isAccepted = true;
    });

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Emergency Case Accepted. Navigating to Farm...'),
        backgroundColor: AppColors.primary,
      )
    );
  }

  void _markResolved() {
     ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Emergency resolved.'),
        backgroundColor: AppColors.primary,
      )
    );
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Emergency Case #EM-12A')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.destructive.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.destructive, width: 2),
              ),
              child: Column(
                children: [
                  const Icon(Icons.warning, color: AppColors.destructive, size: 48),
                  const SizedBox(height: 8),
                  const Text('CRITICAL EMERGENCY', style: TextStyle(color: AppColors.destructive, fontWeight: FontWeight.bold, fontSize: 18)),
                  const SizedBox(height: 16),
                  const Text('Suspected Anthrax in Cattle. High mortality risk.', textAlign: TextAlign.center, style: TextStyle(fontSize: 16)),
                ],
              ),
            ),
            const SizedBox(height: 24),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: const [
                    Text('Location Details', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppColors.textMuted)),
                    Divider(),
                    SizedBox(height: 8),
                    Text('Distance: 5 km away'),
                    SizedBox(height: 4),
                    Text('Reported: 10 minutes ago'),
                    SizedBox(height: 4),
                    Text('Farmer: K. Mutabazi (078XXXXXXX)'),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 32),
             if (!_isAccepted) ...[
                FilledButton(
                  style: FilledButton.styleFrom(
                    backgroundColor: AppColors.destructive,
                    padding: const EdgeInsets.symmetric(vertical: 18)
                  ),
                  onPressed: _isResponding ? null : _respondToEmergency,
                  child: _isResponding 
                    ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : const Text('RESPOND IMMEDIATELY', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                ),
                const SizedBox(height: 16),
                OutlinedButton(
                  onPressed: () => Navigator.of(context).pop(),
                  child: const Text('Forward to Next Available Vet'),
                ),
             ] else ...[
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(color: AppColors.primary.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
                  child: Column(
                    children: [
                      const Icon(Icons.check_circle, color: AppColors.primary, size: 48),
                      const SizedBox(height: 8),
                      const Text('You are the responder for this case.', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 16),
                      FilledButton(
                        onPressed: _markResolved,
                        child: const Text('Mark Case as Resolved')
                      )
                    ],
                  ),
                )
             ]
          ],
        ),
      )
    );
  }
}
