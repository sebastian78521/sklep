import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRouter from "./routes/auth.js";
import productsRouter from "./routes/product.js";
import cartRouter from "./routes/cart.js";
import checkoutRouter, { webhookHandler } from "./routes/checkout.js";

console.log("🚀 Booting API...");

const app = express();
app.use(
  cors({
    origin: (process.env.CORS_ORIGIN || "http://localhost:3000").split(","),
    credentials: true,
  })
);
app.use(cookieParser());

// ⬇️ STRIPE WEBHOOK — RAW body, musi być PRZED express.json()
app.post(
  "/checkout/webhook",
  express.raw({ type: "application/json" }),
  webhookHandler
);

// ⬇️ Reszta tras używa JSON parsera
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/auth", authRouter);
app.use("/products", productsRouter);
app.use("/cart", cartRouter);
app.use("/checkout", checkoutRouter);

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`✅ API listening on http://127.0.0.1:${port}`);
});

// (opcjonalnie) globalne logowanie błędów niezłapanych:
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:", err);
});
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
});
