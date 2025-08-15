export default function CheckoutSuccess({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  return (
    <div
      className="container"
      style={{ padding: 24 }}
    >
      <h1>Dziękujemy!</h1>
      <p>Zamówienie opłacone. Numer sesji: {searchParams.session_id ?? "—"}</p>
      <link
        className="btn"
        href="/"
      >
        Wróć na stronę główną
      </link>
    </div>
  );
}
