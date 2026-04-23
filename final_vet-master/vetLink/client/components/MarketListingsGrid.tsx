import React, { useState } from 'react';
import { Search, Filter, ShoppingBag, MapPin, Tag } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

// Interfaces
interface Listing {
    id: number;
    title: string;
    price: number;
    type: 'ANIMAL' | 'PRODUCE' | 'INPUT';
    location: string;
    image: string;
    seller: string;
    time: string;
}

const mockListings: Listing[] = [
    {
        id: 1,
        title: 'Holstein Friesian Dairy Cow',
        price: 850000,
        type: 'ANIMAL',
        location: 'Rwamagana',
        image: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?q=80&w=2670&auto=format&fit=crop',
        seller: 'John Mugisha',
        time: '2 hours ago'
    },
    {
        id: 2,
        title: 'Premium Yellow Maize (100kg)',
        price: 45000,
        type: 'PRODUCE',
        location: 'Musanze',
        image: 'https://images.unsplash.com/photo-1622943244246-8806287e0767?q=80&w=2692&auto=format&fit=crop',
        seller: 'Cooperative Maisha',
        time: '5 hours ago'
    },
    {
        id: 3,
        title: 'Dewormer (Albendazole) - Bulk',
        price: 15000,
        type: 'INPUT',
        location: 'Kigali',
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=2670&auto=format&fit=crop',
        seller: 'VetPharm Ltd',
        time: '1 day ago'
    },
    {
        id: 4,
        title: 'Boer Goats (Pair)',
        price: 120000,
        type: 'ANIMAL',
        location: 'Nyagatare',
        image: 'https://images.unsplash.com/photo-1524024973431-2ad916746881?q=80&w=2574&auto=format&fit=crop',
        seller: 'AgroFarm Rwanda',
        time: '3 hours ago'
    },
    {
        id: 5,
        title: 'Organic Fertilizer (50kg)',
        price: 8000,
        type: 'INPUT',
        location: 'Huye',
        image: 'https://images.unsplash.com/photo-1628108426034-72671cb647a7?q=80&w=2670&auto=format&fit=crop',
        seller: 'Green Earth',
        time: '6 hours ago'
    },
    {
        id: 6,
        title: 'Local Free-Range Chickens',
        price: 6000,
        type: 'ANIMAL',
        location: 'Bugesera',
        image: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?q=80&w=2400&auto=format&fit=crop',
        seller: 'Poultry King',
        time: '30 mins ago'
    }
];

export const MarketListingsGrid: React.FC = () => {
    const { t } = useLanguage();
    const [filterType, setFilterType] = useState<string>('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredListings = mockListings.filter(l => {
        const matchesType = filterType === 'ALL' || l.type === filterType;
        const matchesSearch = l.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesType && matchesSearch;
    });

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-foreground">Market Hub</h1>
                    <p className="text-muted-foreground mt-1">Connect with buyers and sellers across Rwanda</p>
                </div>
                <button className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-all shadow-sm">
                    <ShoppingBag className="h-5 w-5" />
                    List Item
                </button>
            </div>

            {/* Controls */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 w-full md:max-w-md">
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search listings..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    />
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none">
                        <Filter className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="w-full md:w-48 pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent appearance-none bg-white"
                        >
                            <option value="ALL">All Categories</option>
                            <option value="ANIMAL">Animals</option>
                            <option value="PRODUCE">Produce</option>
                            <option value="INPUT">Farm Inputs</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredListings.length > 0 ? (
                    filteredListings.map(listing => (
                        <div key={listing.id} className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full">
                            <div className="relative h-48 overflow-hidden bg-gray-100">
                                <img
                                    src={listing.image}
                                    alt={listing.title}
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute top-3 left-3">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/90 text-gray-800 shadow-sm backdrop-blur">
                                        <Tag className="w-3 h-3 mr-1" />
                                        {listing.type}
                                    </span>
                                </div>
                            </div>

                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-green-600 transition-colors line-clamp-1">
                                    {listing.title}
                                </h3>

                                <div className="flex items-center text-sm text-gray-500 mb-4">
                                    <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                                    {listing.location}
                                </div>

                                <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                                    <div>
                                        <p className="text-2xl font-bold text-green-600">
                                            {listing.price.toLocaleString()} <span className="text-sm font-medium text-gray-500">RWF</span>
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">By {listing.seller}</p>
                                    </div>
                                    <button className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">
                                        Contact
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ShoppingBag className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No listings found</h3>
                        <p className="text-gray-500 max-w-sm mx-auto mt-2">
                            Try adjusting your search or filters to find what you're looking for.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
