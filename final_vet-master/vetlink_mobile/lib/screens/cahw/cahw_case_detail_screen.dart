import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';

class CahwCaseDetailScreen extends StatefulWidget {
  final String orderId;

  const CahwCaseDetailScreen({super.key, required this.orderId});

  @override
  State<CahwCaseDetailScreen> createState() => _CahwCaseDetailScreenState();
}

class _CahwCaseDetailScreenState extends State<CahwCaseDetailScreen> {
  bool _isAccepted = false;
  final _treatmentKey = GlobalKey<FormState>();
  final _diagnosisCtrl = TextEditingController();
  final _medsCtrl = TextEditingController();

  @override
  void dispose() {
    _diagnosisCtrl.dispose();
    _medsCtrl.dispose();
    super.dispose();
  }

  void _submitTreatment() async {
    if (!_treatmentKey.currentState!.validate()) return;
    
    // Simulate Network Request
    showDialog(
      context: context, 
      barrierDismissible: false,
      builder: (_) => const Center(child: CircularProgressIndicator())
    );
    
    await Future.delayed(const Duration(seconds: 2));
    
    if (!mounted) return;
    Navigator.of(context).pop(); // dismiss loading
    
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Treatment recorded successfully. Payment requested.'),
        backgroundColor: AppColors.primary,
      )
    );
    
    Navigator.of(context).pop(); // dismiss screen
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Case Details ${widget.orderId}')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Goat showing signs of PPR', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppColors.destructive.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: const Text('URGENT', style: TextStyle(color: AppColors.destructive, fontSize: 12, fontWeight: FontWeight.bold)),
                        )
                      ],
                    ),
                    const Divider(height: 32),
                    _InfoRow('Farmer Name', 'K. Mutabazi'),
                    const SizedBox(height: 8),
                    _InfoRow('Symptoms', 'Loss of Appetite, Diarrhea, Breathing Difficulties'),
                    const SizedBox(height: 8),
                    _InfoRow('Distance', '2.5 km away'),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            
            if (!_isAccepted) ...[
              // Action Buttons for Pre-accept
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppColors.destructive,
                        side: const BorderSide(color: AppColors.destructive),
                        padding: const EdgeInsets.symmetric(vertical: 16)
                      ),
                      onPressed: () => Navigator.of(context).pop(),
                      child: const Text('Decline Case'),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: FilledButton(
                      style: FilledButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16)),
                      onPressed: () => setState(() => _isAccepted = true),
                      child: const Text('Accept & Navigate'),
                    ),
                  ),
                ],
              )
            ] else ...[
               // Treatment Form once accepted
               Text('Treatment Form', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
               const SizedBox(height: 12),
               Card(
                 child: Padding(
                   padding: const EdgeInsets.all(16),
                   child: Form(
                     key: _treatmentKey,
                     child: Column(
                       crossAxisAlignment: CrossAxisAlignment.stretch,
                       children: [
                         TextFormField(
                           controller: _diagnosisCtrl,
                           decoration: const InputDecoration(labelText: 'Final Diagnosis / Clinical Observations'),
                           validator: (v) => v!.isEmpty ? 'Required' : null,
                           maxLines: 2,
                         ),
                         const SizedBox(height: 16),
                         TextFormField(
                           controller: _medsCtrl,
                           decoration: const InputDecoration(labelText: 'Medications Administered (with Dosage)'),
                           validator: (v) => v!.isEmpty ? 'Required' : null,
                           maxLines: 2,
                         ),
                         const SizedBox(height: 24),
                         FilledButton(
                           onPressed: _submitTreatment,
                           child: const Text('Complete Case & Request Payment'),
                         )
                       ],
                     ),
                   ),
                 ),
               )
            ]
          ],
        ),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final String label;
  final String value;
  
  const _InfoRow(this.label, this.value);

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 12)),
        const SizedBox(height: 4),
        Text(value, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 16)),
      ],
    );
  }
}
