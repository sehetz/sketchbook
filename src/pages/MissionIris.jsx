// src/pages/MissionIris.jsx
import Header from "../components/layout/Header/Header";
import Footer from "../components/layout/Footer/Footer";
import IrisDrawer from "../components/MissionIris/IrisDrawer";
import IrisPage from "../components/MissionIris/IrisPage";
import { useEffect } from "react";

// ── Lore content ──────────────────────────────────────────────
const LORE = [
  {
    title: "Synopsis",
    content: "Placeholder – the story of Mission Iris in a few sentences.",
  },
  {
    title: "World",
    content: "Placeholder – setting, lore, rules of the universe.",
  },
  {
    title: "Characters",
    content: "Placeholder – main cast and their roles.",
  },
  {
    title: "Project",
    content: "Placeholder – how the comic is made, tools, schedule.",
  },
];

// ── Comic pages – newest first ────────────────────────────────
const PAGES = [
  { number: 1, title: "Page title", date: "Feb 2026", imageSrc: null },
];

// ─────────────────────────────────────────────────────────────

export default function MissionIris() {
  useEffect(() => {
    document.title = "Mission Iris — Sehetz";
  }, []);

  return (
    <>
      <Header />
      <main>
        {/* ── Section 1: Comic page feed ── */}
        <section className="iris-pages">
          {PAGES.length === 0 ? (
            <div className="iris-pages__empty flex p-6-all text-3 axis-center border-top-dotted">
              No pages yet — check back soon.
            </div>
          ) : (
            [...PAGES].reverse().map((page) => (
              <IrisPage key={page.number} page={page} />
            ))
          )}
        </section>

        {/* ── Section 2: Lore drawers ── */}
        <section className="iris-lore">
          {LORE.map((item, i) => (
            <IrisDrawer key={item.title} title={item.title} defaultOpen={i === 0}>
              {item.content}
            </IrisDrawer>
          ))}
        </section>
      </main>
      <Footer />
    </>
  );
}
