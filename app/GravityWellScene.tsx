/**
 * Hand Motion Studio - Gravity Well Scene
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
import type { HandData } from "./types";

type Props = {
  handPos: HandData | null;
};

export default function GravityWellScene({ handPos }: Props) {
  const pointsRef = useRef<THREE.Points>(null);
  const targetPos = useRef(new THREE.Vector3(0, 0, 0));
  const currentPos = useRef(new THREE.Vector3(0, 0, 0));

  const particlesCount = 3000;

  // Initialize particle data: position + velocity
  const { positions, velocities, colors, originalPositions } = useMemo(() => {
    const pos = new Float32Array(particlesCount * 3);
    const original = new Float32Array(particlesCount * 3);
    const vel = new Float32Array(particlesCount * 3);
    const col = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount; i++) {
      const i3 = i * 3;
      const radius = Math.random() * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi) * 0.5; // Flatten slightly in z

      pos[i3] = original[i3] = x;
      pos[i3 + 1] = original[i3 + 1] = y;
      pos[i3 + 2] = original[i3 + 2] = z;

      vel[i3] = 0;
      vel[i3 + 1] = 0;
      vel[i3 + 2] = 0;

      // Initial colors (warm blue/purple)
      col[i3] = 0.3;
      col[i3 + 1] = 0.5;
      col[i3 + 2] = 1.0;
    }
    return { positions: pos, velocities: vel, colors: col, originalPositions: original };
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;

    const geometry = pointsRef.current.geometry;
    const pos = geometry.attributes.position.array as Float32Array;
    const col = geometry.attributes.color.array as Float32Array;
    const time = state.clock.elapsedTime;

    // Track hand position smoothly
    if (handPos) {
      targetPos.current.set(handPos.x * 3, handPos.y * 3, 0);
      currentPos.current.lerp(targetPos.current, 0.15);
    }

    const handX = currentPos.current.x;
    const handY = currentPos.current.y;
    const handZ = currentPos.current.z;

    const isAttract = handPos?.isOpen ?? false;
    const strength = handPos ? (handPos.openness * 0.4 + 0.1) : 0;
    const damping = 0.97;

    for (let i = 0; i < particlesCount; i++) {
      const i3 = i * 3;

      // Direction to/from hand
      const dx = handX - pos[i3];
      const dy = handY - pos[i3 + 1];
      const dz = handZ - pos[i3 + 2];
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) + 0.001;

      if (handPos) {
        // Gravitational force: F ∝ 1/dist²
        const force = strength / (dist * dist + 0.5);
        const direction = isAttract ? 1 : -1;

        velocities[i3] += (dx / dist) * force * direction;
        velocities[i3 + 1] += (dy / dist) * force * direction;
        velocities[i3 + 2] += (dz / dist) * force * direction * 0.3;

        // Add orbital tendency (perpendicular force for swirling)
        if (isAttract && dist < 2) {
          velocities[i3] += (-dy / dist) * force * 0.15;
          velocities[i3 + 1] += (dx / dist) * force * 0.15;
        }
      } else {
        // Gentle drift back to original positions
        velocities[i3] += (originalPositions[i3] - pos[i3]) * 0.002;
        velocities[i3 + 1] += (originalPositions[i3 + 1] - pos[i3 + 1]) * 0.002;
        velocities[i3 + 2] += (originalPositions[i3 + 2] - pos[i3 + 2]) * 0.002;
      }

      // Apply velocity with damping
      velocities[i3] *= damping;
      velocities[i3 + 1] *= damping;
      velocities[i3 + 2] *= damping;

      pos[i3] += velocities[i3];
      pos[i3 + 1] += velocities[i3 + 1];
      pos[i3 + 2] += velocities[i3 + 2];

      // Color based on speed (slow = cool blue, fast = hot pink/red)
      const speed = Math.sqrt(
        velocities[i3] * velocities[i3] +
        velocities[i3 + 1] * velocities[i3 + 1] +
        velocities[i3 + 2] * velocities[i3 + 2]
      );

      const speedNorm = Math.min(speed * 20, 1);
      // Cool blue → hot cyan → magenta gradient
      col[i3] = 0.2 + speedNorm * 0.8;     // R
      col[i3 + 1] = 0.4 + speedNorm * 0.6 * Math.sin(time * 0.5 + i * 0.01); // G
      col[i3 + 2] = 1.0 - speedNorm * 0.3;  // B

      // Distance-based color tint (particles near hand glow brighter)
      if (handPos && dist < 1.5) {
        const proximity = 1 - dist / 1.5;
        col[i3] += proximity * 0.3;
        col[i3 + 1] += proximity * 0.5;
        col[i3 + 2] += proximity * 0.2;
      }
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.color.needsUpdate = true;

    // Gentle global rotation
    pointsRef.current.rotation.y += 0.001;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.025}
        vertexColors
        sizeAttenuation
        transparent
        opacity={0.85}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
