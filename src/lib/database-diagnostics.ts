export function getDatabaseDiagnostic(error: unknown): { code: string; message: string } {
  const msg = (error instanceof Error ? error.message : String(error)).toLowerCase();

  if (msg.includes("e11000") || msg.includes("duplicate key")) {
    return { code: "DUPLICATE_KEY", message: "An account already exists for this email." };
  }
  if (msg.includes("etimedout") || msg.includes("econnrefused") || msg.includes("enotfound")) {
    return { code: "DB_UNREACHABLE", message: "Cannot reach the database. Check DATABASE_URL." };
  }
  if (msg.includes("authentication failed") || msg.includes("auth failed")) {
    return { code: "DB_AUTH_FAILED", message: "Database authentication failed. Check credentials in DATABASE_URL." };
  }
  if (msg.includes("ssl") || msg.includes("certificate")) {
    return { code: "DB_SSL", message: "SSL connection error. Check your MongoDB connection string." };
  }
  return { code: "DB_ERROR", message: "Database error: " + (error instanceof Error ? error.message : String(error)).substring(0, 150) };
}

export function getSafeDatabaseErrorLog(error: unknown) {
  return { diagnostic: getDatabaseDiagnostic(error), message: error instanceof Error ? error.message : String(error) };
}
