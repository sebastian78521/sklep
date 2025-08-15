// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Rozpoczynam seedowanie bazy...");

  // 1) Użytkownik testowy
  const passwordHash = await bcrypt.hash("test1234", 10);
  await prisma.user.upsert({
    where: { email: "test@shop.com" },
    update: {},
    create: { email: "test@shop.com", password: passwordHash },
  });

  // 2) Produkty – UŻYWAJ LOKALNYCH PLIKÓW z /public/images/ (na froncie)
  const products = [
    {
      name: "Koszulka Basic",
      slug: "koszulka-basic",
      priceCents: 4999,
      imageUrl: "/images/koszulka.jpg",
    },
    {
      name: "Bluza Hoodie",
      slug: "bluza-hoodie",
      priceCents: 12999,
      imageUrl: "/images/hoodie.jpg",
    },
    {
      name: "Jeans Classic",
      slug: "jeans-classic",
      priceCents: 15999,
      imageUrl: "/images/jeans.jpg",
    },
  ];

  // KLUCZOWE: update nadpisuje stare pola (w tym imageUrl)
  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: { name: p.name, priceCents: p.priceCents, imageUrl: p.imageUrl },
      create: p,
    });
  }

  console.log("✅ Seed zakończony pomyślnie");
}

main()
  .catch((err) => {
    console.error("❌ Błąd w seedzie:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
