
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { Wifi, WifiOff, Cloud, CloudOff } from 'lucide-react';

const NetworkStatusBar = () => {
  const { isOnline, connectionType, isSlowConnection } = useNetworkStatus();

  if (isOnline && !isSlowConnection) {
    return null; // Don't show anything when online with good connection
  }

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 px-4 py-2 text-sm font-medium text-center ${
      !isOnline 
        ? 'bg-red-500 text-white' 
        : 'bg-yellow-500 text-black'
    }`}>
      <div className="flex items-center justify-center gap-2">
        {!isOnline ? (
          <>
            <WifiOff className="w-4 h-4" />
            <span>You're offline - browsing cached content</span>
            <CloudOff className="w-4 h-4" />
          </>
        ) : (
          <>
            <Wifi className="w-4 h-4" />
            <span>Slow connection detected ({connectionType})</span>
            <Cloud className="w-4 h-4" />
          </>
        )}
      </div>
    </div>
  );
};

export default NetworkStatusBar;
