"""
Depth estimation for 3D reconstruction
"""
import cv2
import numpy as np
import torch
from typing import Optional, Tuple
from pathlib import Path

from src.utils.logger import logger
from src.utils.config_loader import get_config


class DepthEstimator:
    """
    Monocular depth estimation using MiDaS/DPT
    """
    
    def __init__(self, model_type: str = "DPT_Large"):
        """
        Initialize depth estimator
        
        Args:
            model_type: Model type ('DPT_Large', 'DPT_Hybrid', 'MiDaS_small')
        """
        self.config = get_config()
        self.model_type = model_type
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
        logger.info(f"Loading depth estimation model: {model_type}")
        
        try:
            # Load MiDaS model from torch hub
            self.model = torch.hub.load("intel-isl/MiDaS", model_type)
            self.model.to(self.device)
            self.model.eval()
            
            # Load transforms
            midas_transforms = torch.hub.load("intel-isl/MiDaS", "transforms")
            
            if model_type == "DPT_Large" or model_type == "DPT_Hybrid":
                self.transform = midas_transforms.dpt_transform
            else:
                self.transform = midas_transforms.small_transform
            
            logger.info(f"Depth estimator initialized on {self.device}")
            
        except Exception as e:
            logger.error(f"Failed to load depth model: {e}")
            logger.info("Falling back to simple depth estimation")
            self.model = None
            self.transform = None
    
    def estimate_depth(self, image: np.ndarray) -> Optional[np.ndarray]:
        """
        Estimate depth map from image
        
        Args:
            image: Input image (BGR)
            
        Returns:
            Depth map (float32, inverse depth)
        """
        if self.model is None or self.transform is None:
            return self._simple_depth_estimation(image)
        
        try:
            # Convert BGR to RGB
            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # Apply transforms
            input_batch = self.transform(image_rgb).to(self.device)
            
            # Predict depth
            with torch.no_grad():
                prediction = self.model(input_batch)
                
                prediction = torch.nn.functional.interpolate(
                    prediction.unsqueeze(1),
                    size=image.shape[:2],
                    mode="bicubic",
                    align_corners=False,
                ).squeeze()
            
            depth_map = prediction.cpu().numpy()
            
            return depth_map
            
        except Exception as e:
            logger.error(f"Error in depth estimation: {e}")
            return self._simple_depth_estimation(image)
    
    def _simple_depth_estimation(self, image: np.ndarray) -> np.ndarray:
        """
        Simple depth estimation based on brightness/contrast
        Fallback when neural model is not available
        """
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Use gradient magnitude as depth cue
        gx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
        gy = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
        gradient_mag = np.sqrt(gx**2 + gy**2)
        
        # Normalize
        depth_map = cv2.normalize(gradient_mag, None, 0, 1, cv2.NORM_MINMAX, dtype=cv2.CV_32F)
        
        return depth_map
    
    def normalize_depth(
        self,
        depth_map: np.ndarray,
        min_val: float = 0.0,
        max_val: float = 255.0
    ) -> np.ndarray:
        """
        Normalize depth map to specified range
        
        Args:
            depth_map: Input depth map
            min_val: Minimum value
            max_val: Maximum value
            
        Returns:
            Normalized depth map
        """
        depth_min = depth_map.min()
        depth_max = depth_map.max()
        
        if depth_max - depth_min < 1e-6:
            return np.zeros_like(depth_map)
        
        normalized = (depth_map - depth_min) / (depth_max - depth_min)
        normalized = normalized * (max_val - min_val) + min_val
        
        return normalized.astype(np.uint8) if max_val == 255 else normalized
    
    def colorize_depth(self, depth_map: np.ndarray) -> np.ndarray:
        """
        Create colorized visualization of depth map
        
        Args:
            depth_map: Depth map
            
        Returns:
            Colorized depth map (BGR)
        """
        # Normalize to 0-255
        normalized = self.normalize_depth(depth_map, 0, 255)
        
        # Apply colormap
        colored = cv2.applyColorMap(normalized, cv2.COLORMAP_MAGMA)
        
        return colored
    
    def depth_to_point_cloud(
        self,
        depth_map: np.ndarray,
        image: np.ndarray,
        fx: float = 525.0,
        fy: float = 525.0,
        cx: Optional[float] = None,
        cy: Optional[float] = None,
        depth_scale: float = 1000.0
    ) -> Tuple[np.ndarray, np.ndarray]:
        """
        Convert depth map to 3D point cloud
        
        Args:
            depth_map: Depth map
            image: RGB image for colors
            fx: Focal length x
            fy: Focal length y
            cx: Principal point x (default: image center)
            cy: Principal point y (default: image center)
            depth_scale: Depth scaling factor
            
        Returns:
            Tuple of (points_3d, colors)
        """
        h, w = depth_map.shape
        
        if cx is None:
            cx = w / 2.0
        if cy is None:
            cy = h / 2.0
        
        # Create coordinate grid
        u, v = np.meshgrid(np.arange(w), np.arange(h))
        
        # Convert to 3D coordinates
        z = depth_map / depth_scale
        x = (u - cx) * z / fx
        y = (v - cy) * z / fy
        
        # Stack coordinates
        points_3d = np.stack([x, y, z], axis=-1).reshape(-1, 3)
        
        # Get colors
        if len(image.shape) == 3:
            colors = cv2.cvtColor(image, cv2.COLOR_BGR2RGB).reshape(-1, 3) / 255.0
        else:
            colors = np.stack([image.flatten()] * 3, axis=-1) / 255.0
        
        # Filter out invalid points
        valid_mask = (z.flatten() > 0) & (z.flatten() < 10)  # Remove very far/close points
        points_3d = points_3d[valid_mask]
        colors = colors[valid_mask]
        
        return points_3d, colors
    
    def apply_depth_filter(
        self,
        depth_map: np.ndarray,
        mask: Optional[np.ndarray] = None,
        min_depth: float = 0.5,
        max_depth: float = 5.0
    ) -> np.ndarray:
        """
        Apply depth filtering to remove outliers
        
        Args:
            depth_map: Depth map
            mask: Optional mask to apply
            min_depth: Minimum valid depth
            max_depth: Maximum valid depth
            
        Returns:
            Filtered depth map
        """
        filtered = depth_map.copy()
        
        # Apply mask if provided
        if mask is not None:
            filtered[mask == 0] = 0
        
        # Normalize for filtering
        depth_normalized = self.normalize_depth(depth_map, 0, 10)
        
        # Filter by depth range
        filtered[(depth_normalized < min_depth) | (depth_normalized > max_depth)] = 0
        
        # Median filter to remove noise
        filtered = cv2.medianBlur(filtered.astype(np.float32), 5)
        
        return filtered
    
    def estimate_distance_to_person(
        self,
        depth_map: np.ndarray,
        body_mask: np.ndarray
    ) -> float:
        """
        Estimate average distance to person
        
        Args:
            depth_map: Depth map
            body_mask: Binary mask of person
            
        Returns:
            Average distance in meters (approximate)
        """
        # Get depth values for person pixels
        person_depths = depth_map[body_mask > 0]
        
        if len(person_depths) == 0:
            return 0.0
        
        # Calculate median depth (more robust than mean)
        median_depth = np.median(person_depths)
        
        # Convert to approximate real distance
        # This is a rough calibration - should be calibrated for specific setup
        distance = median_depth / 100.0  # Approximate conversion
        
        return distance
    
    def release(self):
        """Release resources"""
        if hasattr(self, 'model') and self.model is not None:
            del self.model
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
            logger.info("Depth estimator released")

