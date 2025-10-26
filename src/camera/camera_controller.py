"""
Camera controller for capturing body scans
"""
import cv2
import numpy as np
from typing import Optional, Tuple, List
from pathlib import Path
import time

from src.utils.logger import logger
from src.utils.config_loader import get_config
from src.utils.image_processing import check_image_quality, draw_text_with_background


class CameraController:
    """Manages camera capture and real-time preview"""
    
    def __init__(self, device_id: Optional[int] = None):
        """
        Initialize camera controller
        
        Args:
            device_id: Camera device ID (None to use config)
        """
        self.config = get_config()
        self.device_id = device_id if device_id is not None else self.config.get('camera.device_id', 0)
        
        # Camera settings
        self.width = self.config.get('camera.resolution.width', 1920)
        self.height = self.config.get('camera.resolution.height', 1080)
        self.fps = self.config.get('camera.fps', 30)
        
        # Quality control
        self.blur_threshold = self.config.get('quality_control.blur_threshold', 100)
        
        self.cap: Optional[cv2.VideoCapture] = None
        self.is_opened = False
        
        logger.info(f"Camera controller initialized with device {self.device_id}")
    
    def open(self) -> bool:
        """
        Open camera connection
        
        Returns:
            True if successful, False otherwise
        """
        try:
            self.cap = cv2.VideoCapture(self.device_id, cv2.CAP_DSHOW)  # DirectShow on Windows
            
            if not self.cap.isOpened():
                logger.error(f"Failed to open camera {self.device_id}")
                return False
            
            # Set camera properties
            self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, self.width)
            self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, self.height)
            self.cap.set(cv2.CAP_PROP_FPS, self.fps)
            
            if self.config.get('camera.autofocus', True):
                self.cap.set(cv2.CAP_PROP_AUTOFOCUS, 1)
            
            # Verify settings
            actual_width = int(self.cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            actual_height = int(self.cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            actual_fps = int(self.cap.get(cv2.CAP_PROP_FPS))
            
            logger.info(f"Camera opened: {actual_width}x{actual_height} @ {actual_fps}fps")
            
            self.is_opened = True
            return True
            
        except Exception as e:
            logger.error(f"Error opening camera: {e}")
            return False
    
    def read_frame(self) -> Tuple[bool, Optional[np.ndarray]]:
        """
        Read a frame from camera
        
        Returns:
            Tuple of (success, frame)
        """
        if not self.is_opened or self.cap is None:
            return False, None
        
        ret, frame = self.cap.read()
        
        if not ret:
            logger.warning("Failed to read frame from camera")
            return False, None
        
        return True, frame
    
    def capture_image(self, save_path: Optional[Path] = None) -> Optional[np.ndarray]:
        """
        Capture a single image
        
        Args:
            save_path: Optional path to save image
            
        Returns:
            Captured image or None
        """
        ret, frame = self.read_frame()
        
        if not ret or frame is None:
            return None
        
        # Check image quality
        is_good, message = check_image_quality(frame, self.blur_threshold)
        if not is_good:
            logger.warning(f"Image quality check failed: {message}")
        
        # Save if path provided
        if save_path:
            save_path.parent.mkdir(parents=True, exist_ok=True)
            cv2.imwrite(str(save_path), frame)
            logger.info(f"Image saved to {save_path}")
        
        return frame
    
    def capture_sequence(
        self,
        num_frames: int = 3,
        delay_ms: int = 500,
        save_dir: Optional[Path] = None
    ) -> List[np.ndarray]:
        """
        Capture a sequence of images
        
        Args:
            num_frames: Number of frames to capture
            delay_ms: Delay between captures in milliseconds
            save_dir: Optional directory to save images
            
        Returns:
            List of captured images
        """
        images = []
        
        for i in range(num_frames):
            if i > 0:
                time.sleep(delay_ms / 1000.0)
            
            save_path = None
            if save_dir:
                save_path = save_dir / f"frame_{i:03d}.jpg"
            
            image = self.capture_image(save_path)
            if image is not None:
                images.append(image)
                logger.info(f"Captured frame {i+1}/{num_frames}")
        
        return images
    
    def preview(
        self,
        window_name: str = "Camera Preview",
        show_info: bool = True,
        callback=None
    ) -> bool:
        """
        Show live camera preview
        
        Args:
            window_name: Name of preview window
            show_info: Whether to show info overlay
            callback: Optional callback function for each frame (frame) -> processed_frame
            
        Returns:
            True if preview closed normally, False on error
        """
        if not self.is_opened:
            logger.error("Camera not opened")
            return False
        
        cv2.namedWindow(window_name, cv2.WINDOW_NORMAL)
        
        try:
            while True:
                ret, frame = self.read_frame()
                
                if not ret or frame is None:
                    break
                
                # Apply callback if provided
                display_frame = frame.copy()
                if callback:
                    processed = callback(frame)
                    if processed is not None:
                        display_frame = processed
                
                # Show info overlay
                if show_info:
                    h, w = frame.shape[:2]
                    info_text = f"Resolution: {w}x{h} | Press 'q' to quit, 's' to capture"
                    display_frame = draw_text_with_background(
                        display_frame,
                        info_text,
                        (10, 30),
                        font_scale=0.6
                    )
                
                cv2.imshow(window_name, display_frame)
                
                # Handle key presses
                key = cv2.waitKey(1) & 0xFF
                if key == ord('q'):
                    logger.info("Preview closed by user")
                    break
                elif key == ord('s'):
                    timestamp = time.strftime("%Y%m%d_%H%M%S")
                    save_path = Path(f"data/captures/manual_{timestamp}.jpg")
                    self.capture_image(save_path)
            
            cv2.destroyWindow(window_name)
            return True
            
        except Exception as e:
            logger.error(f"Error in preview: {e}")
            cv2.destroyAllWindows()
            return False
    
    def release(self):
        """Release camera resources"""
        if self.cap is not None:
            self.cap.release()
            self.is_opened = False
            logger.info("Camera released")
        
        cv2.destroyAllWindows()
    
    def __enter__(self):
        """Context manager entry"""
        self.open()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit"""
        self.release()
    
    def __del__(self):
        """Destructor"""
        self.release()

