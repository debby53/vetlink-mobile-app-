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
        setVillages([]);
        setCells([]);
      } catch (error) {
        toast.error('Failed to load sectors');
      }
    };

    loadSectors();
  }, [selectedDistrict]);

  // Load villages when sector changes
  useEffect(() => {
    const loadVillages = async () => {
      if (!selectedSector) {
        setVillages([]);
        return;
      }
      try {
        const data = await locationService.getVillagesBySectorId(parseInt(selectedSector));
        setVillages(data);
        setSelectedVillage('');
        setCells([]);
      } catch (error) {
        toast.error('Failed to load villages');
      }
    };

    loadVillages();
  }, [selectedSector]);

  // Load cells when village changes
  useEffect(() => {
    const loadCells = async () => {
      if (!selectedVillage) {
        setCells([]);
        return;
      }
      try {
        const data = await locationService.getCellsByVillageId(parseInt(selectedVillage));
        setCells(data);
        setSelectedCell('');
      } catch (error) {
        toast.error('Failed to load cells');
      }
    };

    loadCells();
  }, [selectedVillage]);

  // Notify parent when cell is selected
  useEffect(() => {
    if (selectedCell) {
      const sectorName = sectors.find(s => s.id.toString() === selectedSector)?.name || '';
      const districtName = districts.find(d => d.id.toString() === selectedDistrict)?.name || '';
      onLocationSelect(parseInt(selectedCell), sectorName, districtName);
    }
  }, [selectedCell, onLocationSelect, sectors, districts, selectedSector, selectedDistrict]);

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
                {province.name}
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
                  {district.name}
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
                  {sector.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {selectedSector && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Village</label>
          <Select value={selectedVillage} onValueChange={setSelectedVillage}>
            <SelectTrigger>
              <SelectValue placeholder="Select Village" />
            </SelectTrigger>
            <SelectContent>
              {villages.map((village) => (
                <SelectItem key={village.id} value={village.id.toString()}>
                  {village.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {selectedVillage && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Cell</label>
          <Select value={selectedCell} onValueChange={setSelectedCell}>
            <SelectTrigger>
              <SelectValue placeholder="Select Cell" />
            </SelectTrigger>
            <SelectContent>
              {cells.map((cell) => (
                <SelectItem key={cell.id} value={cell.id.toString()}>
                  {cell.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
