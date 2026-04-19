import 'package:flutter/material.dart';
import '../../services/api_client.dart';
import '../../services/session_store.dart';
import '../../theme/app_colors.dart';
import 'package:go_router/go_router.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
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
    if (!_formKey.currentState!.validate()) return;
    
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final email = _emailController.text;
      final password = _passwordController.text;
      final role = _role;

      final Map<String, dynamic> authResponse = await ApiClient(baseUrl: defaultApiBase).login(email, password, role);

      // Validate Token presence from DB
      if (!authResponse.containsKey('token')) {
        throw Exception('Server rejected login or returned invalid architecture.');
      }
      
      final session = UserSession(
        token: authResponse['token'],
        role: (authResponse['role'] ?? authResponse['user']?['role'] ?? role).toString(),
        name: (authResponse['name'] ?? authResponse['user']?['name'] ?? 'User').toString(),
        email: email,
        userId: (authResponse['id'] ?? authResponse['user']?['id'] ?? 0) is int
            ? (authResponse['id'] ?? authResponse['user']?['id'] ?? 0) as int
            : int.tryParse((authResponse['id'] ?? authResponse['user']?['id'] ?? '0').toString()) ?? 0,
      );
      
      await SessionStore().save(
        token: session.token,
        role: session.role,
        name: session.name,
        email: session.email,
        userId: session.userId,
      );

      if (!mounted) return;
      
      // Route back to Splash matching to decide dashboard
      context.go('/');
    } catch (e) {
      if (mounted) {
        setState(() => _error = e.toString().replaceFirst('Exception: ', ''));
      }
    } finally {
      if (mounted) {
        setState(() => _loading = false);
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
              padding: const EdgeInsets.all(24),
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 400),
                child: Card(
                  elevation: 2,
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Form(
                      key: _formKey,
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          Icon(Icons.pets, size: 48, color: AppColors.primary),
                          const SizedBox(height: 16),
                          Text(
                            'VetLink',
                            textAlign: TextAlign.center,
                            style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                                  fontWeight: FontWeight.w800,
                                  color: AppColors.primary,
                                ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Digital Animal Welfare Platform',
                            textAlign: TextAlign.center,
                            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                  color: AppColors.textMuted,
                                ),
                          ),
                          const SizedBox(height: 32),
                          TextFormField(
                            controller: _emailController,
                            keyboardType: TextInputType.emailAddress,
                            decoration: const InputDecoration(labelText: 'Email Address'),
                            validator: (value) => (value == null || value.trim().isEmpty) ? 'Email is required' : null,
                          ),
                          const SizedBox(height: 16),
                          TextFormField(
                            controller: _passwordController,
                            obscureText: true,
                            decoration: const InputDecoration(labelText: 'Password'),
                            validator: (value) => (value == null || value.isEmpty) ? 'Password is required' : null,
                          ),
                          const SizedBox(height: 16),
                          DropdownButtonFormField<String>(
                            initialValue: _role,
                            decoration: const InputDecoration(labelText: 'Select Role'),
                            items: const [
                              DropdownMenuItem(value: 'farmer', child: Text('Farmer')),
                              DropdownMenuItem(value: 'cahw', child: Text('Community Health Worker')),
                              DropdownMenuItem(value: 'veterinarian', child: Text('Veterinarian')),
                            ],
                            onChanged: (value) => setState(() => _role = value ?? _role),
                          ),
                          if (_error != null) ...[
                            const SizedBox(height: 16),
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: AppColors.destructive.withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                _error!,
                                style: const TextStyle(color: AppColors.destructive, fontWeight: FontWeight.w500),
                                textAlign: TextAlign.center,
                              ),
                            ),
                          ],
                          const SizedBox(height: 24),
                          FilledButton(
                            onPressed: _loading ? null : _submit,
                            child: _loading
                                ? const SizedBox(
                                    width: 24, height: 24,
                                    child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                                  )
                                : const Text('Sign In', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                          ),
                          const SizedBox(height: 16),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              TextButton(
                                onPressed: () => context.go('/forgot-password'), 
                                child: const Text('Forgot Password?')
                              ),
                              TextButton(
                                onPressed: () => context.go('/signup'), 
                                child: const Text('Create Account')
                              ),
                            ],
                          )
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
