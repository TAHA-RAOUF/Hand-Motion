/**
 * Hand Motion Studio - 3D Hand Scene Component
 * Created by Moraouf © 2026
 * GitHub: https://github.com/TAHA-RAOUF
 * 
 * This file is part of Hand Motion Studio.
 * Licensed under the MIT License.
 */

"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
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

export default function HandScene({ handPos }: Props) {
  const pointsRef = useRef<THREE.Points>(null);
  const targetPos = useRef(new THREE.Vector3(0, 0, 0));
  const currentPos = useRef(new THREE.Vector3(0, 0, 0));
  const currentScale = useRef(1);
  const currentColor = useRef(new THREE.Color("#ff4b9b"));
  const swipeEffect = useRef({ active: false, direction: '', intensity: 0 });
  const particleMode = useRef(0); // 0 = sphere, 1 = wave, 2 = helix, 3 = cube

  // Create particles
  const particlesCount = 2000;
  const { positions, originalPositions } = useMemo(() => {
    const pos = new Float32Array(particlesCount * 3);
    const original = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount; i++) {
      const i3 = i * 3;
      const radius = Math.random() * 0.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      
      pos[i3] = original[i3] = x;
      pos[i3 + 1] = original[i3 + 1] = y;
      pos[i3 + 2] = original[i3 + 2] = z;
    }
    return { positions: pos, originalPositions: original };
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;

    const geometry = pointsRef.current.geometry;
    const positions = geometry.attributes.position.array as Float32Array;
    const material = pointsRef.current.material as THREE.PointsMaterial;

    // Handle swipe detection and mode changes
    if (handPos?.swipeDirection) {
      swipeEffect.current = { active: true, direction: handPos.swipeDirection, intensity: handPos.velocity };
      
      // Change particle mode on swipe
      if (handPos.swipeDirection === 'right') {
        particleMode.current = (particleMode.current + 1) % 4;
      } else if (handPos.swipeDirection === 'left') {
        particleMode.current = (particleMode.current - 1 + 4) % 4;
      }
    }
    
    // Fade out swipe effect smoothly
    if (swipeEffect.current.active) {
      swipeEffect.current.intensity *= 0.98; // Slower fade for smoother transition
      if (swipeEffect.current.intensity < 0.05) {
        swipeEffect.current.active = false;
      }
    }

    // Smooth hand position following
    if (handPos) {
      targetPos.current.set(handPos.x * 3, handPos.y * 3, 0);
      currentPos.current.lerp(targetPos.current, 0.05); // Ultra smooth movement
      
      // Scale particles based on hand openness
      const targetScale = handPos.isOpen ? 1.5 + handPos.openness * 0.8 : 0.5 + handPos.openness * 0.3;
      currentScale.current += (targetScale - currentScale.current) * 0.08; // Ultra smooth scaling
      
      // Dynamic particle positions based on mode with smooth interpolation
      for (let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;
        const spreadFactor = handPos.isOpen ? 1.2 : 0.6;
        const flowSpeed = handPos.openness * 0.02;
        const time = state.clock.elapsedTime;
        
        // Get current positions and calculate targets
        const currentX = positions[i3];
        const currentY = positions[i3 + 1];
        const currentZ = positions[i3 + 2];
        
        let targetX = originalPositions[i3];
        let targetY = originalPositions[i3 + 1];
        let targetZ = originalPositions[i3 + 2];
        
        // Different patterns based on mode
        switch (particleMode.current) {
          case 0: // Sphere (default)
            const flow = handPos.isOpen ? Math.sin(time * 2 + i * 0.01) * flowSpeed : 0;
            targetX = targetX * spreadFactor + flow;
            targetY = targetY * spreadFactor + flow;
            targetZ = targetZ * spreadFactor;
            break;
            
          case 1: // Wave pattern
            const wave = Math.sin(time * 2 + targetX * 3) * 0.3;
            targetX = targetX * spreadFactor;
            targetY = targetY * spreadFactor + wave;
            targetZ = targetZ * spreadFactor + Math.cos(time * 2 + targetY * 3) * 0.2;
            break;
            
          case 2: // Helix/DNA pattern
            const angle = time + i * 0.02;
            const radius = 0.5 + Math.abs(originalPositions[i3 + 1]) * 0.5;
            targetX = Math.cos(angle) * radius * spreadFactor;
            targetZ = Math.sin(angle) * radius * spreadFactor;
            targetY = originalPositions[i3 + 1] * spreadFactor * 1.5;
            break;
            
          case 3: // Cube/Grid pattern
            targetX = Math.round(targetX * 2) / 2 * spreadFactor;
            targetY = Math.round(targetY * 2) / 2 * spreadFactor;
            targetZ = Math.round(targetZ * 2) / 2 * spreadFactor;
            break;
        }
        
        // Add swipe burst effect
        if (swipeEffect.current.active) {
          const burstIntensity = swipeEffect.current.intensity * 0.1;
          if (swipeEffect.current.direction === 'right') {
            targetX += burstIntensity * 2;
          } else if (swipeEffect.current.direction === 'left') {
            targetX -= burstIntensity * 2;
          } else if (swipeEffect.current.direction === 'up') {
            targetY += burstIntensity * 2;
          } else if (swipeEffect.current.direction === 'down') {
            targetY -= burstIntensity * 2;
          }
        }
        
        // Smooth interpolation to target positions (imperceptible transitions)
        const lerpFactor = 0.06;
        positions[i3] = currentX + (targetX - currentX) * lerpFactor;
        positions[i3 + 1] = currentY + (targetY - currentY) * lerpFactor;
        positions[i3 + 2] = currentZ + (targetZ - currentZ) * lerpFactor;
      }
      
      geometry.attributes.position.needsUpdate = true;
      
      // Color changes based on mode and hand state
      let targetColor: THREE.Color;
      switch (particleMode.current) {
        case 0: // Sphere - Cyan/Magenta
          targetColor = handPos.isOpen 
            ? new THREE.Color("#00ffff").lerp(new THREE.Color("#ff4b9b"), Math.sin(state.clock.elapsedTime) * 0.5 + 0.5)
            : new THREE.Color("#8b00ff");
          break;
        case 1: // Wave - Green/Yellow
          targetColor = new THREE.Color("#00ff88").lerp(new THREE.Color("#ffff00"), Math.sin(state.clock.elapsedTime * 0.5) * 0.5 + 0.5);
          break;
        case 2: // Helix - Blue/Purple
          targetColor = new THREE.Color("#0088ff").lerp(new THREE.Color("#ff00ff"), Math.sin(state.clock.elapsedTime * 0.3) * 0.5 + 0.5);
          break;
        case 3: // Cube - Red/Orange
          targetColor = new THREE.Color("#ff0044").lerp(new THREE.Color("#ff8800"), Math.sin(state.clock.elapsedTime * 0.4) * 0.5 + 0.5);
          break;
        default:
          targetColor = new THREE.Color("#ff4b9b");
      }
      
      currentColor.current.lerp(targetColor, 0.03); // Ultra smooth color transition
      material.color.copy(currentColor.current);
      
      // Size changes with openness and swipes (ultra smooth)
      const targetSize = 0.015 + handPos.openness * 0.02 + (swipeEffect.current.active ? swipeEffect.current.intensity * 0.01 : 0);
      material.size += (targetSize - material.size) * 0.1;
    }

    pointsRef.current.position.copy(currentPos.current);
    pointsRef.current.scale.setScalar(currentScale.current);

    // Rotation speed changes with hand state
    const rotationSpeed = handPos?.isOpen ? 0.008 : 0.001;
    pointsRef.current.rotation.y += rotationSpeed;
    pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.15;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#ff4b9b"
        sizeAttenuation
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
