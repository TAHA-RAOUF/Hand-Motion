"use client";

import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Center } from "@react-three/drei";
import * as THREE from "three";

type HandData = {
  x: number;
  y: number;
  isOpen: boolean;
  openness: number;
  swipeDirection: 'left' | 'right' | 'up' | 'down' | null;
  velocity: number;
};

type Props = {
  handPos: HandData | null;
};

// Component for animated 3D text
function AnimatedText({ text, position, color }: { text: string; position: [number, number, number]; color: string }) {
  const textRef = useRef<THREE.Mesh>(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    setScale(0);
    const timer = setTimeout(() => setScale(1), 50);
    return () => clearTimeout(timer);
  }, [text]);

  useFrame(() => {
    if (textRef.current) {
      const targetScale = scale;
      textRef.current.scale.x += (targetScale - textRef.current.scale.x) * 0.1;
      textRef.current.scale.y += (targetScale - textRef.current.scale.y) * 0.1;
      textRef.current.scale.z += (targetScale - textRef.current.scale.z) * 0.1;
      
      // Gentle rotation animation
      textRef.current.rotation.y += 0.005;
    }
  });

  return (
    <Center position={position}>
      <Text
        ref={textRef}
        fontSize={1}
        maxWidth={10}
        lineHeight={1}
        letterSpacing={0.02}
        textAlign="center"
        font="https://fonts.gstatic.com/s/raleway/v14/1Ptrg8zYS_SKggPNwK4vaqI.woff"
        anchorX="center"
        anchorY="middle"
      >
        {text}
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
          metalness={0.8}
          roughness={0.2}
        />
      </Text>
    </Center>
  );
}

// Detect number of open fingers based on hand openness and position
function detectFingerCount(handPos: HandData | null): number {
  if (!handPos) return 0;
  
  // Use openness to estimate finger count
  // openness ranges from 0 (closed) to 1 (fully open)
  const openness = handPos.openness;
  
  if (openness < 0.2) return 0; // Fist
  if (openness < 0.4) return 1; // One finger
  if (openness < 0.6) return 2; // Two fingers
  if (openness < 0.8) return 3; // Three fingers
  return 5; // Fully open hand
}

export default function TitleScene({ handPos }: Props) {
  const [currentText, setCurrentText] = useState<string>("");
  const [fingerCount, setFingerCount] = useState(0);
  const textGroupRef = useRef<THREE.Group>(null);
  const targetPos = useRef(new THREE.Vector3(0, 0, 0));
  const currentPos = useRef(new THREE.Vector3(0, 0, 0));
  const lastSwipeTime = useRef(0);

  useFrame(() => {
    if (!textGroupRef.current) return;

    if (handPos) {
      // Move text with hand position
      targetPos.current.set(handPos.x * 2, handPos.y * 2, 0);
      currentPos.current.lerp(targetPos.current, 0.1);
      textGroupRef.current.position.copy(currentPos.current);

      // Detect swipe to clear text
      if (handPos.swipeDirection && (handPos.swipeDirection === 'left' || handPos.swipeDirection === 'right')) {
        const now = Date.now();
        if (now - lastSwipeTime.current > 500) { // Prevent multiple triggers
          setCurrentText("");
          setFingerCount(0);
          lastSwipeTime.current = now;
        }
      } else {
        // Update finger count and text
        const count = detectFingerCount(handPos);
        if (count !== fingerCount && count > 0) {
          setFingerCount(count);
          
          // Set text based on finger count
          switch (count) {
            case 1:
              setCurrentText("Hello");
              break;
            case 2:
              setCurrentText("World");
              break;
            case 3:
              setCurrentText("This is 3D");
              break;
            default:
              setCurrentText("");
          }
        }
      }
    }
  });

  // Get color based on finger count
  const getColor = () => {
    switch (fingerCount) {
      case 1: return "#00ffff"; // Cyan
      case 2: return "#ff00ff"; // Magenta
      case 3: return "#ffff00"; // Yellow
      default: return "#ffffff";
    }
  };

  return (
    <>
      <group ref={textGroupRef}>
        {currentText && (
          <AnimatedText 
            text={currentText} 
            position={[0, 0, 0]} 
            color={getColor()} 
          />
        )}
      </group>

      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
      <pointLight position={[-10, -10, 5]} intensity={0.5} color="#4466ff" />
      <spotLight
        position={[0, 5, 5]}
        angle={0.6}
        penumbra={1}
        intensity={1}
        castShadow
      />
    </>
  );
}

