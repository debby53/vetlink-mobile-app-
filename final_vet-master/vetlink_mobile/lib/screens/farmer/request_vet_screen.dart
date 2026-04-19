import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';

class RequestVetScreen extends StatefulWidget {
  const RequestVetScreen({super.key});

  @override
  State<RequestVetScreen> createState() => _RequestVetScreenState();
}

class _RequestVetScreenState extends State<RequestVetScreen> {
  final _formKey = GlobalKey<FormState>();
  final _descController = TextEditingController();
  bool _isSubmitting = false;

  @override
  void dispose() {
    _descController.dispose();
    super.dispose();
  }

  void _submitRequest() async {
    if (!_formKey.currentState!.validate()) return;
    
    setState(() => _isSubmitting = true);
    
    // Mock network request delay
    await Future.delayed(const Duration(seconds: 2));
    
    if (!mounted) return;
    
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Veterinary help requested. A provider will contact you shortly.'),
        backgroundColor: AppColors.primary,
      )
    );
    
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Request Veterinary Help')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Text('Please describe the situation briefly:'),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _descController,
                    maxLines: 4,
                    decoration: const InputDecoration(
                      hintText: 'E.g., Animal is completely immobile and shivering.',
                    ),
                    validator: (value) => 
                      (value == null || value.trim().isEmpty) ? 'Please provide a description' : null,
                  ),
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.secondary.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: AppColors.secondary.withValues(alpha: 0.3)),
                    ),
                    child: Row(
                      children: const [
                        Icon(Icons.location_on, color: AppColors.secondary),
                        SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'Your GPS location will be securely shared with the nearest available provider.',
                            style: TextStyle(color: AppColors.secondary, fontSize: 12),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                  FilledButton(
                    onPressed: _isSubmitting ? null : _submitRequest,
                    child: _isSubmitting 
                      ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : const Text('Submit Request'),
                  )
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
