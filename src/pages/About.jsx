import Header from "../components/layout/Header/Header";
import Footer from "../components/layout/Footer/Footer";
import TimelineViz from "../components/about/TimelineViz";
import Intro from "../components/layout/Intro";
import SehetzTeaser from "../components/about/SehetzTeaser";

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

