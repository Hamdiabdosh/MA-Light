-- Run this in Supabase Dashboard → SQL Editor
-- Fixes 403 errors on admin routes caused by has_role() being unusable in RLS policies.

-- RLS policies call has_role() as the authenticated user; they need EXECUTE on the function.
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- Keep direct API access blocked for anonymous users only.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
