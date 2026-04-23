import { useState } from 'react';
import SidebarLayout from '@/components/SidebarLayout';
import { Users, MessageSquare, Heart, Search, Plus } from 'lucide-react';

export default function Community() {
  const [searchQuery, setSearchQuery] = useState('');

  const members = [
    {
      id: 1,
      name: 'John Musyoka',
      role: 'Farmer',
      location: 'Kigali',
      avatar: '👨‍🌾',
      animals: 3,
      status: 'active',
    },
    {
      id: 2,
      name: 'Mary Kwame',
      role: 'Farmer',
      location: 'Musanze',
      avatar: '👩‍🌾',
      animals: 5,
      status: 'active',
    },
    {
      id: 3,
      name: 'Joseph Mukama',
      role: 'Farmer',
      location: 'Nyaruguru',
      avatar: '👨‍🌾',
      animals: 4,
      status: 'active',
    },
    {
      id: 4,
      name: 'Grace Nyambi',
      role: 'Farmer',
      location: 'Gitarama',
      avatar: '👩‍🌾',
      animals: 2,
      status: 'inactive',
    },
  ];

  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const posts = [
    {
      id: 1,
      author: 'John Musyoka',
      content: 'Just recovered from a serious livestock disease. Thanks to the CAHW team!',
      timestamp: '2 hours ago',
      likes: 12,
      comments: 3,
    },
    {
      id: 2,
      author: 'Mary Kwame',
      content: 'Sharing vaccination tips for goats in our region',
      timestamp: '1 day ago',
      likes: 24,
      comments: 8,
    },
  ];

  return (
    <SidebarLayout>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Community</h1>
            <p className="text-muted-foreground mt-1">Connect with farmers and other CAHWs</p>
          </div>
          <button className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition-all">
            <Plus className="h-5 w-5" />
            New Post
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Community Members */}
          <div className="lg:col-span-2 space-y-6">
            {/* Posts */}
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">👨‍🌾</span>
                    <div>
                      <p className="font-semibold text-foreground">{post.author}</p>
                      <p className="text-xs text-muted-foreground">{post.timestamp}</p>
                    </div>
                  </div>

                  <p className="text-foreground mb-4">{post.content}</p>

                  <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-lg">
                    <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-all">
                      <Heart className="h-5 w-5" />
                      <span className="text-sm font-medium">{post.likes}</span>
                    </button>
                    <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-all">
                      <MessageSquare className="h-5 w-5" />
                      <span className="text-sm font-medium">{post.comments}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Community Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Community Stats
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Total Members</p>
                  <p className="text-2xl font-bold text-foreground">156</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Today</p>
                  <p className="text-2xl font-bold text-primary">34</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Posts</p>
                  <p className="text-2xl font-bold text-foreground">428</p>
                </div>
              </div>
            </div>

            {/* Members List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-bold text-foreground mb-3">Members</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search members..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  />
                </div>
              </div>

              <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                {filteredMembers.map((member) => (
                  <div key={member.id} className="p-4 hover:bg-gray-50 transition-all">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{member.avatar}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.location}</p>
                      </div>
                      {member.status === 'active' && (
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{member.animals} animals</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
