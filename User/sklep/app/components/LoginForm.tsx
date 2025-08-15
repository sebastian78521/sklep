// app/components/LoginForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // TODO: tutaj wywołasz prawdziwe API (fetch /api/login)
await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password: pwd }),
  credentials: "include"        // << ważne dla cookies
});


    setLoading(false);
    router.push("/");
  };
  


  return (
    <form className="form" onSubmit={submit}>
      <h1>Zaloguj się</h1>
      <p className="help">Dla wersji demo dane nie są wysyłane na serwer.</p>

      <label className="field">
        <span>E-mail</span>
        <input
          className="input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
          required
          placeholder="ty@przyklad.pl"
        />
      </label>

      <label className="field">
        <span>Hasło</span>
        <input
          className="input"
          type="password"
          value={pwd}
          onChange={(e) => setPwd(e.currentTarget.value)}
          required
          placeholder="••••••••"
        />
      </label>

      <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:10}}>
        <label style={{display:"flex", alignItems:"center", gap:8}}>
          <input type="checkbox" defaultChecked /> <span className="help">Zapamiętaj mnie</span>
        </label>
        <a className="help" href="#">Nie pamiętasz hasła?</a>
      </div>

      <div style={{marginTop:16, display:"flex", gap:8}}>
        <button className="btn btnPrimary" type="submit" disabled={loading}>
          {loading ? "Logowanie..." : "Zaloguj"}
        </button>
        <button className="btn" type="button" onClick={() => alert("Rejestracja (placeholder)")}>
          Utwórz konto
        </button>
      </div>
    </form>
  );
}
