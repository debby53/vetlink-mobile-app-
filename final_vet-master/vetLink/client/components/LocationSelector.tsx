import { useEffect, useState } from 'react';
import { locationService, ProvinceDTO, DistrictDTO, SectorDTO, VillageDTO, CellDTO } from '@/lib/locationService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface LocationSelectorProps {
  onLocationSelect: (cellId: number, sectorName?: string, districtName?: string) => void;
  selectedCellId?: number;
  label?: string;
}

export default function LocationSelector({ onLocationSelect, selectedCellId, label = 'Select Location' }: LocationSelectorProps) {
  const [provinces, setProvinces] = useState<ProvinceDTO[]>([]);
  const [districts, setDistricts] = useState<DistrictDTO[]>([]);
  const [sectors, setSectors] = useState<SectorDTO[]>([]);
  const [villages, setVillages] = useState<VillageDTO[]>([]);
  const [cells, setCells] = useState<CellDTO[]>([]);

  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedSector, setSelectedSector] = useState<string>('');
  const [selectedVillage, setSelectedVillage] = useState<string>('');
  const [selectedCell, setSelectedCell] = useState<string>(selectedCellId?.toString() || '');

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Load provinces on mount
  useEffect(() => {
    let cancelled = false;
    let retryTimeout: ReturnType<typeof setTimeout> | null = null;

    const loadProvinces = async () => {
      try {
        setLoading(true);
        setLoadError('');
        const data = await locationService.getProvinces();
        if (cancelled) return;
        setProvinces(data);
        setLoading(false);
      } catch (error) {
        if (cancelled) return;
        console.error(error);
        setLoadError('Locations are still starting up. Retrying...');
        retryTimeout = setTimeout(loadProvinces, 5000);
      }
    };

    void loadProvinces();

    return () => {
      cancelled = true;
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, []);

  // Load districts when province changes
  useEffect(() => {
    const loadDistricts = async () => {
      if (!selectedProvince) {
        setDistricts([]);
        return;
      }
      try {
        const data = await locationService.getDistrictsByProvinceId(parseInt(selectedProvince));
        setDistricts(data);
        setSelectedDistrict('');
        setSectors([]);
        setVillages([]);
        setCells([]);
      } catch (error) {
        toast.error('Failed to load districts');
      }
    };

    loadDistricts();
  }, [selectedProvince]);

  // Load sectors when district changes
  useEffect(() => {
    const loadSectors = async () => {
      if (!selectedDistrict) {
        setSectors([]);
        return;
      }
      try {
        const data = await locationService.getSectorsByDistrictId(parseInt(selectedDistrict));
        setSectors(data);
        setSelectedSector('');
      } catch (error) {
        toast.error('Failed to load sectors');
      }
    };

    loadSectors();
  }, [selectedDistrict]);

  // Notify parent when sector is selected
  useEffect(() => {
    if (selectedSector) {
      const sectorName = sectors.find(s => s.id.toString() === selectedSector)?.name || '';
      const districtName = districts.find(d => d.id.toString() === selectedDistrict)?.name || '';
      onLocationSelect(parseInt(selectedSector), sectorName, districtName);
    }
  }, [selectedSector, onLocationSelect, sectors, districts, selectedDistrict]);

  if (loading && provinces.length === 0) {
    return (
      <div className="space-y-2 text-sm text-muted-foreground">
        <div>Loading locations...</div>
        {loadError && <div>{loadError}</div>}
      </div>
    );
  }

  if (!loading && provinces.length === 0) {
    return (
      <div className="space-y-3">
        <div className="text-sm text-destructive">
          Failed to load locations.
        </div>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-lg border px-3 py-2 text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Province</label>
        <Select value={selectedProvince} onValueChange={setSelectedProvince}>
          <SelectTrigger>
            <SelectValue placeholder="Select Province" />
          </SelectTrigger>
          <SelectContent>
            {provinces.map((province) => (
              <SelectItem key={province.id} value={province.id.toString()}>
                {province.displayName || province.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedProvince && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">District</label>
          <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
            <SelectTrigger>
              <SelectValue placeholder="Select District" />
            </SelectTrigger>
            <SelectContent>
              {districts.map((district) => (
                <SelectItem key={district.id} value={district.id.toString()}>
                  {district.displayName || district.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {selectedDistrict && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Sector</label>
          <Select value={selectedSector} onValueChange={setSelectedSector}>
            <SelectTrigger>
              <SelectValue placeholder="Select Sector" />
            </SelectTrigger>
            <SelectContent>
              {sectors.map((sector) => (
                <SelectItem key={sector.id} value={sector.id.toString()}>
                  {sector.displayName || sector.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
