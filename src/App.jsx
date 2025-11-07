import { useEffect, useState } from "react";

function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const API_TOKEN = import.meta.env.VITE_API_TOKEN;

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(API_URL, {
          headers: { "xc-token": API_TOKEN },
        });
        if (!res.ok) throw new Error(`Fehler: ${res.status}`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err.message);
      }
    }
    fetchData();
  }, [API_URL, API_TOKEN]);

  if (error) return <pre>Fehler: {error}</pre>;
  if (!data) return <pre>Lade Daten...</pre>;

  return (
    <div style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h1>Rohdaten aus NocoDB</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

export default App;
