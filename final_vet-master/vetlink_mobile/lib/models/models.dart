// Global Domain Models for VetLink Mobile

class UserDTO {
  final int? id;
  final String name;
  final String email;
  final String role;
  final String? phone;
  final int? locationId;
  final String? createdAt;

  UserDTO({this.id, required this.name, required this.email, required this.role, this.phone, this.locationId, this.createdAt});

  factory UserDTO.fromJson(Map<String, dynamic> json) => UserDTO(
        id: json['id'],
        name: json['name'] ?? '',
        email: json['email'] ?? '',
        role: json['role'] ?? '',
        phone: json['phone'],
        locationId: json['locationId'],
        createdAt: json['createdAt'],
      );

  Map<String, dynamic> toJson() => {
        if (id != null) 'id': id,
        'name': name,
        'email': email,
        'role': role,
        if (phone != null) 'phone': phone,
        if (locationId != null) 'locationId': locationId,
      };
}

class CaseDTO {
  final int? id;
  final int farmerId;
  final int? locationId;
  final String? locationName;
  final String? farmerName;
  final int animalId;
  final String? animalName;
  final String? animalType;
  final int? cahwId;
  final int? veterinarianId;
  final String title;
  final String description;
  final String caseType;
  final int severity;
  final String? status;
  final String? diagnosis;
  final String? treatment;
  final String? resolution;

  CaseDTO({
    this.id, required this.farmerId, this.locationId, this.locationName, this.farmerName,
    required this.animalId, this.animalName, this.animalType, this.cahwId, this.veterinarianId,
    required this.title, required this.description, required this.caseType, required this.severity,
    this.status, this.diagnosis, this.treatment, this.resolution
  });

  factory CaseDTO.fromJson(Map<String, dynamic> json) => CaseDTO(
        id: json['id'],
        farmerId: json['farmerId'] ?? 0,
        locationId: json['locationId'],
        locationName: json['locationName'],
        farmerName: json['farmerName'],
        animalId: json['animalId'] ?? 0,
        animalName: json['animalName'],
        animalType: json['animalType'],
        cahwId: json['cahwId'],
        veterinarianId: json['veterinarianId'],
        title: json['title'] ?? '',
        description: json['description'] ?? '',
        caseType: json['caseType'] ?? '',
        severity: json['severity'] ?? 1,
        status: json['status'],
        diagnosis: json['diagnosis'],
        treatment: json['treatment'],
        resolution: json['resolution'],
      );

  Map<String, dynamic> toJson() => {
        if (id != null) 'id': id,
        'farmerId': farmerId,
        if (locationId != null) 'locationId': locationId,
        'animalId': animalId,
        if (cahwId != null) 'cahwId': cahwId,
        if (veterinarianId != null) 'veterinarianId': veterinarianId,
        'title': title,
        'description': description,
        'caseType': caseType,
        'severity': severity,
        if (status != null) 'status': status,
        if (diagnosis != null) 'diagnosis': diagnosis,
        if (treatment != null) 'treatment': treatment,
        if (resolution != null) 'resolution': resolution,
      };
}

class AnimalDTO {
  final int? id;
  final String name;
  final String type;
  final String breed;
  final int age;
  final String gender;
  final int farmerId;
  final String healthStatus;
  final double? weight;

  AnimalDTO({this.id, required this.name, required this.type, required this.breed, required this.age, required this.gender, required this.farmerId, required this.healthStatus, this.weight});

  factory AnimalDTO.fromJson(Map<String, dynamic> json) => AnimalDTO(
        id: json['id'],
        name: json['name'] ?? '',
        type: json['type'] ?? '',
        breed: json['breed'] ?? '',
        age: json['age'] ?? 0,
        gender: json['gender'] ?? '',
        farmerId: json['farmerId'] ?? 0,
        healthStatus: json['healthStatus'] ?? '',
        weight: json['weight']?.toDouble(),
      );

  Map<String, dynamic> toJson() => {
        if (id != null) 'id': id,
        'name': name,
        'type': type,
        'breed': breed,
        'age': age,
        'gender': gender,
        'farmerId': farmerId,
        'healthStatus': healthStatus,
        if (weight != null) 'weight': weight,
      };
}

class TreatmentPlanDTO {
  final int? id;
  final int? caseId;
  final int veterinarianId;
  final String treatment;
  final String notes;
  final int duration;
  final int compliance;
  final String status;

  TreatmentPlanDTO({this.id, this.caseId, required this.veterinarianId, required this.treatment, required this.notes, required this.duration, required this.compliance, required this.status});

  factory TreatmentPlanDTO.fromJson(Map<String, dynamic> json) => TreatmentPlanDTO(
        id: json['id'],
        caseId: json['caseId'],
        veterinarianId: json['veterinarianId'] ?? 0,
        treatment: json['treatment'] ?? '',
        notes: json['notes'] ?? '',
        duration: json['duration'] ?? 0,
        compliance: json['compliance'] ?? 0,
        status: json['status'] ?? '',
      );

  Map<String, dynamic> toJson() => {
        if (id != null) 'id': id,
        if (caseId != null) 'caseId': caseId,
        'veterinarianId': veterinarianId,
        'treatment': treatment,
        'notes': notes,
        'duration': duration,
        'compliance': compliance,
        'status': status,
      };
}
