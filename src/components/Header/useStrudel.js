import { useEffect, useRef, useState } from "react";

/**
 * useStrudel
 * - returns [rave, toggleRave]
 * - encapsulates WebAudio kick-loop, drop and dark-mode toggling
 */
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

  const playDrop = () => {
    const ctx = audioCtxRef.current;
    if (!ctx || dropPlayingRef.current) return;
    dropPlayingRef.current = true;
    const now = ctx.currentTime;

    // sub sine
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

    // saw body + filter
    const saw = ctx.createOscillator();
    saw.type = "sawtooth";
    saw.frequency.setValueAtTime(150, now);
    const sawG = ctx.createGain();
    sawG.gain.setValueAtTime(0.0001, now);
    sawG.gain.exponentialRampToValueAtTime(0.7, now + 0.02);
    sawG.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(2000, now);
    lp.frequency.exponentialRampToValueAtTime(200, now + 0.9);
    saw.connect(sawG);
    sawG.connect(lp);
    lp.connect(masterGainRef.current);
    saw.start(now);
    saw.stop(now + 1.2);

    // transient click
    const click = ctx.createOscillator();
    click.type = "square";
    click.frequency.setValueAtTime(2000, now);
    const clickG = ctx.createGain();
    clickG.gain.setValueAtTime(0.0001, now);
    clickG.gain.exponentialRampToValueAtTime(0.6, now + 0.001);
    clickG.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
    click.connect(clickG);
    clickG.connect(masterGainRef.current);
    click.start(now);
    click.stop(now + 0.06);

    setTimeout(() => {
      dropPlayingRef.current = false;
    }, 1400);
  };

  const startRave = async (opts = {}) => {
    try {
      const bpm = opts.bpm || 128;
      const beatsUntilDrop = opts.beatsUntilDrop ?? 16; // default 16-beat intro
      const Ctx = window.AudioContext || window.webkitAudioContext;
      const ctx = new Ctx();
      audioCtxRef.current = ctx;

      const master = ctx.createGain();
      master.gain.value = 0.20;
      master.connect(ctx.destination);
      masterGainRef.current = master;

      const interval = (60 / bpm) * 1000;

      const playKick = () => {
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

      // start loop
      playKick();
      kickIntervalRef.current = setInterval(playKick, interval);

      // schedule drop
      if (dropTimeoutRef.current) clearTimeout(dropTimeoutRef.current);
      dropTimeoutRef.current = setTimeout(() => {
        playDrop();
      }, beatsUntilDrop * interval);
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
