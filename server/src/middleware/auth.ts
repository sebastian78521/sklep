import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
export interface AuthedRequest extends Request {
  userId?: number;
}
export function authRequired(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) {
  const token = req.cookies?.session;
  if (!token) return res.status(401).json({ error: "Brak sesji" });
  try {
    const { uid } = jwt.verify(token, process.env.JWT_SECRET!) as {
      uid: number;
    };
    req.userId = uid;
    next();
  } catch {
    return res.status(401).json({ error: "Sesja wygasła" });
  }
}
