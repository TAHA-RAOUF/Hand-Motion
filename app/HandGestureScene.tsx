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

type HandData = {
  x: number;
  y: number;
  isOpen: boolean;
  openness: number;
  swipeDirection: 'left' | 'right' | 'up' | 'down' | null;
  velocity: number;
  landmarks?: any[];
};

type Props = {
  handPos: HandData | null;
};

// Calculate distance between two landmarks
function getDistance(p1: any, p2: any): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  const dz = p1.z - p2.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

// Calculate curl amount for a finger (0 = straight, 1 = fully curled)
function getFingerCurl(landmarks: any[], tipIdx: number, dipIdx: number, pipIdx: number, mcpIdx: number): number {
  const tip = landmarks[tipIdx];
  const dip = landmarks[dipIdx];
  const pip = landmarks[pipIdx];
  const mcp = landmarks[mcpIdx];
  
  // Distance from tip to base (mcp)
  const straightDist = getDistance(tip, mcp);
  
  // Sum of segment distances
  const bentDist = getDistance(tip, dip) + getDistance(dip, pip) + getDistance(pip, mcp);
  
  // If finger is straight, straightDist ≈ bentDist
  // If curled, bentDist > straightDist
  const curlRatio = Math.min((bentDist / straightDist - 1) * 3, 1);
  return Math.max(0, curlRatio);
}

// Realistic 3D Human Hand Model with Individual Finger Control
function RealisticHand({ handPos }: Props) {
  const handGroupRef = useRef<THREE.Group>(null);
  const thumbRef = useRef<THREE.Group>(null);
  const indexRef = useRef<THREE.Group>(null);
  const middleRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Group>(null);
  const pinkyRef = useRef<THREE.Group>(null);

  const targetPos = useRef(new THREE.Vector3(0, 0, 0));
  const currentPos = useRef(new THREE.Vector3(0, 0, 0));

  useFrame(() => {
    if (!handGroupRef.current || !handPos) return;

    // Position tracking using wrist (landmark 0)
    if (handPos.landmarks && handPos.landmarks[0]) {
      const wrist = handPos.landmarks[0];
      // Mirror for natural movement (like looking in a mirror)
      targetPos.current.set((0.5 - wrist.x) * 6, (0.5 - wrist.y) * 6, 0);
    } else {
      targetPos.current.set(-handPos.x * 3, handPos.y * 3, 0);
    }
    
    currentPos.current.lerp(targetPos.current, 0.15);
    handGroupRef.current.position.copy(currentPos.current);

    // Rotation based on hand orientation
    if (handPos.landmarks && handPos.landmarks.length >= 10) {
      const wrist = handPos.landmarks[0];
      const middleBase = handPos.landmarks[9];
      
      // Calculate hand rotation
      const dx = middleBase.x - wrist.x;
      const dy = middleBase.y - wrist.y;
      const angle = -Math.atan2(-dx, -dy); // Adjusted for mirror effect
      
      handGroupRef.current.rotation.z = angle;
      handGroupRef.current.rotation.y = handPos.x * 0.3;
      handGroupRef.current.rotation.x = -handPos.y * 0.2;
    } else {
      handGroupRef.current.rotation.y = handPos.x * 0.4;
      handGroupRef.current.rotation.x = -handPos.y * 0.3;
    }

    // Individual finger control using landmarks
    if (handPos.landmarks && handPos.landmarks.length === 21) {
      const lm = handPos.landmarks;
      
      // Thumb (landmarks: 1-4)
      if (thumbRef.current) {
        const thumbCurl = getFingerCurl(lm, 4, 3, 2, 1);
        const thumbAngle = thumbCurl * 1.2;
        
        thumbRef.current.children.forEach((segment: any, i) => {
          if (segment.rotation) {
            const targetAngle = thumbAngle * (1 + i * 0.3);
            segment.rotation.z += (targetAngle - segment.rotation.z) * 0.2;
          }
        });
      }

      // Index finger (landmarks: 5-8)
      if (indexRef.current) {
        const indexCurl = getFingerCurl(lm, 8, 7, 6, 5);
        const indexAngle = indexCurl * 1.4;
        
        indexRef.current.children.forEach((segment: any, i) => {
          if (segment.rotation) {
            const targetAngle = indexAngle * (1 + i * 0.25);
            segment.rotation.z += (targetAngle - segment.rotation.z) * 0.2;
          }
        });
      }

      // Middle finger (landmarks: 9-12)
      if (middleRef.current) {
        const middleCurl = getFingerCurl(lm, 12, 11, 10, 9);
        const middleAngle = middleCurl * 1.4;
        
        middleRef.current.children.forEach((segment: any, i) => {
          if (segment.rotation) {
            const targetAngle = middleAngle * (1 + i * 0.25);
            segment.rotation.z += (targetAngle - segment.rotation.z) * 0.2;
          }
        });
      }

      // Ring finger (landmarks: 13-16)
      if (ringRef.current) {
        const ringCurl = getFingerCurl(lm, 16, 15, 14, 13);
        const ringAngle = ringCurl * 1.4;
        
        ringRef.current.children.forEach((segment: any, i) => {
          if (segment.rotation) {
            const targetAngle = ringAngle * (1 + i * 0.25);
            segment.rotation.z += (targetAngle - segment.rotation.z) * 0.2;
          }
        });
      }

      // Pinky (landmarks: 17-20)
      if (pinkyRef.current) {
        const pinkyCurl = getFingerCurl(lm, 20, 19, 18, 17);
        const pinkyAngle = pinkyCurl * 1.4;
        
        pinkyRef.current.children.forEach((segment: any, i) => {
          if (segment.rotation) {
            const targetAngle = pinkyAngle * (1 + i * 0.3);
            segment.rotation.z += (targetAngle - segment.rotation.z) * 0.2;
          }
        });
      }
    } else {
      // Fallback to openness-based animation
      const closedAngle = 1.3;
      const openAngle = 0;
      const targetAngle = handPos.isOpen 
        ? openAngle + (1 - handPos.openness) * 0.3
        : closedAngle - handPos.openness * 0.8;

      [thumbRef, indexRef, middleRef, ringRef, pinkyRef].forEach((ref) => {
        if (ref.current) {
          ref.current.children.forEach((segment: any, i) => {
            if (segment.rotation) {
              const angle = targetAngle * (1 + i * 0.25);
              segment.rotation.z += (angle - segment.rotation.z) * 0.15;
            }
          });
        }
      });
    }
  });

  return (
    <group ref={handGroupRef}>
      {/* Palm - more realistic proportions */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.1, 1.4, 0.35]} />
        <meshStandardMaterial 
          color='#ffd5b8'
          roughness={0.8}
          metalness={0.05}
          emissive='#ffaa88'
          emissiveIntensity={0.05}
        />
      </mesh>

      {/* Wrist connection */}
      <mesh position={[0, -0.85, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.42, 0.38, 0.3, 20]} />
        <meshStandardMaterial 
          color='#ffd5b8'
          roughness={0.8}
          metalness={0.05}
          emissive='#ffaa88'
          emissiveIntensity={0.05}
        />
      </mesh>

      {/* Thumb - leftmost finger */}
      <group ref={thumbRef} position={[-0.65, 0.45, 0.15]} rotation={[0.1, 0, -0.3]}>
        {/* Metacarpal */}
        <mesh position={[0, 0.18, 0]} castShadow receiveShadow>
          <capsuleGeometry args={[0.13, 0.35, 8, 16]} />
          <meshStandardMaterial 
            color='#ffd5b8'
            roughness={0.8}
            metalness={0.05}
          />
        </mesh>
        {/* Proximal phalanx */}
        <group position={[0, 0.42, 0]}>
          <mesh position={[0, 0.16, 0]} castShadow receiveShadow>
            <capsuleGeometry args={[0.12, 0.28, 8, 16]} />
            <meshStandardMaterial 
              color='#ffd5b8'
              roughness={0.8}
              metalness={0.05}
            />
          </mesh>
          {/* Distal phalanx */}
          <group position={[0, 0.35, 0]}>
            <mesh position={[0, 0.13, 0]} castShadow receiveShadow>
              <capsuleGeometry args={[0.11, 0.22, 8, 16]} />
              <meshStandardMaterial 
                color='#ffd5b8'
                roughness={0.8}
                metalness={0.05}
              />
            </mesh>
            {/* Fingertip */}
            <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
              <sphereGeometry args={[0.13, 16, 16]} />
              <meshStandardMaterial 
                color="#ffccaa" 
                roughness={0.75}
                metalness={0.05}
              />
            </mesh>
          </group>
        </group>
      </group>

      {/* Index Finger - second from left */}
      <group ref={indexRef} position={[-0.32, 0.8, 0]}>
        {/* Proximal phalanx */}
        <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
          <capsuleGeometry args={[0.11, 0.4, 8, 16]} />
          <meshStandardMaterial 
            color='#ffd5b8'
            roughness={0.8}
            metalness={0.05}
          />
        </mesh>
        {/* Middle phalanx */}
        <group position={[0, 0.48, 0]}>
          <mesh position={[0, 0.17, 0]} castShadow receiveShadow>
            <capsuleGeometry args={[0.1, 0.3, 8, 16]} />
            <meshStandardMaterial 
              color='#ffd5b8'
              roughness={0.8}
              metalness={0.05}
            />
          </mesh>
          {/* Distal phalanx */}
          <group position={[0, 0.36, 0]}>
            <mesh position={[0, 0.13, 0]} castShadow receiveShadow>
              <capsuleGeometry args={[0.09, 0.22, 8, 16]} />
              <meshStandardMaterial 
                color='#ffd5b8'
                roughness={0.8}
                metalness={0.05}
              />
            </mesh>
            {/* Fingertip */}
            <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
              <sphereGeometry args={[0.11, 16, 16]} />
              <meshStandardMaterial 
                color="#ffccaa" 
                roughness={0.75}
                metalness={0.05}
              />
            </mesh>
          </group>
        </group>
      </group>

      {/* Middle Finger - center, tallest */}
      <group ref={middleRef} position={[0, 0.85, 0]}>
        {/* Proximal phalanx */}
        <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
          <capsuleGeometry args={[0.11, 0.45, 8, 16]} />
          <meshStandardMaterial 
            color='#ffd5b8'
            roughness={0.8}
            metalness={0.05}
          />
        </mesh>
        {/* Middle phalanx */}
        <group position={[0, 0.54, 0]}>
          <mesh position={[0, 0.19, 0]} castShadow receiveShadow>
            <capsuleGeometry args={[0.1, 0.34, 8, 16]} />
            <meshStandardMaterial 
              color='#ffd5b8'
              roughness={0.8}
              metalness={0.05}
            />
          </mesh>
          {/* Distal phalanx */}
          <group position={[0, 0.4, 0]}>
            <mesh position={[0, 0.14, 0]} castShadow receiveShadow>
              <capsuleGeometry args={[0.09, 0.24, 8, 16]} />
              <meshStandardMaterial 
                color='#ffd5b8'
                roughness={0.8}
                metalness={0.05}
              />
            </mesh>
            {/* Fingertip */}
            <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
              <sphereGeometry args={[0.11, 16, 16]} />
              <meshStandardMaterial 
                color="#ffccaa" 
                roughness={0.75}
                metalness={0.05}
              />
            </mesh>
          </group>
        </group>
      </group>

      {/* Ring Finger - fourth from left */}
      <group ref={ringRef} position={[0.32, 0.8, 0]}>
        {/* Proximal phalanx */}
        <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
          <capsuleGeometry args={[0.11, 0.4, 8, 16]} />
          <meshStandardMaterial 
            color='#ffd5b8'
            roughness={0.8}
            metalness={0.05}
          />
        </mesh>
        {/* Middle phalanx */}
        <group position={[0, 0.48, 0]}>
          <mesh position={[0, 0.17, 0]} castShadow receiveShadow>
            <capsuleGeometry args={[0.1, 0.3, 8, 16]} />
            <meshStandardMaterial 
              color='#ffd5b8'
              roughness={0.8}
              metalness={0.05}
            />
          </mesh>
          {/* Distal phalanx */}
          <group position={[0, 0.36, 0]}>
            <mesh position={[0, 0.13, 0]} castShadow receiveShadow>
              <capsuleGeometry args={[0.09, 0.22, 8, 16]} />
              <meshStandardMaterial 
                color='#ffd5b8'
                roughness={0.8}
                metalness={0.05}
              />
            </mesh>
            {/* Fingertip */}
            <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
              <sphereGeometry args={[0.11, 16, 16]} />
              <meshStandardMaterial 
                color="#ffccaa" 
                roughness={0.75}
                metalness={0.05}
              />
            </mesh>
          </group>
        </group>
      </group>

      {/* Pinky Finger - rightmost, shortest */}
      <group ref={pinkyRef} position={[0.58, 0.58, 0]}>
        {/* Proximal phalanx */}
        <mesh position={[0, 0.18, 0]} castShadow receiveShadow>
          <capsuleGeometry args={[0.095, 0.32, 8, 16]} />
          <meshStandardMaterial 
            color='#ffd5b8'
            roughness={0.8}
            metalness={0.05}
          />
        </mesh>
        {/* Middle phalanx */}
        <group position={[0, 0.38, 0]}>
          <mesh position={[0, 0.14, 0]} castShadow receiveShadow>
            <capsuleGeometry args={[0.088, 0.24, 8, 16]} />
            <meshStandardMaterial 
              color='#ffd5b8'
              roughness={0.8}
              metalness={0.05}
            />
          </mesh>
          {/* Distal phalanx */}
          <group position={[0, 0.3, 0]}>
            <mesh position={[0, 0.11, 0]} castShadow receiveShadow>
              <capsuleGeometry args={[0.08, 0.18, 8, 16]} />
              <meshStandardMaterial 
                color='#ffd5b8'
                roughness={0.8}
                metalness={0.05}
              />
            </mesh>
            {/* Fingertip */}
            <mesh position={[0, 0.23, 0]} castShadow receiveShadow>
              <sphereGeometry args={[0.095, 16, 16]} />
              <meshStandardMaterial 
                color="#ffccaa" 
                roughness={0.75}
                metalness={0.05}
              />
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
      <ambientLight intensity={0.4} />
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