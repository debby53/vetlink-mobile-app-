import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../theme/app_colors.dart';
import '../../widgets/app_drawer.dart';
import '../../services/api_client.dart';
import '../../models/models.dart';
import '../../services/session_store.dart';

class FarmerAnimalsScreen extends StatefulWidget {
  const FarmerAnimalsScreen({super.key});

  @override
  State<FarmerAnimalsScreen> createState() => _FarmerAnimalsScreenState();
}

class _FarmerAnimalsScreenState extends State<FarmerAnimalsScreen> {
  late Future<List<AnimalDTO>> _animalsFuture;

  @override
  void initState() {
    super.initState();
    _loadAnimals();
  }

  void _loadAnimals() async {
    final session = await SessionStore().get();
    final client = ApiClient(baseUrl: defaultApiBase, token: session?.token);
    setState(() {
      _animalsFuture = client.getAnimalsByFarmer(session?.userId ?? 0);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Animals')),
      drawer: const AppDrawer(),
      floatingActionButton: FloatingActionButton(
        backgroundColor: AppColors.primary,
        onPressed: () => context.push('/farmer/animals/add').then((_) => _loadAnimals()),
        child: const Icon(Icons.add, color: Colors.white),
      ),
      body: FutureBuilder<List<AnimalDTO>>(
        future: _animalsFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
             return Center(child: Text('Error loading animals:\n${snapshot.error}', textAlign: TextAlign.center, style: const TextStyle(color: AppColors.destructive)));
          }

          final animals = snapshot.data ?? [];
          if (animals.isEmpty) {
             return const Center(child: Text('No animals registered yet.\nClick + to add your first animal.', textAlign: TextAlign.center, style: TextStyle(color: AppColors.textMuted)));
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: animals.length,
            itemBuilder: (context, index) {
              final animal = animals[index];
              return Card(
                margin: const EdgeInsets.only(bottom: 16),
                child: ListTile(
                  contentPadding: const EdgeInsets.all(16),
                  leading: CircleAvatar(
                    backgroundColor: AppColors.primary.withValues(alpha: 0.1),
                    child: const Icon(Icons.pets, color: AppColors.primary),
                  ),
                  title: Text('${animal.name} (${animal.type})', style: const TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: Text('Status: ${animal.healthStatus} | Age: ${animal.age} yrs | ${animal.breed}'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () {},
                ),
              );
            },
          );
        },
      ),
    );
  }
}
