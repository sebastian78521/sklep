// app/page.tsx
import Carousel from "./components/Carousel";
import ProductGrid from "./components/ProductGrid";

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <Carousel />
      </section>

      <section>
        <ProductGrid />
      </section>
    </>
  );
}