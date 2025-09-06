import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";

const SECRET: string = env.JWT_SECRET; // ensure it's a string
const EXPIRES_IN: jwt.SignOptions["expiresIn"] = (env.JWT_EXPIRES_IN || "1h") as jwt.SignOptions["expiresIn"]; // fallback

export function createAccessToken(payload: object) {
  const options: SignOptions = { expiresIn: EXPIRES_IN };
  return jwt.sign(payload, SECRET, options);
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, SECRET) as any;
  } catch (err) {
    throw new Error("Invalid or expired token");
  }
}
