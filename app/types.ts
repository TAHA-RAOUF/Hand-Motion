/**
 * Hand Motion Studio - Shared Types
 * Created by Moraouf © 2026
 * GitHub: https://github.com/TAHA-RAOUF
 *
 * This file is part of Hand Motion Studio.
 * Licensed under the MIT License.
 */

export type HandData = {
  x: number;
  y: number;
  isOpen: boolean;
  openness: number; // 0 = closed, 1 = fully open
  swipeDirection: "left" | "right" | "up" | "down" | null;
  velocity: number;
  fingerCount: number;
  landmarks?: any[]; // Full MediaPipe landmarks for detailed finger control
};
