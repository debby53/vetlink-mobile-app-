import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'services/session_store.dart';

import 'screens/splash_screen.dart';
import 'screens/landing_screen.dart';
import 'screens/auth/login_screen.dart';
import 'screens/auth/signup_screen.dart';
import 'screens/auth/forgot_password_screen.dart';

import 'screens/farmer/farmer_dashboard.dart';
import 'screens/farmer/health_assessment_screen.dart';
import 'screens/farmer/request_vet_screen.dart';
import 'screens/farmer/farmer_animals_screen.dart';
import 'screens/farmer/farmer_add_animal_screen.dart';

import 'screens/cahw/cahw_dashboard.dart';
import 'screens/cahw/cahw_case_detail_screen.dart';
import 'screens/cahw/nearby_cases_map_screen.dart';
import 'screens/cahw/cahw_courses_screen.dart';

import 'screens/shared/ration_calculator_screen.dart';
import 'screens/shared/marketplace_screen.dart';
import 'screens/shared/settings_screen.dart';

import 'screens/vet/vet_dashboard.dart';
import 'screens/vet/emergency_case_screen.dart';
import 'screens/vet/supervision_screen.dart';
import 'screens/vet/vet_patients_screen.dart';
import 'screens/vet/vet_treatment_plans_screen.dart';
import 'screens/vet/vet_training_upload_screen.dart';

import 'screens/admin/admin_dashboard.dart';
import 'screens/admin/admin_users_screen.dart';

final GlobalKey<NavigatorState> _rootNavigatorKey = GlobalKey<NavigatorState>();

final GoRouter appRouter = GoRouter(
  navigatorKey: _rootNavigatorKey,
  initialLocation: '/',
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const SplashScreen(),
    ),
    GoRoute(
      path: '/landing',
      builder: (context, state) => const LandingScreen(),
    ),
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginScreen(),
    ),
    GoRoute(
      path: '/signup',
      builder: (context, state) => const SignupScreen(),
    ),
    GoRoute(
      path: '/forgot-password',
      builder: (context, state) => const ForgotPasswordScreen(),
    ),
    
    // Farmer Routes
    GoRoute(
      path: '/farmer',
      builder: (context, state) {
        final session = state.extra as UserSession?;
        return FarmerDashboard(session: session ?? UserSession(token: '', role: 'farmer', name: 'Farmer', email: '', userId: 0));
      },
      routes: [
        GoRoute(
          path: 'health-assessment',
          builder: (context, state) => const HealthAssessmentScreen(),
        ),
        GoRoute(
          path: 'request-vet',
          builder: (context, state) => const RequestVetScreen(),
        ),
        GoRoute(
          path: 'animals',
          builder: (context, state) => const FarmerAnimalsScreen(),
          routes: [
            GoRoute(
              path: 'add',
              builder: (context, state) => const FarmerAddAnimalScreen(),
            ),
          ]
        ),
      ]
    ),

    // CAHW Routes
    GoRoute(
      path: '/cahw',
      builder: (context, state) {
        final session = state.extra as UserSession?;
        return CahwDashboard(session: session ?? UserSession(token: '', role: 'cahw', name: 'Worker', email: '', userId: 0));
      },
      routes: [
        GoRoute(
          path: 'case/:id',
          builder: (context, state) => CahwCaseDetailScreen(orderId: state.pathParameters['id'] ?? 'Unknown'),
        ),
        GoRoute(
          path: 'nearby-cases',
          builder: (context, state) => const NearbyCasesMapScreen(),
        ),
        GoRoute(
          path: 'training',
          builder: (context, state) => const CahwCoursesScreen(),
        )
      ]
    ),

    // Vet Routes
    GoRoute(
      path: '/vet',
      builder: (context, state) {
        final session = state.extra as UserSession?;
         return VetDashboard(session: session ?? UserSession(token: '', role: 'veterinarian', name: 'Vet', email: '', userId: 0));
      },
      routes: [
         GoRoute(
          path: 'emergency',
          builder: (context, state) => const EmergencyCaseScreen(),
        ),
        GoRoute(
          path: 'supervision',
          builder: (context, state) => const SupervisionScreen(),
        ),
        GoRoute(
          path: 'patients',
          builder: (context, state) => const VetPatientsScreen(),
        ),
        GoRoute(
          path: 'treatment-plans',
          builder: (context, state) => const VetTreatmentPlansScreen(),
        ),
        GoRoute(
          path: 'training-upload',
          builder: (context, state) => const VetTrainingUploadScreen(),
        ),
      ]
    ),
    // Admin Routes
    GoRoute(
      path: '/admin',
      builder: (context, state) {
         final session = state.extra as UserSession?;
         return AdminDashboard(session: session ?? UserSession(token: '', role: 'admin', name: 'Admin', email: '', userId: 0));
      },
      routes: [
         GoRoute(
           path: 'users',
           builder: (context, state) => const AdminUsersScreen(),
         ),
      ]
    ),
    // Shared Routes
    GoRoute(
      path: '/shared/rations',
      builder: (context, state) => const RationCalculatorScreen(),
    ),
    GoRoute(
      path: '/shared/market',
      builder: (context, state) => const MarketplaceScreen(),
    ),
    GoRoute(
      path: '/shared/settings',
      builder: (context, state) => const SettingsScreen(),
    ),
  ],
);
