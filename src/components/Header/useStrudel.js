import { useEffect, useRef, useState } from "react";

export default function useStrudel() {
  const [rave, setRave] = useState(false);
  const audioCtxRef = useRef(null);
  const beatIntervalRef = useRef(null);
  const masterGainRef = useRef(null);

  // ⚙️ BEAT KONSTANTEN
  const BEAT_CONFIG = {
    bpm: 240,
    masterVolume: 0.12,
  };

  // 🎵 SOUND LIBRARY – einfach copy/paste
  const SOUNDS = {
    // DRUMS
    kick_deep: { type: "sine", freq: 150, freqEnd: 50, duration: 0.35, attack: 0.01, decay: 0.3, volume: 0.9 },
    kick_fat: { type: "sine", freq: 180, freqEnd: 60, duration: 0.4, attack: 0.01, decay: 0.35, volume: 0.85 },
    kick_tight: { type: "sine", freq: 120, freqEnd: 40, duration: 0.25, attack: 0.005, decay: 0.2, volume: 0.8 },
    
    // HI-HATS
    hh_bright: { type: "square", freq: 1000, duration: 0.08, attack: 0.001, decay: 0.06, volume: 0.3 },
    hh_soft: { type: "square", freq: 800, duration: 0.06, attack: 0.002, decay: 0.04, volume: 0.2 },
    hh_crisp: { type: "triangle", freq: 1200, duration: 0.05, attack: 0.001, decay: 0.04, volume: 0.35 },
    
    // PERCUSSION
    rim_sharp: { type: "triangle", freq: 4000, duration: 0.08, attack: 0.001, decay: 0.07, volume: 0.6 },
    rim_click: { type: "square", freq: 3000, duration: 0.06, attack: 0.001, decay: 0.05, volume: 0.5 },
    
    // SYNTH BASE (Vorlage für Noten)
    synth: { type: "triangle", duration: 0.5, attack: 0.25, decay: 0.75, volume: 0.4 },
  };

  // 🎵 SYNTH NOTEN – nur Frequenzen
  const SYNTH_NOTES = [120, 72, 48, 96]; // A2, D2, E1, G3 (Hz)

  const clearScheduled = () => {
    if (beatIntervalRef.current) {
      clearInterval(beatIntervalRef.current);
      beatIntervalRef.current = null;
    }
  };

  // 🔊 UNIVERSAL SOUND PLAYER
  const playSound = (ctx, master, soundName) => {
    const sound = SOUNDS[soundName];
    if (!sound) {
      console.warn(`Sound "${soundName}" not found`);
      return;
    }

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = sound.type;
    osc.frequency.setValueAtTime(sound.freq, now);
    if (sound.freqEnd) {
      osc.frequency.exponentialRampToValueAtTime(sound.freqEnd, now + sound.attack + sound.decay);
    }

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(sound.volume, now + sound.attack);
    gain.gain.exponentialRampToValueAtTime(0.001, now + sound.attack + sound.decay);

    osc.connect(gain);
    gain.connect(master);
    osc.start(now);
    osc.stop(now + sound.duration);
  };

  // 🎼 BEAT PATTERN – einfach anpassen
  const playBeat = (ctx, master, beatPhase = 0) => {
    const phase = beatPhase % 8;

    // Drums (was spielen wir WANN)
    if (phase === 0 || phase === 4 || phase === 0 || phase === 8) {
      playSound(ctx, master, "kick_deep");
    }
    if (phase === 2 || phase === 0 || phase === 6 || phase === 0) {
      playSound(ctx, master, "kick_fat");
    }
    if (phase === 2 || phase === 6) {
      playSound(ctx, master, "kick_tight");
    }

    // Synth 
    if (beatPhase % 1 === 0) {
      const noteIndex = Math.floor(beatPhase / 4) % SYNTH_NOTES.length;
      const freq = SYNTH_NOTES[noteIndex];
      playSynthNote(ctx, master, freq);
    }
  };

  // 🎹 SYNTH NOTE PLAYER (mit Frequenz)
  const playSynthNote = (ctx, master, freq) => {
    const sound = SOUNDS.synth;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = sound.type;
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(sound.volume, now + sound.attack);
    gain.gain.exponentialRampToValueAtTime(0.001, now + sound.attack + sound.decay);

    osc.connect(gain);
    gain.connect(master);
    osc.start(now);
    osc.stop(now + sound.duration);
  };

  const startRave = async () => {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      const ctx = new Ctx();
      audioCtxRef.current = ctx;

      const master = ctx.createGain();
      master.gain.value = BEAT_CONFIG.masterVolume;
      master.connect(ctx.destination);
      masterGainRef.current = master;

      const interval = (60 / BEAT_CONFIG.bpm) * 1000;

      let beatPhase = 0;
      playBeat(ctx, master, beatPhase);

      beatIntervalRef.current = setInterval(() => {
        beatPhase++;
        playBeat(ctx, master, beatPhase);
      }, interval);
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

