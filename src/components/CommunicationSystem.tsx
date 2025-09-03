import { useState, useEffect } from "react";
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  Send, 
  Paperclip, 
  Smile, 
  Image, 
  File,
  Clock,
  Check,
  CheckCheck,
  User,
  MoreVertical,
  Search,
  Filter,
  Archive,
  Trash2,
  Star,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AirbnbCard } from "@/components/ui/airbnb-card";
import { AirbnbButton } from "@/components/ui/airbnb-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Message {
  id: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
    type: 'host' | 'guest';
  };
  content: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'file';
  bookingId?: string;
}

interface Conversation {
  id: string;
  participant: {
    id: string;
    name: string;
    avatar?: string;
    type: 'host' | 'guest';
  };
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  bookingId?: string;
  studioName: string;
}

interface CommunicationSystemProps {
  user?: any;
  conversations?: Conversation[];
  messages?: Message[];
}

const CommunicationSystem = ({ user, conversations = [], messages = [] }: CommunicationSystemProps) => {
  const [activeTab, setActiveTab] = useState("messages");
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const mockConversations: Conversation[] = [
    {
      id: "1",
      participant: {
        id: "host1",
        name: "John Smith",
        avatar: null,
        type: "host"
      },
      lastMessage: "Perfect! I'll have everything ready for you.",
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      unreadCount: 2,
      bookingId: "booking1",
      studioName: "Professional Photography Studio"
    },
    {
      id: "2",
      participant: {
        id: "host2",
        name: "Sarah Wilson",
        avatar: null,
        type: "host"
      },
      lastMessage: "The studio will be available at 10 AM as requested.",
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      unreadCount: 0,
      bookingId: "booking2",
      studioName: "Music Recording Studio"
    },
    {
      id: "3",
      participant: {
        id: "host3",
        name: "Mike Chen",
        avatar: null,
        type: "host"
      },
      lastMessage: "Thank you for the great review!",
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      unreadCount: 0,
      bookingId: "booking3",
      studioName: "Video Production Studio"
    }
  ];

  const mockMessages: Message[] = [
    {
      id: "1",
      sender: {
        id: "guest1",
        name: "You",
        type: "guest"
      },
      content: "Hi! I have a question about the studio setup.",
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      status: "read",
      type: "text",
      bookingId: "booking1"
    },
    {
      id: "2",
      sender: {
        id: "host1",
        name: "John Smith",
        avatar: null,
        type: "host"
      },
      content: "Hello! Sure, what would you like to know?",
      timestamp: new Date(Date.now() - 1000 * 60 * 43),
      status: "read",
      type: "text",
      bookingId: "booking1"
    },
    {
      id: "3",
      sender: {
        id: "guest1",
        name: "You",
        type: "guest"
      },
      content: "Do you have additional lighting equipment available?",
      timestamp: new Date(Date.now() - 1000 * 60 * 40),
      status: "read",
      type: "text",
      bookingId: "booking1"
    },
    {
      id: "4",
      sender: {
        id: "host1",
        name: "John Smith",
        avatar: null,
        type: "host"
      },
      content: "Yes, we have professional lighting kits. I'll have them set up for your session.",
      timestamp: new Date(Date.now() - 1000 * 60 * 35),
      status: "read",
      type: "text",
      bookingId: "booking1"
    },
    {
      id: "5",
      sender: {
        id: "host1",
        name: "John Smith",
        avatar: null,
        type: "host"
      },
      content: "Perfect! I'll have everything ready for you.",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      status: "delivered",
      type: "text",
      bookingId: "booking1"
    }
  ];

  const filteredConversations = mockConversations.filter(conv =>
    conv.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.studioName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusIcon = (status: Message['status']) => {
    switch (status) {
      case 'sent': return <Check className="w-3 h-3 text-neutral-400" />;
      case 'delivered': return <CheckCheck className="w-3 h-3 text-blue-500" />;
      case 'read': return <CheckCheck className="w-3 h-3 text-green-500" />;
      default: return null;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const handleSendMessage = () => {
    if (messageText.trim() && selectedConversation) {
      // In a real app, send message to backend
      console.log("Sending message:", messageText);
      setMessageText("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Messages</h1>
          <p className="text-neutral-600">Communicate with hosts and guests</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-1" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Archive className="w-4 h-4 mr-1" />
            Archive
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Conversations List */}
        <AirbnbCard className="p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedConversation?.id === conversation.id 
                    ? 'bg-airbnb-primary/10 border border-airbnb-primary/20' 
                    : 'hover:bg-neutral-50'
                }`}
                onClick={() => setSelectedConversation(conversation)}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={conversation.participant.avatar} />
                    <AvatarFallback>{conversation.participant.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-neutral-900 truncate">
                        {conversation.participant.name}
                      </h4>
                      <span className="text-xs text-neutral-500">
                        {formatTime(conversation.lastMessageTime)}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-600 truncate">{conversation.studioName}</p>
                    <p className="text-sm text-neutral-700 truncate mt-1">
                      {conversation.lastMessage}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <Badge className="bg-airbnb-primary text-white text-xs mt-1">
                        {conversation.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </AirbnbCard>

        {/* Message Thread */}
        <div className="lg:col-span-2">
          <AirbnbCard className="p-6 h-full flex flex-col">
            {selectedConversation ? (
              <>
                {/* Conversation Header */}
                <div className="flex items-center justify-between pb-4 border-b border-neutral-200 mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={selectedConversation.participant.avatar} />
                      <AvatarFallback>{selectedConversation.participant.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-neutral-900">
                        {selectedConversation.participant.name}
                      </h3>
                      <p className="text-sm text-neutral-600">{selectedConversation.studioName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Mail className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {mockMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender.type === 'guest' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md ${
                        message.sender.type === 'guest' 
                          ? 'bg-airbnb-primary text-white' 
                          : 'bg-neutral-100 text-neutral-900'
                      } p-3 rounded-lg`}>
                        <p className="text-sm">{message.content}</p>
                        <div className={`flex items-center gap-1 mt-1 ${
                          message.sender.type === 'guest' ? 'justify-end' : 'justify-start'
                        }`}>
                          <span className="text-xs opacity-75">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {message.sender.type === 'guest' && getStatusIcon(message.status)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="border-t border-neutral-200 pt-4">
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <Textarea
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        className="min-h-[60px] resize-none"
                        rows={2}
                      />
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Paperclip className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Image className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Smile className="w-4 h-4" />
                      </Button>
                      <AirbnbButton
                        onClick={handleSendMessage}
                        disabled={!messageText.trim()}
                        size="sm"
                      >
                        <Send className="w-4 h-4" />
                      </AirbnbButton>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-neutral-500">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 text-neutral-300" />
                  <h3 className="text-lg font-semibold mb-2">No conversation selected</h3>
                  <p>Choose a conversation from the list to start messaging</p>
                </div>
              </div>
            )}
          </AirbnbCard>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AirbnbCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Phone className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-neutral-900">Call Support</h4>
              <p className="text-sm text-neutral-600">Get immediate help</p>
            </div>
          </div>
        </AirbnbCard>

        <AirbnbCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Mail className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-neutral-900">Email Support</h4>
              <p className="text-sm text-neutral-600">Send detailed inquiry</p>
            </div>
          </div>
        </AirbnbCard>

        <AirbnbCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Star className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h4 className="font-semibold text-neutral-900">Rate Experience</h4>
              <p className="text-sm text-neutral-600">Share your feedback</p>
            </div>
          </div>
        </AirbnbCard>
      </div>
    </div>
  );
};

export default CommunicationSystem; 