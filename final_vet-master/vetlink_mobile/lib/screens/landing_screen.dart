import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../theme/app_colors.dart';

class LandingScreen extends StatelessWidget {
  const LandingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Row(
          children: [
            Image.asset('assets/logo.png', height: 32, errorBuilder: (c,e,s) => const Icon(Icons.pets, color: AppColors.primary)),
            const SizedBox(width: 8),
            const Text('VetLink', style: TextStyle(color: AppColors.textMain, fontWeight: FontWeight.w800, fontSize: 24)),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => context.push('/login'),
            child: const Text('Log in', style: TextStyle(color: AppColors.textMain, fontWeight: FontWeight.bold)),
          ),
          Padding(
            padding: const EdgeInsets.only(right: 16.0, left: 8.0),
            child: FilledButton(
              onPressed: () => context.push('/signup'),
              style: FilledButton.styleFrom(visualDensity: VisualDensity.compact),
              child: const Text('Get Started'),
            ),
          )
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            _buildHeroSection(context),
            _buildFeaturesSection(context),
            _buildStatsSection(context),
          ],
        ),
      ),
    );
  }

  Widget _buildHeroSection(BuildContext context) {
    return Container(
      width: double.infinity,
      color: AppColors.primary,
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 48),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: Colors.white.withValues(alpha: 0.3)),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(width: 8, height: 8, decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle)),
                const SizedBox(width: 8),
                const Text('Transforming Animal Health', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
              ],
            ),
          ),
          const SizedBox(height: 24),
          const Text(
            'Accessible Animal\nHealthcare For\nEvery Farmer',
            style: TextStyle(color: Colors.white, fontSize: 40, fontWeight: FontWeight.w900, height: 1.1),
          ),
          const SizedBox(height: 16),
          const Text(
            'Connect with certified veterinarians, get rapid AI-driven diagnostics, and manage your farm\'s health records all in one place.',
            style: TextStyle(color: Colors.white70, fontSize: 16),
          ),
          const SizedBox(height: 32),
          SizedBox(
            width: double.infinity,
            child: FilledButton(
              onPressed: () => context.push('/signup'),
              style: FilledButton.styleFrom(backgroundColor: Colors.white, foregroundColor: AppColors.primary, padding: const EdgeInsets.all(16)),
              child: const Text('Get Started Now →', style: TextStyle(fontSize: 18)),
            ),
          ),
          const SizedBox(height: 16),
           SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: () => context.push('/login'),
              style: OutlinedButton.styleFrom(
                side: BorderSide(color: Colors.white.withValues(alpha: 0.3), width: 2),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.all(16)
              ),
              icon: const Icon(Icons.phone),
              label: const Text('Dial *789# USSD', style: TextStyle(fontSize: 18)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFeaturesSection(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 48, horizontal: 24),
      child: Column(
        children: [
          const Text('Everything you need to succeed', style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: AppColors.textMain), textAlign: TextAlign.center),
          const SizedBox(height: 32),
          _featureCard(Icons.message, 'Direct Advice', 'Chat directly with certified veterinarians for quick advice.'),
          const SizedBox(height: 16),
          _featureCard(Icons.smartphone, 'Offline Ready', 'Access our USSD format anytime without data.'),
          const SizedBox(height: 16),
          _featureCard(Icons.file_copy, 'Digital Records', 'Maintain complete health records for all your livestock.'),
        ],
      ),
    );
  }

  Widget _featureCard(IconData icon, String title, String desc) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: AppColors.primary.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
            child: Icon(icon, color: AppColors.primary, size: 28),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: AppColors.textMain)),
                const SizedBox(height: 4),
                Text(desc, style: const TextStyle(color: AppColors.textMuted)),
              ],
            ),
          )
        ],
      ),
    );
  }

  Widget _buildStatsSection(BuildContext context) {
    return Container(
      width: double.infinity,
      color: AppColors.primary,
      padding: const EdgeInsets.symmetric(vertical: 48, horizontal: 24),
      child: const Column(
        children: [
          _Stat(value: '10,000+', label: 'FARMERS SERVED'),
          SizedBox(height: 24),
          _Stat(value: '500+', label: 'CERTIFIED VETS'),
          SizedBox(height: 24),
          _Stat(value: '98%', label: 'SATISFACTION'),
        ],
      ),
    );
  }
}

class _Stat extends StatelessWidget {
  final String value;
  final String label;

  const _Stat({required this.value, required this.label});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(value, style: const TextStyle(fontSize: 48, fontWeight: FontWeight.w900, color: Colors.white)),
        Text(label, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white70, letterSpacing: 1.5)),
      ],
    );
  }
}
