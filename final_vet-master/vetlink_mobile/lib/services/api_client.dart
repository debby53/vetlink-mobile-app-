import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/models.dart';

const String defaultApiBase = String.fromEnvironment(
  'API_BASE',
  defaultValue: 'http://10.0.2.2:8080/api', // Default android emulator local host
);

class ApiClient {
  ApiClient({required this.baseUrl, this.token});

  final String baseUrl;
  final String? token;

  Map<String, String> _headers() => {
        'Content-Type': 'application/json',
        if (token != null && token!.isNotEmpty) 'Authorization': 'Bearer $token',
      };

  dynamic _handleResponse(http.Response res) {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      if (res.body.isEmpty) return null;
      return jsonDecode(res.body);
    }
    throw Exception('API Error ${res.statusCode}: ${res.body}');
  }

  // ============ AUTHENTICATION ============

  Future<Map<String, dynamic>> login(String email, String password, String role) async {
    final res = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email.trim(), 'password': password, 'role': role}),
    );
    return _handleResponse(res);
  }

  Future<Map<String, dynamic>> signup(String name, String email, String password, String role, {int? locationId}) async {
    final res = await http.post(
      Uri.parse('$baseUrl/auth/signup'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'name': name, 'email': email.trim(), 'password': password, 'role': role, 'locationId': locationId}),
    );
    return _handleResponse(res);
  }

  // ============ USER/FARMER MANAGEMENT ============
  Future<UserDTO> getUserById(int id) async {
    final res = await http.get(Uri.parse('$baseUrl/users/$id'), headers: _headers());
    return UserDTO.fromJson(_handleResponse(res));
  }

  Future<List<UserDTO>> getActiveUsers() async {
    final res = await http.get(Uri.parse('$baseUrl/users/active'), headers: _headers());
    final list = _handleResponse(res) as List;
    return list.map((e) => UserDTO.fromJson(e)).toList();
  }
  
  // ============ CASE MANAGEMENT ============
  Future<CaseDTO> createCase(CaseDTO data) async {
    final res = await http.post(
      Uri.parse('$baseUrl/cases'),
      headers: _headers(),
      body: jsonEncode(data.toJson()),
    );
    return CaseDTO.fromJson(_handleResponse(res));
  }

  Future<List<CaseDTO>> getCasesByFarmer(int farmerId) async {
    final res = await http.get(Uri.parse('$baseUrl/cases/farmer/$farmerId'), headers: _headers());
    final list = _handleResponse(res) as List;
    return list.map((e) => CaseDTO.fromJson(e)).toList();
  }

  Future<List<CaseDTO>> getCasesByVet(int vetId) async {
    final res = await http.get(Uri.parse('$baseUrl/cases/veterinarian/$vetId'), headers: _headers());
    final list = _handleResponse(res) as List;
    return list.map((e) => CaseDTO.fromJson(e)).toList();
  }
  
  Future<List<CaseDTO>> getCasesByCAHW(int cahwId) async {
    final res = await http.get(Uri.parse('$baseUrl/cases/cahw/$cahwId'), headers: _headers());
    final list = _handleResponse(res) as List;
    return list.map((e) => CaseDTO.fromJson(e)).toList();
  }

  Future<List<CaseDTO>> getAllCases() async {
    final res = await http.get(Uri.parse('$baseUrl/cases'), headers: _headers());
    final list = _handleResponse(res) as List;
    return list.map((e) => CaseDTO.fromJson(e)).toList();
  }

  // ============ ANIMAL MANAGEMENT ============
  Future<AnimalDTO> createAnimal(AnimalDTO data) async {
    final res = await http.post(
      Uri.parse('$baseUrl/animals'),
      headers: _headers(),
      body: jsonEncode(data.toJson()),
    );
    return AnimalDTO.fromJson(_handleResponse(res));
  }

  Future<List<AnimalDTO>> getAnimalsByFarmer(int farmerId) async {
    final res = await http.get(Uri.parse('$baseUrl/animals/farmer/$farmerId'), headers: _headers());
    final list = _handleResponse(res) as List;
    return list.map((e) => AnimalDTO.fromJson(e)).toList();
  }

  // ============ TREATMENT PLANS ============
  // Note: Following standard REST mapping from apiService.ts structure
  Future<TreatmentPlanDTO> createTreatmentPlan(TreatmentPlanDTO data) async {
    final res = await http.post(
      Uri.parse('$baseUrl/treatment-plans'),
      headers: _headers(),
      body: jsonEncode(data.toJson()),
    );
    return TreatmentPlanDTO.fromJson(_handleResponse(res));
  }
  
  Future<List<TreatmentPlanDTO>> getTreatmentPlansByVet(int vetId) async {
    final res = await http.get(Uri.parse('$baseUrl/treatment-plans/veterinarian/$vetId'), headers: _headers());
    final list = _handleResponse(res) as List;
    return list.map((e) => TreatmentPlanDTO.fromJson(e)).toList();
  }
}
