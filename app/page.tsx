/**
 * Hand Motion Studio - Main Page
 * Created by Moraouf © 2026
 * GitHub: https://github.com/TAHA-RAOUF
 *
 * This file is part of Hand Motion Studio.
 * Licensed under the MIT License.
 */

// app/page.tsx
"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { Suspense, useState, useEffect, useRef } from "react";
import HandScene from "./HandScene";
import HandGestureScene from "./HandGestureScene";
import TitleScene from "./TitleScene";
import GravityWellScene from "./GravityWellScene";
import MagicWandScene from "./MagicWandScene";
import HandTracker from "./HandTracker";
import ParticlesBackground from "./ParticlesBackground";
import StartButton from "./StartButton";
import SelectionScreen, { ExperienceType } from "./SelectionScreen";
import type { HandData } from "./types";

// Mode name labels
const MODE_NAMES: Record<string, string> = {
  particles: "✨ Particle Control",
  gestures: "👋 Hand Gesture",
  title: "📝 Text Control",
  gravity: "🌀 Gravity Well",
  wand: "🪄 Magic Wand",
};

// FPS Counter hook
function useFPS() {
  const [fps, setFps] = useState(0);
  const frames = useRef(0);
  const lastTime = useRef(performance.now());

  useEffect(() => {
    let rafId: number;
    const tick = () => {
      frames.current++;
      const now = performance.now();
      if (now - lastTime.current >= 1000) {
        setFps(frames.current);
        frames.current = 0;
        lastTime.current = now;
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return fps;
}

export default function HomePage() {
  const [handPos, setHandPos] = useState<HandData | null>(null);
  const [started, setStarted] = useState(false);
  const [selectedExperience, setSelectedExperience] =
    useState<ExperienceType | null>(null);
  const fps = useFPS();

  // Show start screen
  if (!started) {
    return (
      <main className="w-screen h-screen bg-black flex items-center justify-center relative overflow-hidden">
        <ParticlesBackground />
        <div className="relative z-10 text-center px-8 animate-fade-in">
          <h1 className="text-7xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
            Hand Motion Studio
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl">
            Control 3D particles with your hand gestures
          </p>
          <div className="space-y-4 mb-12 text-gray-400">
            <p className="flex items-center justify-center gap-2">
              <span className="text-cyan-400">✋</span> Move your hand to
              control particles
            </p>
            <p className="flex items-center justify-center gap-2">
              <span className="text-purple-400">👐</span> Open/close hand to
              expand/contract
            </p>
            <p className="flex items-center justify-center gap-2">
              <span className="text-pink-400">👉</span> Swipe left/right to
              change patterns
            </p>
          </div>
          <StartButton onClick={() => setStarted(true)} />
        </div>
        <footer className="absolute bottom-8 left-0 right-0 text-center">
          <div className="inline-block bg-black/40 backdrop-blur-sm px-6 py-3 rounded-full border border-gray-800/50">
            <p className="text-gray-400 text-sm">
              © 2026 Created by{" "}
              <a
                href="https://github.com/TAHA-RAOUF"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent font-semibold hover:opacity-80 transition-opacity"
              >
                Moraouf
              </a>{" "}
              - All Rights Reserved
            </p>
          </div>
        </footer>
      </main>
    );
  }

  // Show selection screen
  if (!selectedExperience) {
    return <SelectionScreen onSelect={setSelectedExperience} />;
  }

  // Show the selected experience
  return (
    <main className="w-screen h-screen bg-black relative">
      <HandTracker onHandMove={setHandPos} />
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <color attach="background" args={["#030308"]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />

        {/* Stars background for all scenes */}
        <Stars
          radius={50}
          depth={50}
          count={2000}
          factor={4}
          saturation={0.5}
          fade
          speed={0.5}
        />

        <Suspense fallback={null}>
          {selectedExperience === "particles" && (
            <HandScene handPos={handPos} />
          )}
          {selectedExperience === "gestures" && (
            <HandGestureScene handPos={handPos} />
          )}
          {selectedExperience === "title" && (
            <TitleScene handPos={handPos} />
          )}
          {selectedExperience === "gravity" && (
            <GravityWellScene handPos={handPos} />
          )}
          {selectedExperience === "wand" && (
            <MagicWandScene handPos={handPos} />
          )}
        </Suspense>
        <OrbitControls enableZoom={false} />
      </Canvas>

      {/* Experience info overlay */}
      <div className="absolute top-4 left-4 z-50 bg-black/40 backdrop-blur-md rounded-xl p-4 border border-white/10"
           style={{ minWidth: 200 }}
      >
        <h3 className="text-white text-sm font-semibold mb-2">
          {MODE_NAMES[selectedExperience] || selectedExperience}
        </h3>
        <p className="text-gray-400 text-xs mb-1">
          {handPos ? (
            <span className="text-emerald-400">● Hand detected</span>
          ) : (
            <span className="text-rose-400">● Show your hand to camera</span>
          )}
        </p>
        <p className="text-gray-500 text-xs">{fps} FPS</p>

        {/* Mode-specific instructions */}
        {selectedExperience === "title" && (
          <div className="text-xs text-gray-300 space-y-1 mt-3 border-t border-white/10 pt-2">
            <p>✋ 1 finger → <span className="text-cyan-400">Hello</span></p>
            <p>✌️ 2 fingers → <span className="text-pink-400">World</span></p>
            <p>🤟 3 fingers → <span className="text-yellow-400">This is 3D</span></p>
            <p>👈👉 Swipe → Clear text</p>
          </div>
        )}

        {selectedExperience === "gravity" && (
          <div className="text-xs text-gray-300 space-y-1 mt-3 border-t border-white/10 pt-2">
            <p>👐 Open hand → <span className="text-cyan-400">Attract</span></p>
            <p>✊ Closed fist → <span className="text-rose-400">Repel</span></p>
          </div>
        )}

        {selectedExperience === "wand" && (
          <div className="text-xs text-gray-300 space-y-1 mt-3 border-t border-white/10 pt-2">
            <p>✋ Move → <span className="text-purple-400">Draw trail</span></p>
            <p>✊→👐 Open fist → <span className="text-yellow-400">Sparkle burst</span></p>
          </div>
        )}

        <button
          onClick={() => setSelectedExperience(null)}
          className="mt-3 text-xs text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Change mode
        </button>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-4 left-0 right-0 text-center z-50">
        <div className="inline-block bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
          <p className="text-gray-500 text-xs">
            © 2026 Created by{" "}
            <a
              href="https://github.com/TAHA-RAOUF"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors"
            >
              Moraouf
            </a>{" "}
            - All Rights Reserved
          </p>
        </div>
      </footer>
    </main>
  );
}
