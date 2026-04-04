-- Allow all authenticated users to READ admin_settings (for premium_enabled, pricing, etc.)
CREATE POLICY "Authenticated users can read settings"
ON public.admin_settings
FOR SELECT
TO authenticated
USING (true);
