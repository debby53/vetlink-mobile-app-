import 'package:flutter/material.dart';
import 'theme/app_theme.dart';
import 'routes.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const VetLinkMobileApp());
}

class VetLinkMobileApp extends StatelessWidget {
  const VetLinkMobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      debugShowCheckedModeBanner: false,
      title: 'VetLink',
      theme: AppTheme.lightTheme,
      routerConfig: appRouter,
    );
  }
}
