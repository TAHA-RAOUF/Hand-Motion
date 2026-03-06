/**
 * Hand Motion Studio - Magic Wand Trail Scene
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

const TRAIL_LENGTH = 300;
const SPARKLE_COUNT = 200;

export default function MagicWandScene({ handPos }: Props) {
  const trailRef = useRef<THREE.Points>(null);
  const sparkleRef = useRef<THREE.Points>(null);
  const currentPos = useRef(new THREE.Vector3(0, 0, 0));
  const targetPos = useRef(new THREE.Vector3(0, 0, 0));

  // Ring buffer for trail positions
  const trailIndex = useRef(0);
  const wasOpen = useRef(false);

  // Trail particles
  const { trailPositions, trailColors, trailSizes } = useMemo(() => {
    const pos = new Float32Array(TRAIL_LENGTH * 3);
    const col = new Float32Array(TRAIL_LENGTH * 3);
    const sizes = new Float32Array(TRAIL_LENGTH);

    for (let i = 0; i < TRAIL_LENGTH; i++) {
      pos[i * 3] = 0;
      pos[i * 3 + 1] = 0;
      pos[i * 3 + 2] = 0;
      col[i * 3] = 1;
      col[i * 3 + 1] = 1;
      col[i * 3 + 2] = 1;
      sizes[i] = 0;
    }
    return { trailPositions: pos, trailColors: col, trailSizes: sizes };
  }, []);

  // Sparkle particles (burst on gestures)
  const { sparklePositions, sparkleColors, sparkleSizes, sparkleVelocities } = useMemo(() => {
    const pos = new Float32Array(SPARKLE_COUNT * 3);
    const col = new Float32Array(SPARKLE_COUNT * 3);
    const sizes = new Float32Array(SPARKLE_COUNT);
    const vel = new Float32Array(SPARKLE_COUNT * 3);

    for (let i = 0; i < SPARKLE_COUNT; i++) {
      sizes[i] = 0;
    }
    return {
      sparklePositions: pos,
      sparkleColors: col,
      sparkleSizes: sizes,
      sparkleVelocities: vel,
    };
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // Smooth hand tracking
    if (handPos) {
      targetPos.current.set(handPos.x * 3, handPos.y * 3, 0);
      currentPos.current.lerp(targetPos.current, 0.2);

      // Add new trail point at current ring buffer index
      const idx = trailIndex.current % TRAIL_LENGTH;
      const i3 = idx * 3;

      trailPositions[i3] = currentPos.current.x;
      trailPositions[i3 + 1] = currentPos.current.y;
      trailPositions[i3 + 2] = currentPos.current.z + Math.sin(time * 3) * 0.05;

      // Rainbow color cycling with HSL
      const hue = (time * 0.15 + idx * 0.003) % 1;
      const color = new THREE.Color().setHSL(hue, 1, 0.65);
      trailColors[i3] = color.r;
      trailColors[i3 + 1] = color.g;
      trailColors[i3 + 2] = color.b;

      trailSizes[idx] = 0.06;

      trailIndex.current++;

      // Burst sparkles when hand transitions from closed to open
      if (handPos.isOpen && !wasOpen.current) {
        for (let j = 0; j < SPARKLE_COUNT; j++) {
          const j3 = j * 3;
          sparklePositions[j3] = currentPos.current.x;
          sparklePositions[j3 + 1] = currentPos.current.y;
          sparklePositions[j3 + 2] = currentPos.current.z;

          const angle1 = Math.random() * Math.PI * 2;
          const angle2 = Math.random() * Math.PI * 2;
          const speed = 0.02 + Math.random() * 0.06;
          sparkleVelocities[j3] = Math.cos(angle1) * Math.cos(angle2) * speed;
          sparkleVelocities[j3 + 1] = Math.sin(angle1) * speed;
          sparkleVelocities[j3 + 2] = Math.cos(angle1) * Math.sin(angle2) * speed;

          sparkleSizes[j] = 0.04 + Math.random() * 0.04;

          const sparkHue = (hue + Math.random() * 0.3) % 1;
          const sc = new THREE.Color().setHSL(sparkHue, 1, 0.7);
          sparkleColors[j3] = sc.r;
          sparkleColors[j3 + 1] = sc.g;
          sparkleColors[j3 + 2] = sc.b;
        }
      }
      wasOpen.current = handPos.isOpen;
    }

    // Fade trail points
    for (let i = 0; i < TRAIL_LENGTH; i++) {
      trailSizes[i] *= 0.992;
      if (trailSizes[i] < 0.001) trailSizes[i] = 0;

      // Slight upward drift for faded particles
      if (trailSizes[i] > 0 && trailSizes[i] < 0.02) {
        trailPositions[i * 3 + 1] += 0.001;
      }
    }

    // Update sparkles — move and fade
    for (let j = 0; j < SPARKLE_COUNT; j++) {
      const j3 = j * 3;
      sparklePositions[j3] += sparkleVelocities[j3];
      sparklePositions[j3 + 1] += sparkleVelocities[j3 + 1];
      sparklePositions[j3 + 2] += sparkleVelocities[j3 + 2];

      // Gravity pull down slightly
      sparkleVelocities[j3 + 1] -= 0.0005;

      // Damping
      sparkleVelocities[j3] *= 0.98;
      sparkleVelocities[j3 + 1] *= 0.98;
      sparkleVelocities[j3 + 2] *= 0.98;

      sparkleSizes[j] *= 0.97;
      if (sparkleSizes[j] < 0.001) sparkleSizes[j] = 0;
    }

    // Update buffer attributes
    if (trailRef.current) {
      const geo = trailRef.current.geometry;
      geo.attributes.position.needsUpdate = true;
      geo.attributes.color.needsUpdate = true;
      (geo.attributes.size as THREE.BufferAttribute).needsUpdate = true;
    }

    if (sparkleRef.current) {
      const geo = sparkleRef.current.geometry;
      geo.attributes.position.needsUpdate = true;
      geo.attributes.color.needsUpdate = true;
      (geo.attributes.size as THREE.BufferAttribute).needsUpdate = true;
    }
  });

  // Custom shader material for variable-size particles
  const trailMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {},
        vertexShader: `
          attribute float size;
          varying vec3 vColor;
          void main() {
            vColor = color;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          varying vec3 vColor;
          void main() {
            float d = length(gl_PointCoord - vec2(0.5));
            if (d > 0.5) discard;
            float glow = 1.0 - d * 2.0;
            glow = pow(glow, 2.0);
            gl_FragColor = vec4(vColor * glow * 2.0, glow);
          }
        `,
        vertexColors: true,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    []
  );

  return (
    <>
      {/* Trail particles */}
      <points ref={trailRef} material={trailMaterial}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[trailPositions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[trailColors, 3]}
          />
          <bufferAttribute
            attach="attributes-size"
            args={[trailSizes, 1]}
          />
        </bufferGeometry>
      </points>

      {/* Sparkle burst particles */}
      <points ref={sparkleRef} material={trailMaterial}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[sparklePositions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[sparkleColors, 3]}
          />
          <bufferAttribute
            attach="attributes-size"
            args={[sparkleSizes, 1]}
          />
        </bufferGeometry>
      </points>
    </>
  );
}
