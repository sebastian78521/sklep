"use client";

import { useState } from "react";

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);
  const api = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000";

  async function pay() {
    setLoading(true);
    try {
      const res = await fetch(`${api}/checkout/session`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
      if (data?.url) window.location.href = data.url;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Błąd płatności";
      alert(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="container"
      style={{ padding: 24 }}
    >
      <h1>Płatność</h1>
      <p>Przejdź do Stripe Checkout i opłać zamówienie.</p>
      <button
        className="btn btnPrimary"
        onClick={pay}
        disabled={loading}
      >
        {loading ? "Przekierowuję…" : "Zapłać"}
      </button>
    </div>
  );
}
