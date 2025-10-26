"""
Advanced pose detection using MediaPipe and tracking
"""
import cv2
import numpy as np
import mediapipe as mp
from typing import Optional, Dict, List, Tuple
from dataclasses import dataclass

from src.utils.logger import logger
from src.utils.config_loader import get_config


@dataclass
class PoseLandmarks:
    """Container for pose landmark data"""
    landmarks: List[Tuple[float, float, float]]  # (x, y, visibility)
    world_landmarks: Optional[List[Tuple[float, float, float]]] = None
    image_width: int = 0
    image_height: int = 0
    
    def get_landmark(self, landmark_id: int) -> Optional[Tuple[float, float, float]]:
        """Get specific landmark by ID"""
        if 0 <= landmark_id < len(self.landmarks):
            return self.landmarks[landmark_id]
        return None
    
    def get_pixel_coords(self, landmark_id: int) -> Optional[Tuple[int, int]]:
        """Get pixel coordinates for landmark"""
        landmark = self.get_landmark(landmark_id)
        if landmark:
            x = int(landmark[0] * self.image_width)
            y = int(landmark[1] * self.image_height)
            return (x, y)
        return None


class PoseDetector:
    """Advanced pose detection and tracking"""
    
    # MediaPipe landmark indices
    NOSE = 0
    LEFT_EYE_INNER = 1
    LEFT_EYE = 2
    LEFT_EYE_OUTER = 3
    RIGHT_EYE_INNER = 4
    RIGHT_EYE = 5
    RIGHT_EYE_OUTER = 6
    LEFT_EAR = 7
    RIGHT_EAR = 8
    MOUTH_LEFT = 9
    MOUTH_RIGHT = 10
    LEFT_SHOULDER = 11
    RIGHT_SHOULDER = 12
    LEFT_ELBOW = 13
    RIGHT_ELBOW = 14
    LEFT_WRIST = 15
    RIGHT_WRIST = 16
    LEFT_PINKY = 17
    RIGHT_PINKY = 18
    LEFT_INDEX = 19
    RIGHT_INDEX = 20
    LEFT_THUMB = 21
    RIGHT_THUMB = 22
    LEFT_HIP = 23
    RIGHT_HIP = 24
    LEFT_KNEE = 25
    RIGHT_KNEE = 26
    LEFT_ANKLE = 27
    RIGHT_ANKLE = 28
    LEFT_HEEL = 29
    RIGHT_HEEL = 30
    LEFT_FOOT_INDEX = 31
    RIGHT_FOOT_INDEX = 32
    
    def __init__(self):
        """Initialize pose detector"""
        self.config = get_config()
        
        # MediaPipe configuration
        self.min_detection_confidence = self.config.get('models.pose_detection.min_detection_confidence', 0.7)
        self.min_tracking_confidence = self.config.get('models.pose_detection.min_tracking_confidence', 0.7)
        self.model_complexity = self.config.get('models.pose_detection.model_complexity', 2)
        
        # Initialize MediaPipe
        self.mp_pose = mp.solutions.pose
        self.mp_drawing = mp.solutions.drawing_utils
        self.mp_drawing_styles = mp.solutions.drawing_styles
        
        self.pose = self.mp_pose.Pose(
            static_image_mode=False,
            model_complexity=self.model_complexity,
            smooth_landmarks=True,
            enable_segmentation=True,
            smooth_segmentation=True,
            min_detection_confidence=self.min_detection_confidence,
            min_tracking_confidence=self.min_tracking_confidence
        )
        
        logger.info("Pose detector initialized with MediaPipe")
    
    def detect(self, image: np.ndarray) -> Optional[PoseLandmarks]:
        """
        Detect pose in image
        
        Args:
            image: Input image (BGR)
            
        Returns:
            PoseLandmarks object or None if no pose detected
        """
        # Convert BGR to RGB
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Process image
        results = self.pose.process(image_rgb)
        
        if not results.pose_landmarks:
            return None
        
        h, w = image.shape[:2]
        
        # Extract landmarks
        landmarks = []
        for landmark in results.pose_landmarks.landmark:
            landmarks.append((landmark.x, landmark.y, landmark.visibility))
        
        # Extract world landmarks
        world_landmarks = []
        if results.pose_world_landmarks:
            for landmark in results.pose_world_landmarks.landmark:
                world_landmarks.append((landmark.x, landmark.y, landmark.z))
        
        return PoseLandmarks(
            landmarks=landmarks,
            world_landmarks=world_landmarks if world_landmarks else None,
            image_width=w,
            image_height=h
        )
    
    def draw_landmarks(
        self,
        image: np.ndarray,
        landmarks: PoseLandmarks,
        draw_connections: bool = True
    ) -> np.ndarray:
        """
        Draw pose landmarks on image
        
        Args:
            image: Input image
            landmarks: Pose landmarks
            draw_connections: Whether to draw skeleton connections
            
        Returns:
            Image with landmarks drawn
        """
        output = image.copy()
        
        # Convert to MediaPipe format for drawing
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Create landmark list
        mp_landmarks = self.mp_pose.PoseLandmark
        landmark_list = self.mp_pose.PoseLandmark
        
        # Draw on RGB image
        if draw_connections:
            # Draw skeleton
            for connection in self.mp_pose.POSE_CONNECTIONS:
                start_idx, end_idx = connection
                start = landmarks.get_pixel_coords(start_idx)
                end = landmarks.get_pixel_coords(end_idx)
                
                if start and end:
                    cv2.line(output, start, end, (0, 255, 0), 2)
        
        # Draw landmarks
        for i, landmark in enumerate(landmarks.landmarks):
            if landmark[2] > 0.5:  # visibility threshold
                coords = landmarks.get_pixel_coords(i)
                if coords:
                    cv2.circle(output, coords, 5, (0, 0, 255), -1)
                    cv2.circle(output, coords, 7, (255, 255, 255), 2)
        
        return output
    
    def calculate_body_angles(self, landmarks: PoseLandmarks) -> Dict[str, float]:
        """
        Calculate important body angles
        
        Args:
            landmarks: Pose landmarks
            
        Returns:
            Dictionary of angle measurements
        """
        def calculate_angle(p1: Tuple[float, float], p2: Tuple[float, float], p3: Tuple[float, float]) -> float:
            """Calculate angle between three points"""
            a = np.array([p1[0], p1[1]])
            b = np.array([p2[0], p2[1]])
            c = np.array([p3[0], p3[1]])
            
            ba = a - b
            bc = c - b
            
            cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc) + 1e-6)
            angle = np.arccos(np.clip(cosine_angle, -1.0, 1.0))
            
            return np.degrees(angle)
        
        angles = {}
        
        # Left elbow angle
        left_shoulder = landmarks.get_landmark(self.LEFT_SHOULDER)
        left_elbow = landmarks.get_landmark(self.LEFT_ELBOW)
        left_wrist = landmarks.get_landmark(self.LEFT_WRIST)
        
        if all([left_shoulder, left_elbow, left_wrist]):
            angles['left_elbow'] = calculate_angle(
                (left_shoulder[0], left_shoulder[1]),
                (left_elbow[0], left_elbow[1]),
                (left_wrist[0], left_wrist[1])
            )
        
        # Right elbow angle
        right_shoulder = landmarks.get_landmark(self.RIGHT_SHOULDER)
        right_elbow = landmarks.get_landmark(self.RIGHT_ELBOW)
        right_wrist = landmarks.get_landmark(self.RIGHT_WRIST)
        
        if all([right_shoulder, right_elbow, right_wrist]):
            angles['right_elbow'] = calculate_angle(
                (right_shoulder[0], right_shoulder[1]),
                (right_elbow[0], right_elbow[1]),
                (right_wrist[0], right_wrist[1])
            )
        
        # Shoulder slope
        if left_shoulder and right_shoulder:
            slope = (right_shoulder[1] - left_shoulder[1]) / (right_shoulder[0] - left_shoulder[0] + 1e-6)
            angles['shoulder_slope'] = np.degrees(np.arctan(slope))
        
        return angles
    
    def is_pose_stable(self, recent_landmarks: List[PoseLandmarks], threshold: float = 0.02) -> bool:
        """
        Check if pose is stable across multiple frames
        
        Args:
            recent_landmarks: List of recent pose detections
            threshold: Maximum movement threshold
            
        Returns:
            True if pose is stable
        """
        if len(recent_landmarks) < 2:
            return False
        
        # Calculate average movement of key landmarks
        key_landmarks = [self.NOSE, self.LEFT_SHOULDER, self.RIGHT_SHOULDER, self.LEFT_HIP, self.RIGHT_HIP]
        
        total_movement = 0
        count = 0
        
        for i in range(1, len(recent_landmarks)):
            prev_pose = recent_landmarks[i-1]
            curr_pose = recent_landmarks[i]
            
            for landmark_id in key_landmarks:
                prev = prev_pose.get_landmark(landmark_id)
                curr = curr_pose.get_landmark(landmark_id)
                
                if prev and curr:
                    movement = np.sqrt((curr[0] - prev[0])**2 + (curr[1] - prev[1])**2)
                    total_movement += movement
                    count += 1
        
        if count == 0:
            return False
        
        avg_movement = total_movement / count
        return avg_movement < threshold
    
    def get_body_bounding_box(self, landmarks: PoseLandmarks) -> Tuple[int, int, int, int]:
        """
        Get bounding box around detected body
        
        Args:
            landmarks: Pose landmarks
            
        Returns:
            Tuple of (x, y, width, height)
        """
        visible_landmarks = [
            landmarks.get_pixel_coords(i) 
            for i in range(len(landmarks.landmarks))
            if landmarks.landmarks[i][2] > 0.5
        ]
        
        if not visible_landmarks:
            return (0, 0, 0, 0)
        
        xs = [coord[0] for coord in visible_landmarks]
        ys = [coord[1] for coord in visible_landmarks]
        
        x_min, x_max = min(xs), max(xs)
        y_min, y_max = min(ys), max(ys)
        
        # Add padding
        padding = 20
        x_min = max(0, x_min - padding)
        y_min = max(0, y_min - padding)
        x_max = min(landmarks.image_width, x_max + padding)
        y_max = min(landmarks.image_height, y_max + padding)
        
        return (x_min, y_min, x_max - x_min, y_max - y_min)
    
    def release(self):
        """Release resources"""
        if self.pose:
            self.pose.close()
            logger.info("Pose detector released")

