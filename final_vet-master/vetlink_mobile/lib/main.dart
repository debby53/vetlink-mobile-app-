import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';

const String defaultApiBase = String.fromEnvironment(
  'API_BASE',
  defaultValue: 'http://10.0.2.2:8080/api',
);

void main() {
  runApp(const VetLinkMobileApp());
}

class VetLinkMobileApp extends StatelessWidget {
  const VetLinkMobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    final colorScheme = ColorScheme.fromSeed(
      seedColor: const Color(0xFF10B981),
      brightness: Brightness.light,
      primary: const Color(0xFF10B981),
      secondary: const Color(0xFF0EA5E9),
    );

    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'VetLink Mobile',
      theme: ThemeData(
        colorScheme: colorScheme,
        useMaterial3: true,
        scaffoldBackgroundColor: const Color(0xFFF5F7FA),
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.white,
          foregroundColor: Color(0xFF222222),
          elevation: 0,
        ),
        cardTheme: CardThemeData(
          color: Colors.white,
          margin: const EdgeInsets.symmetric(vertical: 6),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
        ),
      ),
      home: const SplashPage(),
    );
  }
}

class ApiClient {
  ApiClient({required this.baseUrl, this.token});

  final String baseUrl;
  final String? token;

  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
    required String role,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'email': email.trim(),
        'password': password,
        'role': role,
      }),
    );
    return _decode(response);
  }

  Future<List<dynamic>> getCases() async {
    final response = await http.get(
      Uri.parse('$baseUrl/cases'),
      headers: _authHeaders(),
    );
    final decoded = _decode(response);
    if (decoded is List<dynamic>) {
      return decoded;
    }
    return <dynamic>[];
  }

  Future<List<dynamic>> getAnimals() async {
    final response = await http.get(
      Uri.parse('$baseUrl/animals'),
      headers: _authHeaders(),
    );
    final decoded = _decode(response);
    if (decoded is List<dynamic>) {
      return decoded;
    }
    return <dynamic>[];
  }

  Map<String, String> _authHeaders() {
    return {
      'Content-Type': 'application/json',
      if (token != null && token!.isNotEmpty) 'Authorization': 'Bearer $token',
    };
  }

  dynamic _decode(http.Response response) {
    dynamic decoded;
    try {
      decoded = jsonDecode(response.body);
    } catch (_) {
      decoded = {'message': response.body};
    }

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return decoded;
    }
    if (decoded is Map<String, dynamic>) {
      throw Exception(decoded['message'] ?? 'Request failed');
    }
    throw Exception('Request failed (${response.statusCode})');
  }
}

class SessionStore {
  static const _kToken = 'vetlink_token';
  static const _kRole = 'vetlink_role';
  static const _kName = 'vetlink_name';
  static const _kEmail = 'vetlink_email';
  static const _kUserId = 'vetlink_user_id';

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

class SplashPage extends StatefulWidget {
  const SplashPage({super.key});

  @override
  State<SplashPage> createState() => _SplashPageState();
}

class _SplashPageState extends State<SplashPage> {
  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final session = await SessionStore().get();
    if (!mounted) {
      return;
    }
    if (session == null) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const LoginPage()),
      );
      return;
    }
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(
        builder: (_) => HomePage(session: session),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(child: CircularProgressIndicator()),
    );
  }
}

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  String _role = 'farmer';
  bool _loading = false;
  String? _error;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final response = await ApiClient(baseUrl: defaultApiBase).login(
        email: _emailController.text,
        password: _passwordController.text,
        role: _role,
      );

      final token = (response['token'] ?? '').toString();
      if (token.isEmpty) {
        throw Exception('Token missing in response');
      }
      final session = UserSession(
        token: token,
        role: (response['role'] ?? _role).toString(),
        name: (response['name'] ?? 'User').toString(),
        email: (response['email'] ?? _emailController.text).toString(),
        userId: (response['id'] is int)
            ? response['id'] as int
            : int.tryParse((response['id'] ?? '0').toString()) ?? 0,
      );
      await SessionStore().save(
        token: session.token,
        role: session.role,
        name: session.name,
        email: session.email,
        userId: session.userId,
      );

      if (!mounted) {
        return;
      }
      Navigator.of(
        context,
      ).pushReplacement(MaterialPageRoute(builder: (_) => HomePage(session: session)));
    } catch (e) {
      setState(() {
        _error = e.toString().replaceFirst('Exception: ', '');
      });
    } finally {
      if (mounted) {
        setState(() {
          _loading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              colors: [Color(0xFFEFFDF8), Color(0xFFF4FBFF)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 460),
                child: Card(
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Form(
                      key: _formKey,
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          Text(
                            'VetLink Mobile',
                            textAlign: TextAlign.center,
                            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                                  fontWeight: FontWeight.w700,
                                ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Sign in with your existing backend account',
                            textAlign: TextAlign.center,
                            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                  color: Colors.black54,
                                ),
                          ),
                          const SizedBox(height: 20),
                          TextFormField(
                            controller: _emailController,
                            keyboardType: TextInputType.emailAddress,
                            decoration: const InputDecoration(
                              labelText: 'Email',
                              border: OutlineInputBorder(),
                            ),
                            validator: (value) {
                              if (value == null || value.trim().isEmpty) {
                                return 'Email is required';
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: 12),
                          TextFormField(
                            controller: _passwordController,
                            obscureText: true,
                            decoration: const InputDecoration(
                              labelText: 'Password',
                              border: OutlineInputBorder(),
                            ),
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return 'Password is required';
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: 12),
                          DropdownButtonFormField<String>(
                            initialValue: _role,
                            decoration: const InputDecoration(
                              labelText: 'Role',
                              border: OutlineInputBorder(),
                            ),
                            items: const [
                              DropdownMenuItem(value: 'farmer', child: Text('Farmer')),
                              DropdownMenuItem(
                                value: 'veterinarian',
                                child: Text('Veterinarian'),
                              ),
                              DropdownMenuItem(value: 'cahw', child: Text('CAHW')),
                              DropdownMenuItem(value: 'admin', child: Text('Admin')),
                            ],
                            onChanged: (value) {
                              if (value != null) {
                                setState(() {
                                  _role = value;
                                });
                              }
                            },
                          ),
                          if (_error != null) ...[
                            const SizedBox(height: 10),
                            Text(
                              _error!,
                              style: const TextStyle(color: Colors.red),
                              textAlign: TextAlign.center,
                            ),
                          ],
                          const SizedBox(height: 18),
                          FilledButton(
                            onPressed: _loading ? null : _submit,
                            child: _loading
                                ? const SizedBox(
                                    width: 20,
                                    height: 20,
                                    child: CircularProgressIndicator(strokeWidth: 2),
                                  )
                                : const Text('Sign In'),
                          ),
                          const SizedBox(height: 10),
                          Text(
                            'API: $defaultApiBase',
                            textAlign: TextAlign.center,
                            style: const TextStyle(fontSize: 12, color: Colors.black54),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class HomePage extends StatefulWidget {
  const HomePage({super.key, required this.session});

  final UserSession session;

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  late final ApiClient _api;
  bool _loading = true;
  String? _error;
  List<dynamic> _cases = <dynamic>[];
  List<dynamic> _animals = <dynamic>[];

  @override
  void initState() {
    super.initState();
    _api = ApiClient(baseUrl: defaultApiBase, token: widget.session.token);
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final responses = await Future.wait<dynamic>([
        _api.getCases(),
        _api.getAnimals(),
      ]);
      if (!mounted) {
        return;
      }
      setState(() {
        _cases = responses[0] as List<dynamic>;
        _animals = responses[1] as List<dynamic>;
      });
    } catch (e) {
      if (!mounted) {
        return;
      }
      setState(() {
        _error = e.toString().replaceFirst('Exception: ', '');
      });
    } finally {
      if (mounted) {
        setState(() {
          _loading = false;
        });
      }
    }
  }

  Future<void> _logout() async {
    await SessionStore().clear();
    if (!mounted) {
      return;
    }
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => const LoginPage()),
      (route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    final roleTitle = widget.session.role.toUpperCase();

    return Scaffold(
      appBar: AppBar(
        title: Text('$roleTitle Dashboard'),
        actions: [
          IconButton(
            tooltip: 'Refresh',
            onPressed: _load,
            icon: const Icon(Icons.refresh),
          ),
          IconButton(
            tooltip: 'Logout',
            onPressed: _logout,
            icon: const Icon(Icons.logout),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _load,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            _TopProfileCard(session: widget.session),
            const SizedBox(height: 12),
            if (_loading) const LinearProgressIndicator(),
            if (_error != null) ...[
              const SizedBox(height: 12),
              Text(
                _error!,
                style: const TextStyle(color: Colors.red),
              ),
            ],
            const SizedBox(height: 12),
            _MetricRow(
              title: 'Cases',
              value: _cases.length.toString(),
              icon: Icons.medical_services_outlined,
              color: const Color(0xFF10B981),
            ),
            _MetricRow(
              title: 'Animals',
              value: _animals.length.toString(),
              icon: Icons.pets_outlined,
              color: const Color(0xFF0EA5E9),
            ),
            const SizedBox(height: 12),
            Text(
              'Recent Cases',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
            ),
            const SizedBox(height: 6),
            if (_cases.isEmpty && !_loading)
              const Card(child: ListTile(title: Text('No cases found'))),
            ..._cases.take(8).map((caseItem) {
              final map = caseItem is Map<String, dynamic>
                  ? caseItem
                  : Map<String, dynamic>.from(caseItem as Map);
              return Card(
                child: ListTile(
                  title: Text((map['title'] ?? 'Untitled case').toString()),
                  subtitle: Text(
                    [
                      'Status: ${(map['status'] ?? 'unknown').toString()}',
                      if (map['createdAt'] != null)
                        'Created: ${_formatDate((map['createdAt']).toString())}',
                    ].join(' | '),
                  ),
                ),
              );
            }),
          ],
        ),
      ),
    );
  }

  String _formatDate(String input) {
    try {
      final dt = DateTime.parse(input).toLocal();
      return DateFormat('dd MMM yyyy').format(dt);
    } catch (_) {
      return input;
    }
  }
}

class _TopProfileCard extends StatelessWidget {
  const _TopProfileCard({required this.session});

  final UserSession session;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            CircleAvatar(
              radius: 24,
              backgroundColor: const Color(0xFFE6FBF4),
              child: Text(
                session.name.isNotEmpty ? session.name[0].toUpperCase() : 'U',
                style: const TextStyle(
                  color: Color(0xFF0B8A61),
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    session.name,
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w700,
                        ),
                  ),
                  Text(
                    session.email,
                    style: const TextStyle(color: Colors.black54),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _MetricRow extends StatelessWidget {
  const _MetricRow({
    required this.title,
    required this.value,
    required this.icon,
    required this.color,
  });

  final String title;
  final String value;
  final IconData icon;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: color.withValues(alpha: 0.14),
          child: Icon(icon, color: color),
        ),
        title: Text(title),
        trailing: Text(
          value,
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.w700,
              ),
        ),
      ),
    );
  }
}
