/**
 * Optional env sanity check. Does not run during `npm run build`.
 * Use: npm run check:env
 *
 * On Vercel this only prints warnings so a missing variable never
 * fails the deployment the way the old prebuild hook did.
 */
const isVercelBuild = process.env.VERCEL === "1";

const warnings = [];
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.trim() || "";
const adminPassword = process.env.ADMIN_PASSWORD?.trim() || "";
const jwtSecret = process.env.JWT_SECRET?.trim() || "";
const redisUrl = (
  process.env.UPSTASH_REDIS_REST_URL ||
  process.env.KV_REST_API_URL ||
  ""
).trim();
const redisToken = (
  process.env.UPSTASH_REDIS_REST_TOKEN ||
  process.env.KV_REST_API_TOKEN ||
  ""
).trim();

if (baseUrl && !/^https:\/\/[^/]+(?:\/.*)?$/i.test(baseUrl)) {
  warnings.push("NEXT_PUBLIC_BASE_URL should be an absolute HTTPS URL.");
}

if (!baseUrl) {
  warnings.push("NEXT_PUBLIC_BASE_URL is not set.");
}

if (adminPassword && adminPassword.length < 12) {
  warnings.push("ADMIN_PASSWORD should contain at least 12 characters.");
}

if (!adminPassword) {
  warnings.push("ADMIN_PASSWORD is not set.");
}

if (jwtSecret && jwtSecret.length < 32) {
  warnings.push("JWT_SECRET should contain at least 32 characters.");
}

if (!jwtSecret) {
  warnings.push("JWT_SECRET is not set.");
}

if (!redisUrl || !redisToken) {
  warnings.push(
    "Redis is not fully configured (UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN).",
  );
}

if (redisUrl && !/^https:\/\//i.test(redisUrl)) {
  warnings.push("The Redis REST URL should use HTTPS.");
}

if (warnings.length > 0) {
  const label = isVercelBuild ? "Vercel env warnings" : "Environment warnings";
  console.warn(`\n${label}:\n`);
  for (const warning of warnings) {
    console.warn(`- ${warning}`);
  }
  console.warn(
    "\nSet these in Vercel Project Settings > Environment Variables if needed.\n",
  );
  // Never fail the process — missing env must not block deploy.
  process.exit(0);
}

console.log("Environment check passed.");
