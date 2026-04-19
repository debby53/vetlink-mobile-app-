import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import '../../services/api_client.dart';
import '../../models/models.dart';
import '../../services/session_store.dart';

class HealthAssessmentScreen extends StatefulWidget {
  const HealthAssessmentScreen({super.key});

  @override
  State<HealthAssessmentScreen> createState() => _HealthAssessmentScreenState();
}

class _HealthAssessmentScreenState extends State<HealthAssessmentScreen> {
  int _currentStep = 0;
  int? _selectedAnimalId;
  final List<String> _selectedSymptoms = [];
  bool _isAnalyzing = false;
  String? _urgencyResult;
  
  List<AnimalDTO> _animals = [];
  bool _loadingAnimals = true;

  final List<String> _symptoms = [
    'Fever / High Temperature', 'Loss of Appetite', 'Lethargy / Weakness', 
    'Breathing Difficulties', 'Diarrhea', 'Abnormal Discharge', 'Lameness',
  ];

  @override
  void initState() {
    super.initState();
    _fetchAnimals();
  }

  void _fetchAnimals() async {
    final session = await SessionStore().get();
    if (session == null) return;
    try {
      final client = ApiClient(baseUrl: defaultApiBase, token: session.token);
      final animals = await client.getAnimalsByFarmer(session.userId);
      setState(() {
        _animals = animals;
        _loadingAnimals = false;
      });
    } catch (_) {
      setState(() => _loadingAnimals = false);
    }
  }

  void _analyzeSymptoms() async {
    setState(() => _isAnalyzing = true);
    
    // Triage
    String result = 'Routine';
    int severity = 1;
    if (_selectedSymptoms.contains('Breathing Difficulties') || _selectedSymptoms.contains('Abnormal Discharge')) {
      result = 'Emergency';
      severity = 3;
    } else if (_selectedSymptoms.length > 2) {
      result = 'Urgent';
      severity = 2;
    } else if (_selectedSymptoms.isEmpty) {
      result = 'Informational';
      severity = 1;
    }

    try {
      final session = await SessionStore().get();
      final client = ApiClient(baseUrl: defaultApiBase, token: session?.token);
      
      await client.createCase(CaseDTO(
        farmerId: session?.userId ?? 0,
        animalId: _selectedAnimalId ?? 0,
        title: 'Health Assessment: $result',
        description: 'Symptoms reported: ${_selectedSymptoms.join(", ")}',
        caseType: 'ASSESSMENT',
        severity: severity,
      ));

      setState(() {
        _isAnalyzing = false;
        _urgencyResult = result;
      });
    } catch (e) {
      setState(() => _isAnalyzing = false);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to submit case: $e')));
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_urgencyResult != null) return _buildResultScreen();

    return Scaffold(
      appBar: AppBar(title: const Text('Health Assessment')),
      body: _loadingAnimals 
          ? const Center(child: CircularProgressIndicator()) 
          : Stepper(
        currentStep: _currentStep,
        onStepContinue: () {
          if (_currentStep == 0 && _selectedAnimalId == null) {
            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please select an animal.')));
            return;
          }
          if (_currentStep < 1) {
            setState(() => _currentStep += 1);
          } else {
            _analyzeSymptoms();
          }
        },
        onStepCancel: () {
          if (_currentStep > 0) setState(() => _currentStep -= 1);
        },
        controlsBuilder: (context, details) {
          if (_isAnalyzing) {
            return const Padding(padding: EdgeInsets.only(top: 16), child: Center(child: CircularProgressIndicator()));
          }
          return Padding(
            padding: const EdgeInsets.only(top: 16),
            child: Row(
              children: [
                FilledButton(onPressed: details.onStepContinue, child: Text(_currentStep == 1 ? 'Analyze & Submit' : 'Next')),
                if (_currentStep > 0) ...[
                  const SizedBox(width: 12),
                  TextButton(onPressed: details.onStepCancel, child: const Text('Back')),
                ]
              ],
            ),
          );
        },
        steps: [
          Step(
            title: const Text('Select Animal'),
            isActive: _currentStep >= 0,
            content: _animals.isEmpty 
              ? const Text('No animals registered. Please add an animal first.', style: TextStyle(color: AppColors.destructive))
              : DropdownButtonFormField<int>(
              initialValue: _selectedAnimalId,
              hint: const Text('Select livestock'),
              items: _animals.map((a) => DropdownMenuItem(value: a.id, child: Text('${a.name} (${a.type})'))).toList(),
              onChanged: (v) => setState(() => _selectedAnimalId = v),
              decoration: const InputDecoration(border: OutlineInputBorder()),
            ),
          ),
          Step(
            title: const Text('Symptoms'),
            isActive: _currentStep >= 1,
            content: Column(
              children: _symptoms.map((symptom) {
                return CheckboxListTile(
                  title: Text(symptom),
                  value: _selectedSymptoms.contains(symptom),
                  onChanged: (selected) {
                    setState(() {
                      if (selected == true) {
                        _selectedSymptoms.add(symptom);
                      } else {
                        _selectedSymptoms.remove(symptom);
                      }
                    });
                  },
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildResultScreen() {
    Color getResultColor() {
      switch (_urgencyResult) {
        case 'Emergency': return AppColors.destructive;
        case 'Urgent': return AppColors.accent;
        case 'Routine': return AppColors.secondary;
        default: return AppColors.primary;
      }
    }

    String getAdvice() {
      switch (_urgencyResult) {
        case 'Emergency': return 'Immediate veterinary assistance required. A case has been logged for the nearest available vet.';
        case 'Urgent': return 'A Community Animal Health Worker (CAHW) has been notified and will be dispatched.';
        case 'Routine': return 'Please rest the animal and ensure hydration. Monitor for 24 hours.';
        default: return 'No severe symptoms detected. Keep observing the animal casually. Case logged.';
      }
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Assessment Result')),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(_urgencyResult == 'Emergency' ? Icons.warning_amber_rounded : Icons.check_circle_outline, size: 80, color: getResultColor()),
              const SizedBox(height: 16),
              Text('Urgency: $_urgencyResult', style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold, color: getResultColor())),
              const SizedBox(height: 16),
              Text(getAdvice(), textAlign: TextAlign.center, style: Theme.of(context).textTheme.bodyLarge),
              const SizedBox(height: 32),
              FilledButton(onPressed: () => Navigator.of(context).pop(), child: const Text('Return to Dashboard'))
            ],
          ),
        ),
      ),
    );
  }
}
