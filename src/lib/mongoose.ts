import mongoose from "mongoose";

const MONGODB_URI = process.env.DATABASE_URL!;

if (!MONGODB_URI) {
  throw new Error("DATABASE_URL is not defined");
}

declare global {
  var _mongooseConn: typeof mongoose | null;
  var _mongoosePromise: Promise<typeof mongoose> | null;
}

let cached = global._mongooseConn;
let cachedPromise = global._mongoosePromise;

export async function connectDB() {
  if (cached) return cached;
  if (!cachedPromise) {
    cachedPromise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
    });
  }
  cached = await cachedPromise;
  global._mongooseConn = cached;
  global._mongoosePromise = cachedPromise;
  return cached;
}
