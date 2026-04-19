import 'package:flutter/material.dart';
import '../services/session_store.dart';
import 'package:go_router/go_router.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final session = await SessionStore().get();
    if (!mounted) return;

    if (session == null) {
      context.go('/login');
      return;
    }

    if (session.role == 'farmer') {
      context.go('/farmer', extra: session);
    } else if (session.role == 'cahw') {
      context.go('/cahw', extra: session);
    } else if (session.role == 'veterinarian') {
       context.go('/vet', extra: session);
    } else if (session.role == 'admin') {
       context.go('/admin', extra: session);
    } else {
       context.go('/landing');
    }
  }

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(child: CircularProgressIndicator()),
    );
  }
}
