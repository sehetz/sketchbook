import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import AboutViz from "./components/AboutViz/AboutViz.jsx";
import Intro from "./components/Intro/Intro.jsx";

export default function About() {
  return (
    <main>
      <Header />
      <Intro />
      <AboutViz />
      <Footer />
    </main>
  );
}
