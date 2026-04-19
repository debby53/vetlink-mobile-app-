import 'package:flutter/material.dart';
import 'theme/app_theme.dart';
import 'routes.dart';

import 'services/language_provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await languageProvider.init();
  runApp(const VetLinkMobileApp());
}

class VetLinkMobileApp extends StatelessWidget {
  const VetLinkMobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: languageProvider,
      builder: (context, _) {
        return MaterialApp.router(
          debugShowCheckedModeBanner: false,
          title: 'VetLink',
          theme: AppTheme.lightTheme,
          routerConfig: appRouter,
        );
      }
    );
  }
}
