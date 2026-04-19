import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import '../../services/language_provider.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  void _showLanguagePicker(BuildContext context) {
    showModalBottomSheet(
      context: context,
      builder: (context) {
        return ListenableBuilder(
          listenable: languageProvider,
          builder: (context, _) {
            final currentLang = languageProvider.currentLanguage;
            return SafeArea(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  ListTile(
                    title: const Text('English'),
                    trailing: currentLang == 'en' ? const Icon(Icons.check, color: AppColors.primary) : null,
                    onTap: () {
                      languageProvider.setLanguage('en');
                      Navigator.pop(context);
                    },
                  ),
                  ListTile(
                    title: const Text('Français'),
                    trailing: currentLang == 'fr' ? const Icon(Icons.check, color: AppColors.primary) : null,
                    onTap: () {
                      languageProvider.setLanguage('fr');
                      Navigator.pop(context);
                    },
                  ),
                  ListTile(
                    title: const Text('Kinyarwanda'),
                    trailing: currentLang == 'rw' ? const Icon(Icons.check, color: AppColors.primary) : null,
                    onTap: () {
                      languageProvider.setLanguage('rw');
                      Navigator.pop(context);
                    },
                  ),
                ],
              ),
            );
          }
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(languageProvider.t('settings'))),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
           Text(languageProvider.t('preferences'), style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary)),
           const SizedBox(height: 8),
           SwitchListTile(
             title: Text(languageProvider.t('push_notifications')),
             subtitle: Text(languageProvider.t('receive_alerts')),
             value: true,
             onChanged: (v) {},
           ),
           SwitchListTile(
             title: Text(languageProvider.t('dark_mode')),
             subtitle: Text(languageProvider.t('toggle_system_theme')),
             value: false,
             onChanged: (v) {},
           ),
           const Divider(),
           Text(languageProvider.t('account'), style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary)),
           const SizedBox(height: 8),
           ListTile(
             leading: const Icon(Icons.language),
             title: Text(languageProvider.t('language')),
             trailing: Text(
               languageProvider.currentLanguage == 'en' ? 'English' 
               : languageProvider.currentLanguage == 'fr' ? 'Français' 
               : 'Kinyarwanda', 
               style: const TextStyle(color: AppColors.textMuted)
             ),
             onTap: () => _showLanguagePicker(context),
           ),
           ListTile(
             leading: const Icon(Icons.lock),
             title: Text(languageProvider.t('change_password')),
             trailing: const Icon(Icons.chevron_right),
             onTap: () {},
           ),
            ListTile(
             leading: const Icon(Icons.help),
             title: Text(languageProvider.t('help_support')),
             trailing: const Icon(Icons.chevron_right),
             onTap: () {},
           ),
        ],
      ),
    );
  }
}
