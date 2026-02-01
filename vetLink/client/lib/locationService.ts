// Location service uses the same backend as main API
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8888/api';

export interface ProvinceDTO {
  id: number;
  name: string;
  displayName?: string;
  code?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DistrictDTO {
  id: number;
  name: string;
  displayName?: string;
  code?: string;
  provinceId: number;
  provinceName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SectorDTO {
  id: number;
  name: string;
  displayName?: string;
  code?: string;
  districtId: number;
  districtName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface VillageDTO {
  id: number;
  name: string;
  code?: string;
  sectorId: number;
  sectorName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CellDTO {
  id: number;
  name: string;
  code?: string;
  villageId: number;
  villageName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const locationService = {
  // Province APIs
  async getProvinces(): Promise<ProvinceDTO[]> {
    const response = await fetch(`${API_BASE}/locations/provinces`);
    if (!response.ok) throw new Error('Failed to fetch provinces');
    return response.json();
  },

  async getProvinceById(id: number): Promise<ProvinceDTO> {
    const response = await fetch(`${API_BASE}/locations/provinces/${id}`);
    if (!response.ok) throw new Error('Failed to fetch province');
    return response.json();
  },

  async createProvince(province: ProvinceDTO): Promise<ProvinceDTO> {
    const response = await fetch(`${API_BASE}/locations/provinces`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(province),
    });
    if (!response.ok) throw new Error('Failed to create province');
    return response.json();
  },

  // District APIs
  async getDistrictsByProvinceId(provinceId: number): Promise<DistrictDTO[]> {
    const response = await fetch(`${API_BASE}/locations/districts/province/${provinceId}`);
    if (!response.ok) throw new Error('Failed to fetch districts');
    return response.json();
  },

  async getDistrictById(id: number): Promise<DistrictDTO> {
    const response = await fetch(`${API_BASE}/locations/districts/${id}`);
    if (!response.ok) throw new Error('Failed to fetch district');
    return response.json();
  },

  async createDistrict(district: DistrictDTO): Promise<DistrictDTO> {
    const response = await fetch(`${API_BASE}/locations/districts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(district),
    });
    if (!response.ok) throw new Error('Failed to create district');
    return response.json();
  },

  // Sector APIs
  async getSectorsByDistrictId(districtId: number): Promise<SectorDTO[]> {
    const response = await fetch(`${API_BASE}/locations/sectors/district/${districtId}`);
    if (!response.ok) throw new Error('Failed to fetch sectors');
    return response.json();
  },

  async getSectorById(id: number): Promise<SectorDTO> {
    const response = await fetch(`${API_BASE}/locations/sectors/${id}`);
    if (!response.ok) throw new Error('Failed to fetch sector');
    return response.json();
  },

  async createSector(sector: SectorDTO): Promise<SectorDTO> {
    const response = await fetch(`${API_BASE}/locations/sectors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sector),
    });
    if (!response.ok) throw new Error('Failed to create sector');
    return response.json();
  },

  // Village APIs
  async getVillagesBySectorId(sectorId: number): Promise<VillageDTO[]> {
    const response = await fetch(`${API_BASE}/locations/villages/sector/${sectorId}`);
    if (!response.ok) throw new Error('Failed to fetch villages');
    return response.json();
  },

  async getVillageById(id: number): Promise<VillageDTO> {
    const response = await fetch(`${API_BASE}/locations/villages/${id}`);
    if (!response.ok) throw new Error('Failed to fetch village');
    return response.json();
  },

  async createVillage(village: VillageDTO): Promise<VillageDTO> {
    const response = await fetch(`${API_BASE}/locations/villages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(village),
    });
    if (!response.ok) throw new Error('Failed to create village');
    return response.json();
  },

  // Cell APIs
  async getCellsByVillageId(villageId: number): Promise<CellDTO[]> {
    const response = await fetch(`${API_BASE}/locations/cells/village/${villageId}`);
    if (!response.ok) throw new Error('Failed to fetch cells');
    return response.json();
  },

  async getCellById(id: number): Promise<CellDTO> {
    const response = await fetch(`${API_BASE}/locations/cells/${id}`);
    if (!response.ok) throw new Error('Failed to fetch cell');
    return response.json();
  },

  async createCell(cell: CellDTO): Promise<CellDTO> {
    const response = await fetch(`${API_BASE}/locations/cells`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cell),
    });
    if (!response.ok) throw new Error('Failed to create cell');
    return response.json();
  },

  // Validation APIs
  async validateSameCell(userCellId: number, caseCellId: number): Promise<boolean> {
    const response = await fetch(
      `${API_BASE}/locations/validate/same-cell?userCellId=${userCellId}&caseCellId=${caseCellId}`
    );
    if (!response.ok) throw new Error('Failed to validate cell');
    return response.json();
  },

  async validateSameVillage(userCellId: number, caseCellId: number): Promise<boolean> {
    const response = await fetch(
      `${API_BASE}/locations/validate/same-village?userCellId=${userCellId}&caseCellId=${caseCellId}`
    );
    if (!response.ok) throw new Error('Failed to validate village');
    return response.json();
  },

  async validateSameSector(userCellId: number, caseCellId: number): Promise<boolean> {
    const response = await fetch(
      `${API_BASE}/locations/validate/same-sector?userCellId=${userCellId}&caseCellId=${caseCellId}`
    );
    if (!response.ok) throw new Error('Failed to validate sector');
    return response.json();
  },

  async getLocationHierarchy(cellId: number): Promise<string> {
    const response = await fetch(`${API_BASE}/locations/hierarchy/${cellId}`);
    if (!response.ok) throw new Error('Failed to get location hierarchy');
    return response.json();
  },
};
