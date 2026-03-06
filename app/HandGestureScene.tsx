/**
 * Hand Motion Studio - Gesture-Based 3D Scene
 * Created by Moraouf © 2026
 * GitHub: https://github.com/TAHA-RAOUF
 *
 * This file is part of Hand Motion Studio.
 * Licensed under the MIT License.
 */

"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { HandData } from "./types";

type Props = {
  handPos: HandData | null;
};

// Compute angle between 3 points (the angle at point B in triangle A-B-C)
function angleBetween(a: any, b: any, c: any): number {
  const ba = { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
  const bc = { x: c.x - b.x, y: c.y - b.y, z: c.z - b.z };

  const dot = ba.x * bc.x + ba.y * bc.y + ba.z * bc.z;
  const magBA = Math.sqrt(ba.x * ba.x + ba.y * ba.y + ba.z * ba.z);
  const magBC = Math.sqrt(bc.x * bc.x + bc.y * bc.y + bc.z * bc.z);

  if (magBA === 0 || magBC === 0) return Math.PI;
  const cosAngle = Math.max(-1, Math.min(1, dot / (magBA * magBC)));
  return Math.acos(cosAngle);
}

// Skin-tone material config
const SKIN_COLOR = "#f5c5a3";
const SKIN_DARK = "#e8b090";
const SKIN_LIGHT = "#fcd8c0";

// Single finger bone component
function FingerBone({
  length,
  radius,
  color = SKIN_COLOR,
}: {
  length: number;
  radius: number;
  color?: string;
}) {
  return (
    <mesh castShadow receiveShadow>
      <capsuleGeometry args={[radius, length, 8, 16]} />
      <meshStandardMaterial
        color={color}
        roughness={0.75}
        metalness={0.02}
        emissive={SKIN_DARK}
        emissiveIntensity={0.02}
      />
    </mesh>
  );
}

// Fingertip sphere
function Fingertip({ radius }: { radius: number }) {
  return (
    <mesh castShadow receiveShadow>
      <sphereGeometry args={[radius, 16, 16]} />
      <meshStandardMaterial
        color={SKIN_LIGHT}
        roughness={0.7}
        metalness={0.02}
      />
    </mesh>
  );
}

function RealisticHand({ handPos }: Props) {
  const handGroupRef = useRef<THREE.Group>(null);

  // Individual joint refs for proper per-joint rotation
  // Thumb joints
  const thumbBase = useRef<THREE.Group>(null);    // CMC joint
  const thumbMid = useRef<THREE.Group>(null);     // MCP joint
  const thumbTip = useRef<THREE.Group>(null);     // IP joint

  // Index finger joints
  const indexBase = useRef<THREE.Group>(null);    // MCP
  const indexMid = useRef<THREE.Group>(null);     // PIP
  const indexTip = useRef<THREE.Group>(null);     // DIP

  // Middle finger joints
  const middleBase = useRef<THREE.Group>(null);
  const middleMid = useRef<THREE.Group>(null);
  const middleTip = useRef<THREE.Group>(null);

  // Ring finger joints
  const ringBase = useRef<THREE.Group>(null);
  const ringMid = useRef<THREE.Group>(null);
  const ringTip = useRef<THREE.Group>(null);

  // Pinky finger joints
  const pinkyBase = useRef<THREE.Group>(null);
  const pinkyMid = useRef<THREE.Group>(null);
  const pinkyTip = useRef<THREE.Group>(null);

  const targetPos = useRef(new THREE.Vector3(0, 0, 0));
  const currentPos = useRef(new THREE.Vector3(0, 0, 0));

  // Smoothed rotation values
  const smoothRot = useRef({
    handZ: 0, handY: 0, handX: 0,
    thumbBase: 0, thumbMid: 0, thumbTip: 0, thumbSpread: 0,
    indexBase: 0, indexMid: 0, indexTip: 0,
    middleBase: 0, middleMid: 0, middleTip: 0,
    ringBase: 0, ringMid: 0, ringTip: 0,
    pinkyBase: 0, pinkyMid: 0, pinkyTip: 0,
  });

  useFrame(() => {
    if (!handGroupRef.current || !handPos) return;

    const lr = 0.12; // Lerp rate for smooth but responsive movement

    // ---- Position tracking ----
    if (handPos.landmarks && handPos.landmarks[0]) {
      const wrist = handPos.landmarks[0];
      targetPos.current.set((0.5 - wrist.x) * 6, (0.5 - wrist.y) * 6, 0);
    } else {
      targetPos.current.set(-handPos.x * 3, handPos.y * 3, 0);
    }
    currentPos.current.lerp(targetPos.current, 0.18);
    handGroupRef.current.position.copy(currentPos.current);

    // ---- Hand rotation ----
    if (handPos.landmarks && handPos.landmarks.length >= 21) {
      const lm = handPos.landmarks;
      const wrist = lm[0];
      const middleMCP = lm[9];

      // Hand tilt angle from wrist → middle finger base
      const dx = middleMCP.x - wrist.x;
      const dy = middleMCP.y - wrist.y;
      const targetZ = -Math.atan2(-dx, -dy);

      // Depth-based rotations from landmarks z values
      const targetY = (lm[5].z - lm[17].z) * 8; // Tilt based on index vs pinky depth
      const targetX = (wrist.z - middleMCP.z) * 5; // Forward/backward tilt

      smoothRot.current.handZ += (targetZ - smoothRot.current.handZ) * lr;
      smoothRot.current.handY += (targetY - smoothRot.current.handY) * lr;
      smoothRot.current.handX += (targetX - smoothRot.current.handX) * lr;
    }

    handGroupRef.current.rotation.z = smoothRot.current.handZ;
    handGroupRef.current.rotation.y = smoothRot.current.handY;
    handGroupRef.current.rotation.x = smoothRot.current.handX;

    // ---- Per-finger joint rotation from landmarks ----
    if (handPos.landmarks && handPos.landmarks.length === 21) {
      const lm = handPos.landmarks;

      // THUMB — unique kinematics: curls across the palm
      // Landmarks: 1 (CMC), 2 (MCP), 3 (IP), 4 (TIP)
      // On a real hand, the thumb:
      //   - Base (CMC) rotates to bring thumb across palm (mostly Z rotation)
      //   - MCP and IP joints curl the thumb forward (X rotation)
      {
        const cmcAngle = Math.PI - angleBetween(lm[0], lm[1], lm[2]);
        const mcpAngle = Math.PI - angleBetween(lm[1], lm[2], lm[3]);
        const ipAngle = Math.PI - angleBetween(lm[2], lm[3], lm[4]);

        // Thumb spread: how far thumb tip is from index finger MCP
        // When thumb is open wide, this distance is large
        const thumbIndexDist = Math.sqrt(
          (lm[4].x - lm[5].x) ** 2 +
          (lm[4].y - lm[5].y) ** 2
        );
        // Normalize: ~0.18 = wide open, ~0.03 = closed across palm
        const thumbSpread = Math.max(0, Math.min(1, (thumbIndexDist - 0.03) / 0.15));

        // Smooth all values
        smoothRot.current.thumbBase += (cmcAngle - smoothRot.current.thumbBase) * lr;
        smoothRot.current.thumbMid += (mcpAngle - smoothRot.current.thumbMid) * lr;
        smoothRot.current.thumbTip += (ipAngle - smoothRot.current.thumbTip) * lr;
        smoothRot.current.thumbSpread += (thumbSpread - smoothRot.current.thumbSpread) * lr;

        if (thumbBase.current) {
          // Base joint: spread controls how far thumb sticks out (Z rotation)
          // When open: thumb points outward; when closed: rotates inward across palm
          const spreadAngle = smoothRot.current.thumbSpread * 0.6; // 0 = closed in, 0.6 = spread out
          thumbBase.current.rotation.z = -0.2 + spreadAngle;
          // Curl component on Y to bring thumb across palm when closing
          thumbBase.current.rotation.y = (1 - smoothRot.current.thumbSpread) * 0.5;
        }
        if (thumbMid.current) {
          // MCP: curls the thumb forward
          thumbMid.current.rotation.x = smoothRot.current.thumbMid * 0.7;
          // Also slight inward curl when thumb is closed
          thumbMid.current.rotation.z = (1 - smoothRot.current.thumbSpread) * 0.3;
        }
        if (thumbTip.current) {
          // IP: final curl of the thumb tip
          thumbTip.current.rotation.x = smoothRot.current.thumbTip * 0.6;
        }
      }

      // INDEX FINGER — Landmarks: 5 (MCP), 6 (PIP), 7 (DIP), 8 (TIP)
      {
        const mcpAngle = Math.PI - angleBetween(lm[0], lm[5], lm[6]);
        const pipAngle = Math.PI - angleBetween(lm[5], lm[6], lm[7]);
        const dipAngle = Math.PI - angleBetween(lm[6], lm[7], lm[8]);

        smoothRot.current.indexBase += (mcpAngle * 1.1 - smoothRot.current.indexBase) * lr;
        smoothRot.current.indexMid += (pipAngle * 1.2 - smoothRot.current.indexMid) * lr;
        smoothRot.current.indexTip += (dipAngle * 1.2 - smoothRot.current.indexTip) * lr;

        if (indexBase.current) indexBase.current.rotation.x = smoothRot.current.indexBase;
        if (indexMid.current) indexMid.current.rotation.x = smoothRot.current.indexMid;
        if (indexTip.current) indexTip.current.rotation.x = smoothRot.current.indexTip;
      }

      // MIDDLE FINGER — Landmarks: 9 (MCP), 10 (PIP), 11 (DIP), 12 (TIP)
      {
        const mcpAngle = Math.PI - angleBetween(lm[0], lm[9], lm[10]);
        const pipAngle = Math.PI - angleBetween(lm[9], lm[10], lm[11]);
        const dipAngle = Math.PI - angleBetween(lm[10], lm[11], lm[12]);

        smoothRot.current.middleBase += (mcpAngle * 1.1 - smoothRot.current.middleBase) * lr;
        smoothRot.current.middleMid += (pipAngle * 1.2 - smoothRot.current.middleMid) * lr;
        smoothRot.current.middleTip += (dipAngle * 1.2 - smoothRot.current.middleTip) * lr;

        if (middleBase.current) middleBase.current.rotation.x = smoothRot.current.middleBase;
        if (middleMid.current) middleMid.current.rotation.x = smoothRot.current.middleMid;
        if (middleTip.current) middleTip.current.rotation.x = smoothRot.current.middleTip;
      }

      // RING FINGER — Landmarks: 13 (MCP), 14 (PIP), 15 (DIP), 16 (TIP)
      {
        const mcpAngle = Math.PI - angleBetween(lm[0], lm[13], lm[14]);
        const pipAngle = Math.PI - angleBetween(lm[13], lm[14], lm[15]);
        const dipAngle = Math.PI - angleBetween(lm[14], lm[15], lm[16]);

        smoothRot.current.ringBase += (mcpAngle * 1.1 - smoothRot.current.ringBase) * lr;
        smoothRot.current.ringMid += (pipAngle * 1.2 - smoothRot.current.ringMid) * lr;
        smoothRot.current.ringTip += (dipAngle * 1.2 - smoothRot.current.ringTip) * lr;

        if (ringBase.current) ringBase.current.rotation.x = smoothRot.current.ringBase;
        if (ringMid.current) ringMid.current.rotation.x = smoothRot.current.ringMid;
        if (ringTip.current) ringTip.current.rotation.x = smoothRot.current.ringTip;
      }

      // PINKY — Landmarks: 17 (MCP), 18 (PIP), 19 (DIP), 20 (TIP)
      {
        const mcpAngle = Math.PI - angleBetween(lm[0], lm[17], lm[18]);
        const pipAngle = Math.PI - angleBetween(lm[17], lm[18], lm[19]);
        const dipAngle = Math.PI - angleBetween(lm[18], lm[19], lm[20]);

        smoothRot.current.pinkyBase += (mcpAngle * 1.1 - smoothRot.current.pinkyBase) * lr;
        smoothRot.current.pinkyMid += (pipAngle * 1.2 - smoothRot.current.pinkyMid) * lr;
        smoothRot.current.pinkyTip += (dipAngle * 1.2 - smoothRot.current.pinkyTip) * lr;

        if (pinkyBase.current) pinkyBase.current.rotation.x = smoothRot.current.pinkyBase;
        if (pinkyMid.current) pinkyMid.current.rotation.x = smoothRot.current.pinkyMid;
        if (pinkyTip.current) pinkyTip.current.rotation.x = smoothRot.current.pinkyTip;
      }
    } else {
      // Fallback: use openness for all fingers
      const curl = handPos.isOpen ? 0 : (1 - handPos.openness) * 1.4;
      const fallbackLr = 0.1;

      // Apply uniform curl to all finger joints
      const joints = [
        { base: indexBase, mid: indexMid, tip: indexTip },
        { base: middleBase, mid: middleMid, tip: middleTip },
        { base: ringBase, mid: ringMid, tip: ringTip },
        { base: pinkyBase, mid: pinkyMid, tip: pinkyTip },
      ];

      joints.forEach(({ base, mid, tip }) => {
        if (base.current) base.current.rotation.x += (curl * 0.6 - base.current.rotation.x) * fallbackLr;
        if (mid.current) mid.current.rotation.x += (curl * 0.8 - mid.current.rotation.x) * fallbackLr;
        if (tip.current) tip.current.rotation.x += (curl * 0.5 - tip.current.rotation.x) * fallbackLr;
      });

      if (thumbBase.current) {
        const thumbSpreadTarget = handPos.isOpen ? 0.4 : -0.2;
        thumbBase.current.rotation.z += (thumbSpreadTarget - thumbBase.current.rotation.z) * fallbackLr;
        thumbBase.current.rotation.y += (curl * 0.3 - thumbBase.current.rotation.y) * fallbackLr;
      }
      if (thumbMid.current) {
        thumbMid.current.rotation.x += (curl * 0.5 - thumbMid.current.rotation.x) * fallbackLr;
      }
      if (thumbTip.current) {
        thumbTip.current.rotation.x += (curl * 0.4 - thumbTip.current.rotation.x) * fallbackLr;
      }
    }
  });

  return (
    <group ref={handGroupRef} scale={0.9}>
      {/* ===== PALM ===== */}
      {/* Main palm body — rounded box shape */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.0, 1.3, 0.3]} />
        <meshStandardMaterial
          color={SKIN_COLOR}
          roughness={0.8}
          metalness={0.02}
          emissive={SKIN_DARK}
          emissiveIntensity={0.03}
        />
      </mesh>
      {/* Palm top rounding */}
      <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.5, 0.5, 0.3, 20]} />
        <meshStandardMaterial color={SKIN_COLOR} roughness={0.8} metalness={0.02} />
      </mesh>
      {/* Wrist */}
      <mesh position={[0, -0.8, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.38, 0.35, 0.35, 20]} />
        <meshStandardMaterial color={SKIN_COLOR} roughness={0.8} metalness={0.02} />
      </mesh>

      {/* ===== THUMB ===== */}
      {/* The thumb attaches at the lower-left of the palm.
          It's angled ~45° outward in its resting position.
          The group hierarchy is: CMC (base) → MCP (mid) → IP (tip)
          Each joint pivots the entire chain below it. */}
      <group
        ref={thumbBase}
        position={[-0.55, -0.15, 0.12]}
        rotation={[0.2, 0.3, 0.4]}
      >
        {/* Metacarpal bone (CMC → MCP) — the thick base bone */}
        <mesh position={[0, 0.2, 0]} rotation={[0, 0, 0.1]} castShadow receiveShadow>
          <capsuleGeometry args={[0.13, 0.36, 8, 16]} />
          <meshStandardMaterial color={SKIN_COLOR} roughness={0.8} metalness={0.02} />
        </mesh>

        {/* MCP joint — where the thumb visibly bends */}
        <group ref={thumbMid} position={[0, 0.45, 0]}>
          {/* Proximal phalanx */}
          <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
            <capsuleGeometry args={[0.11, 0.28, 8, 16]} />
            <meshStandardMaterial color={SKIN_COLOR} roughness={0.8} metalness={0.02} />
          </mesh>

          {/* IP joint — the last thumb bend */}
          <group ref={thumbTip} position={[0, 0.34, 0]}>
            {/* Distal phalanx */}
            <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
              <capsuleGeometry args={[0.1, 0.2, 8, 16]} />
              <meshStandardMaterial color={SKIN_COLOR} roughness={0.8} metalness={0.02} />
            </mesh>
            {/* Thumb tip */}
            <mesh position={[0, 0.24, 0]} castShadow receiveShadow>
              <sphereGeometry args={[0.12, 16, 16]} />
              <meshStandardMaterial color={SKIN_LIGHT} roughness={0.7} metalness={0.02} />
            </mesh>
          </group>
        </group>
      </group>

      {/* ===== INDEX FINGER ===== */}
      <group ref={indexBase} position={[-0.3, 0.85, 0]}>
        <FingerBone length={0.38} radius={0.1} />
        <group ref={indexMid} position={[0, 0.44, 0]}>
          <FingerBone length={0.28} radius={0.09} />
          <group ref={indexTip} position={[0, 0.34, 0]}>
            <FingerBone length={0.2} radius={0.08} />
            <mesh position={[0, 0.24, 0]}>
              <Fingertip radius={0.1} />
            </mesh>
          </group>
        </group>
      </group>

      {/* ===== MIDDLE FINGER ===== */}
      <group ref={middleBase} position={[0, 0.9, 0]}>
        <FingerBone length={0.42} radius={0.1} />
        <group ref={middleMid} position={[0, 0.5, 0]}>
          <FingerBone length={0.32} radius={0.09} />
          <group ref={middleTip} position={[0, 0.38, 0]}>
            <FingerBone length={0.22} radius={0.08} />
            <mesh position={[0, 0.26, 0]}>
              <Fingertip radius={0.1} />
            </mesh>
          </group>
        </group>
      </group>

      {/* ===== RING FINGER ===== */}
      <group ref={ringBase} position={[0.3, 0.85, 0]}>
        <FingerBone length={0.38} radius={0.1} />
        <group ref={ringMid} position={[0, 0.44, 0]}>
          <FingerBone length={0.28} radius={0.09} />
          <group ref={ringTip} position={[0, 0.34, 0]}>
            <FingerBone length={0.2} radius={0.08} />
            <mesh position={[0, 0.24, 0]}>
              <Fingertip radius={0.1} />
            </mesh>
          </group>
        </group>
      </group>

      {/* ===== PINKY ===== */}
      <group ref={pinkyBase} position={[0.55, 0.65, 0]}>
        <FingerBone length={0.3} radius={0.085} />
        <group ref={pinkyMid} position={[0, 0.36, 0]}>
          <FingerBone length={0.22} radius={0.078} />
          <group ref={pinkyTip} position={[0, 0.28, 0]}>
            <FingerBone length={0.16} radius={0.07} />
            <mesh position={[0, 0.2, 0]}>
              <Fingertip radius={0.085} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}

export default function HandGestureScene({ handPos }: Props) {
  return (
    <>
      <RealisticHand handPos={handPos} />

      {/* Optimized lighting for realistic hand */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-3, 2, 3]} intensity={0.8} color="#ffd4a3" />
      <pointLight position={[3, -2, 2]} intensity={0.5} color="#a3d4ff" />
      <hemisphereLight
        color="#ffffff"
        groundColor="#444444"
        intensity={0.6}
      />
    </>
  );
}