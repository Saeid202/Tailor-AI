"""
Advanced body segmentation using multiple methods
"""
import cv2
import numpy as np
from typing import Optional, Tuple
import mediapipe as mp

from src.utils.logger import logger
from src.utils.config_loader import get_config
from src.utils.image_processing import apply_morphological_operations


class BodySegmenter:
    """High-precision body segmentation"""
    
    def __init__(self, method: str = "mediapipe"):
        """
        Initialize body segmenter
        
        Args:
            method: Segmentation method ('mediapipe', 'grabcut', 'hybrid')
        """
        self.config = get_config()
        self.method = method
        
        if method in ["mediapipe", "hybrid"]:
            self.mp_selfie = mp.solutions.selfie_segmentation
            self.selfie_segmentation = self.mp_selfie.SelfieSegmentation(model_selection=1)
            logger.info("MediaPipe segmentation initialized")
        
        logger.info(f"Body segmenter initialized with method: {method}")
    
    def segment(
        self,
        image: np.ndarray,
        background_blur: bool = False
    ) -> Tuple[np.ndarray, np.ndarray]:
        """
        Segment body from background
        
        Args:
            image: Input image (BGR)
            background_blur: Whether to blur background instead of removing
            
        Returns:
            Tuple of (segmented_image, binary_mask)
        """
        if self.method == "mediapipe":
            return self._segment_mediapipe(image, background_blur)
        elif self.method == "grabcut":
            return self._segment_grabcut(image)
        elif self.method == "hybrid":
            return self._segment_hybrid(image, background_blur)
        else:
            logger.error(f"Unknown segmentation method: {self.method}")
            return image, np.ones(image.shape[:2], dtype=np.uint8) * 255
    
    def _segment_mediapipe(
        self,
        image: np.ndarray,
        background_blur: bool = False
    ) -> Tuple[np.ndarray, np.ndarray]:
        """Segment using MediaPipe"""
        # Convert BGR to RGB
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Process
        results = self.selfie_segmentation.process(image_rgb)
        
        # Get segmentation mask
        condition = results.segmentation_mask > 0.5
        
        # Create binary mask
        binary_mask = (condition * 255).astype(np.uint8)
        
        # Clean up mask
        binary_mask = apply_morphological_operations(binary_mask, kernel_size=5)
        
        if background_blur:
            # Blur background
            blurred = cv2.GaussianBlur(image, (55, 55), 0)
            output = np.where(condition[:, :, np.newaxis], image, blurred)
        else:
            # Remove background (make transparent/white)
            output = np.where(condition[:, :, np.newaxis], image, 255)
        
        return output.astype(np.uint8), binary_mask
    
    def _segment_grabcut(self, image: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """
        Segment using GrabCut algorithm
        Assumes person is in center of image
        """
        h, w = image.shape[:2]
        
        # Initialize mask
        mask = np.zeros(image.shape[:2], np.uint8)
        
        # Background and foreground models
        bgd_model = np.zeros((1, 65), np.float64)
        fgd_model = np.zeros((1, 65), np.float64)
        
        # Define rectangle around center (assumed person location)
        margin_w = int(w * 0.15)
        margin_h = int(h * 0.1)
        rect = (margin_w, margin_h, w - 2*margin_w, h - 2*margin_h)
        
        # Apply GrabCut
        cv2.grabCut(image, mask, rect, bgd_model, fgd_model, 5, cv2.GC_INIT_WITH_RECT)
        
        # Create binary mask
        binary_mask = np.where((mask == 2) | (mask == 0), 0, 255).astype(np.uint8)
        
        # Clean up mask
        binary_mask = apply_morphological_operations(binary_mask, kernel_size=7)
        
        # Apply mask
        output = cv2.bitwise_and(image, image, mask=binary_mask)
        
        return output, binary_mask
    
    def _segment_hybrid(
        self,
        image: np.ndarray,
        background_blur: bool = False
    ) -> Tuple[np.ndarray, np.ndarray]:
        """
        Hybrid segmentation combining MediaPipe and GrabCut
        Uses MediaPipe for initial mask, refines with GrabCut
        """
        # Get MediaPipe segmentation
        _, mp_mask = self._segment_mediapipe(image, False)
        
        # Use MediaPipe mask to guide GrabCut
        h, w = image.shape[:2]
        mask = np.zeros(image.shape[:2], np.uint8)
        
        # Set probable foreground and background based on MediaPipe
        mask[mp_mask > 200] = cv2.GC_PR_FGD  # Probable foreground
        mask[mp_mask < 50] = cv2.GC_BGD      # Background
        mask[(mp_mask >= 50) & (mp_mask <= 200)] = cv2.GC_PR_BGD  # Probable background
        
        # Background and foreground models
        bgd_model = np.zeros((1, 65), np.float64)
        fgd_model = np.zeros((1, 65), np.float64)
        
        # Refine with GrabCut
        try:
            cv2.grabCut(image, mask, None, bgd_model, fgd_model, 3, cv2.GC_INIT_WITH_MASK)
        except:
            # Fall back to MediaPipe only
            return self._segment_mediapipe(image, background_blur)
        
        # Create refined binary mask
        binary_mask = np.where((mask == 2) | (mask == 0), 0, 255).astype(np.uint8)
        
        # Clean up mask
        binary_mask = apply_morphological_operations(binary_mask, kernel_size=5)
        
        if background_blur:
            blurred = cv2.GaussianBlur(image, (55, 55), 0)
            output = np.where(binary_mask[:, :, np.newaxis] > 0, image, blurred)
        else:
            output = cv2.bitwise_and(image, image, mask=binary_mask)
        
        return output.astype(np.uint8), binary_mask
    
    def refine_mask(self, mask: np.ndarray) -> np.ndarray:
        """
        Refine segmentation mask
        
        Args:
            mask: Binary mask
            
        Returns:
            Refined mask
        """
        # Apply morphological operations
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
        
        # Close gaps
        mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel, iterations=2)
        
        # Remove noise
        mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel, iterations=1)
        
        # Find largest contour (main body)
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if contours:
            # Keep only largest contour
            largest_contour = max(contours, key=cv2.contourArea)
            refined_mask = np.zeros_like(mask)
            cv2.drawContours(refined_mask, [largest_contour], -1, 255, -1)
            
            # Smooth edges
            refined_mask = cv2.GaussianBlur(refined_mask, (5, 5), 0)
            _, refined_mask = cv2.threshold(refined_mask, 127, 255, cv2.THRESH_BINARY)
            
            return refined_mask
        
        return mask
    
    def calculate_coverage(self, mask: np.ndarray) -> float:
        """
        Calculate body coverage percentage in frame
        
        Args:
            mask: Binary mask
            
        Returns:
            Coverage percentage (0-1)
        """
        total_pixels = mask.shape[0] * mask.shape[1]
        body_pixels = np.sum(mask > 0)
        
        return body_pixels / total_pixels
    
    def extract_body_region(
        self,
        image: np.ndarray,
        mask: np.ndarray,
        padding: int = 20
    ) -> Tuple[np.ndarray, Tuple[int, int, int, int]]:
        """
        Extract body region with bounding box
        
        Args:
            image: Input image
            mask: Binary mask
            padding: Padding around body
            
        Returns:
            Tuple of (cropped_image, (x, y, w, h))
        """
        # Find contours
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if not contours:
            return image, (0, 0, image.shape[1], image.shape[0])
        
        # Get bounding box of largest contour
        largest_contour = max(contours, key=cv2.contourArea)
        x, y, w, h = cv2.boundingRect(largest_contour)
        
        # Add padding
        h_img, w_img = image.shape[:2]
        x = max(0, x - padding)
        y = max(0, y - padding)
        w = min(w_img - x, w + 2*padding)
        h = min(h_img - y, h + 2*padding)
        
        # Extract region
        cropped = image[y:y+h, x:x+w]
        
        return cropped, (x, y, w, h)
    
    def create_alpha_channel(self, mask: np.ndarray) -> np.ndarray:
        """
        Create alpha channel from mask for RGBA images
        
        Args:
            mask: Binary mask
            
        Returns:
            Alpha channel (0-255)
        """
        # Smooth edges for better alpha
        alpha = cv2.GaussianBlur(mask, (3, 3), 0)
        
        return alpha
    
    def release(self):
        """Release resources"""
        if hasattr(self, 'selfie_segmentation'):
            self.selfie_segmentation.close()
            logger.info("Body segmenter released")

