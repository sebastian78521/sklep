// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import Header from "./components/Header";
import Footer from "./components/Footer";

export const metadata: Metadata = {
  title: "4u — Sklep z ciuchami",
  description: "Sklep 4u: moda streetwear i casual.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body>
        <header className="header">
          <div className="container headerInner">
            <Header />
          </div>
        </header>

        <main className="container">{children}</main>

        <footer className="footer">
          <div className="container footerInner">
            <Footer />
          </div>
        </footer>
      </body>
    </html>
  );
}
