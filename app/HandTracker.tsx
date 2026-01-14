/**
 * Hand Motion Studio - Hand Tracking Component
 * Created by Moraouf © 2026
 * GitHub: https://github.com/TAHA-RAOUF
 * 
 * This file is part of Hand Motion Studio.
 * Licensed under the MIT License.
 */

"use client";

import { useEffect, useRef, useState } from "react";

type HandData = {
  x: number;
  y: number;
  isOpen: boolean;
  openness: number; // 0 = closed, 1 = fully open
  swipeDirection: 'left' | 'right' | 'up' | 'down' | null;
  velocity: number;
  landmarks?: any[]; // Full MediaPipe landmarks for detailed finger control
};

type Props = {
  onHandMove: (data: HandData | null) => void;
};

export default function HandTracker({ onHandMove }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const previousPos = useRef({ x: 0, y: 0, time: Date.now() });
  const swipeTimeout = useRef<NodeJS.Timeout | undefined>(undefined);
  const [handDetected, setHandDetected] = useState(false);

  useEffect(() => {
    let hands: any;
    
    const initHandTracking = async () => {
      if (!videoRef.current || !canvasRef.current) return;

      // Dynamically import MediaPipe Hands only on client side
      const { Hands } = await import("@mediapipe/hands");

      hands = new Hands({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.7,
      });

      hands.onResults((results: any) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        
        if (canvas && ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Draw hand landmarks if detected
          const lm = results.multiHandLandmarks?.[0];
          if (lm) {
            // Draw connections
            ctx.strokeStyle = "#00ff00";
            ctx.lineWidth = 2;
            
            const connections = [
              [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
              [0, 5], [5, 6], [6, 7], [7, 8], // Index
              [0, 9], [9, 10], [10, 11], [11, 12], // Middle
              [0, 13], [13, 14], [14, 15], [15, 16], // Ring
              [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
              [5, 9], [9, 13], [13, 17] // Palm
            ];
            
            connections.forEach(([start, end]) => {
              const startPoint = lm[start];
              const endPoint = lm[end];
              ctx.beginPath();
              ctx.moveTo(startPoint.x * canvas.width, startPoint.y * canvas.height);
              ctx.lineTo(endPoint.x * canvas.width, endPoint.y * canvas.height);
              ctx.stroke();
            });
            
            // Draw landmarks
            ctx.fillStyle = "#ff00ff";
            lm.forEach((landmark: any) => {
              ctx.beginPath();
              ctx.arc(
                landmark.x * canvas.width,
                landmark.y * canvas.height,
                5,
                0,
                2 * Math.PI
              );
              ctx.fill();
            });
            
            // Use index fingertip (landmark 8)
            const { x, y } = lm[8];
            const nx = x * 2 - 1;
            const ny = -(y * 2 - 1);
            
            // Calculate hand openness by measuring finger tip distances from palm
            const palmCenter = lm[0];
            const fingerTips = [lm[4], lm[8], lm[12], lm[16], lm[20]]; // Thumb, Index, Middle, Ring, Pinky
            
            let totalDistance = 0;
            fingerTips.forEach(tip => {
              const dx = tip.x - palmCenter.x;
              const dy = tip.y - palmCenter.y;
              const dz = tip.z - palmCenter.z;
              totalDistance += Math.sqrt(dx * dx + dy * dy + dz * dz);
            });
            
            // Normalize openness (typical range: 0.3 closed, 0.8 open)
            const openness = Math.min(Math.max((totalDistance - 0.3) / 0.5, 0), 1);
            const isOpen = openness > 0.5;
            
            // Detect swipe direction
            const now = Date.now();
            const deltaX = nx - previousPos.current.x;
            const deltaY = ny - previousPos.current.y;
            const deltaTime = now - previousPos.current.time;
            
            // Calculate velocity
            const velocity = Math.sqrt(deltaX * deltaX + deltaY * deltaY) / (deltaTime / 1000);
            
            let swipeDirection: 'left' | 'right' | 'up' | 'down' | null = null;
            
            // Detect significant swipes (velocity threshold)
            if (velocity > 2) {
              const absX = Math.abs(deltaX);
              const absY = Math.abs(deltaY);
              
              if (absX > absY) {
                swipeDirection = deltaX > 0 ? 'right' : 'left';
              } else {
                swipeDirection = deltaY > 0 ? 'up' : 'down';
              }
              
              // Clear swipe after short delay
              if (swipeTimeout.current) clearTimeout(swipeTimeout.current);
            }
            
            previousPos.current = { x: nx, y: ny, time: now };
            
            setHandDetected(true);
            onHandMove({ x: nx, y: ny, isOpen, openness, swipeDirection, velocity, landmarks: lm });
          } else {
            setHandDetected(false);
            onHandMove(null);
          }
        }
      });

      // Start camera
      startCamera();
    };

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
        });
        
        if (videoRef.current) {
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

    const sendFrame = async () => {
      if (hands && videoRef.current && videoRef.current.readyState === 4) {
        await hands.send({ image: videoRef.current });
      }
      animationFrameRef.current = requestAnimationFrame(sendFrame);
    };

    initHandTracking();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
      if (hands) {
        hands.close();
      }
    };
  }, [onHandMove]);

  return (
    <div
      className="hand-tracker-container"
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        width: 320,
        height: 240,
        border: "2px solid #00ff00",
        borderRadius: 8,
        overflow: "hidden",
        zIndex: 1000,
      }}
    >
      <video
        ref={videoRef}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: "scaleX(-1)", // Mirror the video
        }}
        autoPlay
        playsInline
        muted
      />
      <canvas
        ref={canvasRef}
        width={320}
        height={240}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          transform: "scaleX(-1)", // Mirror the canvas
        }}
      />
      
      {/* Hand detection status */}
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          right: 10,
          padding: "8px 12px",
          borderRadius: 6,
          background: handDetected 
            ? "rgba(0, 255, 0, 0.2)" 
            : "rgba(255, 0, 0, 0.2)",
          border: handDetected 
            ? "2px solid #00ff00" 
            : "2px solid #ff0000",
          backdropFilter: "blur(10px)",
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 14,
          fontWeight: 600,
          color: "white",
          textShadow: "0 2px 4px rgba(0,0,0,0.5)",
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: handDetected ? "#00ff00" : "#ff0000",
            boxShadow: handDetected 
              ? "0 0 8px #00ff00" 
              : "0 0 8px #ff0000",
            animation: handDetected ? "pulse 1.5s infinite" : "none",
          }}
        />
        {handDetected ? "Hand Detected" : "No Hand Detected"}
      </div>
      
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        /* Mobile responsive */
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
            top: 10px !important;
            right: 10px !important;
          }
        }
      `}</style>
    </div>
  );
}
