import { useEffect } from "react";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import TimelineViz from "./components/AboutViz/TimelineViz/TimelineViz.jsx";
import Intro from "./components/Intro/Intro.jsx";
import SehetzTeaser from "./components/AboutViz/SehetzTeaser/SehetzTeaser.jsx";

export default function About() {
  useEffect(() => {
    // Set page title
    document.title = "Sarah Heitz | Portfolio & Experience";

    // Add meta tags
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Product Designer with experience in UX/UI, Design Systems, and User Research. View my work timeline and projects.");
    }

    // Add Schema.org JSON-LD
    const personSchema = {
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Sarah Heitz",
      alternateName: ["Sarah Heitz", "Sarah", "sehetz"],
      jobTitle: "Information Designer, Illustrator, Filmmaker, Frontend Developer",
      url: "https://sehetz.info",
      sameAs: [
        "https://www.linkedin.com/in/sarah-heitz-7b722b118/",
        "https://www.instagram.com/sehetz/",
        // Add your socials
      ],
      knowsAbout: ["Product Design", "UX Design", "UI Design", "Design Systems"],
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(personSchema);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <main>
      <Header />
      <Intro page="about" /> {/* ⭐ Pass page prop */}
      <TimelineViz />
      <SehetzTeaser /> {/* ⭐ NEW */}
      <Footer />
    </main>
  );
}
