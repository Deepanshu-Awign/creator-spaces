
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Save, Settings, Mail, CreditCard, Clock } from 'lucide-react';

const AdminSettings = () => {
  const queryClient = useQueryClient();

  // Fetch system settings
  const { data: settings } = useQuery({
    queryKey: ['systemSettings'],
    queryFn: async () => {
      const { data } = await supabase
        .from('system_settings')
        .select('key, value, category, description');
      
      const settingsMap: Record<string, any> = {};
      data?.forEach(setting => {
        // Safely parse JSON values
        try {
          settingsMap[setting.key] = typeof setting.value === 'string' 
            ? JSON.parse(setting.value) 
            : setting.value;
        } catch {
          settingsMap[setting.key] = setting.value;
        }
      });
      
      return settingsMap;
    }
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: Record<string, any>) => {
      const promises = Object.entries(updates).map(([key, value]) =>
        supabase
          .from('system_settings')
          .upsert({
            key,
            value: JSON.stringify(value),
            updated_at: new Date().toISOString(),
            updated_by: (await supabase.auth.getUser()).data.user?.id
          })
      );

      await Promise.all(promises);

      // Log the activity
      await supabase.rpc('log_admin_activity', {
        _action: 'Updated system settings',
        _target_type: 'settings',
        _details: updates
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['systemSettings'] });
      toast.success('Settings updated successfully');
    },
    onError: (error) => {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    }
  });

  const [formData, setFormData] = useState({
    site_name: '',
    site_description: '',
    admin_email: '',
    booking_cancellation_hours: '',
    commission_rate: '',
    max_booking_duration: ''
  });

  // Update form data when settings load
  React.useEffect(() => {
    if (settings) {
      setFormData({
        site_name: settings.site_name || '',
        site_description: settings.site_description || '',
        admin_email: settings.admin_email || '',
        booking_cancellation_hours: String(settings.booking_cancellation_hours || ''),
        commission_rate: String(settings.commission_rate || ''),
        max_booking_duration: String(settings.max_booking_duration || '')
      });
    }
  }, [settings]);

  const handleSubmit = (category: string) => {
    const updates: Record<string, any> = {};
    
    if (category === 'general') {
      updates.site_name = formData.site_name;
      updates.site_description = formData.site_description;
      updates.admin_email = formData.admin_email;
    } else if (category === 'booking') {
      updates.booking_cancellation_hours = parseInt(formData.booking_cancellation_hours);
      updates.max_booking_duration = parseInt(formData.max_booking_duration);
    } else if (category === 'payment') {
      updates.commission_rate = parseFloat(formData.commission_rate);
    }
    
    updateSettingsMutation.mutate(updates);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Configure your application settings</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general" className="gap-2">
            <Settings className="w-4 h-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="booking" className="gap-2">
            <Clock className="w-4 h-4" />
            Booking
          </TabsTrigger>
          <TabsTrigger value="payment" className="gap-2">
            <CreditCard className="w-4 h-4" />
            Payment
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Mail className="w-4 h-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="site_name">Site Name</Label>
                  <Input
                    id="site_name"
                    value={formData.site_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, site_name: e.target.value }))}
                    placeholder="BookMyStudio"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin_email">Admin Email</Label>
                  <Input
                    id="admin_email"
                    type="email"
                    value={formData.admin_email}
                    onChange={(e) => setFormData(prev => ({ ...prev, admin_email: e.target.value }))}
                    placeholder="admin@bookmystudio.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="site_description">Site Description</Label>
                <Textarea
                  id="site_description"
                  value={formData.site_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, site_description: e.target.value }))}
                  placeholder="Professional studio booking platform"
                  rows={3}
                />
              </div>
              <Button onClick={() => handleSubmit('general')} className="gap-2">
                <Save className="w-4 h-4" />
                Save General Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="booking">
          <Card>
            <CardHeader>
              <CardTitle>Booking Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="booking_cancellation_hours">Cancellation Hours</Label>
                  <Input
                    id="booking_cancellation_hours"
                    type="number"
                    value={formData.booking_cancellation_hours}
                    onChange={(e) => setFormData(prev => ({ ...prev, booking_cancellation_hours: e.target.value }))}
                    placeholder="24"
                  />
                  <p className="text-sm text-gray-500">Hours before booking can be cancelled</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_booking_duration">Max Booking Duration</Label>
                  <Input
                    id="max_booking_duration"
                    type="number"
                    value={formData.max_booking_duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_booking_duration: e.target.value }))}
                    placeholder="8"
                  />
                  <p className="text-sm text-gray-500">Maximum booking duration in hours</p>
                </div>
              </div>
              <Button onClick={() => handleSubmit('booking')} className="gap-2">
                <Save className="w-4 h-4" />
                Save Booking Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Payment Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="commission_rate">Commission Rate</Label>
                <Input
                  id="commission_rate"
                  type="number"
                  step="0.01"
                  value={formData.commission_rate}
                  onChange={(e) => setFormData(prev => ({ ...prev, commission_rate: e.target.value }))}
                  placeholder="0.10"
                />
                <p className="text-sm text-gray-500">Platform commission rate (e.g., 0.10 for 10%)</p>
              </div>
              <Button onClick={() => handleSubmit('payment')} className="gap-2">
                <Save className="w-4 h-4" />
                Save Payment Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Email notification settings will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
