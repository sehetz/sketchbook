import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import TimelineViz from "./components/AboutViz/TimelineViz/TimelineViz.jsx";
import Intro from "./components/Intro/Intro.jsx";

export default function About() {
  return (
    <main>
      <Header />
      <Intro />
      <TimelineViz />
      <Footer />
    </main>
  );
}
