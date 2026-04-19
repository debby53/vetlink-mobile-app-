import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import '../../widgets/app_drawer.dart';

class MarketplaceScreen extends StatelessWidget {
  const MarketplaceScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Marketplace')),
      drawer: const AppDrawer(),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
               decoration: InputDecoration(
                 hintText: 'Search feed, medicine, tools...',
                 prefixIcon: const Icon(Icons.search),
                 filled: true,
                 fillColor: Colors.grey.shade100,
                 border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none)
               ),
            ),
          ),
          Expanded(
            child: GridView.builder(
              padding: const EdgeInsets.all(16),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 16,
                mainAxisSpacing: 16,
                childAspectRatio: 0.75,
              ),
              itemCount: 4,
              itemBuilder: (context, index) {
                final products = ['Dairy Meal 50kg', 'Dewormer 100ml', 'Mineral Block', 'Poultry Feed 25kg'];
                final prices = ['\$45.00', '\$12.50', '\$8.00', '\$22.00'];
                
                return Card(
                  clipBehavior: Clip.antiAlias,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Expanded(
                        child: Container(
                          color: AppColors.primary.withValues(alpha: 0.1),
                          child: const Icon(Icons.shopping_bag, size: 64, color: AppColors.primary),
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(12),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(products[index], style: const TextStyle(fontWeight: FontWeight.bold), maxLines: 2),
                            const SizedBox(height: 4),
                            Text(prices[index], style: const TextStyle(color: AppColors.secondary, fontWeight: FontWeight.bold)),
                            const SizedBox(height: 8),
                            SizedBox(
                              width: double.infinity,
                              child: FilledButton(
                                onPressed: () {
                                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Added to cart!')));
                                },
                                child: const Text('Buy'),
                              ),
                            )
                          ],
                        ),
                      )
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
