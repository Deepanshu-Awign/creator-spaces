import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Shield, AlertTriangle, User, Calendar, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AdminProfile {
  id: string;
  full_name?: string;
  email?: string;
}

interface AdminLogWithProfile {
  id: string;
  action: string;
  admin_user_id: string;
  created_at: string;
  target_type: string | null;
  target_id: string | null;
  admin_profile?: AdminProfile;
}

const SecurityMonitor = () => {
  const [filter, setFilter] = useState('');
  
  // Fetch admin activity logs
  const { data: adminLogs, isLoading } = useQuery<AdminLogWithProfile[]>({
    queryKey: ['adminLogs', filter],
    queryFn: async () => {
      let query = supabase
        .from('admin_activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (filter) {
        query = query.or(`action.ilike.%${filter}%,target_type.ilike.%${filter}%`);
      }

      const { data: logs, error } = await query;
      if (error) throw error;

      // Fetch admin profiles separately
      if (logs && logs.length > 0) {
        const adminIds = [...new Set(logs.map(log => log.admin_user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', adminIds);

        // Combine logs with admin profiles
        return logs.map(log => ({
          ...log,
          admin_profile: profiles?.find(profile => profile.id === log.admin_user_id)
        })) as AdminLogWithProfile[];
      }

      return (logs || []) as AdminLogWithProfile[];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getActionBadge = (action: string) => {
    if (action.includes('Admin') || action.includes('admin')) {
      return <Badge variant="destructive" className="gap-1"><Shield className="w-3 h-3" />Critical</Badge>;
    }
    if (action.includes('Delete') || action.includes('delete')) {
      return <Badge variant="secondary" className="gap-1"><AlertTriangle className="w-3 h-3" />Warning</Badge>;
    }
    return <Badge variant="outline">Info</Badge>;
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getRecentCriticalActions = () => {
    if (!adminLogs) return 0;
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return adminLogs.filter(log => 
      new Date(log.created_at) > oneDayAgo && 
      (log.action.includes('Admin') || log.action.includes('Delete'))
    ).length;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Security Monitor</h2>
          <p className="text-gray-600">Monitor administrative actions and security events</p>
        </div>
      </div>

      {/* Security Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Actions (24h)</p>
                <p className="text-2xl font-bold">{adminLogs?.filter(log => 
                  new Date(log.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
                ).length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Critical Actions (24h)</p>
                <p className="text-2xl font-bold text-orange-600">{getRecentCriticalActions()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <User className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Active Admins</p>
                <p className="text-2xl font-bold">
                  {adminLogs ? new Set(adminLogs.map(log => log.admin_user_id)).size : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Actions Alert */}
      {getRecentCriticalActions() > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Security Notice:</strong> {getRecentCriticalActions()} critical administrative actions 
            have been performed in the last 24 hours. Review the activity log below.
          </AlertDescription>
        </Alert>
      )}

      {/* Activity Log */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Recent Administrative Activity
            </CardTitle>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Filter actions..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading security logs...</div>
          ) : !adminLogs || adminLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No administrative activity recorded yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Severity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adminLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="text-sm">
                        {formatDateTime(log.created_at)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-sm">
                          {log.admin_profile?.full_name || 'Unknown Admin'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {log.admin_profile?.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-sm">{log.action}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {log.target_type && (
                          <span className="text-gray-600">
                            {log.target_type}
                            {log.target_id && (
                              <span className="text-xs text-gray-400 ml-1">
                                ({log.target_id.slice(0, 8)}...)
                              </span>
                            )}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getActionBadge(log.action)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Security Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600" />
            Security Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
              <p>All administrative actions are automatically logged and monitored.</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
              <p>Admin role assignments require explicit confirmation for security.</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
              <p>Review this security log regularly for unusual activity patterns.</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5"></div>
              <p>Enable leaked password protection and reduce OTP expiry in Supabase Auth settings.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityMonitor;