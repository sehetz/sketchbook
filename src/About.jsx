import { useEffect } from "react";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import TimelineViz from "./components/AboutViz/TimelineViz/TimelineViz.jsx";
import Intro from "./components/Intro/Intro.jsx";

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
      name: "Sarah Heitz-Carnault",
      alternateName: ["Sarah Heitz", "Sarah Carnault", "sehetz"],
      jobTitle: "Information Designer, Illustrator",
      url: "https://sehetz.info",
      sameAs: [
        "https://www.linkedin.com/in/sarah-heitz",
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
      <Footer />
    </main>
  );
}
