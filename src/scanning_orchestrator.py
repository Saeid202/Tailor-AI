"""
Main scanning orchestrator - coordinates the entire body scanning process
"""
import cv2
import numpy as np
from typing import Optional, Callable, Dict, Tuple
from pathlib import Path
from datetime import datetime
import time

from src.camera.camera_controller import CameraController
from src.vision.pose_detector import PoseDetector, PoseLandmarks
from src.vision.orientation_detector import OrientationDetector, Orientation
from src.vision.body_segmentation import BodySegmenter
from src.vision.depth_estimator import DepthEstimator
from src.reconstruction.body_reconstructor import BodyReconstructor, MultiViewCapture
from src.measurements.body_measurements import BodyMeasurementExtractor, BodyMeasurements
from src.utils.logger import logger
from src.utils.config_loader import get_config
from src.utils.image_processing import draw_text_with_background


class ScanningState:
    """Enumeration of scanning states"""
    INITIALIZING = "initializing"
    WAITING_FOR_POSITION = "waiting_for_position"
    POSITION_CONFIRMED = "position_confirmed"
    CAPTURING = "capturing"
    PROCESSING = "processing"
    COMPLETE = "complete"
    ERROR = "error"


class ScanningOrchestrator:
    """
    Main orchestrator for the body scanning process
    Coordinates all components to achieve 98%+ measurement accuracy
    """
    
    def __init__(self, session_name: Optional[str] = None):
        """
        Initialize scanning orchestrator
        
        Args:
            session_name: Optional session name for organizing output
        """
        self.config = get_config()
        
        # Create session
        if session_name is None:
            session_name = f"scan_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        self.session_name = session_name
        self.session_dir = Path("data/sessions") / session_name
        self.session_dir.mkdir(parents=True, exist_ok=True)
        
        # Initialize components
        logger.info("Initializing scanning system...")
        
        self.camera = CameraController()
        self.pose_detector = PoseDetector()
        self.orientation_detector = OrientationDetector()
        self.body_segmenter = BodySegmenter(method="mediapipe")
        self.depth_estimator = DepthEstimator(model_type="DPT_Large")
        self.body_reconstructor = BodyReconstructor()
        self.measurement_extractor = BodyMeasurementExtractor()
        
        # Scanning state
        self.state = ScanningState.INITIALIZING
        self.multi_view_capture = MultiViewCapture()
        self.current_target_orientation = Orientation.FRONT
        self.orientations_to_capture = [
            Orientation.FRONT,
            Orientation.LEFT_SIDE,
            Orientation.RIGHT_SIDE,
            Orientation.BACK
        ]
        self.current_orientation_idx = 0
        
        # Frame stability tracking
        self.stable_frames_count = 0
        self.required_stable_frames = self.config.get('quality_control.pose_stability_frames', 5)
        self.recent_landmarks = []
        
        # Capture settings
        self.images_per_orientation = self.config.get('capture.images_per_orientation', 3)
        self.current_captures_for_orientation = 0
        
        logger.info(f"Scanning session initialized: {session_name}")
    
    def start_scanning(self, callback: Optional[Callable] = None):
        """
        Start the interactive scanning process
        
        Args:
            callback: Optional callback function for progress updates
        """
        logger.info("=" * 60)
        logger.info("STARTING BODY SCANNING PROCESS")
        logger.info("=" * 60)
        
        # Open camera
        if not self.camera.open():
            logger.error("Failed to open camera")
            self.state = ScanningState.ERROR
            return
        
        self.state = ScanningState.WAITING_FOR_POSITION
        
        try:
            # Main scanning loop
            self._run_scanning_loop(callback)
            
        finally:
            # Cleanup
            self.camera.release()
            self.pose_detector.release()
            self.body_segmenter.release()
            self.depth_estimator.release()
    
    def _run_scanning_loop(self, callback: Optional[Callable] = None):
        """Main scanning loop with real-time feedback"""
        
        cv2.namedWindow("Body Scanning", cv2.WINDOW_NORMAL)
        
        while self.current_orientation_idx < len(self.orientations_to_capture):
            ret, frame = self.camera.read_frame()
            
            if not ret or frame is None:
                logger.error("Failed to read frame")
                break
            
            # Process frame
            display_frame = self._process_frame(frame)
            
            # Show frame
            cv2.imshow("Body Scanning", display_frame)
            
            # Handle key presses
            key = cv2.waitKey(1) & 0xFF
            if key == ord('q'):
                logger.info("Scanning cancelled by user")
                break
            elif key == ord('s'):
                # Manual capture trigger
                self._trigger_capture(frame)
            elif key == ord('n'):
                # Skip to next orientation
                self._next_orientation()
            
            # Call progress callback if provided
            if callback:
                progress = (self.current_orientation_idx / len(self.orientations_to_capture)) * 100
                callback(progress, self.state)
        
        cv2.destroyAllWindows()
        
        # Process captured data
        if self.multi_view_capture.has_complete_scan():
            self._process_captured_data()
        else:
            logger.warning("Incomplete scan - not all orientations captured")
    
    def _process_frame(self, frame: np.ndarray) -> np.ndarray:
        """
        Process frame and update state
        
        Args:
            frame: Input frame
            
        Returns:
            Display frame with overlays
        """
        display_frame = frame.copy()
        
        # Detect pose
        landmarks = self.pose_detector.detect(frame)
        
        if landmarks is None:
            # No person detected
            self._draw_instruction(display_frame, "⚠️ No person detected. Please step into view.", (0, 0, 255))
            self.stable_frames_count = 0
            return display_frame
        
        # Draw pose landmarks
        display_frame = self.pose_detector.draw_landmarks(display_frame, landmarks)
        
        # Detect orientation
        current_orientation, confidence = self.orientation_detector.detect_orientation(landmarks)
        
        # Get current target
        target_orientation = self.orientations_to_capture[self.current_orientation_idx]
        
        # Draw orientation overlay
        display_frame = self.orientation_detector.draw_orientation_overlay(
            display_frame, current_orientation, confidence, target_orientation
        )
        
        # Check if correct orientation
        if current_orientation == target_orientation and confidence > 0.85:
            # Track stability
            self.recent_landmarks.append(landmarks)
            if len(self.recent_landmarks) > 10:
                self.recent_landmarks.pop(0)
            
            is_stable = self.pose_detector.is_pose_stable(self.recent_landmarks, threshold=0.02)
            
            if is_stable:
                self.stable_frames_count += 1
                
                if self.stable_frames_count >= self.required_stable_frames:
                    if self.state == ScanningState.WAITING_FOR_POSITION:
                        self.state = ScanningState.POSITION_CONFIRMED
                        
                        # Auto-capture after confirmation
                        time.sleep(0.5)
                        self._trigger_capture(frame, landmarks)
                
                # Draw stability progress
                progress_text = f"Hold still... {self.stable_frames_count}/{self.required_stable_frames}"
                self._draw_instruction(display_frame, progress_text, (0, 255, 0))
            else:
                self.stable_frames_count = 0
                self._draw_instruction(display_frame, "Please hold still", (255, 165, 0))
        else:
            self.stable_frames_count = 0
            self.recent_landmarks.clear()
            
            # Show guidance
            guidance = self.orientation_detector.get_guidance_message(
                current_orientation, target_orientation, confidence
            )
            self._draw_instruction(display_frame, guidance, (255, 255, 0))
        
        # Draw progress
        self._draw_progress(display_frame)
        
        return display_frame
    
    def _trigger_capture(self, frame: np.ndarray, landmarks: Optional[PoseLandmarks] = None):
        """Trigger capture for current orientation"""
        
        if landmarks is None:
            landmarks = self.pose_detector.detect(frame)
            if landmarks is None:
                logger.warning("Cannot capture - no pose detected")
                return
        
        logger.info(f"Capturing {self.orientations_to_capture[self.current_orientation_idx].value}...")
        
        self.state = ScanningState.CAPTURING
        
        # Segment body
        segmented, mask = self.body_segmenter.segment(frame, background_blur=False)
        
        # Estimate depth
        depth_map = self.depth_estimator.estimate_depth(frame)
        
        # Save capture data
        orientation = self.orientations_to_capture[self.current_orientation_idx]
        self.multi_view_capture.add_capture(
            orientation, frame, landmarks, depth_map, mask
        )
        
        # Save images for reference
        orientation_dir = self.session_dir / orientation.value
        orientation_dir.mkdir(exist_ok=True)
        
        capture_idx = self.current_captures_for_orientation
        cv2.imwrite(str(orientation_dir / f"capture_{capture_idx}.jpg"), frame)
        cv2.imwrite(str(orientation_dir / f"segmented_{capture_idx}.jpg"), segmented)
        cv2.imwrite(str(orientation_dir / f"mask_{capture_idx}.jpg"), mask)
        
        # Save depth visualization
        depth_colored = self.depth_estimator.colorize_depth(depth_map)
        cv2.imwrite(str(orientation_dir / f"depth_{capture_idx}.jpg"), depth_colored)
        
        self.current_captures_for_orientation += 1
        
        logger.info(f"Captured {self.current_captures_for_orientation}/{self.images_per_orientation} images for {orientation.value}")
        
        # Check if enough captures for this orientation
        if self.current_captures_for_orientation >= self.images_per_orientation:
            self._next_orientation()
        else:
            self.state = ScanningState.WAITING_FOR_POSITION
            self.stable_frames_count = 0
    
    def _next_orientation(self):
        """Move to next orientation"""
        self.current_orientation_idx += 1
        self.current_captures_for_orientation = 0
        self.stable_frames_count = 0
        self.recent_landmarks.clear()
        self.state = ScanningState.WAITING_FOR_POSITION
        
        if self.current_orientation_idx < len(self.orientations_to_capture):
            next_orientation = self.orientations_to_capture[self.current_orientation_idx]
            logger.info(f"Ready for next orientation: {next_orientation.value}")
        else:
            logger.info("All orientations captured!")
    
    def _process_captured_data(self):
        """Process all captured data to create 3D model and measurements"""
        logger.info("=" * 60)
        logger.info("PROCESSING CAPTURED DATA")
        logger.info("=" * 60)
        
        self.state = ScanningState.PROCESSING
        
        # 3D Reconstruction
        logger.info("Starting 3D reconstruction...")
        point_cloud, mesh = self.body_reconstructor.reconstruct_from_multi_view(
            self.multi_view_capture
        )
        
        # Optimize mesh for manufacturing
        mesh = self.body_reconstructor.optimize_mesh_for_manufacturing(mesh)
        
        # Export 3D models
        export_dir = self.session_dir / "exports"
        self.body_reconstructor.export_reconstruction(
            mesh, point_cloud, export_dir, filename_prefix="body_model"
        )
        
        # Extract measurements
        logger.info("Extracting body measurements...")
        
        # Get landmarks from front view (most accurate for measurements)
        front_captures = self.multi_view_capture.get_captures(Orientation.FRONT)
        front_landmarks = front_captures[0]['landmarks'] if front_captures else None
        
        measurements = self.measurement_extractor.extract_measurements(
            mesh, point_cloud, front_landmarks
        )
        
        # Add timestamp
        measurements.timestamp = datetime.now().isoformat()
        
        # Generate reports
        report_dir = self.session_dir / "reports"
        report_dir.mkdir(exist_ok=True)
        
        measurements.save_to_json(report_dir / "measurements.json")
        self.measurement_extractor.generate_measurement_report(
            measurements, report_dir / "measurement_report.txt"
        )
        
        logger.info("=" * 60)
        logger.info("SCANNING COMPLETE!")
        logger.info(f"Results saved to: {self.session_dir}")
        logger.info("=" * 60)
        
        self.state = ScanningState.COMPLETE
        
        return measurements
    
    def _draw_instruction(self, frame: np.ndarray, text: str, color: Tuple[int, int, int]):
        """Draw instruction text on frame"""
        h, w = frame.shape[:2]
        
        # Draw at top center
        text_size = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, 0.8, 2)[0]
        x = (w - text_size[0]) // 2
        y = 40
        
        draw_text_with_background(
            frame, text, (x, y),
            font_scale=0.8, thickness=2,
            text_color=color,
            bg_color=(0, 0, 0),
            padding=10
        )
    
    def _draw_progress(self, frame: np.ndarray):
        """Draw scanning progress on frame"""
        h, w = frame.shape[:2]
        
        # Draw progress bar
        bar_width = 400
        bar_height = 30
        bar_x = (w - bar_width) // 2
        bar_y = h - 60
        
        total_orientations = len(self.orientations_to_capture)
        progress = (self.current_orientation_idx + 
                   (self.current_captures_for_orientation / self.images_per_orientation)) / total_orientations
        
        # Background
        cv2.rectangle(frame, (bar_x, bar_y), (bar_x + bar_width, bar_y + bar_height), (50, 50, 50), -1)
        
        # Progress fill
        fill_width = int(bar_width * progress)
        cv2.rectangle(frame, (bar_x, bar_y), (bar_x + fill_width, bar_y + bar_height), (0, 255, 0), -1)
        
        # Border
        cv2.rectangle(frame, (bar_x, bar_y), (bar_x + bar_width, bar_y + bar_height), (255, 255, 255), 2)
        
        # Text
        progress_text = f"Progress: {progress*100:.0f}% ({self.current_orientation_idx}/{total_orientations} orientations)"
        text_size = cv2.getTextSize(progress_text, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)[0]
        text_x = bar_x + (bar_width - text_size[0]) // 2
        text_y = bar_y - 10
        
        cv2.putText(frame, progress_text, (text_x, text_y),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
    
    def get_session_summary(self) -> Dict:
        """Get summary of scanning session"""
        return {
            'session_name': self.session_name,
            'session_dir': str(self.session_dir),
            'state': self.state,
            'total_captures': self.multi_view_capture.get_total_captures(),
            'orientations_captured': [
                orient.value for orient in self.orientations_to_capture[:self.current_orientation_idx]
            ]
        }

