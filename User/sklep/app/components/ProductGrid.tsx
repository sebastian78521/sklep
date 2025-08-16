"use client";

// components/ProductGrid.tsx (wersja z infinite scroll – zachowujemy nazwę)
// Naprawa błędu "Encountered two children with the same key":
// - deduplikujemy produkty po id
// - stabilny klucz: `${p.id}-${p.slug ?? "_"}`

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import AddToCartButton from "./AddToCartButton";

export type Product = {
  id: number;
  name: string;
  slug: string;
  priceCents: number;
  imageUrl: string | null;
};

type PageRespCursor = { items: Product[]; nextCursor: string | null };

type Mode = "cursor" | "offset";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000";

export default function ProductGrid({ pageSize = 24 }: { pageSize?: number }) {
  const [items, setItems] = useState<Product[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [offset, setOffset] = useState<number>(0);
  const [mode, setMode] = useState<Mode>("cursor");
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Zbiór już widzianych ID – dzięki temu nie dodamy duplikatu, a React nie dostanie dwóch takich samych key
  const seenIds = useRef<Set<number>>(new Set());

  const loadPage = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      qs.set("limit", String(pageSize));
      if (mode === "cursor" && cursor) qs.set("cursor", cursor);
      if (mode === "offset") qs.set("offset", String(offset));

      const res = await fetch(`${API}/products?${qs.toString()}`, {
        cache: "no-store",
        credentials: "include",
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      let pageItems: Product[] = [];
      let nextCursor: string | null = null;

      if (Array.isArray(json)) {
        pageItems = json as Product[];
        setMode("offset");
        setOffset((o) => o + pageSize);
        // Uwaga: po deduplikacji może być mniej elementów, ale hasMore określamy wg odpowiedzi API
        setHasMore(pageItems.length === pageSize);
      } else {
        const data = json as PageRespCursor;
        pageItems = data.items ?? [];
        nextCursor = data.nextCursor ?? null;
        setCursor(nextCursor);
        setHasMore(Boolean(nextCursor));
        setMode("cursor");
      }

      // Deduplikacja po id
      const deduped = pageItems.filter((p) => {
        if (seenIds.current.has(p.id)) return false;
        seenIds.current.add(p.id);
        return true;
      });

      if (deduped.length > 0) {
        setItems((prev) => [...prev, ...deduped]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [cursor, hasMore, loading, mode, offset, pageSize]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadPage();
      },
      { rootMargin: "800px" }
    );
    io.observe(node);
    return () => io.disconnect();
  }, [loadPage]);

  return (
    <>
      <ul
        className="grid"
        style={{ listStyle: "none", margin: 0, padding: 0 }}
      >
        {items.map((p, i) => (
          <li
            key={`${p.id}-${p.slug ?? "_"}`}
            className="card"
          >
            <Link
              href={`/product/${p.slug}`}
              style={{ display: "block" }}
            >
              <div className="relative aspect-square">
                <Image
                  src={p.imageUrl ?? "/images/placeholder.png"}
                  alt={p.name}
                  fill
                  sizes="(max-width:700px) 50vw, (max-width:1000px) 33vw, 25vw"
                  className="object-cover"
                  priority={i < 4}
                />
              </div>
            </Link>
            <div className="cardBody">
              <h3 className="cardTitle">{p.name}</h3>
              <div className="cardPrice">
                {(p.priceCents / 100).toFixed(2)} zł
              </div>
              <div className="cardActions">
                <AddToCartButton productId={p.id} />
                <Link
                  href={`/product/${p.slug}`}
                  className="btn"
                >
                  Szczegóły
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div
        ref={sentinelRef}
        style={{ height: 1 }}
      />
      {loading && <div className="feedLoading">Wczytywanie…</div>}
      {!hasMore && items.length > 0 && (
        <div className="feedEnd">To już wszystkie produkty ✨</div>
      )}
    </>
  );
}
