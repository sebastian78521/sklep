// app/components/Header.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Header() {
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((d) => setIsAuthed(!!d.ok));
  }, []);

  return (
    <>
      <Link
        className="brand"
        href="/"
      >
        <span className="brandMark">4u</span>
        <span>Sklep</span>
        <span className="badge">moda</span>
      </Link>

      <nav className="nav">
        <Link href="/nowosci">Nowości</Link> {/* <= tu zmiana */}
        <Link href="/meskie">Męskie</Link>{" "}
        {/* upewnij się, że masz app/meskie/page.tsx */}
        <Link href="/damskie">Damskie</Link>{" "}
        {/* upewnij się, że masz app/damskie/page.tsx */}
        <Link href="/sale">Wyprzedaż</Link>
        <Link
          href="/login"
          className="badge"
        >
          {isAuthed ? "Konto" : "Zaloguj"}
        </Link>
        <Link
          href="/cart"
          aria-label="Koszyk"
          title="Koszyk"
          className="badge"
        >
          Koszyk
        </Link>
      </nav>
    </>
  );
}
