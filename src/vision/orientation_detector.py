"""
Body orientation detection for multi-view scanning
"""
import numpy as np
from enum import Enum
from typing import Optional, Tuple
import cv2

from src.vision.pose_detector import PoseLandmarks, PoseDetector
from src.utils.logger import logger
from src.utils.config_loader import get_config


class Orientation(Enum):
    """Body orientation states"""
    FRONT = "front"
    LEFT_SIDE = "left_side"
    RIGHT_SIDE = "right_side"
    BACK = "back"
    UNKNOWN = "unknown"


class OrientationDetector:
    """Detects body orientation from pose landmarks"""
    
    def __init__(self):
        """Initialize orientation detector"""
        self.config = get_config()
        self.pose_detector = PoseDetector()
        
        # Angle thresholds from config
        self.front_range = self.config.get('orientation_detection.front_angle_range', [-30, 30])
        self.side_range = self.config.get('orientation_detection.side_angle_range', [60, 120])
        self.back_range = self.config.get('orientation_detection.back_angle_range', [150, 210])
        
        self.confidence_threshold = self.config.get('orientation_detection.confidence_threshold', 0.85)
        
        logger.info("Orientation detector initialized")
    
    def detect_orientation(
        self,
        landmarks: PoseLandmarks,
        use_face: bool = True
    ) -> Tuple[Orientation, float]:
        """
        Detect body orientation from pose landmarks
        
        Args:
            landmarks: Pose landmarks
            use_face: Whether to use face landmarks for detection
            
        Returns:
            Tuple of (orientation, confidence)
        """
        # Method 1: Shoulder width ratio
        shoulder_score, shoulder_orientation = self._detect_from_shoulders(landmarks)
        
        # Method 2: Face direction
        face_score, face_orientation = self._detect_from_face(landmarks) if use_face else (0.0, Orientation.UNKNOWN)
        
        # Method 3: Hip visibility
        hip_score, hip_orientation = self._detect_from_hips(landmarks)
        
        # Combine scores
        total_score = shoulder_score + face_score + hip_score
        
        if total_score == 0:
            return Orientation.UNKNOWN, 0.0
        
        # Weighted voting
        orientation_scores = {
            Orientation.FRONT: 0,
            Orientation.LEFT_SIDE: 0,
            Orientation.RIGHT_SIDE: 0,
            Orientation.BACK: 0
        }
        
        if shoulder_orientation != Orientation.UNKNOWN:
            orientation_scores[shoulder_orientation] += shoulder_score
        if face_orientation != Orientation.UNKNOWN:
            orientation_scores[face_orientation] += face_score
        if hip_orientation != Orientation.UNKNOWN:
            orientation_scores[hip_orientation] += hip_score
        
        # Get best orientation
        best_orientation = max(orientation_scores, key=orientation_scores.get)
        confidence = orientation_scores[best_orientation] / total_score
        
        return best_orientation, confidence
    
    def _detect_from_shoulders(self, landmarks: PoseLandmarks) -> Tuple[float, Orientation]:
        """Detect orientation from shoulder landmarks"""
        left_shoulder = landmarks.get_landmark(PoseDetector.LEFT_SHOULDER)
        right_shoulder = landmarks.get_landmark(PoseDetector.RIGHT_SHOULDER)
        
        if not left_shoulder or not right_shoulder:
            return 0.0, Orientation.UNKNOWN
        
        # Calculate shoulder width (in image space)
        shoulder_width = abs(right_shoulder[0] - left_shoulder[0])
        
        # Calculate visibility difference
        vis_diff = abs(left_shoulder[2] - right_shoulder[2])
        
        # Front: Both shoulders visible, wide width
        # Side: One shoulder more visible, narrow width
        # Back: Both shoulders visible, wide width (similar to front)
        
        score = 1.0
        
        if shoulder_width > 0.15:  # Wide shoulders
            if vis_diff < 0.2:  # Both visible
                # Could be front or back - need other cues
                return score, Orientation.FRONT  # Assume front for now
            else:
                return score, Orientation.UNKNOWN
        elif shoulder_width < 0.08:  # Narrow shoulders
            if left_shoulder[2] > right_shoulder[2]:
                return score, Orientation.LEFT_SIDE
            else:
                return score, Orientation.RIGHT_SIDE
        
        return score, Orientation.UNKNOWN
    
    def _detect_from_face(self, landmarks: PoseLandmarks) -> Tuple[float, Orientation]:
        """Detect orientation from face landmarks"""
        nose = landmarks.get_landmark(PoseDetector.NOSE)
        left_ear = landmarks.get_landmark(PoseDetector.LEFT_EAR)
        right_ear = landmarks.get_landmark(PoseDetector.RIGHT_EAR)
        left_eye = landmarks.get_landmark(PoseDetector.LEFT_EYE)
        right_eye = landmarks.get_landmark(PoseDetector.RIGHT_EYE)
        
        if not nose:
            return 0.0, Orientation.UNKNOWN
        
        score = 1.5  # Face is a strong indicator
        
        # Check ear visibility
        left_ear_visible = left_ear and left_ear[2] > 0.5
        right_ear_visible = right_ear and right_ear[2] > 0.5
        left_eye_visible = left_eye and left_eye[2] > 0.5
        right_eye_visible = right_eye and right_eye[2] > 0.5
        
        # Front: Both eyes visible, ears may or may not be visible
        if left_eye_visible and right_eye_visible:
            if left_ear_visible and right_ear_visible:
                return score, Orientation.FRONT
            elif not left_ear_visible and not right_ear_visible:
                return score, Orientation.FRONT
        
        # Left side: Left ear visible, right ear not visible
        if left_ear_visible and not right_ear_visible:
            return score, Orientation.LEFT_SIDE
        
        # Right side: Right ear visible, left ear not visible
        if right_ear_visible and not left_ear_visible:
            return score, Orientation.RIGHT_SIDE
        
        # Back: No eyes visible, but ears might be
        if not left_eye_visible and not right_eye_visible:
            if left_ear_visible or right_ear_visible:
                return score, Orientation.BACK
        
        return score, Orientation.UNKNOWN
    
    def _detect_from_hips(self, landmarks: PoseLandmarks) -> Tuple[float, Orientation]:
        """Detect orientation from hip landmarks"""
        left_hip = landmarks.get_landmark(PoseDetector.LEFT_HIP)
        right_hip = landmarks.get_landmark(PoseDetector.RIGHT_HIP)
        left_shoulder = landmarks.get_landmark(PoseDetector.LEFT_SHOULDER)
        right_shoulder = landmarks.get_landmark(PoseDetector.RIGHT_SHOULDER)
        
        if not all([left_hip, right_hip, left_shoulder, right_shoulder]):
            return 0.0, Orientation.UNKNOWN
        
        # Calculate hip width
        hip_width = abs(right_hip[0] - left_hip[0])
        shoulder_width = abs(right_shoulder[0] - left_shoulder[0])
        
        # Calculate torso alignment
        left_torso_angle = np.arctan2(
            left_hip[1] - left_shoulder[1],
            left_hip[0] - left_shoulder[0]
        )
        right_torso_angle = np.arctan2(
            right_hip[1] - right_shoulder[1],
            right_hip[0] - right_shoulder[0]
        )
        
        score = 0.8
        
        # Front/Back: Hip width similar to shoulder width
        if abs(hip_width - shoulder_width) < 0.05:
            return score, Orientation.FRONT  # Default to front
        
        # Side: Hip width much smaller
        elif hip_width < shoulder_width * 0.6:
            if left_hip[2] > right_hip[2]:
                return score, Orientation.LEFT_SIDE
            else:
                return score, Orientation.RIGHT_SIDE
        
        return score, Orientation.UNKNOWN
    
    def calculate_rotation_angle(self, landmarks: PoseLandmarks) -> float:
        """
        Calculate approximate body rotation angle (0-360 degrees)
        0° = front, 90° = left side, 180° = back, 270° = right side
        
        Args:
            landmarks: Pose landmarks
            
        Returns:
            Rotation angle in degrees
        """
        left_shoulder = landmarks.get_landmark(PoseDetector.LEFT_SHOULDER)
        right_shoulder = landmarks.get_landmark(PoseDetector.RIGHT_SHOULDER)
        nose = landmarks.get_landmark(PoseDetector.NOSE)
        
        if not all([left_shoulder, right_shoulder, nose]):
            return 0.0
        
        # Calculate shoulder center
        shoulder_center_x = (left_shoulder[0] + right_shoulder[0]) / 2
        shoulder_center_y = (left_shoulder[1] + right_shoulder[1]) / 2
        
        # Vector from shoulder center to nose
        dx = nose[0] - shoulder_center_x
        dy = nose[1] - shoulder_center_y
        
        # Calculate angle
        angle = np.arctan2(dy, dx)
        angle_degrees = np.degrees(angle)
        
        # Normalize to 0-360
        angle_degrees = (angle_degrees + 360) % 360
        
        return angle_degrees
    
    def get_guidance_message(
        self,
        current_orientation: Orientation,
        target_orientation: Orientation,
        confidence: float
    ) -> str:
        """
        Get user guidance message for camera positioning
        
        Args:
            current_orientation: Current detected orientation
            target_orientation: Target orientation
            confidence: Detection confidence
            
        Returns:
            Guidance message
        """
        if confidence < self.confidence_threshold:
            return "⚠️ Please stand still and ensure full body is visible"
        
        if current_orientation == target_orientation:
            return f"✓ Perfect! {target_orientation.value.replace('_', ' ').title()} position detected"
        
        # Provide guidance to reach target
        guidance = {
            (Orientation.FRONT, Orientation.LEFT_SIDE): "➡️ Please rotate 90° to your left",
            (Orientation.FRONT, Orientation.RIGHT_SIDE): "⬅️ Please rotate 90° to your right",
            (Orientation.FRONT, Orientation.BACK): "🔄 Please turn around 180°",
            
            (Orientation.LEFT_SIDE, Orientation.FRONT): "⬅️ Please rotate 90° to your right",
            (Orientation.LEFT_SIDE, Orientation.RIGHT_SIDE): "🔄 Please turn around 180°",
            (Orientation.LEFT_SIDE, Orientation.BACK): "➡️ Please rotate 90° to your left",
            
            (Orientation.RIGHT_SIDE, Orientation.FRONT): "➡️ Please rotate 90° to your left",
            (Orientation.RIGHT_SIDE, Orientation.LEFT_SIDE): "🔄 Please turn around 180°",
            (Orientation.RIGHT_SIDE, Orientation.BACK): "⬅️ Please rotate 90° to your right",
            
            (Orientation.BACK, Orientation.FRONT): "🔄 Please turn around 180°",
            (Orientation.BACK, Orientation.LEFT_SIDE): "⬅️ Please rotate 90° to your right",
            (Orientation.BACK, Orientation.RIGHT_SIDE): "➡️ Please rotate 90° to your left",
        }
        
        key = (current_orientation, target_orientation)
        return guidance.get(key, f"Move to {target_orientation.value.replace('_', ' ')} position")
    
    def draw_orientation_overlay(
        self,
        image: np.ndarray,
        orientation: Orientation,
        confidence: float,
        target_orientation: Optional[Orientation] = None
    ) -> np.ndarray:
        """
        Draw orientation information overlay on image
        
        Args:
            image: Input image
            orientation: Detected orientation
            confidence: Detection confidence
            target_orientation: Optional target orientation
            
        Returns:
            Image with overlay
        """
        output = image.copy()
        h, w = output.shape[:2]
        
        # Color based on match
        if target_orientation and orientation == target_orientation:
            color = (0, 255, 0)  # Green
            status = "✓ CORRECT"
        elif target_orientation:
            color = (0, 165, 255)  # Orange
            status = "⟳ ADJUST"
        else:
            color = (255, 255, 255)  # White
            status = ""
        
        # Draw orientation info
        text = f"{orientation.value.replace('_', ' ').upper()}"
        cv2.putText(output, text, (20, 50), cv2.FONT_HERSHEY_SIMPLEX, 1.2, color, 3)
        
        # Draw confidence bar
        bar_width = 200
        bar_height = 20
        bar_x = 20
        bar_y = 80
        
        # Background
        cv2.rectangle(output, (bar_x, bar_y), (bar_x + bar_width, bar_y + bar_height), (50, 50, 50), -1)
        
        # Confidence fill
        fill_width = int(bar_width * confidence)
        cv2.rectangle(output, (bar_x, bar_y), (bar_x + fill_width, bar_y + bar_height), color, -1)
        
        # Text
        cv2.putText(output, f"Confidence: {confidence*100:.1f}%", 
                   (bar_x, bar_y - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        
        if status:
            cv2.putText(output, status, (bar_x + bar_width + 20, bar_y + 15),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)
        
        # Draw target if specified
        if target_orientation:
            target_text = f"Target: {target_orientation.value.replace('_', ' ').upper()}"
            cv2.putText(output, target_text, (20, h - 30),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 0), 2)
            
            # Guidance message
            guidance = self.get_guidance_message(orientation, target_orientation, confidence)
            cv2.putText(output, guidance, (20, h - 60),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        
        return output

