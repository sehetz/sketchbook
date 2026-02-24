// src/pages/MissionIris.jsx
import Footer from "../components/layout/Footer/Footer";
import IrisHeader from "../components/MissionIris/IrisHeader";
import IrisDrawer from "../components/MissionIris/IrisDrawer";
import IrisSubItem from "../components/MissionIris/IrisSubItem";
import IrisPageViewer from "../components/MissionIris/IrisPageViewer";
import { useState, useEffect } from "react";

// ── Comic pages – newest first ────────────────────────────────
const PAGES = [
  { number: 1, title: "Page title", date: "Feb 2026", imageSrc: "media/iris/mission-iris-page-001.webp" },
  { number: 2, title: "Page title", date: "Feb 2026", imageSrc: "media/iris/mission-iris-page-002.webp" },
  { number: 3, title: "Page title", date: "Feb 2026", imageSrc: "media/iris/mission-iris-page-003.webp" },
];

// ─────────────────────────────────────────────────────────────

export default function MissionIris() {
  const [openDrawer, setOpenDrawer] = useState(null);
  const [readMode, setReadMode] = useState(false);

  // Apply dark mode for the entire Iris sub-site
  useEffect(() => {
    document.documentElement.classList.add("dark");
    return () => {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.remove("iris-read");
    };
  }, []);

  // Toggle reading mode
  useEffect(() => {
    if (readMode) {
      document.documentElement.classList.add("iris-read");
    } else {
      document.documentElement.classList.remove("iris-read");
    }
  }, [readMode]);

  const handleToggle = (key) => {
    setOpenDrawer((prev) => (prev === key ? null : key));
  };

  useEffect(() => {
    document.title = "Mission Iris — Sehetz";
  }, []);

  return (
    <>
      <IrisHeader readMode={readMode} onToggle={() => setReadMode((v) => !v)} />
      <main>
        {/* ── Section 1: Comic page feed ── */}
        <section className="iris-pages">
          <IrisPageViewer pages={PAGES} />
        </section>

        {/* ── Section 2: Lore drawers ── */}
        <section className="iris-lore">

          <IrisDrawer title="Synopsis" simple
            isOpen={openDrawer === "Synopsis"}
            onToggle={() => handleToggle("Synopsis")}>
            Mission Iris is a visual sci-fi rock opera: a story about two women, two gods and one all-seeing eye.
          </IrisDrawer>

          <IrisDrawer title="World" noPadding
            isOpen={openDrawer === "World"}
            onToggle={() => handleToggle("World")}>
            <IrisSubItem
              index={0}
              title="Iris Spaceship"
              description="The Iris-unit is a lightweight spaceship for long-distance journeys — and it's packed with plenty of fun extras!"
              imageSrc="media/iris/mission-iris-world-iris-spaceship.webp"
            />
          </IrisDrawer>

          <IrisDrawer title="Characters" noPadding
            isOpen={openDrawer === "Characters"}
            onToggle={() => handleToggle("Characters")}>
            <IrisSubItem
              index={0}
              title="Verda-Star-WI"
              description="Verda Star WI may be as wild as her origin, but those who lean toward extremes are often the easiest to control."
              imageSrc="media/iris/mission-iris-characters-verda.webp"
            />
            <IrisSubItem
              index={1}
              title="Kat-Shar-OR"
              description="Kat Shar OR is friendly, reliable, creative, and just. All qualities that would flourish in a fair society. But fate had other plans. None of this applies on the Menemne orbit station, where she lives."
              imageSrc="media/iris/mission-iris-characters-kat.webp"
            />
            <IrisSubItem
              index={2}
              title="Iru"
              description=""
              imageSrc={null}
            />
            <IrisSubItem
              index={3}
              title="Menemne"
              description=""
              imageSrc={null}
            />
            <IrisSubItem
              index={4}
              title="IRIS"
              description=""
              imageSrc={null}
            />
          </IrisDrawer>

          <IrisDrawer title="Project" simple
            isOpen={openDrawer === "Project"}
            onToggle={() => handleToggle("Project")}>
            My plan is to complete three episodes by the end of 2026. I want to publish the work in a small printed edition, ideally using Risograph printing. Before printing, I want to slowly build visibility for Mission Iris through social media, once enough pages exist to allow for a consistent and thoughtful posting rhythm.
          </IrisDrawer>

        </section>
      </main>
      <Footer />
    </>
  );
}
