// src/App.jsx
import "./styles/global.css";

// Core Components
import Header from "./components/Header/Header";
import Intro from "./components/Intro/Intro";
import Footer from "./components/Footer/Footer";

// Data Logic Layer
import DataView from "./components/DataView/DataView";
// import AllProjectsMasonry from "./components/AboutViz/AllProjectsMasonry/AllProjectsMasonry";
import { useState } from "react";

function App() {
  const [filter, setFilter] = useState("skills");

  return (
    <>
      <Header />
      <Intro filter={filter} /> {/* ⭐ Pass filter */}
      <main>
        <DataView onFilterChange={setFilter} /> {/* ⭐ Pass setter */}
        {/* <AllProjectsMasonry /> */}
      </main>
      <Footer />
    </>
  );
}

export default App;
