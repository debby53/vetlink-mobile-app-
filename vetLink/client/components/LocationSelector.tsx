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

  // Load provinces on mount
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        setLoading(true);
        const data = await locationService.getProvinces();
        setProvinces(data);
      } catch (error) {
        toast.error('Failed to load provinces');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadProvinces();
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
    return <div className="text-sm text-muted-foreground">Loading locations...</div>;
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
