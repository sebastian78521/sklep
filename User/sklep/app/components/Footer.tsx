// app/components/Footer.tsx
import Image from "next/image";

export default function Footer() {
  return (
    <>
      <div>© {new Date().getFullYear()} 4u. Wszelkie prawa zastrzeżone.</div>
      <div style={{display:"flex", alignItems:"center", gap:8}}>
        <Image src="/next.svg" alt="Next.js" width={60} height={12} />
        <span className="badge">Zbudowano w Next.js</span>
      </div>
    </>
  );
}
