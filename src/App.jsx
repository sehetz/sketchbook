// src/App.jsx
import "./styles/global.css";

// Core Components
import Header from "./components/Header/Header";
import Intro from "./components/Intro/Intro";
import Footer from "./components/Footer/Footer";

// Data Logic Layer
import DataView from "./components/DataView/DataView";

function App() {
  return (
    <>
      <Header />
      <Intro />
      <main>
        <DataView />
      </main>
      <Footer />
    </>
  );
}

export default App;
