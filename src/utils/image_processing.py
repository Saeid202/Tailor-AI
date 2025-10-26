"""
Image processing utilities
"""
import cv2
import numpy as np
from typing import Tuple, Optional


def calculate_blur_score(image: np.ndarray) -> float:
    """
    Calculate blur score using Laplacian variance
    Higher score = sharper image
    
    Args:
        image: Input image
        
    Returns:
        Blur score (variance of Laplacian)
    """
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image
    laplacian = cv2.Laplacian(gray, cv2.CV_64F)
    return laplacian.var()


def check_image_quality(image: np.ndarray, blur_threshold: float = 100.0) -> Tuple[bool, str]:
    """
    Check if image meets quality requirements
    
    Args:
        image: Input image
        blur_threshold: Minimum acceptable blur score
        
    Returns:
        Tuple of (is_good_quality, message)
    """
    # Check blur
    blur_score = calculate_blur_score(image)
    if blur_score < blur_threshold:
        return False, f"Image too blurry (score: {blur_score:.2f}, threshold: {blur_threshold})"
    
    # Check brightness
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image
    mean_brightness = np.mean(gray)
    
    if mean_brightness < 50:
        return False, f"Image too dark (brightness: {mean_brightness:.2f})"
    elif mean_brightness > 200:
        return False, f"Image too bright (brightness: {mean_brightness:.2f})"
    
    # Check contrast
    std_dev = np.std(gray)
    if std_dev < 30:
        return False, f"Image has low contrast (std: {std_dev:.2f})"
    
    return True, "Image quality acceptable"


def resize_image(image: np.ndarray, max_size: int = 1920) -> np.ndarray:
    """
    Resize image while maintaining aspect ratio
    
    Args:
        image: Input image
        max_size: Maximum dimension size
        
    Returns:
        Resized image
    """
    h, w = image.shape[:2]
    if max(h, w) <= max_size:
        return image
    
    if h > w:
        new_h = max_size
        new_w = int(w * (max_size / h))
    else:
        new_w = max_size
        new_h = int(h * (max_size / w))
    
    return cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_AREA)


def enhance_image(image: np.ndarray) -> np.ndarray:
    """
    Enhance image quality using CLAHE and denoising
    
    Args:
        image: Input image
        
    Returns:
        Enhanced image
    """
    # Convert to LAB color space
    lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    
    # Apply CLAHE to L channel
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    l = clahe.apply(l)
    
    # Merge channels
    enhanced_lab = cv2.merge([l, a, b])
    enhanced = cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2BGR)
    
    # Denoise
    enhanced = cv2.fastNlMeansDenoisingColored(enhanced, None, 10, 10, 7, 21)
    
    return enhanced


def create_mask_from_segmentation(segmentation: np.ndarray) -> np.ndarray:
    """
    Create binary mask from segmentation result
    
    Args:
        segmentation: Segmentation mask
        
    Returns:
        Binary mask
    """
    if len(segmentation.shape) == 3:
        segmentation = cv2.cvtColor(segmentation, cv2.COLOR_BGR2GRAY)
    
    _, binary_mask = cv2.threshold(segmentation, 127, 255, cv2.THRESH_BINARY)
    return binary_mask


def apply_morphological_operations(mask: np.ndarray, kernel_size: int = 5) -> np.ndarray:
    """
    Clean up mask using morphological operations
    
    Args:
        mask: Binary mask
        kernel_size: Size of morphological kernel
        
    Returns:
        Cleaned mask
    """
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (kernel_size, kernel_size))
    
    # Close small holes
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel, iterations=2)
    
    # Remove small noise
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel, iterations=1)
    
    return mask


def draw_text_with_background(
    image: np.ndarray,
    text: str,
    position: Tuple[int, int],
    font_scale: float = 0.7,
    thickness: int = 2,
    text_color: Tuple[int, int, int] = (255, 255, 255),
    bg_color: Tuple[int, int, int] = (0, 0, 0),
    padding: int = 5
) -> np.ndarray:
    """
    Draw text with background rectangle
    
    Args:
        image: Input image
        text: Text to draw
        position: (x, y) position
        font_scale: Font scale
        thickness: Text thickness
        text_color: Text color (B, G, R)
        bg_color: Background color (B, G, R)
        padding: Padding around text
        
    Returns:
        Image with text
    """
    font = cv2.FONT_HERSHEY_SIMPLEX
    
    # Get text size
    (text_width, text_height), baseline = cv2.getTextSize(text, font, font_scale, thickness)
    
    x, y = position
    
    # Draw background rectangle
    cv2.rectangle(
        image,
        (x - padding, y - text_height - padding),
        (x + text_width + padding, y + baseline + padding),
        bg_color,
        -1
    )
    
    # Draw text
    cv2.putText(image, text, (x, y), font, font_scale, text_color, thickness)
    
    return image

