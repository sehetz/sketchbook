import { useEffect, useState } from "react";
import "./styles/global.css";
import Header from "./components/Header/Header";
import Intro from "./components/Intro/Intro";
import FilterNav from "./components/FilterNav/FilterNav";
import Footer from "./components/Footer/Footer";
import ProjectContainer from "./components/ProjectContainer/ProjectContainer";

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
    <>
      <Header />
      <Intro />
      <FilterNav />

      <main>
        {data.list && data.list.length > 0 ? (
          data.list.map((item, index) => (
            <ProjectContainer
              key={item.Id}
              projects={[item]}
              isLast={index === data.list.length - 1}
            />
          ))
        ) : (
          <p className="text-3">Keine Projekte gefunden.</p>
        )}

        {/* <h2 className="text-2">Rohdaten</h2>
        <pre>{JSON.stringify(data, null, 2)}</pre> */}
      </main>

      <Footer />
    </>
  );
}

export default App;
