import { useState, useEffect, useRef } from 'react';
import SidebarLayout from '@/components/SidebarLayout';
import CallModal from '@/components/CallModal';
import { Send, Search, MessageSquare, X, Trash2, Edit2, Check, Phone, Video } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { messageAPI, userAPI, callAPI, MessageDTO, UserDTO } from '@/lib/apiService';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface Conversation {
  partnerId: number;
  name: string;
  type: string;
  avatar: string;
  lastMessage: string;
  timestamp: any; // Using any to handle various date formats from backend
  unread: number;
}

export default function Messages() {
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [messageText, setMessageText] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [allUsers, setAllUsers] = useState<UserDTO[]>([]);
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [searchUsers, setSearchUsers] = useState('');
  const [selectedChatUser, setSelectedChatUser] = useState<UserDTO | null>(null);
  const [selectedMessages, setSelectedMessages] = useState<Set<number>>(new Set());
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [hoveredMessageId, setHoveredMessageId] = useState<number | null>(null);
  const [activeCall, setActiveCall] = useState<any>(null);
  const [showCallModal, setShowCallModal] = useState(false);
  const [incomingCalls, setIncomingCalls] = useState<any[]>([]);
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
  const callCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const parseDate = (dateValue: any): Date => {
    if (Array.isArray(dateValue)) {
      const [year, month, day, hour, minute, second] = dateValue;
      return new Date(year, month - 1, day, hour, minute, second || 0);
    }
    return new Date(dateValue || 0);
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
    if (!user?.id) return;

    let isMounted = true;

    const loadInbox = async () => {
      try {
        const inbox = await messageAPI.getInboxMessages(user.id);
        // Build conversation list (one entry per partner)
        const map = new Map<number, any>();
        for (const msg of inbox) {
          const partnerId = msg.senderId === user.id ? msg.recipientId : msg.senderId;
          const existing = map.get(partnerId);
          if (!existing || parseDate(msg.createdAt).getTime() > parseDate(existing.timestamp || 0).getTime()) {
            map.set(partnerId, {
              partnerId,
              lastMessage: msg.content || msg.attachmentUrl || '',
              timestamp: msg.createdAt,
              unread: msg.isRead ? 0 : 1,
            });
          }
        }

        const convs: any[] = [];
        for (const [partnerId, info] of map.entries()) {
          try {
            const u = await userAPI.getUserById(partnerId as number);
            convs.push({
              partnerId,
              name: u.name,
              type: u.role || 'Farmer',
              avatar: u.name ? u.name.charAt(0) : '👤',
              lastMessage: info.lastMessage,
              timestamp: info.timestamp,
              unread: info.unread,
            });
          } catch (inner) {
            convs.push({ partnerId, name: 'Unknown', type: 'User', avatar: '👤', ...info });
          }
        }
        if (!isMounted) return;

        setConversations(convs);
        if (convs.length > 0 && selectedChat === null) setSelectedChat(convs[0].partnerId as number);

        // Load all active users for new message selection
        try {
          const allUsersData = await userAPI.getActiveUsers();
          if (isMounted) {
            setAllUsers(allUsersData || []);
          }
        } catch (err) {
          console.error('Failed to load users:', err);
        }
      } catch (err) {
        console.error('Failed to load inbox', err);
        toast.error('Failed to load messages');
      }
    };

    loadInbox();

    checkIncomingCalls();
    if (callCheckIntervalRef.current) {
      clearInterval(callCheckIntervalRef.current);
    }
    callCheckIntervalRef.current = setInterval(() => {
      checkIncomingCalls();
    }, 2000);

    return () => {
      isMounted = false;
      if (callCheckIntervalRef.current) {
        clearInterval(callCheckIntervalRef.current);
        callCheckIntervalRef.current = null;
      }
    };
  }, [user?.id]);

  useEffect(() => {
    const loadConversation = async () => {
      if (!user?.id || !selectedChat) return;
      try {
        const conv = await messageAPI.getConversation(user.id, selectedChat);
        setMessages(conv);
        try {
          const chatUser = await userAPI.getUserById(selectedChat);
          setSelectedChatUser(chatUser);
        } catch (userErr) {
          console.error('Failed to load selected chat user', userErr);
          setSelectedChatUser(null);
        }
      } catch (err) {
        console.error('Failed to load conversation', err);
      }
    };
    loadConversation();
  }, [user?.id, selectedChat]);

  const sendMessage = async () => {
    if (!user?.id || !selectedChat) return;
    if (!messageText.trim()) return;
    try {
      const sent = await messageAPI.sendMessage({ senderId: user.id, recipientId: selectedChat, content: messageText } as any);
      setMessages((prev) => [...prev, sent]);
      setMessageText('');
    } catch (err) {
      console.error('Failed to send message', err);
      toast.error('Failed to send message');
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
    if (selectedMessages.size === messages.length) {
      setSelectedMessages(new Set());
    } else {
      setSelectedMessages(new Set(messages.map(m => m.id)));
    }
  };

  const deleteMessage = async (messageId: number) => {
    try {
      await messageAPI.deleteMessage(messageId);
      setMessages(messages.filter(m => m.id !== messageId));
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
      setMessages(messages.filter(m => !selectedMessages.has(m.id)));
      setSelectedMessages(new Set());
      toast.success(`${selectedMessages.size} message(s) deleted`);
    } catch (err: any) {
      console.error('Error deleting messages:', err);
      toast.error('Failed to delete messages');
    }
  };

  const deleteAllMessages = () => {
    if (messages.length === 0) {
      toast.error('No messages to delete');
      return;
    }
    setDeleteAllDialogOpen(true);
  };

  const confirmDeleteAllMessages = async () => {
    try {
      await Promise.all(messages.map(m => messageAPI.deleteMessage(m.id)));
      setMessages([]);
      setSelectedMessages(new Set());
      toast.success('All messages deleted');
    } catch (err: any) {
      console.error('Error deleting all messages:', err);
      toast.error('Failed to delete all messages');
    } finally {
      setDeleteAllDialogOpen(false);
    }
  };

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

  const startEditMessage = (message: MessageDTO) => {
    if (message.senderId !== user?.id) {
      toast.error('You can only edit your own messages');
      return;
    }
    setEditingMessageId(message.id);
    setEditingContent(message.content || '');
  };

  const updateMessage = async () => {
    if (!editingMessageId || !editingContent.trim()) {
      toast.error('Please enter message content');
      return;
    }

    try {
      const updated = await messageAPI.updateMessage(editingMessageId, editingContent);
      setMessages(messages.map(m => m.id === editingMessageId ? updated : m));
      setEditingMessageId(null);
      setEditingContent('');
      toast.success('Message updated');
    } catch (err: any) {
      console.error('Error updating message:', err);
      toast.error('Failed to update message');
    }
  };

  const handleStartNewConversation = (userId: number) => {
    setSelectedChat(userId);
    setShowUserSelector(false);
    setSearchUsers('');
    const chatUser = allUsers.find((u) => u.id === userId) || null;
    setSelectedChatUser(chatUser);
  };

  const filteredUsers = allUsers.filter(u =>
    u.id !== user?.id &&
    u.name?.toLowerCase().includes(searchUsers.toLowerCase())
  );

  return (
    <SidebarLayout>
      <div className="max-w-7xl mx-auto h-full flex gap-6">
        {/* Conversations List */}
        <div className="w-96 bg-white rounded-lg shadow-sm border border-gray-100 hidden lg:flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-foreground">Messages</h2>
              <button
                onClick={() => setShowUserSelector(true)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-primary/90 transition-all text-sm font-medium"
              >
                <MessageSquare className="h-4 w-4" />
                New Message
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {conversations.map((conv) => (
              <button
                key={conv.partnerId}
                onClick={() => setSelectedChat(conv.partnerId)}
                className={`w-full text-left p-4 hover:bg-gray-50 transition-all ${selectedChat === conv.partnerId ? 'bg-blue-50 border-l-4 border-primary' : ''
                  }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{conv.avatar}</span>
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
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            {(selectedChatUser || conversations.find((c) => c.partnerId === selectedChat)) && (
              <>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">
                    {selectedChatUser?.name
                      ? selectedChatUser.name.charAt(0).toUpperCase()
                      : conversations.find((c) => c.partnerId === selectedChat)?.avatar}
                  </span>
                  <div>
                    <p className="font-semibold text-foreground">
                      {selectedChatUser?.name || conversations.find((c) => c.partnerId === selectedChat)?.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedChatUser?.role || conversations.find((c) => c.partnerId === selectedChat)?.type}
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
                </div>
              </>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Message Actions Toolbar */}
            {messages.length > 0 && (
              <div className="flex items-center gap-2 mb-4 p-2 bg-gray-50 rounded-lg sticky top-0 z-10">
                <input
                  type="checkbox"
                  checked={selectedMessages.size === messages.length && messages.length > 0}
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
                {messages.length > 0 && (
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

            {messages.map((msg) => (
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
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-100 p-4">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Type your message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button onClick={sendMessage} className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-all font-medium">
                <Send className="h-5 w-5" />
                Send
              </button>
            </div>
          </div>
        </div>

        {/* User Selector Modal */}
        {showUserSelector && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-96 flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h3 className="text-lg font-bold text-foreground">Start New Message</h3>
                <button
                  onClick={() => setShowUserSelector(false)}
                  className="p-1 hover:bg-gray-100 rounded transition-all"
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>

              {/* Search */}
              <div className="p-4 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchUsers}
                    onChange={(e) => setSearchUsers(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    autoFocus
                  />
                </div>
              </div>

              {/* Users List */}
              <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => handleStartNewConversation(u.id!)}
                      className="w-full text-left p-4 hover:bg-gray-50 transition-all flex items-center gap-3"
                    >
                      <span className="text-2xl">{u.name ? u.name.charAt(0) : '👤'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate">{u.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{u.role?.toLowerCase()}</p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-muted-foreground">No users found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
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

      {/* Delete All Messages Confirmation Dialog */}
      <AlertDialog open={deleteAllDialogOpen} onOpenChange={setDeleteAllDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete All Messages</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete all {messages.length} messages? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteAllMessages} className="bg-red-600 hover:bg-red-700">
              Delete All
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarLayout>
  );
}
