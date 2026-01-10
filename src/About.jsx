import { useEffect } from "react";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import TimelineViz from "./components/AboutViz/TimelineViz";
import Intro from "./components/Intro/Intro";
import SehetzTeaser from "./components/AboutViz/SehetzTeaser";

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
      description: "Graphic Designer with experience in Information Design, UX/UI, Design Systems, and Illustration.",
      jobTitle: ["Information Designer", "Illustrator", "Frontend Developer"],
      url: "https://sehetz.ch",
      email: "hoi@sehetz.ch",
      image: "https://sehetz.ch/media/Sehetz-Team-Hochschule-Trier-3.jpg",
      location: {
        "@type": "Place",
        name: "Basel, Switzerland"
      },
      sameAs: [
        "https://www.linkedin.com/in/sarah-heitz-7b722b118/",
        "https://www.instagram.com/sehetz/",
        "https://www.behance.net/sehetz",
        "https://ch.pinterest.com/sehetzch/"
      ],
      knowsAbout: [
        "Product Design",
        "UX Design",
        "UI Design",
        "Design Systems",
        "Illustration",
        "Frontend Development",
        "Comic",
        "User Research"
      ],
      worksFor: [
        {
          "@type": "Organization",
          name: "Superdot.studio",
          url: "https://superdot.studio",
          description: "Agency for Information Design"
        },
        {
          "@type": "Organization",
          name: "Carnault.ch",
          url: "https://carnault.ch",
          description: "Luxury Brand for electric Cigarettes"
        }
      ],
      hasOccupation: [
        {
          "@type": "Occupation",
          name: "Designer"
        },
        {
          "@type": "Occupation",
          name: "Illustrator"
        },
        {
          "@type": "Occupation",
          name: "Developer"
        }
      ]
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(personSchema);
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
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
