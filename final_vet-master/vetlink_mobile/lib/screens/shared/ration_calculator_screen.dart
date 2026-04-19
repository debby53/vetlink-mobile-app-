import 'dart:math';
import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import '../../widgets/app_drawer.dart';

class RationCalculatorScreen extends StatefulWidget {
  const RationCalculatorScreen({super.key});

  @override
  State<RationCalculatorScreen> createState() => _RationCalculatorScreenState();
}

class _RationCalculatorScreenState extends State<RationCalculatorScreen> {
  String _animalType = 'COW';
  double _weight = 400;
  double _productivity = 10;
  bool _loading = false;
  
  Map<String, double>? _recipe;
  double? _energy;

  void _calculate() async {
    setState(() => _loading = true);
    
    // Simulate API delay
    await Future.delayed(const Duration(milliseconds: 800));

    // Mirroring React typescript logic
    final maintenance = 0.5 * pow(_weight, 0.75);
    final production = _productivity * 5;
    final totalEnergy = maintenance + production;

    final mockRec = <String, double>{
      "Napier Grass (Fresh)": double.parse(((_weight * 0.025 * 0.7) / 0.25).toStringAsFixed(2)),
      "Maize Bran": double.parse(((_productivity > 5 ? (_productivity - 5) / 2 : 0) * 0.7).toStringAsFixed(2)),
      "Cotton Seed Cake": double.parse(((_productivity > 5 ? (_productivity - 5) / 2 : 0) * 0.3).toStringAsFixed(2)),
      "Mineral Salt": 0.1,
    };

    if (!mounted) return;
    setState(() {
      _loading = false;
      _energy = double.parse(totalEnergy.toStringAsFixed(1));
      _recipe = mockRec;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Smart Feed Advisor')),
      drawer: const AppDrawer(),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Card(
              child: Padding(
                padding: EdgeInsets.all(16),
                child: Text('Optimize your livestock nutrition with locally available ingredients based on weight and yield targets.', style: TextStyle(color: AppColors.textMuted)),
              ),
            ),
            const SizedBox(height: 24),
            DropdownButtonFormField<String>(
              initialValue: _animalType,
              decoration: const InputDecoration(labelText: 'Livestock Type'),
              items: const [
                 DropdownMenuItem(value: 'COW', child: Text('Dairy Cow')),
                 DropdownMenuItem(value: 'GOAT', child: Text('Dairy Goat')),
                 DropdownMenuItem(value: 'BEEF', child: Text('Beef Cattle')),
              ],
              onChanged: (v) => setState(() => _animalType = v!),
            ),
            const SizedBox(height: 24),
            Text('Animal Weight: ${_weight.toInt()} kg', style: const TextStyle(fontWeight: FontWeight.bold)),
            Slider(
              value: _weight,
              min: 100, max: 800, divisions: 70,
              label: '${_weight.toInt()}',
              onChanged: (v) => setState(() => _weight = v),
            ),
            const SizedBox(height: 16),
            TextFormField(
              initialValue: _productivity.toString(),
              keyboardType: TextInputType.number,
              decoration: InputDecoration(labelText: _animalType == 'BEEF' ? 'Daily Weight Gain (kg)' : 'Daily Milk Yield (Liters)'),
              onChanged: (v) => _productivity = double.tryParse(v) ?? 0,
            ),
            const SizedBox(height: 32),
            FilledButton(
              onPressed: _loading ? null : _calculate,
              child: _loading ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2)) : const Text('Generate Ration Recipe'),
            ),
            if (_recipe != null) ...[
              const SizedBox(height: 32),
              Card(
                color: AppColors.primary.withValues(alpha: 0.05),
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const Text('Recommended Daily Ration', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.primary)),
                      const Divider(),
                      ..._recipe!.entries.map((e) => Padding(
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(e.key, style: const TextStyle(fontWeight: FontWeight.w600)),
                            Text('${e.value} kg', style: const TextStyle(color: AppColors.secondary, fontWeight: FontWeight.bold)),
                          ],
                        ),
                      )),
                      const Divider(),
                      Text('Energy Target: $_energy MJ\nOptimized for a ${_weight.toInt()}kg ${_animalType == 'COW' ? 'Cow' : 'Animal'}', style: const TextStyle(fontSize: 12, color: AppColors.textMuted))
                    ],
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
