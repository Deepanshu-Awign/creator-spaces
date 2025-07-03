
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Wifi, WifiOff, Sync } from 'lucide-react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

interface QueuedBooking {
  id: string;
  studioName: string;
  date: string;
  time: string;
  status: 'queued' | 'syncing' | 'failed';
  timestamp: number;
}

const OfflineBookingQueue = () => {
  const { isOnline } = useNetworkStatus();
  const [queuedBookings, setQueuedBookings] = useState<QueuedBooking[]>([]);

  useEffect(() => {
    loadQueuedBookings();
  }, []);

  const loadQueuedBookings = async () => {
    try {
      const db = await openIndexedDB();
      const transaction = db.transaction(['offlineActions'], 'readonly');
      const store = transaction.objectStore('offlineActions');
      
      const request = store.getAll();
      request.onsuccess = () => {
        const bookingActions = request.result.filter(
          (action: any) => action.type === 'booking' && !action.synced
        );
        
        const formattedBookings = bookingActions.map((action: any) => ({
          id: action.id,
          studioName: action.data?.studioName || 'Unknown Studio',
          date: action.data?.date || 'Unknown Date',
          time: action.data?.time || 'Unknown Time',
          status: 'queued' as const,
          timestamp: action.timestamp
        }));
        
        setQueuedBookings(formattedBookings);
      };
    } catch (error) {
      console.error('Failed to load queued bookings:', error);
    }
  };

  const openIndexedDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('BookMyStudioDB', 2);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  };

  const retrySync = async () => {
    if (!isOnline) return;
    
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('sync-bookings');
      }
    } catch (error) {
      console.error('Failed to trigger sync:', error);
    }
  };

  if (queuedBookings.length === 0) {
    return null;
  }

  return (
    <Card className="mx-4 mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4" />
          Pending Bookings
          <Badge variant="secondary">{queuedBookings.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {queuedBookings.map((booking) => (
          <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <p className="font-medium text-sm">{booking.studioName}</p>
              <p className="text-xs text-gray-500">{booking.date} at {booking.time}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant={booking.status === 'failed' ? 'destructive' : 'secondary'}
                className="text-xs"
              >
                {booking.status}
              </Badge>
              {!isOnline ? (
                <WifiOff className="w-4 h-4 text-red-500" />
              ) : (
                <Wifi className="w-4 h-4 text-green-500" />
              )}
            </div>
          </div>
        ))}
        
        {isOnline && (
          <Button 
            onClick={retrySync}
            size="sm" 
            className="w-full mt-3 bg-blue-500 hover:bg-blue-600"
          >
            <Sync className="w-4 h-4 mr-2" />
            Sync Now
          </Button>
        )}
        
        {!isOnline && (
          <p className="text-xs text-gray-500 text-center mt-2">
            Bookings will sync automatically when you're back online
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default OfflineBookingQueue;
