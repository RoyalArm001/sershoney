const isVercelBuild = process.env.VERCEL === "1";

if (!isVercelBuild) {
  console.log("Vercel environment check skipped for local build.");
  process.exit(0);
}

const errors = [];
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

if (!/^https:\/\/[^/]+(?:\/.*)?$/i.test(baseUrl)) {
  errors.push("NEXT_PUBLIC_BASE_URL must be an absolute HTTPS URL.");
}

if (adminPassword.length < 12) {
  errors.push("ADMIN_PASSWORD must contain at least 12 characters.");
}

if (jwtSecret.length < 32) {
  errors.push("JWT_SECRET must contain at least 32 characters.");
}

if (!redisUrl || !redisToken) {
  errors.push(
    "Configure both UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN " +
      "(or the KV_REST_API_URL/KV_REST_API_TOKEN aliases)."
  );
}

if (redisUrl && !/^https:\/\//i.test(redisUrl)) {
  errors.push("The Redis REST URL must use HTTPS.");
}

if (errors.length > 0) {
  console.error("\nVercel production configuration is incomplete:\n");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  console.error(
    "\nSet these values in Vercel Project Settings > Environment Variables."
  );
  process.exit(1);
}

console.log("Vercel environment check passed.");
