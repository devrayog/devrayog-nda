
-- Notification preferences table
CREATE TABLE public.notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  daily_study_reminder boolean NOT NULL DEFAULT true,
  study_reminder_time text NOT NULL DEFAULT '08:00',
  mock_test_reminder boolean NOT NULL DEFAULT true,
  streak_reminder boolean NOT NULL DEFAULT true,
  current_affairs_update boolean NOT NULL DEFAULT true,
  news_time text NOT NULL DEFAULT '07:00',
  community_replies boolean NOT NULL DEFAULT true,
  exam_countdown_alerts boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own notification prefs" ON public.notification_preferences
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Allow admins to insert notifications for any user (broadcast)
CREATE POLICY "Admins can insert notifications for any user" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow admins to read all notifications
CREATE POLICY "Admins can read all notifications" ON public.notifications
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
