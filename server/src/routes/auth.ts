// server/src/routes/auth.ts
import { Router } from "express";
import { prisma } from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";

const router = Router();

const credsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

function sessionCookie(token: string) {
  const isProd = process.env.NODE_ENV === "production";
  return {
    name: "session",
    value: token,
    options: {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dni w ms
    } as const,
  };
}

router.post("/register", async (req, res) => {
  const parsed = credsSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Złe dane" });

  const { email, password } = parsed.data;
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ error: "Użytkownik istnieje" });

  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, password: hash } });
  return res.status(201).json({ id: user.id, email: user.email });
});

router.post("/login", async (req, res) => {
  const parsed = credsSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Złe dane" });

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: "Błędny login/hasło" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: "Błędny login/hasło" });

  const token = jwt.sign({ uid: user.id }, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });
  const c = sessionCookie(token);
  res.cookie(c.name, c.value, c.options);
  return res.json({ ok: true });
});

router.get("/me", async (req, res) => {
  const token = (req as any).cookies?.session;
  if (!token) return res.status(200).json({ ok: false });

  try {
    const { uid } = jwt.verify(token, process.env.JWT_SECRET!) as {
      uid: number;
    };
    const user = await prisma.user.findUnique({
      where: { id: uid },
      select: { id: true, email: true },
    });
    return res.json({ ok: true, user });
  } catch {
    return res.json({ ok: false });
  }
});

router.post("/logout", (_req, res) => {
  const isProd = process.env.NODE_ENV === "production";
  res.clearCookie("session", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
  });
  return res.json({ ok: true });
});

export default router;
