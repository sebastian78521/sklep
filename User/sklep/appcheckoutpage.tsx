// app/checkout/page.tsx
"use client";

import { useState } from "react";

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);

  async function startCheckout() {
    setLoading(true);
    try {
      const api = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000";
      const res = await fetch(`${api}/checkout/session`, {
        method: "POST",
        credentials: "include", // potrzebne do ciasteczka sesji
      });
      const data = await res.json();
      if (!res.ok || !data?.url)
        throw new Error(
          data?.error || "Nie udało się utworzyć sesji płatności"
        );
      window.location.href = data.url; // przekierowanie do Stripe Checkout
    } catch (e: any) {
      alert(e.message || "Błąd płatności");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="container"
      style={{ padding: 16 }}
    >
      <h1>Płatność</h1>
      <p>
        Po kliknięciu przejdziesz do bezpiecznego formularza Stripe Checkout.
      </p>
      <button
        className="btn btnPrimary"
        onClick={startCheckout}
        disabled={loading}
      >
        {loading ? "Przekierowuję..." : "Zapłać"}
      </button>
    </div>
  );
}
