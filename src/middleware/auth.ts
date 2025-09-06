// src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../auth/jwt";

// Extend Express Request type to include `user`
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authorization header missing or invalid" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    req.user = decoded; // attach decoded payload to request
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
