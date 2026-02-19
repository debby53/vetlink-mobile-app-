import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import SidebarLayout from '@/components/SidebarLayout';
import CallModal from '@/components/CallModal';
import { useAuth } from '@/lib/AuthContext';
import { messageAPI, userAPI, callAPI } from '@/lib/apiService';
import { toast } from 'sonner';
import { Send, Search, Phone, Video, MoreVertical, Paperclip, X, Plus, Trash2, Edit2, Check } from 'lucide-react';

export default function FarmerMessages() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [messageText, setMessageText] = useState('');
  const [conversations, setConversations] = useState<any[]>([]);
  const [currentMessages, setCurrentMessages] = useState<any[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [searchUsers, setSearchUsers] = useState<any[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [selectedChatUser, setSelectedChatUser] = useState<any>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [modalSearch, setModalSearch] = useState('');
  const [selectedMessages, setSelectedMessages] = useState<Set<number>>(new Set());
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [hoveredMessageId, setHoveredMessageId] = useState<number | null>(null);
  const [activeCall, setActiveCall] = useState<any>(null);
  const [showCallModal, setShowCallModal] = useState(false);
  const [incomingCalls, setIncomingCalls] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const callCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const parseDate = (dateValue: any): Date => {
    if (Array.isArray(dateValue)) {
      const [year, month, day, hour, minute, second] = dateValue;
      return new Date(year, month - 1, day, hour, minute, second || 0);
    }
    return new Date(dateValue || 0);
  };

  const loadConversations = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const allMessages = await messageAPI.getInboxMessages(user.id);
      const unreadMessages = await messageAPI.getUnreadMessages(user.id);

      const uniquePartners = new Map();

      allMessages.forEach((msg: any) => {
        const partnerId = msg.senderId === user.id ? msg.recipientId : msg.senderId;

        if (!uniquePartners.has(partnerId)) {
          uniquePartners.set(partnerId, msg);
        } else {
          const existing = uniquePartners.get(partnerId);
          if (parseDate(msg.createdAt) > parseDate(existing.createdAt)) {
            uniquePartners.set(partnerId, msg);
          }
        }
      });

      const convs = await Promise.all(
        Array.from(uniquePartners.values()).map(async (msg: any) => {
          const partnerId = msg.senderId === user.id ? msg.recipientId : msg.senderId;
          const partnerData = await userAPI.getUserById(partnerId);
          const partnerName = partnerData?.name || 'Unknown';
          return {
            id: partnerId,
            name: partnerName,
            phone: partnerData?.phone || '',
            avatar: partnerName.charAt(0).toUpperCase(),
            type: partnerData?.role || 'CAHW',
            locationId: partnerData?.locationId, // Capture location
            lastMessage: msg.content,
            timestamp: parseDate(msg.createdAt).toLocaleDateString(),
            unread: unreadMessages.filter((m: any) => m.senderId === partnerId && !m.isRead).length,
          };
        })
      );

      // Apply restriction: Farmers can only see conversations with CAHWs in their sector
      let filteredConvs = convs;
      if (user.role?.toUpperCase() === 'FARMER') {
        filteredConvs = convs.filter(c =>
          (c.type?.toUpperCase() === 'CAHW') &&
          (!user.locationId || !c.locationId || String(c.locationId) === String(user.locationId))
        );
      }

      setConversations(filteredConvs);
      if (filteredConvs.length > 0 && !selectedChat) {
        setSelectedChat(filteredConvs[0].id);
      }
    } catch (err: any) {
      console.error('Error loading conversations:', err);
      toast.error('Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async () => {
    if (!selectedChat || !user?.id) return;
    setIsLoading(true);
    try {
      console.log(`Loading messages between user ${user.id} and ${selectedChat}`);
      const msgs = await messageAPI.getConversation(user.id, selectedChat);
      console.log('Messages loaded:', msgs);

      const sortedMsgs = (msgs || []).sort((a, b) => {
        const dateA = parseDate(a.createdAt).getTime();
        const dateB = parseDate(b.createdAt).getTime();
        return dateA - dateB;
      });

      setCurrentMessages(sortedMsgs);

      if (sortedMsgs && sortedMsgs.length > 0) {
        for (const msg of sortedMsgs) {
          if (!msg.isRead && msg.recipientId === user.id) {
            try {
              await messageAPI.markMessageAsRead(msg.id);
            } catch (err) {
              console.error('Failed to mark message as read:', err);
            }
          }
        }
      }
    } catch (err: any) {
      console.error('Error loading messages:', err);
      toast.error('Failed to load messages: ' + (err.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const loadDirectCAHWChat = async (cahwId: number) => {
    if (!user?.id) return;
    try {
      const cahwData = await userAPI.getUserById(cahwId);
      setSelectedChatUser(cahwData);
      const msgs = await messageAPI.getConversation(user.id, cahwId);
      const sortedMsgs = (msgs || []).sort((a, b) => {
        const dateA = parseDate(a.createdAt).getTime();
        const dateB = parseDate(b.createdAt).getTime();
        return dateA - dateB;
      });
      setCurrentMessages(sortedMsgs);
    } catch (err: any) {
      console.error('Error loading direct chat:', err);
    }
  };

  const loadAllUsers = async () => {
    try {
      const users = await userAPI.getActiveUsers();

      if (user?.role?.toUpperCase() === 'FARMER' && users) {
        // Restriction: Farmers can only see CAHWs in the same sector (location)
        const filteredUsers = users.filter((u: any) =>
          u.role === 'CAHW' &&
          u.locationId &&
          user.locationId &&
          String(u.locationId) === String(user.locationId)
        );
        console.log('Filtered users for farmer:', filteredUsers.length);
        setAllUsers(filteredUsers);
      } else {
        setAllUsers(users || []);
      }
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  const checkIncomingCalls = async () => {
    try {
      const calls = await callAPI.getIncomingCalls();
      if (calls.length > 0) {
        setIncomingCalls(calls);
        setActiveCall(calls[0]);
        setShowCallModal(true);
      }
    } catch (err) {
      console.error('Error checking calls:', err);
    }
  };

  const startCall = async (recipientId: number, callType: 'voice' | 'video') => {
    try {
      const call = await callAPI.initiateCall(recipientId, callType);
      setActiveCall(call);
      setShowCallModal(true);
      toast.success(`${callType === 'video' ? 'Video' : 'Voice'} call initiated...`);
    } catch (err: any) {
      console.error('Error starting call:', err);
      toast.error('Failed to start call: ' + (err.message || 'Unknown error'));
    }
  };

  const acceptCall = async () => {
    try {
      if (!activeCall?.id) return;
      const call = await callAPI.acceptCall(activeCall.id);
      setActiveCall(call);
      toast.success('Call accepted!');
    } catch (err: any) {
      console.error('Error accepting call:', err);
      toast.error('Failed to accept call');
    }
  };

  const declineCall = async () => {
    try {
      if (!activeCall?.id) return;
      await callAPI.declineCall(activeCall.id, 'declined');
      setActiveCall(null);
      setShowCallModal(false);
      setIncomingCalls(incomingCalls.filter(c => c.id !== activeCall.id));
      toast.success('Call declined');
    } catch (err: any) {
      console.error('Error declining call:', err);
      toast.error('Failed to decline call');
    }
  };

  const endCall = async () => {
    try {
      if (!activeCall?.id) return;
      await callAPI.endCall(activeCall.id);
      setActiveCall(null);
      setShowCallModal(false);
      toast.success('Call ended');
    } catch (err: any) {
      console.error('Error ending call:', err);
      toast.error('Failed to end call');
    }
  };

  const handleCallClose = () => {
    setShowCallModal(false);
    // Always end the call when closing the modal to ensure backend is updated
    endCall();
  };

  useEffect(() => {
    if (user?.id) {
      loadConversations();
      loadAllUsers();
      checkIncomingCalls();
      // Check for incoming calls every 2 seconds
      callCheckIntervalRef.current = setInterval(() => {
        checkIncomingCalls();
      }, 2000);
    }
    return () => {
      if (callCheckIntervalRef.current) {
        clearInterval(callCheckIntervalRef.current);
      }
    };
  }, [user?.id]);

  useEffect(() => {
    const cahwId = searchParams.get('cahw');
    if (cahwId) {
      const cahwIdNum = parseInt(cahwId);
      setSelectedChat(cahwIdNum);
      loadDirectCAHWChat(cahwIdNum);
      console.log('Auto-selected CAHW:', cahwIdNum);
    }
  }, [searchParams]);

  useEffect(() => {
    if (selectedChat) {
      loadMessages();
    }
  }, [selectedChat, user?.id]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages]);

  const formatMessageDate = (dateString: any) => {
    try {
      if (!dateString) return 'Unknown time';

      let date: Date;

      // Handle array format from Java LocalDateTime: [year, month, day, hour, minute, second, nano]
      if (Array.isArray(dateString)) {
        console.log('Array date format:', dateString);
        const [year, month, day, hour, minute, second] = dateString;
        // month is 1-indexed in the array, but Date constructor expects 0-indexed
        date = new Date(year, month - 1, day, hour, minute, second || 0);
      } else if (typeof dateString === 'string') {
        // Try parsing as ISO 8601 (with or without milliseconds and timezone)
        date = new Date(dateString);

        // If that failed, try other formats
        if (isNaN(date.getTime())) {
          // Try removing 'Z' and timezone info and parse again
          const cleanedDate = dateString.replace('Z', '').split('+')[0];
          date = new Date(cleanedDate);
        }
      } else if (typeof dateString === 'number') {
        date = new Date(dateString);
      } else {
        date = new Date(dateString);
      }

      if (isNaN(date.getTime())) {
        console.warn('Invalid date:', dateString);
        return 'Invalid Date';
      }

      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      console.error('Error formatting date:', dateString, err);
      return 'Invalid Date';
    }
  };

  const handleStartNewConversation = (userId: number) => {
    setSelectedChat(userId);
    setShowUserModal(false);
    setModalSearch('');
    loadDirectCAHWChat(userId);
  };

  const filteredModalUsers = allUsers.filter(u =>
    u.id !== user?.id &&
    u.name?.toLowerCase().includes(modalSearch.toLowerCase())
  );

  const handleSearchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchUsers([]);
      return;
    }
    setIsSearchingUsers(true);
    try {
      // Fetch all active users and filter by name
      const allUsers = await userAPI.getActiveUsers();
      if (allUsers) {
        let filtered = allUsers.filter((u: any) =>
          u.name?.toLowerCase().includes(query.toLowerCase()) && u.id !== user?.id
        );

        // Apply Farmer restriction: Only CAHWs in same sector
        if (user?.role?.toUpperCase() === 'FARMER') {
          filtered = filtered.filter((u: any) =>
            u.role === 'CAHW' &&
            (!user.locationId || !u.locationId || String(u.locationId) === String(user.locationId))
          );
        }

        setSearchUsers(filtered);
      }
    } catch (err: any) {
      console.error('Error searching users:', err);
      toast.error('Failed to search users');
    } finally {
      setIsSearchingUsers(false);
    }
  };

  const selectUserToMessage = (selectedUser: any) => {
    setSelectedChat(selectedUser.id);
    setSelectedChatUser(selectedUser);
    setShowUserSearch(false);
    setSearchUsers([]);
    loadDirectCAHWChat(selectedUser.id);
  };

  const handleSendMessage = async () => {
    console.log('Send button clicked', { selectedChat, messageText, userId: user?.id });

    if (!messageText.trim() || !selectedChat || !user?.id) {
      toast.error('Please enter a message and select a conversation');
      return;
    }

    setIsSending(true);
    try {
      console.log('Sending message:', { senderId: user.id, recipientId: selectedChat, content: messageText });
      const newMessage = await messageAPI.sendMessage({
        senderId: user.id,
        recipientId: selectedChat,
        content: messageText,
      });

      console.log('Message sent successfully:', newMessage);
      // Add new message and maintain sort order (it should be latest)
      setCurrentMessages([...currentMessages, newMessage]);
      setMessageText('');
      toast.success('Message sent successfully');

      // Refresh conversations to update last message and timestamp
      loadConversations();
    } catch (err: any) {
      console.error('Error sending message:', err);
      toast.error('Failed to send message: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSending(false);
    }
  };

  const toggleSelectMessage = (messageId: number) => {
    const newSelected = new Set(selectedMessages);
    if (newSelected.has(messageId)) {
      newSelected.delete(messageId);
    } else {
      newSelected.add(messageId);
    }
    setSelectedMessages(newSelected);
  };

  const selectAllMessages = () => {
    if (selectedMessages.size === currentMessages.length) {
      setSelectedMessages(new Set());
    } else {
      setSelectedMessages(new Set(currentMessages.map(m => m.id)));
    }
  };

  const deleteMessage = async (messageId: number) => {
    try {
      await messageAPI.deleteMessage(messageId);
      setCurrentMessages(currentMessages.filter(m => m.id !== messageId));
      setSelectedMessages(prev => {
        const newSet = new Set(prev);
        newSet.delete(messageId);
        return newSet;
      });
      toast.success('Message deleted');
    } catch (err: any) {
      console.error('Error deleting message:', err);
      toast.error('Failed to delete message');
    }
  };

  const deleteSelectedMessages = async () => {
    if (selectedMessages.size === 0) {
      toast.error('No messages selected');
      return;
    }

    try {
      await Promise.all(Array.from(selectedMessages).map(id => messageAPI.deleteMessage(id)));
      setCurrentMessages(currentMessages.filter(m => !selectedMessages.has(m.id)));
      setSelectedMessages(new Set());
      toast.success(`${selectedMessages.size} message(s) deleted`);
    } catch (err: any) {
      console.error('Error deleting messages:', err);
      toast.error('Failed to delete messages');
    }
  };

  const deleteAllMessages = async () => {
    if (currentMessages.length === 0) {
      toast.error('No messages to delete');
      return;
    }

    if (!confirm(`Delete all ${currentMessages.length} messages? This cannot be undone.`)) {
      return;
    }

    try {
      await Promise.all(currentMessages.map(m => messageAPI.deleteMessage(m.id)));
      setCurrentMessages([]);
      setSelectedMessages(new Set());
      toast.success('All messages deleted');
    } catch (err: any) {
      console.error('Error deleting all messages:', err);
      toast.error('Failed to delete all messages');
    }
  };

  const startEditMessage = (message: any) => {
    if (message.senderId !== user?.id) {
      toast.error('You can only edit your own messages');
      return;
    }
    setEditingMessageId(message.id);
    setEditingContent(message.content);
  };

  const updateMessage = async () => {
    if (!editingMessageId || !editingContent.trim()) {
      toast.error('Please enter message content');
      return;
    }

    try {
      const updated = await messageAPI.updateMessage(editingMessageId, editingContent);
      setCurrentMessages(currentMessages.map(m => m.id === editingMessageId ? updated : m));
      setEditingMessageId(null);
      setEditingContent('');
      toast.success('Message updated');
    } catch (err: any) {
      console.error('Error updating message:', err);
      toast.error('Failed to update message');
    }
  };

  return (
    <SidebarLayout>
      <div className="max-w-7xl mx-auto h-full flex gap-6">
        {/* Conversations List */}
        <div className="w-96 bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col hidden lg:flex">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-foreground">Messages</h2>
              <button
                onClick={() => setShowUserModal(true)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-primary/90 transition-all text-sm font-medium"
              >
                New Message
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Conversations List */}
          {
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
              {conversations.filter((conv) =>
                conv.name.toLowerCase().includes(searchQuery.toLowerCase())
              ).length === 0 ? (
                <div className="flex items-center justify-center p-4 text-muted-foreground">
                  {conversations.length === 0 ? 'No conversations yet' : 'No matching conversations'}
                </div>
              ) : (
                conversations
                  .filter((conv) =>
                    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedChat(conv.id)}
                      className={`w-full text-left p-4 hover:bg-gray-50 transition-all ${selectedChat === conv.id ? 'bg-blue-50 border-l-4 border-primary' : ''
                        }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                          {conv.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground truncate">{conv.name}</p>
                          <p className="text-xs text-muted-foreground">{conv.type}</p>
                        </div>
                        {conv.unread > 0 && (
                          <span className="flex items-center justify-center h-6 w-6 rounded-full bg-red-500 text-white text-xs font-bold">
                            {conv.unread}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                      <p className="text-xs text-muted-foreground mt-1">{conv.timestamp}</p>
                    </button>
                  ))
              )}
            </div>
          }
        </div>

        {/* User Selection Modal */}
        {showUserModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
            <div className="bg-white rounded-t-lg sm:rounded-lg w-full sm:max-w-md max-h-[90vh] flex flex-col shadow-lg">
              {/* Modal Header */}
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Select User to Message</h3>
                <button
                  onClick={() => {
                    setShowUserModal(false);
                    setModalSearch('');
                  }}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>

              {/* Search Input */}
              <div className="p-4 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by name..."
                    value={modalSearch}
                    onChange={(e) => setModalSearch(e.target.value)}
                    autoFocus
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  />
                </div>
              </div>

              {/* Users List */}
              <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                {filteredModalUsers.length === 0 ? (
                  <div className="flex items-center justify-center p-8 text-muted-foreground">
                    {allUsers.length === 0 ? 'No users available' : 'No users found'}
                  </div>
                ) : (
                  filteredModalUsers.map((userItem) => (
                    <button
                      key={userItem.id}
                      onClick={() => handleStartNewConversation(userItem.id)}
                      className="w-full text-left p-4 hover:bg-gray-50 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                          {userItem.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground truncate">{userItem.name}</p>
                          <p className="text-xs text-muted-foreground">{userItem.role}</p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Chat Area */}
        <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col">
          {!selectedChat ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <p className="text-lg font-medium mb-2">No conversation selected</p>
                <p className="text-sm">Select a conversation from the list to start messaging</p>
              </div>
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                    {(selectedChatUser?.name || conversations.find((c) => c.id === selectedChat)?.name)?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {selectedChatUser?.name || conversations.find((c) => c.id === selectedChat)?.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedChatUser?.role || conversations.find((c) => c.id === selectedChat)?.type}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startCall(selectedChat!, 'voice')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                    title="Start voice call"
                  >
                    <Phone className="h-5 w-5 text-primary" />
                  </button>
                  <button
                    onClick={() => startCall(selectedChat!, 'video')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                    title="Start video call"
                  >
                    <Video className="h-5 w-5 text-primary" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-all">
                    <MoreVertical className="h-5 w-5 text-muted-foreground" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-muted-foreground">Loading messages...</div>
                  </div>
                ) : currentMessages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-muted-foreground">No messages yet. Start the conversation!</div>
                  </div>
                ) : (
                  <>
                    {/* Message Actions Toolbar */}
                    {currentMessages.length > 0 && (
                      <div className="flex items-center gap-2 mb-4 p-2 bg-gray-50 rounded-lg sticky top-0 z-10">
                        <input
                          type="checkbox"
                          checked={selectedMessages.size === currentMessages.length && currentMessages.length > 0}
                          onChange={selectAllMessages}
                          className="w-5 h-5 cursor-pointer"
                          title="Select all messages"
                        />
                        <span className="text-sm text-muted-foreground">
                          {selectedMessages.size > 0 ? `${selectedMessages.size} selected` : 'Select all'}
                        </span>
                        {selectedMessages.size > 0 && (
                          <>
                            <button
                              onClick={deleteSelectedMessages}
                              className="ml-auto inline-flex items-center gap-1 px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-all"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete Selected
                            </button>
                          </>
                        )}
                        {currentMessages.length > 0 && (
                          <button
                            onClick={deleteAllMessages}
                            className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete All
                          </button>
                        )}
                      </div>
                    )}

                    {currentMessages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'} group`}
                        onMouseEnter={() => setHoveredMessageId(msg.id)}
                        onMouseLeave={() => setHoveredMessageId(null)}
                      >
                        <div className="flex items-end gap-2">
                          {msg.senderId === user?.id && (
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => startEditMessage(msg)}
                                className="p-1 hover:bg-blue-100 rounded transition-all"
                                title="Edit message"
                              >
                                <Edit2 className="h-4 w-4 text-blue-600" />
                              </button>
                              <button
                                onClick={() => deleteMessage(msg.id)}
                                className="p-1 hover:bg-red-100 rounded transition-all"
                                title="Delete message"
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </button>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            {msg.senderId === user?.id && (hoveredMessageId === msg.id || selectedMessages.has(msg.id)) && (
                              <input
                                type="checkbox"
                                checked={selectedMessages.has(msg.id)}
                                onChange={() => toggleSelectMessage(msg.id)}
                                className="w-4 h-4 cursor-pointer"
                              />
                            )}
                            {editingMessageId === msg.id ? (
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={editingContent}
                                  onChange={(e) => setEditingContent(e.target.value)}
                                  className="px-3 py-2 border border-gray-300 rounded-lg flex-1 text-sm"
                                  autoFocus
                                />
                                <button
                                  onClick={updateMessage}
                                  className="p-2 bg-green-600 text-white rounded hover:bg-green-700 transition-all"
                                >
                                  <Check className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => setEditingMessageId(null)}
                                  className="p-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-all"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ) : (
                              <div
                                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${msg.senderId === user?.id
                                  ? 'bg-green-600 text-white shadow-md'
                                  : 'bg-white text-gray-900 border border-gray-300 shadow-sm'
                                  }`}
                              >
                                <p className="text-sm font-medium">{msg.content}</p>
                                <p className={`text-xs mt-2 ${msg.senderId === user?.id ? 'text-green-100' : 'text-gray-500'}`}>
                                  {formatMessageDate(msg.createdAt)}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Message Input */}
              <div className="border-t border-gray-100 p-4">
                <div className="flex gap-3">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-all">
                    <Paperclip className="h-5 w-5 text-muted-foreground" />
                  </button>
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={isSending || !messageText.trim()}
                    className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                  >
                    <Send className="h-5 w-5" />
                    {isSending ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Call Modal */}
      <CallModal
        isOpen={showCallModal}
        callData={activeCall}
        onClose={handleCallClose}
        onAccept={acceptCall}
        onDecline={declineCall}
        isIncoming={activeCall?.senderId !== user?.id}
        currentUserId={user?.id}
      />
    </SidebarLayout>
  );
}
