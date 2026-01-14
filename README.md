#  Hand Motion Studio

> **Created by [Moraouf](https://github.com/TAHA-RAOUF) © 2026 | Licensed under MIT**

An interactive 3D particle system controlled by hand gestures using MediaPipe and Three.js. Move your hand to control beautiful particle formations in real-time!

![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black)
![React Three Fiber](https://img.shields.io/badge/React%20Three%20Fiber-latest-blue)
![MediaPipe](https://img.shields.io/badge/MediaPipe-Hands-green)
![License](https://img.shields.io/badge/License-MIT-green)
![Copyright](https://img.shields.io/badge/Copyright-Moraouf%202026-blue)

## ✨ Features

- 🖐️ **Real-time Hand Tracking** - Uses MediaPipe Hands for accurate hand detection
- 🎯 **Gesture Controls** - Open/close hand to expand/contract particles
- 🌊 **4 Particle Modes** - Swipe to cycle through Sphere, Wave, Helix, and Cube patterns
-  **Dynamic Colors** - Each mode has unique color themes
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile devices
- ⚡ **Ultra Smooth Transitions** - Imperceptible particle movements
- 🎥 **Live Camera Feed** - See your hand tracking in real-time

## 🎮 Controls

| Gesture | Action |
|---------|--------|
| ✋ Move Hand | Control particle position |
| 👐 Open Hand | Expand particles |
| ✊ Close Hand | Contract particles |
| 👉 Swipe Right | Next particle pattern |
| 👈 Swipe Left | Previous particle pattern |
| ☝️ Swipe Up/Down | Burst effects |

##  Particle Modes

1. **Sphere** (Cyan/Magenta) - Default flowing particles
2. **Wave** (Green/Yellow) - Undulating wave pattern
3. **Helix** (Blue/Purple) - DNA-like spiral structure
4. **Cube** (Red/Orange) - Geometric grid pattern

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- Webcam access

### Installation

```bash
# Clone the repository
git clone <your-repo-url>

# Navigate to project directory
cd attractors-hand-demo

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 🛠️ Tech Stack

- **Next.js 16.1.1** - React framework with App Router
- **React Three Fiber** - React renderer for Three.js
- **Three.js** - 3D graphics library
- **@react-three/drei** - Useful helpers for R3F
- **MediaPipe Hands** - Hand tracking ML model
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling

## 📦 Project Structure

```
app/
├── HandTracker.tsx       # MediaPipe hand tracking component
├── HandScene.tsx         # Three.js 3D particle system
├── ParticlesBackground.tsx # Intro screen particles
├── StartButton.tsx       # Animated start button
├── page.tsx             # Main page with intro screen
├── globals.css          # Global styles
└── startButton.css      # Button animations
```

## 🎯 How It Works

1. **Hand Detection**: MediaPipe Hands tracks 21 hand landmarks in real-time
2. **Gesture Recognition**: Calculates hand openness and swipe direction from landmarks
3. **3D Rendering**: React Three Fiber renders 2000 particles that respond to gestures
4. **Smooth Interpolation**: All movements use lerp for buttery-smooth transitions

## 🔧 Performance Optimizations

- Dynamic MediaPipe import (client-side only)
- Particle position interpolation for smooth movement
- Optimized lerp values for imperceptible transitions
- Responsive camera feed for mobile devices
- Efficient particle system with 2000 particles

## 📱 Browser Support

Works best on:
- Chrome/Edge (recommended)
- Firefox
- Safari (macOS/iOS)

Requires webcam access and JavaScript enabled.

## 👤 Author

**Moraouf** - [GitHub](https://github.com/TAHA-RAOUF)

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- MediaPipe by Google
- Three.js community

---

**Created by Moraouf © 2026** | Made with ❤️ | [GitHub](https://github.com/TAHA-RAOUF)
