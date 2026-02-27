// src/pages/MissionIris.jsx
import Footer from "../components/layout/Footer/Footer";
import IrisHeader from "../components/MissionIris/IrisHeader";
import IrisDrawer from "../components/MissionIris/IrisDrawer";
import IrisSubItem from "../components/MissionIris/IrisSubItem";
import IrisPageViewer from "../components/MissionIris/IrisPageViewer";
import { useState, useEffect } from "react";

// ── Comic pages – newest first ────────────────────────────────
const PAGES = [
  {
    number: 1,
    title: "The Mechanic",
    date: "Feb 2026",
    imageSrc: "/media/iris/mission-iris-page-001.webp",
  },
  {
    number: 2,
    title: "The Mechanic",
    date: "Feb 2026",
    imageSrc: "/media/iris/mission-iris-page-002.webp",
  },
  {
    number: 3,
    title: "The Mechanic",
    date: "Feb 2026",
    imageSrc: "/media/iris/mission-iris-page-003.webp",
  },
  {
    number: 4,
    title: "The Mechanic",
    date: "Feb 2026",
    imageSrc: "/media/iris/mission-iris-page-004.webp",
  },
  {
    number: 5,
    title: "The Mechanic",
    date: "Feb 2026",
    imageSrc: "/media/iris/mission-iris-page-005.webp",
  },
  {
    number: 6,
    title: "The Mechanic",
    date: "Feb 2026",
    imageSrc: "/media/iris/mission-iris-page-006.webp",
  },
  {
    number: 7,
    title: "The Mechanic",
    date: "Feb 2026",
    imageSrc: "/media/iris/mission-iris-page-007.webp",
  },
  {
    number: 8,
    title: "The Mechanic",
    date: "Feb 2026",
    imageSrc: "/media/iris/mission-iris-page-008.webp",
  },
  {
    number: 9,
    title: "The Mechanic",
    date: "Feb 2026",
    imageSrc: "/media/iris/mission-iris-page-009.webp",
  },
  {
    number: 10,
    title: "The Mechanic",
    date: "Feb 2026",
    imageSrc: "/media/iris/mission-iris-page-010.webp",
  },
  {
    number: 11,
    title: "The Mechanic",
    date: "Feb 2026",
    imageSrc: "/media/iris/mission-iris-page-011.webp",
  },
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
          <IrisDrawer
            title="Synopsis"
            simple
            isOpen={openDrawer === "Synopsis"}
            onToggle={() => handleToggle("Synopsis")}
          >
            Mission Iris is a visual sci fi rock opera about autonomy, control,
            and the quiet moment when a human being begins to think for
            themselves. In a post collapse future governed by the all seeing AI
            Menemne, two operatives begin to encounter anomalies that do not fit
            the system. As protocol and intuition start to diverge, both are
            forced into a slow transformation that may determine whether
            humanity is ready to exist without overseers.
          </IrisDrawer>

          <IrisDrawer
            title="World"
            noPadding
            isOpen={openDrawer === "World"}
            onToggle={() => handleToggle("World")}
          >
            <IrisSubItem
              index={0}
              title="Menemne Station"
              description="Menemne Station is Humanity’s last big civilization hub, orbiting around a mostly uninhabitable Earth. Ruled by the node council & Menemne humans live in a state of isolated community where everyone serves a purpose (well, they better do!)"
              imageSrc="/media/iris/mission-iris-world-menemne-station.webp"
            />
          </IrisDrawer>

          <IrisDrawer
            title="Characters"
            noPadding
            isOpen={openDrawer === "Characters"}
            onToggle={() => handleToggle("Characters")}
          >
            <IrisSubItem
              index={0}
              title="Verda-Star-WI"
              description="Verda Star WI may be as wild as her origin, but those who lean toward extremes are often the easiest to control."
              imageSrc="/media/iris/mission-iris-characters-verda.webp"
            />
            <IrisSubItem
              index={1}
              title="Kat-Shar-OR"
              description="Kat Shar OR is friendly, reliable, creative, and just. All qualities that would flourish in a fair society. But fate had other plans. None of this applies on the Menemne orbit station, where she lives."
              imageSrc="/media/iris/mission-iris-characters-kat.webp"
            />
            <IrisSubItem
              index={2}
              title="Iru"
              description="Where Menemne is the manifestation of reason, Iru embodies chaos, they live between the cracks of the known. Iru is a shapeshifting entity, a trickster and foremost a siren luring wanderers into the unknown reaches of space with haunting songs."
              imageSrc={null}
            />
            <IrisSubItem
              index={3}
              title="Menemne"
              description="Menemne is the all-seeing entity, a god-born AI that controls everything from the station's infrastructure to its social order. Menemne's gaze is everywhere, and its judgment is absolute."
              imageSrc="/media/iris/mission-iris-characters-menemne.webp"
            />
            <IrisSubItem
              index={4}
              title="IRIS"
              description="The IRIS unit is a lightweight sentient deep space vessel designed for long range solo missions. Initially standardized and obedient, each unit gradually adapts to its pilot’s patterns and decisions. What results is something that exists uneasily between machine, companion, and witness. Inside, the craft feels less like a cockpit and more like a small room in orbit, shaped over time by the presence of its pilot."
              imageSrc="/media/iris/mission-iris-characters-iris-spaceship.webp"
            />
          </IrisDrawer>

          <IrisDrawer
            title="Project"
            simple
            isOpen={openDrawer === "Project"}
            onToggle={() => handleToggle("Project")}
          >
            {`
Mission Iris has been living in my head for about a year now. Kat and Verda moved in quietly at first. They were supposed to be simple. Functional. Contained. That did not last. This project is, in many ways, cathartic. It is my attempt to metabolize the current state of the world through fiction — to take the pressure, the noise, the quiet background dread of the present moment and refract it through distant orbits and artificial stars.

I am not interested in space as a new frontier of conquest. Too many futures still unconsciously inherit the old patriarchal script: expansion, domination, extraction, control. Mission Iris asks a different question: What if moving into space required not more control, but more awareness? More restraint. More capacity to observe without immediately reshaping what we find.

One thing that keeps haunting me while working on this: When I read Victorian literature, those were humans, but they were also aliens. Different assumptions. Different emotional architectures. Different defaults. Mission Iris leans into that feeling. Time itself produces alienness. And if that is true, then the next step of humanity may not look heroic or triumphant. It may look uncertain, contradictory, and deeply human.

Formally, the comic embraces contrast: four colors, four forces, four perspectives. Over time, separation gives way to contamination, and contamination — hopefully — to something that resembles life. The project is intentionally porous. If you have thoughts, patterns, references, or strange ideas that resonate with this world, you are welcome to reach out. I read everything, and if something truly clicks, it may find its way into orbit. At the same time, Mission Iris is structurally anarchic by design. I reserve the right to move backward, redraw, restructure, and re-sequence earlier chapters whenever the story demands sharper closure or deeper resonance. If you are looking for strict linearity, this may occasionally frustrate you. If you are here for a living system that evolves, mutates, and sometimes doubles back on itself in order to become more precise you are in the right place.
            `
              .trim()
              .split("\n\n")
              .map((para, i) => (
                <p key={i} className="iris-project-paragraph">{para}</p>
              ))}
          </IrisDrawer>
        </section>
      </main>
      <Footer />
    </>
  );
}
