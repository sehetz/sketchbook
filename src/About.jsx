import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import TimelineViz from "./components/AboutViz/TimelineViz";
import Intro from "./components/Intro/Intro";
import SehetzTeaser from "./components/AboutViz/SehetzTeaser";

export default function About() {
  return (
    <main>
      <Header />
      <Intro page="about" />
      <TimelineViz />
      <SehetzTeaser />
      <Footer />
    </main>
  );
}

