export async function safeDbQuery<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[DB Error]", (error as Error)?.message);
    }
    return fallback;
  }
}
