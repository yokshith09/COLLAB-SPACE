type ClerkConfig =
  | { publishableKey: string; error: null }
  | { publishableKey: null; error: string };

function normalizeEnvValue(value: string | undefined) {
  return value?.trim().replace(/^["']|["']$/g, "") ?? "";
}

function decodePublishableKeyHost(key: string) {
  const match = key.match(/^pk_(test|live)_([A-Za-z0-9_-]+)$/);
  if (!match) return null;

  try {
    const decoded = Buffer.from(match[2], "base64url").toString("utf8").replace(/\$$/, "");
    if (!decoded || /\s/.test(decoded) || !decoded.includes(".")) return null;
    return decoded;
  } catch {
    return null;
  }
}

export function getClerkConfig(): ClerkConfig {
  const publishableKey = normalizeEnvValue(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  if (!publishableKey) {
    return {
      publishableKey: null,
      error: "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is missing.",
    };
  }

  if (publishableKey.includes("placeholder") || !decodePublishableKeyHost(publishableKey)) {
    return {
      publishableKey: null,
      error: "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not a valid Clerk publishable key.",
    };
  }

  return { publishableKey, error: null };
}
