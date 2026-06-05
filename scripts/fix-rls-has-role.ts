/**
 * Fixes 403 errors on admin routes by granting EXECUTE on has_role() to authenticated.
 * Run: bun scripts/fix-rls-has-role.ts
 */
import postgres from "postgres";

const url = process.env.DATABASE_URL ?? process.env.DIRECT_URL;
if (!url) {
  console.error("[fix-rls] Missing DATABASE_URL or DIRECT_URL in environment.");
  process.exit(1);
}

const sql = postgres(url, { max: 1 });

try {
  await sql`GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated`;
  await sql`REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon`;
  console.log("[fix-rls] Done — authenticated can now use has_role() in RLS policies.");
} catch (error) {
  console.error("[fix-rls] Failed:", error);
  process.exit(1);
} finally {
  await sql.end();
}
