import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../theme/app_colors.dart';

class FarmerAddAnimalScreen extends StatefulWidget {
  const FarmerAddAnimalScreen({super.key});

  @override
  State<FarmerAddAnimalScreen> createState() => _FarmerAddAnimalScreenState();
}

class _FarmerAddAnimalScreenState extends State<FarmerAddAnimalScreen> {
  final _formKey = GlobalKey<FormState>();
  bool _saving = false;

  void _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);
    await Future.delayed(const Duration(seconds: 1)); // Mock delay
    if (!mounted) return;
    
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Animal added successfully'), backgroundColor: AppColors.primary));
    context.pop();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Register New Animal')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              TextFormField(
                decoration: const InputDecoration(labelText: 'Name / Tag ID'),
                validator: (v) => v!.isEmpty ? 'Required' : null,
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                decoration: const InputDecoration(labelText: 'Animal Type'),
                items: const [
                  DropdownMenuItem(value: 'cow', child: Text('Cow')),
                  DropdownMenuItem(value: 'goat', child: Text('Goat')),
                  DropdownMenuItem(value: 'sheep', child: Text('Sheep')),
                  DropdownMenuItem(value: 'poultry', child: Text('Poultry')),
                ],
                onChanged: (v) {},
                validator: (v) => v == null ? 'Required' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                decoration: const InputDecoration(labelText: 'Breed'),
              ),
              const SizedBox(height: 16),
              TextFormField(
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: 'Age (in years)'),
                validator: (v) => v!.isEmpty ? 'Required' : null,
              ),
               const SizedBox(height: 32),
               FilledButton(
                 onPressed: _saving ? null : _save,
                 child: _saving ? const CircularProgressIndicator(color: Colors.white) : const Text('Register Animal'),
               )
            ],
          ),
        ),
      ),
    );
  }
}
