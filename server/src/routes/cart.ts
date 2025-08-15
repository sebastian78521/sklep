import { Router, Response } from "express";
import { prisma } from "../db.js";
import jwt from "jsonwebtoken";

const router = Router();

function requireAuth(req: any, res: Response, next: Function) {
  const token = req.cookies?.session;
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const { uid } = jwt.verify(token, process.env.JWT_SECRET!) as {
      uid: number;
    };
    req.userId = uid;
    next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

// GET /cart — zawartość koszyka
router.get("/", requireAuth, async (req: any, res) => {
  const userId = req.userId as number;
  const items = await prisma.cartItem.findMany({
    where: { userId },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          priceCents: true,
          imageUrl: true,
        },
      },
    },
  });
  return res.json(items);
});

// POST /cart/add — dodaj/increment
router.post("/add", requireAuth, async (req: any, res) => {
  const userId = req.userId as number;
  const { productId, qty = 1 } = req.body as {
    productId?: number;
    qty?: number;
  };
  if (!productId) return res.status(400).json({ error: "Brak productId" });

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return res.status(404).json({ error: "Produkt nie istnieje" });

  const item = await prisma.cartItem.upsert({
    where: { userId_productId: { userId, productId } },
    update: { qty: { increment: qty } },
    create: { userId, productId, qty },
  });
  return res.json(item);
});

// PATCH /cart/item — ustaw qty albo usuń jeśli qty<=0
router.patch("/item", requireAuth, async (req: any, res) => {
  const userId = req.userId as number;
  const { productId, qty } = req.body as { productId?: number; qty?: number };
  if (!productId || typeof qty !== "number") {
    return res.status(400).json({ error: "Brak productId/qty" });
  }

  if (qty <= 0) {
    await prisma.cartItem.delete({
      where: { userId_productId: { userId, productId } },
    });
    return res.json({ ok: true, deleted: true });
  }

  const item = await prisma.cartItem.update({
    where: { userId_productId: { userId, productId } },
    data: { qty },
  });
  return res.json(item);
});

// DELETE /cart/item/:productId — usuń jedną pozycję
router.delete("/item/:productId", requireAuth, async (req: any, res) => {
  const userId = req.userId as number;
  const productId = Number(req.params.productId);
  if (!productId) return res.status(400).json({ error: "Brak productId" });

  await prisma.cartItem.delete({
    where: { userId_productId: { userId, productId } },
  });
  return res.json({ ok: true });
});

// POST /cart/clear — wyczyść koszyk
router.post("/clear", requireAuth, async (req: any, res) => {
  const userId = req.userId as number;
  await prisma.cartItem.deleteMany({ where: { userId } });
  return res.json({ ok: true });
});

export default router;
