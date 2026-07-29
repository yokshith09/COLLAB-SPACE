type DiagnosticInput = {
  message: string;
  code?: string;
  name?: string;
};

type DatabaseDiagnostic = {
  code: string;
  message: string;
};

function collectErrorDetails(error: unknown, seen = new Set<unknown>()): DiagnosticInput[] {
  if (!error || seen.has(error)) return [];
  seen.add(error);

  if (error instanceof Error) {
    const details: DiagnosticInput[] = [
      {
        name: error.name,
        message: error.message,
        code:
          typeof (error as Error & { code?: unknown }).code === "string"
            ? (error as Error & { code?: string }).code
            : undefined,
      },
    ];

    const cause = (error as Error & { cause?: unknown }).cause;
    if (cause) details.push(...collectErrorDetails(cause, seen));

    return details;
  }

  if (typeof error === "object") {
    const record = error as Record<string, unknown>;
    const details: DiagnosticInput[] = [
      {
        name: typeof record.name === "string" ? record.name : undefined,
        message: typeof record.message === "string" ? record.message : "",
        code: typeof record.code === "string" ? record.code : undefined,
      },
    ];

    if (record.cause) details.push(...collectErrorDetails(record.cause, seen));
    if (record.meta) details.push(...collectErrorDetails(record.meta, seen));

    return details;
  }

  return [{ message: String(error) }];
}

export function getDatabaseDiagnostic(error: unknown): DatabaseDiagnostic {
  const details = collectErrorDetails(error);
  const text = details
    .map((detail) => [detail.name, detail.code, detail.message].filter(Boolean).join(" "))
    .join(" ")
    .toLowerCase();
  const codes = details.map((detail) => detail.code).filter(Boolean);

  if (codes.includes("P2002") || text.includes("unique constraint")) {
    return {
      code: "P2002",
      message: "An account already exists for this email.",
    };
  }

  if (
    codes.includes("P2021") ||
    codes.includes("P2022") ||
    text.includes("does not exist") ||
    text.includes("relation") ||
    text.includes("table")
  ) {
    return {
      code: codes.find((code) => code?.startsWith("P20")) ?? "SCHEMA_MISSING",
      message:
        "Database schema is missing. Run prisma/supabase-init.sql in the Supabase SQL Editor, then try again.",
    };
  }

  if (
    codes.includes("28P01") ||
    text.includes("password authentication failed") ||
    text.includes("invalid username/password")
  ) {
    return {
      code: "DB_AUTH_FAILED",
      message: "Database login failed. Recheck the password inside DATABASE_URL in Vercel.",
    };
  }

  if (
    codes.includes("P1001") ||
    text.includes("can't reach database") ||
    text.includes("econnrefused") ||
    text.includes("etimedout") ||
    text.includes("enotfound") ||
    text.includes("connection terminated") ||
    text.includes("connection timeout") ||
    text.includes("ssl") ||
    text.includes("certificate")
  ) {
    return {
      code: codes.includes("P1001") ? "P1001" : "DB_UNREACHABLE",
      message:
        "DB Error: " + (text.substring(0, 150) || "Unknown connection error").replace(/\n/g, " "),
    };
  }

  if (
    text.includes("database_url") ||
    codes.includes("ERR_INVALID_URL") ||
    text.includes("err_invalid_url") ||
    text.includes("invalid url") ||
    text.includes("environment variable not found") ||
    text.includes("connection string")
  ) {
    return {
      code: codes.includes("ERR_INVALID_URL") ? "ERR_INVALID_URL" : "DATABASE_URL_MISSING",
      message:
        "DATABASE_URL is invalid. URL-encode special characters in the database password, then redeploy.",
    };
  }

  return {
    code: codes[0] ?? "REGISTRATION_ERROR",
    message:
      "Registration failed: " + (text.substring(0, 150) || "Unknown error").replace(/\n/g, " "),
  };
}

export function getSafeDatabaseErrorLog(error: unknown) {
  return {
    diagnostic: getDatabaseDiagnostic(error),
    details: collectErrorDetails(error).map((detail) => ({
      name: detail.name,
      code: detail.code,
      message: detail.message,
    })),
  };
}
