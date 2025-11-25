import { useEffect, useRef, useState } from "react";

export default function useStrudel() {
  const [rave, setRave] = useState(false);
  const audioCtxRef = useRef(null);
  const kickIntervalRef = useRef(null);
  const masterGainRef = useRef(null);
  const dropTimeoutRef = useRef(null);
  const dropPlayingRef = useRef(false);

  const clearScheduled = () => {
    if (kickIntervalRef.current) {
      clearInterval(kickIntervalRef.current);
      kickIntervalRef.current = null;
    }
    if (dropTimeoutRef.current) {
      clearTimeout(dropTimeoutRef.current);
      dropTimeoutRef.current = null;
    }
  };

  // ⭐ Simple, solid kick
  const playKick = (ctx, master) => {
    const now = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();

    o.type = "sine";
    o.frequency.setValueAtTime(150, now);
    o.frequency.exponentialRampToValueAtTime(50, now + 0.08);

    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(1.0, now + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    o.connect(g);
    g.connect(master);
    o.start(now);
    o.stop(now + 0.35);
  };

  // ⭐ Drop: Sub bass thump
  const playDrop = () => {
    const ctx = audioCtxRef.current;
    if (!ctx || dropPlayingRef.current) return;
    dropPlayingRef.current = true;
    const now = ctx.currentTime;

    const sub = ctx.createOscillator();
    sub.type = "sine";
    sub.frequency.setValueAtTime(60, now);
    const subG = ctx.createGain();
    subG.gain.setValueAtTime(0.0001, now);
    subG.gain.exponentialRampToValueAtTime(1.2, now + 0.02);
    subG.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    sub.connect(subG);
    subG.connect(masterGainRef.current);
    sub.start(now);
    sub.stop(now + 0.8);

    setTimeout(() => {
      dropPlayingRef.current = false;
    }, 1400);
  };

  const startRave = async (opts = {}) => {
    try {
      const bpm = opts.bpm || 128;
      const Ctx = window.AudioContext || window.webkitAudioContext;
      const ctx = new Ctx();
      audioCtxRef.current = ctx;

      const master = ctx.createGain();
      master.gain.value = 0.15;
      master.connect(ctx.destination);
      masterGainRef.current = master;

      const interval = (60 / bpm) * 1000;

      playKick(ctx, master);
      kickIntervalRef.current = setInterval(() => {
        playKick(ctx, master);
      }, interval);

      // Drop after 32 beats
      if (dropTimeoutRef.current) clearTimeout(dropTimeoutRef.current);
      dropTimeoutRef.current = setTimeout(() => {
        playDrop();
      }, interval * 32);
    } catch (err) {
      console.error("Audio start failed", err);
    }
  };

  const stopRave = () => {
    clearScheduled();
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    masterGainRef.current = null;
  };

  const toggleRave = async () => {
    if (!rave) {
      await startRave();
      document.documentElement.classList.add("dark");
      setRave(true);
    } else {
      stopRave();
      document.documentElement.classList.remove("dark");
      setRave(false);
    }
  };

  useEffect(() => {
    return () => {
      stopRave();
      document.documentElement.classList.remove("dark");
    };
  }, []);

  return [rave, toggleRave];
}
