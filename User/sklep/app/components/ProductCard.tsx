// app/components/ProductCard.tsx
"use client";

import Image from "next/image";
import { useState } from "react";

export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  tags?: string[];
};

export default function ProductCard({ product }: { product: Product }) {
  const [added, setAdded] = useState(false);

  const addToCart = () => {
    // placeholder koszyka w localStorage
    const key = "cart";
    const raw = localStorage.getItem(key);
    const cart = raw ? JSON.parse(raw) : [];
    cart.push({ id: product.id, qty: 1 });
    localStorage.setItem(key, JSON.stringify(cart));
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <article className="card">
      <Image
        src={product.image}
        alt={product.name}
        width={640}
        height={800}
        style={{ width: "100%", height: "auto" }}
      />
      <div className="cardBody">
        <div className="tag">{product.tags?.join(" · ")}</div>
        <div className="cardTitle">{product.name}</div>
        <div className="cardPrice">{product.price.toFixed(2)} zł</div>
        <div className="cardActions">
          <button className="btn btnPrimary" onClick={addToCart}>
            {added ? "Dodano ✓" : "Do koszyka"}
          </button>
          <button className="btn" onClick={() => alert("Szczegóły produktu (placeholder)")}>
            Szczegóły
          </button>
        </div>
      </div>
    </article>
  );
}
