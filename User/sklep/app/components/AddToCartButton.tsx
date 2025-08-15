"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = { productId: number };

export default function AddToCartButton({ productId }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const api = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000";

  async function add() {
    setLoading(true);
    try {
      const res = await fetch(`${api}/cart/add`, {
        method: "POST",
        credentials: "include", // <-- ważne: ciasteczko sesji
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, qty: 1 }),
      });

      if (res.status === 401) {
        // niezalogowany -> przenieś do logowania
        window.location.href = "/login";
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || `HTTP ${res.status}`);
      }

      // odśwież UI (np. badge koszyka, listę itp.)
      router.refresh();
    } catch (e: unknown) {
      alert((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      className="btn btnPrimary"
      onClick={add}
      disabled={loading}
    >
      {loading ? "Dodaję..." : "Dodaj do koszyka"}
    </button>
  );
}
