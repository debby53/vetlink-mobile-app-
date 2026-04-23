import { useState, useEffect } from 'react';
import SidebarLayout from '@/components/SidebarLayout';
import { Search, Phone, Mail, MapPin, UserCheck, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { userAPI, UserDTO } from '@/lib/apiService';
import { locationService } from '@/lib/locationService';

export default function CAHWs() {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [cahws, setCahws] = useState<UserDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [locationName, setLocationName] = useState<string>('');

    useEffect(() => {
        const loadData = async () => {
            if (!user?.locationId) return;

            try {
                setIsLoading(true);
                // Load Location Name
                try {
                    const hierarchy = await locationService.getLocationHierarchy(user.locationId);
                    if (typeof hierarchy === 'string') {
                        // Format: Province > District > Sector > Village > Cell
                        // We want District (index 1) and Sector (index 2)
                        const parts = hierarchy.split(' > ');
                        if (parts.length >= 3) {
                            setLocationName(`${parts[1]} - ${parts[2]}`);
                        } else if (parts.length >= 2) {
                            setLocationName(parts[1]);
                        } else {
                            setLocationName(hierarchy);
                        }
                    } else {
                        setLocationName(`Location ID: ${user.locationId}`);
                    }
                } catch (locErr) {
                    console.error('Failed to load location hierarchy', locErr);
                    setLocationName(`Location ID: ${user.locationId}`);
                }

                // Fetch all CAHWs
                const allCahws = await userAPI.getUsersByRole('cahw');

                // Filter by same location as veterinarian
                const localCahws = allCahws.filter(
                    (cahw) => cahw.locationId === user.locationId
                );

                setCahws(localCahws);
            } catch (err) {
                console.error('Failed to load data', err);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [user?.locationId]);

    const filteredCahws = cahws.filter((c) =>
        (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.email || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <SidebarLayout>
            <div className="max-w-7xl mx-auto p-6 space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-4xl font-bold text-foreground">Community Health Workers</h1>
                    <p className="text-muted-foreground mt-1">
                        CAHWs working in your sector ({locationName || `Location ID: ${user?.locationId}`})
                    </p>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                </div>

                {/* CAHWs Grid */}
                {isLoading ? (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">Loading CAHWs...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCahws.length > 0 ? (
                            filteredCahws.map((cahw) => (
                                <div key={cahw.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                <UserCheck className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-foreground">{cahw.name}</h3>
                                                <div className="flex items-center gap-1 text-muted-foreground text-xs mt-0.5">
                                                    <ShieldCheck className="h-3 w-3 text-green-600" />
                                                    <span>Active CAHW</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                                        {cahw.phone && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Phone className="h-4 w-4 text-primary" />
                                                <span className="text-foreground">{cahw.phone}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 text-sm">
                                            <Mail className="h-4 w-4 text-primary" />
                                            <span className="text-foreground">{cahw.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <MapPin className="h-4 w-4 text-primary" />
                                            <span className="text-foreground">Sector ID: {cahw.locationId}</span>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                                        <button className="flex-1 px-3 py-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-all font-medium text-sm flex items-center justify-center gap-2">
                                            <Phone className="h-4 w-4" />
                                            Call
                                        </button>
                                        <button className="flex-1 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all font-medium text-sm flex items-center justify-center gap-2">
                                            <Mail className="h-4 w-4" />
                                            Message
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12 bg-white rounded-lg border border-gray-100">
                                <UserCheck className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-muted-foreground">No Community Animal Health Workers found in your sector</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </SidebarLayout>
    );
}
