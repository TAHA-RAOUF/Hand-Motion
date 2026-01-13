"use client";

export type ExperienceType = "particles" | "gestures" | "title";

type Props = {
  onSelect: (type: ExperienceType) => void;
};

export default function SelectionScreen({ onSelect }: Props) {
  const cards = [
    {
      type: "particles" as ExperienceType,
      title: "Move Particles",
      description: "Control and move particles with your hand movements",
      icon: "✨",
      gradient: "from-cyan-500 to-blue-500",
    },
    {
      type: "gestures" as ExperienceType,
      title: "Hand Gestures",
      description: "Interact using hand gestures and positions",
      icon: "👋",
      gradient: "from-purple-500 to-pink-500",
    },
    // {
    //   type: "title" as ExperienceType,
    //   title: "Move Title",
    //   description: "Move and control a 3D text with your hands",
    //   icon: "📝",
    //   gradient: "from-orange-500 to-red-500",
    // },
  ];

  return (
    <main className="w-screen h-screen bg-black flex items-center justify-center relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20" />
      
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl px-8">
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Choose Your Experience
          </h1>
          <p className="text-xl text-gray-400">
            Select how you want to interact with the 3D world
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {cards.map((card, index) => (
            <div
              key={card.type}
              onClick={() => onSelect(card.type)}
              className="group cursor-pointer animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative h-80 rounded-2xl bg-gradient-to-br from-gray-900 to-black border border-gray-800 overflow-hidden transition-all duration-300 hover:border-gray-600 hover:scale-105 hover:-translate-y-2">
                {/* Gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                
                {/* Card content */}
                <div className="relative h-full flex flex-col items-center justify-center p-8">
                  <div className="text-7xl mb-6 group-hover:scale-110 transition-transform duration-300">
                    {card.icon}
                  </div>
                  
                  <h3 className={`text-3xl font-bold mb-4 bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}>
                    {card.title}
                  </h3>
                  
                  <p className="text-gray-400 text-center leading-relaxed">
                    {card.description}
                  </p>
                  
                  {/* Hover indicator */}
                  <div className="mt-8 flex items-center gap-2 text-gray-500 group-hover:text-gray-300 transition-colors">
                    <span>Click to start</span>
                    <svg 
                      className="w-4 h-4 group-hover:translate-x-1 transition-transform" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                {/* Border glow effect */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300`} />
              </div>
            </div>
          ))}
        </div>

        {/* Back button */}
        <div className="text-center mt-12 animate-fade-in" style={{ animationDelay: "500ms" }}>
          <button
            onClick={() => window.location.reload()}
            className="text-gray-500 hover:text-gray-300 transition-colors text-sm"
          >
            ← Back to start
          </button>
        </div>
      </div>
    </main>
  );
}
