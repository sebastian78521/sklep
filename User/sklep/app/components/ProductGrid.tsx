import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "./AddToCartButton";

type Product = {
  id: number;
  name: string;
  slug: string;
  priceCents: number;
  imageUrl: string | null;
};

export default async function ProductGrid() {
  const api = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000";
  const res = await fetch(`${api}/products`, { cache: "no-store" });
  if (!res.ok) throw new Error("Nie udało się pobrać produktów");
  const products: Product[] = await res.json();

  return (
    <ul
      className="grid"
      style={{ listStyle: "none", margin: 0, padding: 0 }}
    >
      {products.map((p, i) => (
        <li
          key={p.id}
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
  );
}
