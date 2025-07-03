
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface NotificationRequest {
  userId: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  data?: any;
  fcmToken?: string;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method === 'POST') {
      // Send notification
      const notificationData: NotificationRequest = await req.json();

      // Store notification in database
      const { data: notification, error } = await supabase
        .from('notifications')
        .insert({
          user_id: notificationData.userId,
          title: notificationData.title,
          message: notificationData.message,
          type: notificationData.type || 'info',
          data: notificationData.data,
          read: false
        })
        .select()
        .single();

      if (error) throw error;

      // Here you would integrate with FCM to send push notifications
      // For now, we'll just log the FCM token
      if (notificationData.fcmToken) {
        console.log('Would send push notification to FCM token:', notificationData.fcmToken);
      }

      return new Response(
        JSON.stringify({ notification }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );

    } else if (req.method === 'GET') {
      // Get user notifications
      const url = new URL(req.url);
      const userId = url.searchParams.get('userId');
      const unreadOnly = url.searchParams.get('unreadOnly') === 'true';

      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'User ID required' }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (unreadOnly) {
        query = query.eq('read', false);
      }

      const { data: notifications, error } = await query;

      if (error) throw error;

      return new Response(
        JSON.stringify({ notifications }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );

    } else if (req.method === 'PUT') {
      // Mark notifications as read
      const url = new URL(req.url);
      const userId = url.searchParams.get('userId');
      const notificationId = url.searchParams.get('notificationId');

      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'User ID required' }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      let query = supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId);

      if (notificationId) {
        query = query.eq('id', notificationId);
      }

      const { error } = await query;

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );

  } catch (error) {
    console.error('Error in mobile-notifications function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});
