/**
 * Comprehensive API Service for VetLink Frontend
 * Handles all API calls to the backend
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8888/api';

// Log the API base URL for debugging
console.log('🌐 API Base URL:', API_BASE);

// Token management
export const getAuthToken = (): string | null => {
  return localStorage.getItem('vetlink_token');
};

export const getAuthHeader = () => ({
  'Content-Type': 'application/json',
  ...(getAuthToken() && { Authorization: `Bearer ${getAuthToken()}` }),
});

// ============ TYPES ============

export interface CaseDTO {
  id?: number;
  farmerId: number;
  locationId?: number;
  locationName?: string;
  farmerName?: string;
  animalId: number;
  animalName?: string;
  animalType?: string; // e.g. "Cow", "Goat"
  cahwId?: number;
  veterinarianId?: number;
  title: string;
  description: string;
  caseType: string;
  severity: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  resolvedAt?: string;
  isEscalated?: boolean;
  diagnosis?: string;
  treatment?: string;
  resolution?: string;
}

export interface AnimalDTO {
  id?: number;
  name: string;
  type: string;
  breed: string;
  age: number;
  gender: string;
  farmerId: number;
  healthStatus: string;
  specificAttributes?: string; // JSON string of specific fields
  weight?: number;
  createdAt?: string;
}

export interface HealthRecordDTO {
  id?: number;
  animalId: number;
  recordType: string;
  details: string;
  diagnosis: string;
  treatment: string;
  weight?: number;
  temperature?: string;
  createdAt?: string;
  recordDate?: string;
}

export interface MessageDTO {
  id?: number;
  senderId: number;
  recipientId: number;
  content: string;
  attachmentUrl?: string;
  isRead?: boolean;
  createdAt?: string;
}

export interface NotificationDTO {
  id?: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  isRead?: boolean;
  createdAt?: string;
}

export interface TreatmentPlanDTO {
  id?: number;
  caseId?: number | null;
  veterinarianId: number;
  treatment: string;
  notes: string;
  duration: number;
  compliance: number;
  status: string;
  activityType?: string;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
}

export interface VisitDTO {
  id?: number;
  caseId?: number;
  veterinarianId: number;
  farmerId: number;
  animalId?: number;
  scheduledDate: string;
  actualDate?: string;
  purpose: string;
  notes?: string;
  status?: string;
  location?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserDTO {
  id?: number;
  name: string;
  email: string;
  role: string;
  phone?: string;
  locationId?: number;
  createdAt?: string;
}

export interface CallDTO {
  id?: number;
  callerId: number;
  callerName?: string;
  recipientId: number;
  recipientName?: string;
  callType: "voice" | "video";
  status: "initiated" | "ringing" | "connected" | "ended" | "declined" | "missed";
  initiatedAt?: string;
  connectedAt?: string;
  endedAt?: string;
  durationSeconds?: number;
  declinationReason?: string;
  createdAt?: string;
}

export interface VeterinarianDTO {
  id?: number;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  licenseNumber: string;
  active?: boolean;
  locationId?: number;
  locationName?: string;
  activeCases?: number;
  totalCasesResolved?: number;
  averageResponseTime?: number;
  registrationDate?: string;
}

// ============ UTILITY FUNCTIONS ============

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') || '';
  console.log('💡 API Response:', {
    status: response.status,
    contentType,
    ok: response.ok,
    url: response.url,
    statusText: response.statusText
  });

  if (!response.ok) {
    // try parse JSON error body first
    try {
      if (contentType.includes('application/json')) {
        const err = await response.json();
        console.error('❌ API Error:', err);
        throw new Error(err.message || JSON.stringify(err));
      }
      const text = await response.text();
      console.error('❌ API Error Text:', text);
      throw new Error(text || `HTTP Error: ${response.status}`);
    } catch (parseErr) {
      console.error('❌ Error parsing error response:', parseErr);
      throw new Error(`HTTP Error: ${response.status}`);
    }
  }

  // no content
  if (response.status === 204) {
    console.log('✅ No content response (204)');
    return undefined as unknown as T;
  }

  try {
    // Try to read response body as text first (can only be read once)
    const text = await response.text();
    console.log('📝 Response text:', text);

    if (!text) {
      console.warn('⚠️ Empty response body');
      return undefined as unknown as T;
    }

    try {
      const parsed = JSON.parse(text);
      console.log('✅ Response parsed successfully:', parsed);
      return parsed as T;
    } catch (jsonErr) {
      console.warn('⚠️ Failed to parse as JSON, returning as text', jsonErr);
      return text as unknown as T;
    }
  } catch (e) {
    console.error('❌ Failed to parse response:', e);
    throw new Error('Failed to parse response: ' + (e instanceof Error ? e.message : String(e)));
  }
}

async function safeFetch(input: RequestInfo, init?: RequestInit) {
  try {
    const resp = await fetch(input, init);
    return await handleResponse(resp);
  } catch (err) {
    // Repackage network/parse errors for callers
    if (err instanceof Error) throw err;
    throw new Error('Network or server error');
  }
}

// ============ AUTHENTICATION ============

export const authAPI = {
  login: async (email: string, password: string, role: string) => {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role }),
    });
    return handleResponse(response);
  },

  signup: async (name: string, email: string, password: string, role: string, locationId?: number) => {
    const response = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role, locationId }),
    });
    return handleResponse(response);
  },
};

// ============ USER MANAGEMENT ============

export const userAPI = {
  getUserById: async (id: number): Promise<UserDTO> => {
    const response = await fetch(`${API_BASE}/users/${id}`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  getUserByEmail: async (email: string): Promise<UserDTO> => {
    const response = await fetch(`${API_BASE}/users/email/${email}`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  getUsersByRole: async (role: string): Promise<UserDTO[]> => {
    const response = await fetch(`${API_BASE}/users/role/${role}`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  // NOTE: This endpoint now returns ALL users (not just active) due to backend modification
  getActiveUsers: async (): Promise<UserDTO[]> => {
    const response = await fetch(`${API_BASE}/users/active`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  updateUser: async (id: number, userData: Partial<UserDTO>): Promise<UserDTO> => {
    const response = await fetch(`${API_BASE}/users/${id}`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  // New method for users to update their own profile (non-admin)
  updateOwnProfile: async (id: number, userData: Partial<UserDTO>): Promise<UserDTO> => {
    const response = await fetch(`${API_BASE}/users/${id}/profile`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  changePassword: async (id: number, passwordData: { currentPassword: string; newPassword: string }): Promise<string> => {
    const response = await fetch(`${API_BASE}/users/${id}/change-password`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(passwordData),
    });
    return handleResponse(response);
  },

  lockUser: async (id: number): Promise<UserDTO> => {
    const response = await fetch(`${API_BASE}/users/${id}/lock`, {
      method: 'PUT',
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  unlockUser: async (id: number): Promise<UserDTO> => {
    const response = await fetch(`${API_BASE}/users/${id}/unlock`, {
      method: 'PUT',
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  createUser: async (userData: any): Promise<UserDTO> => {
    const response = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  deleteUser: async (id: number): Promise<string> => {
    const response = await fetch(`${API_BASE}/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  approveUser: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE}/admin/applications/approve`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ userId: id }),
    });
    return handleResponse(response);
  },

  rejectUser: async (id: number, reason: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/admin/applications/reject`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ userId: id, rejectionReason: reason }),
    });
    return handleResponse(response);
  },
};

// ============ VETERINARIAN MANAGEMENT ============

export const veterinarianAPI = {
  createVeterinarian: async (vetData: VeterinarianDTO): Promise<VeterinarianDTO> => {
    const response = await fetch(`${API_BASE}/veterinarians`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(vetData),
    });
    return handleResponse(response);
  },

  getVeterinarianById: async (id: number): Promise<VeterinarianDTO> => {
    const response = await fetch(`${API_BASE}/veterinarians/${id}`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  getVeterinarianByUserId: async (userId: number): Promise<VeterinarianDTO> => {
    const response = await fetch(`${API_BASE}/veterinarians/user/${userId}`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  getAllVeterinarians: async (): Promise<VeterinarianDTO[]> => {
    const response = await fetch(`${API_BASE}/veterinarians`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  getVeterinariansByLocation: async (locationId: number): Promise<VeterinarianDTO[]> => {
    const response = await fetch(`${API_BASE}/veterinarians/location/${locationId}`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  updateVeterinarian: async (id: number, vetData: Partial<VeterinarianDTO>): Promise<VeterinarianDTO> => {
    const response = await fetch(`${API_BASE}/veterinarians/${id}`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(vetData),
    });
    return handleResponse(response);
  },

  deleteVeterinarian: async (id: number): Promise<string> => {
    const response = await fetch(`${API_BASE}/veterinarians/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },
};

// ============ CASE MANAGEMENT ============

export const caseAPI = {
  createCase: async (caseData: CaseDTO): Promise<CaseDTO> => {
    const response = await fetch(`${API_BASE}/cases`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(caseData),
    });
    return handleResponse(response);
  },

  getAllCases: async (): Promise<CaseDTO[]> => {
    const response = await fetch(`${API_BASE}/cases`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  getCaseById: async (id: number): Promise<CaseDTO> => {
    console.log(`🔄 Fetching case ${id} from ${API_BASE}/cases/${id}...`);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.warn(`⏱️ Timeout for case ${id} - aborting request`);
        controller.abort();
      }, 15000); // 15 second timeout

      const response = await fetch(`${API_BASE}/cases/${id}`, {
        headers: getAuthHeader(),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log(`✅ Got response for case ${id}:`, response.status);
      return handleResponse(response);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`❌ Error fetching case ${id}:`, error.name, error.message);
        if (error.name === 'AbortError') {
          const msg = `Request timeout fetching case ${id} - backend may not be running`;
          console.error(`❌ ${msg}`);
          throw new Error(msg);
        }
      } else {
        console.error(`❌ Unknown error fetching case ${id}:`, error);
      }
      throw error;
    }
  },

  getCasesByFarmerId: async (farmerId: number): Promise<CaseDTO[]> => {
    const response = await fetch(`${API_BASE}/cases/farmer/${farmerId}`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  getCasesByVeterinarianId: async (veterinarianId: number): Promise<CaseDTO[]> => {
    const response = await fetch(`${API_BASE}/cases/veterinarian/${veterinarianId}`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  getCasesByCAHWId: async (cahwId: number): Promise<CaseDTO[]> => {
    const response = await fetch(`${API_BASE}/cases/cahw/${cahwId}`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  getCasesByLocation: async (locationId: number): Promise<CaseDTO[]> => {
    const response = await fetch(`${API_BASE}/cases/location/${locationId}/available`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  updateCase: async (id: number, caseData: Partial<CaseDTO>): Promise<CaseDTO> => {
    const response = await fetch(`${API_BASE}/cases/${id}`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(caseData),
    });
    return handleResponse(response);
  },

  assignToVeterinarian: async (caseId: number, veterinarianId: number): Promise<CaseDTO> => {
    const response = await fetch(`${API_BASE}/cases/${caseId}/assign/${veterinarianId}`, {
      method: 'PUT',
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  assignToCAHW: async (caseId: number, cahwId: number): Promise<CaseDTO> => {
    const response = await fetch(`${API_BASE}/cases/${caseId}/assign-cahw/${cahwId}`, {
      method: 'PUT',
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  markCaseAsReceived: async (caseId: number, userId?: number): Promise<CaseDTO> => {
    let url = `${API_BASE}/cases/${caseId}/mark-received`;
    if (userId) {
      url += `?userId=${userId}`;
    }
    const response = await fetch(url, {
      method: 'PUT',
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  markCaseAsCompleted: async (caseId: number, caseData: Partial<CaseDTO>): Promise<CaseDTO> => {
    const response = await fetch(`${API_BASE}/cases/${caseId}/mark-completed`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(caseData),
    });
    return handleResponse(response);
  },

  escalateCase: async (caseId: number, escalationReason: string): Promise<CaseDTO> => {
    const response = await fetch(`${API_BASE}/cases/${caseId}/escalate`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify({ escalationReason }),
    });
    return handleResponse(response);
  },

  getCasesEscalated: async (): Promise<CaseDTO[]> => {
    try {
      const response = await fetch(`${API_BASE}/cases/escalated`, {
        headers: getAuthHeader(),
      });
      return handleResponse(response);
    } catch (err) {
      console.error('Failed to load escalated cases:', err);
      return [];
    }
  },

  getCasesByVeterinarianLocation: async (veterinarianId: number): Promise<CaseDTO[]> => {
    const response = await fetch(`${API_BASE}/cases/veterinarian/${veterinarianId}/sector`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  getCasesByCAHWLocation: async (cahwId: number): Promise<CaseDTO[]> => {
    const response = await fetch(`${API_BASE}/cases/cahw/${cahwId}/sector`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  deleteCase: async (id: number): Promise<string> => {
    const response = await fetch(`${API_BASE}/cases/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  getCaseTrends: async (): Promise<{ name: string; cases: number; resolved: number }[]> => {
    const response = await fetch(`${API_BASE}/cases/stats/trends`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  getCaseTypeDistribution: async (): Promise<{ name: string; value: number }[]> => {
    const response = await fetch(`${API_BASE}/cases/stats/types`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  // ============ MEDIA MANAGEMENT ============
  uploadMedia: async (caseId: number, file: File, description?: string, userId?: string | number): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    if (description) {
      formData.append('description', description);
    }

    const url = new URL(`${API_BASE}/cases/${caseId}/media/upload`);
    if (userId) {
      url.searchParams.append('userId', userId.toString());
    }

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        ...(getAuthToken() && { Authorization: `Bearer ${getAuthToken()}` }),
      },
      body: formData,
    });
    return handleResponse(response);
  },

  getMediaByCase: async (caseId: number, userId?: string | number): Promise<any[]> => {
    const url = new URL(`${API_BASE}/cases/${caseId}/media`);
    if (userId) {
      url.searchParams.append('userId', userId.toString());
    }
    const response = await fetch(url.toString(), {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  deleteMedia: async (caseId: number, mediaId: number, userId?: string | number): Promise<string> => {
    const url = new URL(`${API_BASE}/cases/${caseId}/media/${mediaId}`);
    if (userId) {
      url.searchParams.append('userId', userId.toString());
    }
    const response = await fetch(url.toString(), {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },
};

// ============ ANIMAL MANAGEMENT ============

export const animalAPI = {
  createAnimal: async (animalData: AnimalDTO): Promise<AnimalDTO> => {
    const response = await fetch(`${API_BASE}/animals`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(animalData),
    });
    return handleResponse(response);
  },

  getAnimalById: async (id: number): Promise<AnimalDTO> => {
    const response = await fetch(`${API_BASE}/animals/${id}`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  getAnimalsByFarmerId: async (farmerId: number): Promise<AnimalDTO[]> => {
    const response = await fetch(`${API_BASE}/animals/farmer/${farmerId}`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  updateAnimal: async (id: number, animalData: Partial<AnimalDTO>): Promise<AnimalDTO> => {
    const response = await fetch(`${API_BASE}/animals/${id}`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(animalData),
    });
    return handleResponse(response);
  },

  deleteAnimal: async (id: number): Promise<string> => {
    const response = await fetch(`${API_BASE}/animals/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },
};

// ============ HEALTH RECORDS ============

export const healthRecordAPI = {
  createHealthRecord: async (recordData: HealthRecordDTO): Promise<HealthRecordDTO> => {
    const response = await fetch(`${API_BASE}/health-records`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(recordData),
    });
    return handleResponse(response);
  },

  getHealthRecordById: async (id: number): Promise<HealthRecordDTO> => {
    const response = await fetch(`${API_BASE}/health-records/${id}`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  getHealthRecordsByAnimalId: async (animalId: number): Promise<HealthRecordDTO[]> => {
    const response = await fetch(`${API_BASE}/health-records/animal/${animalId}`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  updateHealthRecord: async (id: number, recordData: Partial<HealthRecordDTO>): Promise<HealthRecordDTO> => {
    const response = await fetch(`${API_BASE}/health-records/${id}`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(recordData),
    });
    return handleResponse(response);
  },

  deleteHealthRecord: async (id: number): Promise<string> => {
    const response = await fetch(`${API_BASE}/health-records/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },
};

// ============ MESSAGING ============

export const messageAPI = {
  sendMessage: async (messageData: MessageDTO): Promise<MessageDTO> => {
    const response = await fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(messageData),
    });
    return handleResponse(response);
  },

  getConversation: async (userId1: number, userId2: number): Promise<MessageDTO[]> => {
    const response = await fetch(`${API_BASE}/messages/conversation?userId1=${userId1}&userId2=${userId2}`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  getInboxMessages: async (userId: number): Promise<MessageDTO[]> => {
    const response = await fetch(`${API_BASE}/messages/inbox/${userId}`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  getUnreadMessages: async (userId: number): Promise<MessageDTO[]> => {
    const response = await fetch(`${API_BASE}/messages/unread/${userId}`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  markMessageAsRead: async (id: number): Promise<MessageDTO> => {
    const response = await fetch(`${API_BASE}/messages/${id}/read`, {
      method: 'PUT',
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  deleteMessage: async (id: number): Promise<string> => {
    const response = await fetch(`${API_BASE}/messages/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  updateMessage: async (id: number, content: string): Promise<MessageDTO> => {
    const response = await fetch(`${API_BASE}/messages/${id}`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify({ content }),
    });
    return handleResponse(response);
  },
};

// ============ TREATMENT PLANS ============

export const treatmentPlanAPI = {
  createTreatmentPlan: async (planData: TreatmentPlanDTO): Promise<TreatmentPlanDTO> => {
    const response = await fetch(`${API_BASE}/treatment-plans`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(planData),
    });
    return handleResponse(response);
  },

  getTreatmentPlanById: async (id: number): Promise<TreatmentPlanDTO> => {
    const response = await fetch(`${API_BASE}/treatment-plans/${id}`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  getTreatmentPlansByVeterinarianId: async (veterinarianId: number): Promise<TreatmentPlanDTO[]> => {
    const response = await fetch(`${API_BASE}/treatment-plans/veterinarian/${veterinarianId}`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  getActiveTreatmentPlans: async (veterinarianId: number): Promise<TreatmentPlanDTO[]> => {
    const response = await fetch(`${API_BASE}/treatment-plans/veterinarian/${veterinarianId}/active`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  updateTreatmentPlan: async (id: number, planData: Partial<TreatmentPlanDTO>): Promise<TreatmentPlanDTO> => {
    const response = await fetch(`${API_BASE}/treatment-plans/${id}`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(planData),
    });
    return handleResponse(response);
  },

  deleteTreatmentPlan: async (id: number): Promise<string> => {
    const response = await fetch(`${API_BASE}/treatment-plans/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },
};

// ============ VISITS ============

export const visitAPI = {
  createVisit: async (visitData: VisitDTO): Promise<VisitDTO> => {
    const response = await fetch(`${API_BASE}/visits`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(visitData),
    });
    return handleResponse(response);
  },

  getVisitById: async (id: number): Promise<VisitDTO> => {
    const response = await fetch(`${API_BASE}/visits/${id}`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  getVisitsByVeterinarianId: async (veterinarianId: number): Promise<VisitDTO[]> => {
    const response = await fetch(`${API_BASE}/visits/veterinarian/${veterinarianId}`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  getVisitsByFarmerId: async (farmerId: number): Promise<VisitDTO[]> => {
    const response = await fetch(`${API_BASE}/visits/farmer/${farmerId}`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  getScheduledVisitsByVeterinarianId: async (veterinarianId: number): Promise<VisitDTO[]> => {
    const response = await fetch(`${API_BASE}/visits/veterinarian/${veterinarianId}/scheduled`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  getScheduledVisitsByFarmerId: async (farmerId: number): Promise<VisitDTO[]> => {
    const response = await fetch(`${API_BASE}/visits/farmer/${farmerId}/scheduled`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  getVisitsByCase: async (caseId: number): Promise<VisitDTO[]> => {
    const response = await fetch(`${API_BASE}/visits/case/${caseId}`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  updateVisit: async (id: number, visitData: Partial<VisitDTO>): Promise<VisitDTO> => {
    const response = await fetch(`${API_BASE}/visits/${id}`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(visitData),
    });
    return handleResponse(response);
  },

  completeVisit: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE}/visits/${id}/complete`, {
      method: 'PUT',
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  cancelVisit: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE}/visits/${id}/cancel`, {
      method: 'PUT',
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  deleteVisit: async (id: number): Promise<string> => {
    const response = await fetch(`${API_BASE}/visits/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },
};

// ============ NOTIFICATIONS ============

export const notificationAPI = {
  createNotification: async (userId: number, title: string, message: string, type: string): Promise<NotificationDTO> => {
    const response = await fetch(`${API_BASE}/notifications?userId=${userId}&title=${encodeURIComponent(title)}&message=${encodeURIComponent(message)}&type=${type}`, {
      method: 'POST',
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  createNotificationWithCase: async (userId: number, title: string, message: string, type: string, relatedCaseId: number): Promise<NotificationDTO> => {
    const response = await fetch(`${API_BASE}/notifications/with-case?userId=${userId}&title=${encodeURIComponent(title)}&message=${encodeURIComponent(message)}&type=${type}&relatedCaseId=${relatedCaseId}`, {
      method: 'POST',
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  getNotificationsByUserId: async (userId: number): Promise<NotificationDTO[]> => {
    const response = await fetch(`${API_BASE}/notifications/user/${userId}`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  getUnreadNotifications: async (userId: number): Promise<NotificationDTO[]> => {
    const response = await fetch(`${API_BASE}/notifications/user/${userId}/unread`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  getUnreadCount: async (userId: number): Promise<{ unreadCount: number }> => {
    const response = await fetch(`${API_BASE}/notifications/user/${userId}/unread-count`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  markNotificationAsRead: async (id: number): Promise<NotificationDTO> => {
    const response = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PUT',
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  markAllAsRead: async (userId: number): Promise<string> => {
    const response = await fetch(`${API_BASE}/notifications/user/${userId}/read-all`, {
      method: 'PUT',
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  deleteNotification: async (id: number): Promise<string> => {
    const response = await fetch(`${API_BASE}/notifications/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  deleteAllNotifications: async (userId: number): Promise<string> => {
    const response = await fetch(`${API_BASE}/notifications/user/${userId}/delete-all`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },
};

// ============ TRAININGS ============

export const trainingAPI = {
  createTraining: async (trainingData: any): Promise<any> => {
    // If caller passed a FormData (for file uploads) let fetch set headers
    if (trainingData instanceof FormData) {
      const headers = getAuthHeader();
      // remove Content-Type header if present so browser sets boundary
      delete (headers as any)['Content-Type'];
      return safeFetch(`${API_BASE}/trainings`, {
        method: 'POST',
        headers,
        body: trainingData,
      });
    }

    return safeFetch(`${API_BASE}/trainings`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(trainingData),
    });
  },

  getTrainingById: async (id: number): Promise<any> => {
    const response = await fetch(`${API_BASE}/trainings/${id}`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  getTrainingsByCategory: async (category: string): Promise<any[]> => {
    const response = await fetch(`${API_BASE}/trainings/category/${category}`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  getPublishedTrainings: async (): Promise<any[]> => {
    const response = await fetch(`${API_BASE}/trainings/published`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  getTrainingsByInstructor: async (instructorId: number): Promise<any[]> => {
    const response = await fetch(`${API_BASE}/trainings/instructor/${instructorId}`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  updateTraining: async (id: number, trainingData: any): Promise<any> => {
    const response = await fetch(`${API_BASE}/trainings/${id}`, {
      method: 'PUT',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(trainingData),
    });
    return handleResponse(response);
  },

  deleteTraining: async (id: number): Promise<string> => {
    const response = await fetch(`${API_BASE}/trainings/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  getTrainingEnrollments: async (trainingId: number): Promise<any[]> => {
    const response = await fetch(`${API_BASE}/trainings/${trainingId}/enrollments`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  getCourseLessons: async (trainingId: number): Promise<any[]> => {
    const response = await fetch(`${API_BASE}/trainings/${trainingId}/lessons`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  getLesson: async (lessonId: number): Promise<any> => {
    const response = await fetch(`${API_BASE}/lessons/${lessonId}`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  updateLesson: async (lessonId: number, lessonData: any): Promise<any> => {
    const response = await fetch(`${API_BASE}/lessons/${lessonId}`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(lessonData),
    });
    return handleResponse(response);
  },

  deleteLesson: async (lessonId: number): Promise<string> => {
    const response = await fetch(`${API_BASE}/lessons/${lessonId}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },
};

// ============ USER TRAININGS / ENROLLMENTS ============

export const userTrainingAPI = {
  enrollInTraining: async (userId: number, trainingId: number): Promise<any> => {
    const response = await fetch(`${API_BASE}/user-trainings/${userId}/enroll/${trainingId}`, {
      method: 'POST',
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  getUserTrainings: async (userId: number): Promise<any[]> => {
    const response = await fetch(`${API_BASE}/user-trainings/${userId}`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  getTrainingsByStatus: async (userId: number, status: string): Promise<any[]> => {
    const response = await fetch(`${API_BASE}/user-trainings/${userId}/status/${status}`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  updateTrainingProgress: async (id: number, progressPercentage: number): Promise<any> => {
    const response = await fetch(`${API_BASE}/user-trainings/${id}/progress?progressPercentage=${progressPercentage}`, {
      method: 'PUT',
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  completeTraining: async (id: number, score: number): Promise<any> => {
    const response = await fetch(`${API_BASE}/user-trainings/${id}/complete?score=${score}`, {
      method: 'PUT',
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  getEnrollmentById: async (id: number): Promise<any> => {
    const response = await fetch(`${API_BASE}/user-trainings/enrollment/${id}`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  completeLesson: async (enrollmentId: number, lessonId: number, stoppedAt?: number): Promise<any> => {
    const response = await fetch(`${API_BASE}/enrollments/${enrollmentId}/lessons/${lessonId}/complete`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ stoppedAt }),
    });
    return handleResponse(response);
  },

  checkEnrollmentCompletion: async (enrollmentId: number): Promise<any> => {
    const response = await fetch(`${API_BASE}/enrollments/${enrollmentId}/check-completion`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  resetEnrollment: async (enrollmentId: number): Promise<any> => {
    const response = await fetch(`${API_BASE}/user-trainings/${enrollmentId}/reset`, {
      method: 'PUT',
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },
};

// ============ QUIZZES ============

export const quizAPI = {
  getQuiz: async (lessonId: number): Promise<any> => {
    const response = await fetch(`${API_BASE}/lessons/${lessonId}/quiz`, {
      headers: getAuthHeader(),
    });
    if (response.status === 404) return null;
    return handleResponse(response);
  },

  createQuiz: async (lessonId: number, quizData: any): Promise<any> => {
    const response = await fetch(`${API_BASE}/lessons/${lessonId}/quiz`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(quizData),
    });
    return handleResponse(response);
  },

  submitQuiz: async (lessonId: number, quizId: number, answers: number[], enrollmentId?: number): Promise<any> => {
    const response = await fetch(`${API_BASE}/lessons/${lessonId}/quiz/submit`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ quizId, answers, enrollmentId }),
    });
    return handleResponse(response);
  },

  updateQuiz: async (lessonId: number, quizId: number, quizData: any): Promise<any> => {
    const response = await fetch(`${API_BASE}/lessons/${lessonId}/quiz/${quizId}`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(quizData),
    });
    return handleResponse(response);
  },

  deleteQuiz: async (lessonId: number, quizId: number): Promise<string> => {
    const response = await fetch(`${API_BASE}/lessons/${lessonId}/quiz/${quizId}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },
};

export const certificationAPI = {
  createCertification: async (certData: any): Promise<any> => {
    const response = await fetch(`${API_BASE}/certifications`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(certData),
    });
    return handleResponse(response);
  },

  getCertificationById: async (id: number): Promise<any> => {
    const response = await fetch(`${API_BASE}/certifications/${id}`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  getCertificationsByUserId: async (userId: number): Promise<any[]> => {
    const response = await fetch(`${API_BASE}/certifications/user/${userId}`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  getActiveCertifications: async (userId: number): Promise<any[]> => {
    const response = await fetch(`${API_BASE}/certifications/user/${userId}/active`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  updateCertification: async (id: number, certData: any): Promise<any> => {
    const response = await fetch(`${API_BASE}/certifications/${id}`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(certData),
    });
    return handleResponse(response);
  },

  deleteCertification: async (id: number): Promise<string> => {
    const response = await fetch(`${API_BASE}/certifications/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },
};

// ============ CALL API ============
export const callAPI = {
  // Initiate a new call
  initiateCall: async (recipientId: number, callType: "voice" | "video"): Promise<CallDTO> => {
    const payload = { recipientId, callType };
    const token = getAuthToken();
    console.log('📞 Initiating call request:', { recipientId, callType, tokenPresent: !!token });

    const response = await fetch(`${API_BASE}/calls/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(payload),
    });

    console.log('📞 Call response:', { status: response.status, ok: response.ok });
    return handleResponse(response);
  },

  // Accept an incoming call
  acceptCall: async (callId: number): Promise<CallDTO> => {
    const response = await fetch(`${API_BASE}/calls/${callId}/accept`, {
      method: 'POST',
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  // Decline/reject a call
  declineCall: async (callId: number, reason?: string): Promise<CallDTO> => {
    const response = await fetch(`${API_BASE}/calls/${callId}/decline`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ reason }),
    });
    return handleResponse(response);
  },

  // End an active call
  endCall: async (callId: number): Promise<CallDTO> => {
    const response = await fetch(`${API_BASE}/calls/${callId}/end`, {
      method: 'POST',
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  // Get incoming calls
  getIncomingCalls: async (): Promise<CallDTO[]> => {
    try {
      const token = getAuthToken();
      console.log('📞 Fetching incoming calls...', {
        token: token ? `present (${token.substring(0, 20)}...)` : 'MISSING',
        url: `${API_BASE}/calls/incoming`
      });

      if (!token) {
        console.warn('⚠️  No authentication token found!');
        return [];
      }

      const response = await fetch(`${API_BASE}/calls/incoming`, {
        method: 'GET',
        headers: getAuthHeader(),
      });
      console.log('📞 Incoming calls response:', { status: response.status, ok: response.ok, statusText: response.statusText });
      const result = await handleResponse<CallDTO[]>(response);
      console.log('📞 Incoming calls result:', result);
      return (result as CallDTO[]) || [];
    } catch (err: any) {
      console.error('📞 Error in getIncomingCalls:', err);
      // Return empty array instead of throwing to prevent app crash
      return [];
    }
  },

  // Get call history
  getCallHistory: async (userId: number): Promise<CallDTO[]> => {
    const response = await fetch(`${API_BASE}/calls/history/${userId}`, {
      method: 'GET',
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  // Get a specific call
  getCall: async (callId: number): Promise<CallDTO> => {
    const response = await fetch(`${API_BASE}/calls/${callId}`, {
      method: 'GET',
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },

  // Get missed calls
  getMissedCalls: async (): Promise<CallDTO[]> => {
    const response = await fetch(`${API_BASE}/calls/missed`, {
      method: 'GET',
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  },
};


export default {
  authAPI,
  userAPI,
  veterinarianAPI,
  caseAPI,
  animalAPI,
  healthRecordAPI,
  messageAPI,
  treatmentPlanAPI,
  visitAPI,
  notificationAPI,
  trainingAPI,
  userTrainingAPI,
  quizAPI,
  certificationAPI,
};
