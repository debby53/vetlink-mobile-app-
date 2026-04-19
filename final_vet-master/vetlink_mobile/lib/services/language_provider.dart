import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../l10n/app_translations.dart';

class LanguageProvider extends ChangeNotifier {
  static const String _langKey = 'selected_language';
  String _currentLanguage = 'en'; // default english
  
  String get currentLanguage => _currentLanguage;

  Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    _currentLanguage = prefs.getString(_langKey) ?? 'en';
    notifyListeners();
  }

  Future<void> setLanguage(String langCode) async {
    if (_currentLanguage == langCode) return;
    _currentLanguage = langCode;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_langKey, langCode);
    notifyListeners();
  }

  // Helper method for translations
  String t(String key) {
    return AppTranslations.strings[_currentLanguage]?[key] ?? key;
  }
}

// Global instance for simple access outside contexts 
final languageProvider = LanguageProvider();
