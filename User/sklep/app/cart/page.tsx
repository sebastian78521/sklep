"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

type CartProduct = {
  id: number;
  name: string;
  slug: string;
  priceCents: number;
  imageUrl: string | null;
};

type CartItem = {
  id: number;
  userId: number;
  productId: number;
  qty: number;
  product: CartProduct;
};

export default function CartPage() {
  const api = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000";
  const [items, setItems] = useState<CartItem[] | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`${api}/cart`, { credentials: "include" });
    if (res.status === 401) {
      window.location.href = "/login";
      return;
    }
    const data = (await res.json()) as CartItem[];
    setItems(data);
  }, [api]);

  useEffect(() => {
    void load();
  }, [load]);

  async function changeQty(productId: number, qty: number) {
    setLoading(true);
    try {
      const res = await fetch(`${api}/cart/item`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, qty }),
      });
      if (!res.ok) throw new Error("Nie udało się zmienić ilości");
      await load();
    } finally {
      setLoading(false);
    }
  }

  async function removeItem(productId: number) {
    setLoading(true);
    try {
      const res = await fetch(`${api}/cart/item/${productId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Nie udało się usunąć pozycji");
      await load();
    } finally {
      setLoading(false);
    }
  }

  async function clearCart() {
    setLoading(true);
    try {
      const res = await fetch(`${api}/cart/clear`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Nie udało się wyczyścić koszyka");
      await load();
    } finally {
      setLoading(false);
    }
  }

  if (items === null) {
    return (
      <div
        className="container"
        style={{ padding: 24 }}
      >
        Ładowanie…
      </div>
    );
  }

  const total = items.reduce((s, it) => s + it.qty * it.product.priceCents, 0);

  return (
    <div
      className="container"
      style={{ padding: 24 }}
    >
      <h1>Koszyk</h1>

      {items.length === 0 ? (
        <p>
          Pusto. <Link href="/">Wróć do sklepu</Link>
        </p>
      ) : (
        <>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "grid",
              gap: 12,
            }}
          >
            {items.map((it) => (
              <li
                key={it.id}
                className="card"
                style={{
                  display: "grid",
                  gridTemplateColumns: "80px 1fr auto",
                  gap: 12,
                  alignItems: "center",
                }}
              >
                <div
                  className="relative"
                  style={{ width: 80, height: 80 }}
                >
                  <Image
                    src={it.product.imageUrl ?? "/images/placeholder.png"}
                    alt={it.product.name}
                    fill
                    sizes="80px"
                    style={{ objectFit: "cover" }}
                  />
                </div>

                <div className="cardBody">
                  <div className="cardTitle">{it.product.name}</div>
                  <div className="cardPrice">
                    {(it.product.priceCents / 100).toFixed(2)} zł
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    paddingRight: 12,
                  }}
                >
                  <button
                    className="btn"
                    onClick={() =>
                      changeQty(it.productId, Math.max(1, it.qty - 1))
                    }
                    disabled={loading}
                  >
                    −
                  </button>
                  <span>{it.qty}</span>
                  <button
                    className="btn"
                    onClick={() => changeQty(it.productId, it.qty + 1)}
                    disabled={loading}
                  >
                    +
                  </button>
                  <button
                    className="btn"
                    onClick={() => removeItem(it.productId)}
                    disabled={loading}
                  >
                    Usuń
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div
            style={{
              marginTop: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <strong>Suma: {(total / 100).toFixed(2)} zł</strong>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="btn"
                onClick={clearCart}
                disabled={loading}
              >
                Wyczyść koszyk
              </button>
              <Link
                className="btn btnPrimary"
                href="/checkout"
              >
                Do kasy
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
