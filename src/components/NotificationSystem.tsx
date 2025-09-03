import { useState, useEffect } from "react";
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  X, 
  Settings, 
  Filter,
  Search,
  Clock,
  Calendar,
  MessageSquare,
  Star,
  CreditCard,
  MapPin,
  User,
  Building,
  Phone,
  Mail,
  MoreVertical,
  Archive,
  Trash2,
  Eye,
  EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AirbnbCard } from "@/components/ui/airbnb-card";
import { AirbnbButton } from "@/components/ui/airbnb-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Notification {
  id: string;
  type: 'booking' | 'payment' | 'message' | 'review' | 'system' | 'reminder';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  action?: {
    type: 'link' | 'button' | 'modal';
    label: string;
    url?: string;
  };
  sender?: {
    name: string;
    avatar?: string;
    type: 'host' | 'guest' | 'system';
  };
}

interface NotificationSystemProps {
  user?: any;
  notifications?: Notification[];
}

const NotificationSystem = ({ user, notifications = [] }: NotificationSystemProps) => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const mockNotifications: Notification[] = [
    {
      id: "1",
      type: "booking",
      title: "Booking Confirmed",
      message: "Your booking for Professional Photography Studio has been confirmed for tomorrow at 2:00 PM.",
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      read: false,
      priority: "high",
      action: {
        type: "link",
        label: "View Details",
        url: "/booking/1"
      },
      sender: {
        name: "John Smith",
        type: "host"
      }
    },
    {
      id: "2",
      type: "payment",
      title: "Payment Successful",
      message: "Payment of ₹2,400 for your studio booking has been processed successfully.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      read: true,
      priority: "high",
      action: {
        type: "link",
        label: "View Receipt",
        url: "/receipt/1"
      }
    },
    {
      id: "3",
      type: "message",
      title: "New Message from Host",
      message: "Sarah Wilson sent you a message about your upcoming booking.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      read: false,
      priority: "medium",
      action: {
        type: "link",
        label: "Reply",
        url: "/messages"
      },
      sender: {
        name: "Sarah Wilson",
        type: "host"
      }
    },
    {
      id: "4",
      type: "review",
      title: "New Review",
      message: "You received a 5-star review from your recent guest.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      read: true,
      priority: "medium",
      action: {
        type: "link",
        label: "View Review",
        url: "/reviews"
      }
    },
    {
      id: "5",
      type: "reminder",
      title: "Upcoming Booking Reminder",
      message: "You have a studio booking tomorrow at 10:00 AM. Don't forget to prepare!",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      read: true,
      priority: "low",
      action: {
        type: "link",
        label: "View Booking",
        url: "/booking/2"
      }
    },
    {
      id: "6",
      type: "system",
      title: "System Maintenance",
      message: "Scheduled maintenance will occur tonight from 2:00 AM to 4:00 AM. Services may be temporarily unavailable.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
      read: true,
      priority: "low"
    }
  ];

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'booking': return <Calendar className="w-5 h-5" />;
      case 'payment': return <CreditCard className="w-5 h-5" />;
      case 'message': return <MessageSquare className="w-5 h-5" />;
      case 'review': return <Star className="w-5 h-5" />;
      case 'system': return <Info className="w-5 h-5" />;
      case 'reminder': return <Clock className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'booking': return 'text-blue-600 bg-blue-50';
      case 'payment': return 'text-green-600 bg-green-50';
      case 'message': return 'text-purple-600 bg-purple-50';
      case 'review': return 'text-yellow-600 bg-yellow-50';
      case 'system': return 'text-gray-600 bg-gray-50';
      case 'reminder': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
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
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const filteredNotifications = mockNotifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || notification.type === activeTab;
    const matchesReadFilter = !showUnreadOnly || !notification.read;
    
    return matchesSearch && matchesTab && matchesReadFilter;
  });

  const unreadCount = mockNotifications.filter(n => !n.read).length;

  const handleMarkAsRead = (notificationId: string) => {
    // In a real app, this would update the notification status
    console.log('Marking notification as read:', notificationId);
  };

  const handleMarkAllAsRead = () => {
    // In a real app, this would mark all notifications as read
    console.log('Marking all notifications as read');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Notifications</h1>
          <p className="text-neutral-600">Stay updated with your bookings and messages</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-airbnb-primary text-white">
            {unreadCount} unread
          </Badge>
          <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
            Mark all as read
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
          <Input
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant={showUnreadOnly ? "default" : "outline"}
          size="sm"
          onClick={() => setShowUnreadOnly(!showUnreadOnly)}
        >
          {showUnreadOnly ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
          Unread only
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Notification List */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="booking">Bookings</TabsTrigger>
              <TabsTrigger value="payment">Payments</TabsTrigger>
              <TabsTrigger value="message">Messages</TabsTrigger>
              <TabsTrigger value="review">Reviews</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4 mt-6">
              {filteredNotifications.length === 0 ? (
                <AirbnbCard className="p-8 text-center">
                  <Bell className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">No notifications</h3>
                  <p className="text-neutral-600">You're all caught up!</p>
                </AirbnbCard>
              ) : (
                <div className="space-y-4">
                  {filteredNotifications.map((notification) => (
                    <AirbnbCard 
                      key={notification.id} 
                      className={`p-6 transition-colors ${
                        !notification.read ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getNotificationColor(notification.type)}`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-neutral-900">{notification.title}</h4>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                              <Badge className={getPriorityColor(notification.priority)}>
                                {notification.priority}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-neutral-500">
                                {formatTime(notification.timestamp)}
                              </span>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <p className="text-sm text-neutral-700 mb-3">{notification.message}</p>
                          
                          {notification.sender && (
                            <div className="flex items-center gap-2 mb-3">
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={notification.sender.avatar} />
                                <AvatarFallback>{notification.sender.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm text-neutral-600">{notification.sender.name}</span>
                              <Badge variant="secondary" className="text-xs">
                                {notification.sender.type}
                              </Badge>
                            </div>
                          )}
                          
                          {notification.action && (
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm">
                                {notification.action.label}
                              </Button>
                              {!notification.read && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleMarkAsRead(notification.id)}
                                >
                                  Mark as read
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </AirbnbCard>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Notification Settings */}
        <div className="space-y-6">
          <AirbnbCard className="p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Notification Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-neutral-900">Booking Notifications</h4>
                  <p className="text-sm text-neutral-600">Confirmations, reminders, updates</p>
                </div>
                <Button variant="outline" size="sm">On</Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-neutral-900">Payment Alerts</h4>
                  <p className="text-sm text-neutral-600">Successful payments, receipts</p>
                </div>
                <Button variant="outline" size="sm">On</Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-neutral-900">Messages</h4>
                  <p className="text-sm text-neutral-600">Host and guest messages</p>
                </div>
                <Button variant="outline" size="sm">On</Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-neutral-900">Reviews</h4>
                  <p className="text-sm text-neutral-600">New reviews and ratings</p>
                </div>
                <Button variant="outline" size="sm">On</Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-neutral-900">System Updates</h4>
                  <p className="text-sm text-neutral-600">Maintenance, announcements</p>
                </div>
                <Button variant="outline" size="sm">Off</Button>
              </div>
            </div>
          </AirbnbCard>

          <AirbnbCard className="p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Settings className="w-4 h-4 mr-2" />
                Notification Preferences
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Archive className="w-4 h-4 mr-2" />
                Archive All
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>
          </AirbnbCard>

          <AirbnbCard className="p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Notification Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">Total Notifications</span>
                <span className="font-medium">{mockNotifications.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">Unread</span>
                <span className="font-medium text-blue-600">{unreadCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">This Week</span>
                <span className="font-medium">{mockNotifications.filter(n => 
                  n.timestamp > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                ).length}</span>
              </div>
            </div>
          </AirbnbCard>
        </div>
      </div>
    </div>
  );
};

export default NotificationSystem; 