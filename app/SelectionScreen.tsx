/**
 * Hand Motion Studio - Experience Selection Screen
 * Created by Moraouf © 2026
 * GitHub: https://github.com/TAHA-RAOUF
 *
 * This file is part of Hand Motion Studio.
 * Licensed under the MIT License.
 */

"use client";

export type ExperienceType = "particles" | "gestures" | "title" | "gravity" | "wand";

type Props = {
  onSelect: (type: ExperienceType) => void;
};

export default function SelectionScreen({ onSelect }: Props) {
  const cards = [
    {
      type: "particles" as ExperienceType,
      title: "Move Particles",
      description: "Control 3000 particles across 10 stunning patterns — swipe to cycle modes",
      icon: "✨",
      gradient: "from-cyan-500 to-blue-500",
    },
    {
      type: "gravity" as ExperienceType,
      title: "Gravity Well",
      description: "Attract and repel particles with gravitational forces — open hand pulls, fist pushes",
      icon: "🌀",
      gradient: "from-violet-500 to-indigo-500",
    },
    {
      type: "wand" as ExperienceType,
      title: "Magic Wand",
      description: "Paint rainbow particle trails in 3D space — open your fist for sparkle bursts",
      icon: "🪄",
      gradient: "from-amber-500 to-pink-500",
    },
    {
      type: "gestures" as ExperienceType,
      title: "3D Hand Model",
      description: "See a realistic 3D hand mirror your real hand movements in real-time",
      icon: "👋",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      type: "title" as ExperienceType,
      title: "Text Control",
      description: "Show different fingers to spawn 3D text — swipe to clear",
      icon: "📝",
      gradient: "from-orange-500 to-red-500",
    },
  ];

  return (
    <main className="w-screen h-screen bg-black flex items-center justify-center relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20" />

      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl px-6 overflow-y-auto max-h-screen py-12">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Choose Your Experience
          </h1>
          <p className="text-lg text-gray-400">
            Select how you want to interact with the 3D world
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, index) => (
            <div
              key={card.type}
              onClick={() => onSelect(card.type)}
              className="group cursor-pointer animate-slide-up"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="relative h-64 rounded-2xl bg-gradient-to-br from-gray-900/80 to-black border border-white/10 overflow-hidden transition-all duration-300 hover:border-white/20 hover:scale-[1.03] hover:-translate-y-1">
                {/* Gradient overlay */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                />

                {/* Card content */}
                <div className="relative h-full flex flex-col items-center justify-center p-6">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {card.icon}
                  </div>

                  <h3
                    className={`text-xl font-bold mb-3 bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}
                  >
                    {card.title}
                  </h3>

                  <p className="text-gray-400 text-sm text-center leading-relaxed max-w-[240px]">
                    {card.description}
                  </p>

                  {/* Hover indicator */}
                  <div className="mt-5 flex items-center gap-2 text-gray-500 group-hover:text-gray-300 transition-colors text-xs">
                    <span>Click to start</span>
                    <svg
                      className="w-3 h-3 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>

                {/* Border glow effect */}
                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-15 blur-xl transition-opacity duration-300 pointer-events-none`}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Back button */}
        <div
          className="text-center mt-10 animate-fade-in"
          style={{ animationDelay: "500ms" }}
        >
          <button
            onClick={() => window.location.reload()}
            className="text-gray-500 hover:text-gray-300 transition-colors text-sm"
          >
            ← Back to start
          </button>
        </div>
      </div>

      {/* Copyright footer */}
      <footer className="absolute bottom-6 left-0 right-0 text-center z-50">
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
