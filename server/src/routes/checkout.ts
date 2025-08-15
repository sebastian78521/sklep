import { Router, Request, Response } from "express";
import { prisma } from "../db.js";
import Stripe from "stripe";
import jwt from "jsonwebtoken";

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_KEY) {
  console.warn("[checkout] STRIPE_SECRET_KEY is missing in .env");
}
const stripe = new Stripe(STRIPE_KEY ?? ""); // bez apiVersion — użyje domyślnej

const router = Router();

const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://127.0.0.1:3000";

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

/**
 * POST /checkout/session
 * Tworzy zamówienie "pending" i Stripe Checkout Session.
 */
router.post("/session", requireAuth, async (req: any, res: Response) => {
  try {
    if (!STRIPE_KEY) {
      return res.status(500).json({ error: "Stripe key not configured" });
    }

    const userId = req.userId as number;

    const cart = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });
    if (cart.length === 0) {
      return res.status(400).json({ error: "Koszyk jest pusty" });
    }

    const totalCents = cart.reduce(
      (sum, it) => sum + it.qty * it.product.priceCents,
      0
    );

    // 1) utwórz Order + OrderItems w stanie "pending"
    const order = await prisma.order.create({
      data: {
        userId,
        status: "pending",
        totalCents,
        items: {
          create: cart.map((it) => ({
            productId: it.productId,
            qty: it.qty,
            unitCents: it.product.priceCents,
          })),
        },
      },
    });

    // 2) Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      currency: "pln",
      line_items: cart.map((it) => ({
        quantity: it.qty,
        price_data: {
          currency: "pln",
          unit_amount: it.product.priceCents,
          product_data: { name: it.product.name },
        },
      })),
      success_url: `${FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_URL}/cart`,
      metadata: {
        orderId: String(order.id),
        userId: String(userId),
      },
    });

    // 3) zapisz paymentRef
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentRef: session.id },
    });

    return res.status(201).json({ url: session.url });
  } catch (err: any) {
    console.error("[checkout/session] ERROR:", err?.message || err);
    return res
      .status(500)
      .json({ error: err?.message || "Internal Server Error" });
  }
});

/**
 * Webhook Stripe — MUSI otrzymać RAW body (patrz index.ts).
 */
export const webhookHandler = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string | undefined;
  if (!sig) return res.status(400).send("Missing signature");

  try {
    const event = stripe.webhooks.constructEvent(
      (req as any).body, // raw Buffer
      sig,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;
      const userId = Number(session.metadata?.userId);

      if (orderId) {
        await prisma.order.update({
          where: { id: Number(orderId) },
          data: {
            status: "paid",
            paymentRef: String(session.payment_intent ?? session.id),
          },
        });
        if (userId) {
          await prisma.cartItem.deleteMany({ where: { userId } });
        }
      }
    }

    return res.json({ received: true });
  } catch (err: any) {
    console.error("[checkout/webhook] ERROR:", err?.message || err);
    return res.status(400).send(`Webhook Error: ${err?.message || err}`);
  }
};

export default router;
