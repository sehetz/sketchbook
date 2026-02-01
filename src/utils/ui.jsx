// ============================================
// UI UTILITIES – Animation & Timer Helpers
// ============================================
// 
// NAMING CONVENTION:
//   animation_*() → Animation utilities
//   timer_*()     → Async timer management
//   use*()        → React hooks (useRotationAnimation, useStrudel)
//   CONSTANT_*    → Configuration constants
//
// All functions documented with:
//   - Where they're used
//   - What they do (1 sentence)
//   - Parameters & return value
// ============================================

import { useEffect, useRef, useState } from "react";

// ============================================
// CONSTANTS
// ============================================

// Used in: CaseContainer.jsx (animation timing)
// Controls when project panel closes/transitions/opens
export const CLOSE_MS = 400;
export const TRANSITION_GAP_MS = 20;
export const DEFAULT_FIRST_OPEN_INDEX = 0;

// ============================================
// ANIMATION HELPERS
// ============================================

/**
 * Rotate animation loop for DOM elements
 * Used in: Header.jsx (disco button rotation)
 * What: Continuously rotates element via requestAnimationFrame with 2deg increments. Snaps to last full 360° rotation on stop.
 *
 * @param {HTMLElement} element - DOM element to rotate
 * @param {Boolean} isActive - Whether animation should run
 * @returns {Function} Cleanup function to stop animation
 */
export function useRotationAnimation(element, isActive) {
  let animationId;
  let rotation = 0;

  const getRotationFromTransform = () => {
    const transform = element.style.transform;
    const match = transform.match(/rotate\((-?\d+(?:\.\d+)?)deg\)/);
    return match ? parseFloat(match[1]) : 0;
  };

  const rotate = () => {
    element.style.transform = `rotate(${(rotation += 2)}deg)`;
    animationId = requestAnimationFrame(rotate);
  };

  if (isActive) {
    rotation = getRotationFromTransform();
    animationId = requestAnimationFrame(rotate);
  } else {
    const currentRotation = getRotationFromTransform();
    const lastFullRotation = Math.floor(currentRotation / 360) * 360;
    element.style.transform = `rotate(${lastFullRotation}deg)`;
  }

  return () => animationId && cancelAnimationFrame(animationId);
}

// ============================================
// TIMER HELPERS
// ============================================

/**
 * Schedule async project open with delay
 * Used in: CaseContainer.jsx (handleProjectToggle when switching projects)
 * What: Sets up a timeout queue ref for delayed project open
 * 
 * @param {Number} index - Project index to open
 * @param {Object} timerRef - useRef object for setTimeout ID
 * @param {Object} queuedRef - useRef object for queued index
 * @param {Number} delay - Milliseconds before opening
 */
export function timer_schedule(index, timerRef, queuedRef, delay) {
  queuedRef.current = index;
  timerRef.current = setTimeout(() => {
    // Timer runs, actual state update handled by useEffect
  }, delay);
}

/**
 * Clear and reset timer refs
 * Used in: CaseContainer.jsx (handleSkillToggle, handleProjectToggle, cleanup useEffect)
 * What: Clears timeout and resets both timer and queued refs
 * 
 * @param {Object} timerRef - useRef object from setTimeout
 * @param {Object} queuedRef - useRef object storing queued index
 */
export function timer_clear(timerRef, queuedRef) {
  if (timerRef.current) {
    clearTimeout(timerRef.current);
    timerRef.current = null;
  }
  if (queuedRef.current !== null) {
    queuedRef.current = null;
  }
}

// ============================================
// AUDIO / RAVE MODE HOOK
// ============================================

/**
 * Rave mode with audio beat generation
 * Used in: Header.jsx (disco button)
 * What: Manages dark mode + generative beat pattern using Web Audio API
 * 
 * @returns {Array} [rave: Boolean, toggleRave: Function]
 */
export function useStrudel() {
  const [rave, setRave] = useState(false);
  const audioCtxRef = useRef(null);
  const beatIntervalRef = useRef(null);
  const masterGainRef = useRef(null);

  // ⚙️ BEAT KONSTANTEN
  const BEAT_CONFIG = {
    bpm: 240,
    masterVolume: 0.12,
  };

  // 🎵 SOUND LIBRARY
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
    
    // SYNTH BASE
    synth: { type: "triangle", duration: 0.5, attack: 0.25, decay: 0.75, volume: 0.4 },
  };

  // 🎵 SYNTH NOTEN – Frequenzen
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
    if (!sound) return;

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

  // 🎼 BEAT PATTERN
  const playBeat = (ctx, master, beatPhase = 0) => {
    const phase = beatPhase % 8;

    // Drums
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

  // 🎹 SYNTH NOTE PLAYER
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

      // Resume AudioContext (required for Safari/iOS)
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

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
      // Silent fail
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
      localStorage.setItem("darkMode", "true");
      setRave(true);
    } else {
      stopRave();
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
      setRave(false);
    }
  };

  useEffect(() => {
    // Load dark mode preference from localStorage
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    if (savedDarkMode) {
      document.documentElement.classList.add("dark");
      setRave(true);
    }
    
    return () => {
      stopRave();
      document.documentElement.classList.remove("dark");
    };
  }, []);

  return [rave, toggleRave];
}
