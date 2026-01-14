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
import { OrbitControls } from "@react-three/drei";
import { Suspense, useState } from "react";
import HandScene from "./HandScene";
import HandGestureScene from "./HandGestureScene";
import TitleScene from "./TitleScene";
import HandTracker from "./HandTracker";
import ParticlesBackground from "./ParticlesBackground";
import StartButton from "./StartButton";
import SelectionScreen, { ExperienceType } from "./SelectionScreen";

type HandData = {
  x: number;
  y: number;
  isOpen: boolean;
  openness: number;
  swipeDirection: "left" | "right" | "up" | "down" | null;
  velocity: number;
  landmarks?: any[];
};

export default function HomePage() {
  const [handPos, setHandPos] = useState<HandData | null>(null);
  const [started, setStarted] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState<ExperienceType | null>(null);

  // Show start screen
  if (!started) {
    return (
      <main className="w-screen h-screen bg-black flex items-center justify-center relative overflow-hidden">
        {/* Particles.js background */}
        <ParticlesBackground />

        {/* Main content */}
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

        {/* Footer with copyright notice */}
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
              </a>
              {" "}- All Rights Reserved
            </p>
          </div>
        </footer>
      </main>
    );
  }

  // Show selection screen after start button is clicked
  if (!selectedExperience) {
    return <SelectionScreen onSelect={setSelectedExperience} />;
  }

  // Show the selected experience
  return (
    <main className="w-screen h-screen bg-black relative">
      <HandTracker onHandMove={setHandPos} />
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <color attach="background" args={["#05050a"]} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <Suspense fallback={null}>
          {selectedExperience === "particles" && <HandScene handPos={handPos} />}
          {selectedExperience === "gestures" && <HandGestureScene handPos={handPos} />}
          {selectedExperience === "title" && <TitleScene handPos={handPos} />}
        </Suspense>
        <OrbitControls enableZoom={false} />
      </Canvas>

      {/* Experience info overlay */}
      <div className="absolute top-4 left-4 z-50 bg-black/50 backdrop-blur-sm rounded-lg p-4 border border-gray-800">
        <h3 className="text-white text-sm font-semibold mb-2">
          {selectedExperience === "particles" && " Particle Control"}
          {selectedExperience === "gestures" && "👋 Hand Gesture Mode"}
          {selectedExperience === "title" && "📝 Text Control"}
        </h3>
        <p className="text-gray-400 text-xs mb-2">
          {handPos ? "Hand detected ✓" : "Show your hand to camera"}
        </p>
        
        {/* Instructions for Title mode */}
        {selectedExperience === "title" && (
          <div className="text-xs text-gray-300 space-y-1 mt-3 border-t border-gray-700 pt-2">
            <p>✋ 1 finger → <span className="text-cyan-400">Hello</span></p>
            <p>✌️ 2 fingers → <span className="text-pink-400">World</span></p>
            <p>🤟 3 fingers → <span className="text-yellow-400">This is 3D</span></p>
            <p>👈👉 Swipe → Clear text</p>
          </div>
        )}
        
        <button
          onClick={() => setSelectedExperience(null)}
          className="mt-2 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          ← Change mode
        </button>
      </div>

      {/* Footer for 3D view - Copyright watermark */}
      <footer className="absolute bottom-4 left-0 right-0 text-center z-50">
        <div className="inline-block bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-700/50">
          <p className="text-gray-400 text-xs">
            © 2026 Created by{" "}
            <a 
              href="https://github.com/TAHA-RAOUF" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors"
            >
              Moraouf
            </a>
            {" "}- All Rights Reserved
          </p>
        </div>
      </footer>
    </main>
  );
}
