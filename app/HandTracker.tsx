/**
 * Hand Motion Studio - Hand Tracking Component
 * Created by Moraouf © 2026
 * GitHub: https://github.com/TAHA-RAOUF
 *
 * This file is part of Hand Motion Studio.
 * Licensed under the MIT License.
 */

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { HandData } from "./types";

type Props = {
  onHandMove: (data: HandData | null) => void;
};

// Count extended fingers from landmarks
function countFingers(landmarks: any[]): number {
  if (!landmarks || landmarks.length < 21) return 0;

  let count = 0;

  // Thumb: compare tip x vs IP joint x (works for right hand, mirror for left)
  const thumbTip = landmarks[4];
  const thumbIP = landmarks[3];
  const wrist = landmarks[0];
  const isRightHand = landmarks[17].x < wrist.x;
  if (isRightHand ? thumbTip.x < thumbIP.x : thumbTip.x > thumbIP.x) count++;

  // Other 4 fingers: tip.y < pip.y means extended (y is inverted in screen coords)
  const fingerPairs = [
    [8, 6],   // Index
    [12, 10], // Middle
    [16, 14], // Ring
    [20, 18], // Pinky
  ];
  for (const [tipIdx, pipIdx] of fingerPairs) {
    if (landmarks[tipIdx].y < landmarks[pipIdx].y) count++;
  }

  return count;
}

export default function HandTracker({ onHandMove }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const processingRef = useRef(false); // Prevent frame pileup
  const previousPos = useRef({ x: 0, y: 0, time: Date.now() });
  const smoothedPos = useRef({ x: 0, y: 0 }); // EMA smoothed position
  const swipeTimeout = useRef<NodeJS.Timeout | undefined>(undefined);
  const [handDetected, setHandDetected] = useState(false);
  const handsRef = useRef<any>(null);

  // Memoize the callback to prevent re-renders from re-initializing MediaPipe
  const onHandMoveRef = useRef(onHandMove);
  onHandMoveRef.current = onHandMove;

  const processResults = useCallback((results: any) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const lm = results.multiHandLandmarks?.[0];
      if (lm) {
        // Draw hand skeleton with glow effect
        ctx.shadowBlur = 8;
        ctx.shadowColor = "#00ffff";

        // Draw connections with gradient
        const connections = [
          [0, 1], [1, 2], [2, 3], [3, 4],
          [0, 5], [5, 6], [6, 7], [7, 8],
          [0, 9], [9, 10], [10, 11], [11, 12],
          [0, 13], [13, 14], [14, 15], [15, 16],
          [0, 17], [17, 18], [18, 19], [19, 20],
          [5, 9], [9, 13], [13, 17],
        ];

        ctx.strokeStyle = "rgba(0, 255, 255, 0.6)";
        ctx.lineWidth = 2;

        connections.forEach(([start, end]) => {
          const s = lm[start];
          const e = lm[end];
          ctx.beginPath();
          ctx.moveTo(s.x * canvas.width, s.y * canvas.height);
          ctx.lineTo(e.x * canvas.width, e.y * canvas.height);
          ctx.stroke();
        });

        // Draw landmarks with color coding
        lm.forEach((landmark: any, idx: number) => {
          const isFingerTip = [4, 8, 12, 16, 20].includes(idx);
          ctx.beginPath();
          ctx.arc(
            landmark.x * canvas.width,
            landmark.y * canvas.height,
            isFingerTip ? 6 : 4,
            0,
            2 * Math.PI
          );
          ctx.fillStyle = isFingerTip ? "#ff00ff" : "#00ffff";
          ctx.shadowColor = isFingerTip ? "#ff00ff" : "#00ffff";
          ctx.fill();
        });

        ctx.shadowBlur = 0;

        // Use palm center (landmark 9 = middle finger base) for smoother tracking
        const palmX = (lm[0].x + lm[5].x + lm[9].x + lm[13].x + lm[17].x) / 5;
        const palmY = (lm[0].y + lm[5].y + lm[9].y + lm[13].y + lm[17].y) / 5;

        // Map to normalized coords (-1 to 1)
        const rawX = palmX * 2 - 1;
        const rawY = -(palmY * 2 - 1);

        // EMA smoothing (alpha = 0.4 for responsive but smooth tracking)
        const alpha = 0.4;
        smoothedPos.current.x = smoothedPos.current.x + alpha * (rawX - smoothedPos.current.x);
        smoothedPos.current.y = smoothedPos.current.y + alpha * (rawY - smoothedPos.current.y);

        const nx = smoothedPos.current.x;
        const ny = smoothedPos.current.y;

        // Calculate hand openness
        const palmCenter = lm[0];
        const fingerTips = [lm[4], lm[8], lm[12], lm[16], lm[20]];
        let totalDistance = 0;
        fingerTips.forEach((tip) => {
          const dx = tip.x - palmCenter.x;
          const dy = tip.y - palmCenter.y;
          const dz = tip.z - palmCenter.z;
          totalDistance += Math.sqrt(dx * dx + dy * dy + dz * dz);
        });
        const openness = Math.min(Math.max((totalDistance - 0.3) / 0.5, 0), 1);
        const isOpen = openness > 0.5;

        // Count fingers
        const fingerCount = countFingers(lm);

        // Detect swipe direction
        const now = Date.now();
        const deltaX = nx - previousPos.current.x;
        const deltaY = ny - previousPos.current.y;
        const deltaTime = now - previousPos.current.time;
        const velocity = Math.sqrt(deltaX * deltaX + deltaY * deltaY) / (deltaTime / 1000);

        let swipeDirection: "left" | "right" | "up" | "down" | null = null;
        if (velocity > 2.5) {
          const absX = Math.abs(deltaX);
          const absY = Math.abs(deltaY);
          if (absX > absY) {
            swipeDirection = deltaX > 0 ? "right" : "left";
          } else {
            swipeDirection = deltaY > 0 ? "up" : "down";
          }
          if (swipeTimeout.current) clearTimeout(swipeTimeout.current);
        }

        previousPos.current = { x: nx, y: ny, time: now };

        setHandDetected(true);
        onHandMoveRef.current({
          x: nx,
          y: ny,
          isOpen,
          openness,
          swipeDirection,
          velocity,
          fingerCount,
          landmarks: lm,
        });
      } else {
        setHandDetected(false);
        onHandMoveRef.current(null);
      }
    }

    processingRef.current = false;
  }, []);

  useEffect(() => {
    let mounted = true;

    const initHandTracking = async () => {
      if (!videoRef.current || !canvasRef.current) return;

      const { Hands } = await import("@mediapipe/hands");

      const hands = new Hands({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.65,
        minTrackingConfidence: 0.65,
      });

      hands.onResults(processResults);
      handsRef.current = hands;

      // Start camera
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: "user" },
        });

        if (videoRef.current && mounted) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            sendFrame();
          };
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
      }
    };

    // Non-blocking frame sender — fire and forget, skip if still processing
    const sendFrame = () => {
      if (!mounted) return;

      if (
        handsRef.current &&
        videoRef.current &&
        videoRef.current.readyState === 4 &&
        !processingRef.current
      ) {
        processingRef.current = true;
        handsRef.current
          .send({ image: videoRef.current })
          .catch(() => {
            processingRef.current = false;
          });
      }

      animationFrameRef.current = requestAnimationFrame(sendFrame);
    };

    initHandTracking();

    return () => {
      mounted = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
      if (handsRef.current) {
        handsRef.current.close();
      }
    };
  }, [processResults]);

  return (
    <div
      className="hand-tracker-container"
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        width: 280,
        height: 210,
        borderRadius: 16,
        overflow: "hidden",
        zIndex: 1000,
        background: "rgba(0, 0, 0, 0.3)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: handDetected
          ? "0 0 20px rgba(0, 255, 255, 0.3), inset 0 0 20px rgba(0, 255, 255, 0.05)"
          : "0 0 20px rgba(255, 0, 100, 0.2), inset 0 0 20px rgba(255, 0, 100, 0.05)",
        transition: "box-shadow 0.5s ease",
      }}
    >
      <video
        ref={videoRef}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: "scaleX(-1)",
          opacity: 0.85,
        }}
        autoPlay
        playsInline
        muted
      />
      <canvas
        ref={canvasRef}
        width={280}
        height={210}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          transform: "scaleX(-1)",
        }}
      />

      {/* Status badge */}
      <div
        style={{
          position: "absolute",
          bottom: 8,
          left: 8,
          right: 8,
          padding: "6px 10px",
          borderRadius: 8,
          background: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 11,
          fontWeight: 500,
          color: "white",
          letterSpacing: "0.03em",
        }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: handDetected ? "#00ffcc" : "#ff3366",
            boxShadow: handDetected
              ? "0 0 8px #00ffcc"
              : "0 0 8px #ff3366",
            animation: handDetected ? "pulse 1.5s infinite" : "none",
          }}
        />
        <span style={{ opacity: 0.9 }}>
          {handDetected ? "Tracking Active" : "No Hand Detected"}
        </span>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        @media (max-width: 768px) {
          .hand-tracker-container {
            width: 160px !important;
            height: 120px !important;
            top: 10px !important;
            right: 10px !important;
          }
        }

        @media (max-width: 480px) {
          .hand-tracker-container {
            width: 120px !important;
            height: 90px !important;
          }
        }
      `}</style>
    </div>
  );
}
