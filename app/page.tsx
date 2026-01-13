// app/page.tsx
"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense, useState } from "react";
import HandScene from "./HandScene";
import HandTracker from "./HandTracker";
import ParticlesBackground from "./ParticlesBackground";
import StartButton from "./StartButton";

type HandData = {
  x: number;
  y: number;
  isOpen: boolean;
  openness: number;
  swipeDirection: "left" | "right" | "up" | "down" | null;
  velocity: number;
};

export default function HomePage() {
  const [handPos, setHandPos] = useState<HandData | null>(null);
  const [started, setStarted] = useState(false);

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

        {/* Footer */}
        <footer className="absolute bottom-8 left-0 right-0 text-center">
          <p className="text-gray-500 text-sm">
            Created by{" "}
            <a
              href="https://github.com/TAHA-RAOUF"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent font-semibold hover:opacity-80 transition-opacity"
            >
              Black_Wolf
            </a>
          </p>
        </footer>
      </main>
    );
  }

  return (
    <main className="w-screen h-screen bg-black relative">
      <HandTracker onHandMove={setHandPos} />
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <color attach="background" args={["#05050a"]} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <Suspense fallback={null}>
          <HandScene handPos={handPos} />
        </Suspense>
        <OrbitControls enableZoom={false} />
      </Canvas>

      {/* Footer for 3D view */}
      <footer className="absolute bottom-4 left-0 right-0 text-center z-50">
        <p className="text-gray-600 text-xs">
          Created by{" "}
          <span className="text-purple-400 font-semibold">Black Wolf</span>
        </p>
      </footer>
    </main>
  );
}
