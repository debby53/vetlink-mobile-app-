import 'package:shared_preferences/shared_preferences.dart';

class UserSession {
  const UserSession({
    required this.token,
    required this.role,
    required this.name,
    required this.email,
    required this.userId,
  });

  final String token;
  final String role;
  final String name;
  final String email;
  final int userId;
}

class SessionStore {
  static const _kToken = 'vetlink_token';
  static const _kRole = 'vetlink_role';
  static const _kName = 'vetlink_name';
  static const _kEmail = 'vetlink_email';
  static const _kUserId = 'vetlink_user_id';

  static final SessionStore _instance = SessionStore._internal();
  factory SessionStore() => _instance;
  SessionStore._internal();

  Future<void> save({
    required String token,
    required String role,
    required String name,
    required String email,
    required int userId,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_kToken, token);
    await prefs.setString(_kRole, role);
    await prefs.setString(_kName, name);
    await prefs.setString(_kEmail, email);
    await prefs.setInt(_kUserId, userId);
  }

  Future<UserSession?> get() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString(_kToken);
    final role = prefs.getString(_kRole);
    if (token == null || role == null) {
      return null;
    }
    return UserSession(
      token: token,
      role: role,
      name: prefs.getString(_kName) ?? 'User',
      email: prefs.getString(_kEmail) ?? '',
      userId: prefs.getInt(_kUserId) ?? 0,
    );
  }

  Future<void> clear() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_kToken);
    await prefs.remove(_kRole);
    await prefs.remove(_kName);
    await prefs.remove(_kEmail);
    await prefs.remove(_kUserId);
  }
}
