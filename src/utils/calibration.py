"""
Camera calibration and accuracy validation system
"""
import cv2
import numpy as np
from typing import Tuple, List, Optional, Dict
from pathlib import Path
import pickle

from src.utils.logger import logger


class CameraCalibrator:
    """
    Camera calibration for accurate 3D measurements
    Uses checkerboard pattern for calibration
    """
    
    def __init__(self, checkerboard_size: Tuple[int, int] = (9, 6), square_size_mm: float = 25.0):
        """
        Initialize camera calibrator
        
        Args:
            checkerboard_size: Inner corners of checkerboard (width, height)
            square_size_mm: Size of checkerboard square in millimeters
        """
        self.checkerboard_size = checkerboard_size
        self.square_size_mm = square_size_mm
        
        # Calibration data
        self.camera_matrix: Optional[np.ndarray] = None
        self.dist_coeffs: Optional[np.ndarray] = None
        self.rvecs: Optional[List[np.ndarray]] = None
        self.tvecs: Optional[List[np.ndarray]] = None
        self.calibration_error: float = 0.0
        
        # Object points (3D points in real world space)
        self.objp = np.zeros((checkerboard_size[0] * checkerboard_size[1], 3), np.float32)
        self.objp[:, :2] = np.mgrid[0:checkerboard_size[0], 0:checkerboard_size[1]].T.reshape(-1, 2)
        self.objp *= (square_size_mm / 1000.0)  # Convert to meters
        
        logger.info(f"Camera calibrator initialized with {checkerboard_size} checkerboard")
    
    def calibrate_from_images(
        self,
        image_paths: List[Path],
        show_detections: bool = False
    ) -> bool:
        """
        Calibrate camera from multiple checkerboard images
        
        Args:
            image_paths: List of paths to calibration images
            show_detections: Whether to show corner detections
            
        Returns:
            True if calibration successful
        """
        objpoints = []  # 3D points in real world space
        imgpoints = []  # 2D points in image plane
        
        image_size = None
        
        for img_path in image_paths:
            img = cv2.imread(str(img_path))
            if img is None:
                logger.warning(f"Failed to load image: {img_path}")
                continue
            
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            image_size = gray.shape[::-1]
            
            # Find checkerboard corners
            ret, corners = cv2.findChessboardCorners(
                gray, self.checkerboard_size,
                cv2.CALIB_CB_ADAPTIVE_THRESH + cv2.CALIB_CB_NORMALIZE_IMAGE
            )
            
            if ret:
                objpoints.append(self.objp)
                
                # Refine corner positions
                criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 30, 0.001)
                corners_refined = cv2.cornerSubPix(gray, corners, (11, 11), (-1, -1), criteria)
                imgpoints.append(corners_refined)
                
                logger.info(f"Detected checkerboard in {img_path.name}")
                
                if show_detections:
                    cv2.drawChessboardCorners(img, self.checkerboard_size, corners_refined, ret)
                    cv2.imshow('Checkerboard Detection', img)
                    cv2.waitKey(500)
            else:
                logger.warning(f"Checkerboard not found in {img_path.name}")
        
        if show_detections:
            cv2.destroyAllWindows()
        
        if len(objpoints) < 3:
            logger.error(f"Not enough valid calibration images (found {len(objpoints)}, need at least 3)")
            return False
        
        # Calibrate camera
        ret, camera_matrix, dist_coeffs, rvecs, tvecs = cv2.calibrateCamera(
            objpoints, imgpoints, image_size, None, None
        )
        
        if not ret:
            logger.error("Camera calibration failed")
            return False
        
        self.camera_matrix = camera_matrix
        self.dist_coeffs = dist_coeffs
        self.rvecs = rvecs
        self.tvecs = tvecs
        
        # Calculate re-projection error
        total_error = 0
        for i in range(len(objpoints)):
            imgpoints_projected, _ = cv2.projectPoints(
                objpoints[i], rvecs[i], tvecs[i], camera_matrix, dist_coeffs
            )
            error = cv2.norm(imgpoints[i], imgpoints_projected, cv2.NORM_L2) / len(imgpoints_projected)
            total_error += error
        
        self.calibration_error = total_error / len(objpoints)
        
        logger.info(f"Camera calibration successful!")
        logger.info(f"Reprojection error: {self.calibration_error:.4f} pixels")
        logger.info(f"Camera matrix:\n{camera_matrix}")
        logger.info(f"Distortion coefficients: {dist_coeffs.ravel()}")
        
        return True
    
    def save_calibration(self, filepath: Path):
        """Save calibration data to file"""
        if self.camera_matrix is None:
            logger.error("No calibration data to save")
            return
        
        calibration_data = {
            'camera_matrix': self.camera_matrix,
            'dist_coeffs': self.dist_coeffs,
            'rvecs': self.rvecs,
            'tvecs': self.tvecs,
            'calibration_error': self.calibration_error,
            'checkerboard_size': self.checkerboard_size,
            'square_size_mm': self.square_size_mm
        }
        
        filepath.parent.mkdir(parents=True, exist_ok=True)
        with open(filepath, 'wb') as f:
            pickle.dump(calibration_data, f)
        
        logger.info(f"Calibration data saved to {filepath}")
    
    def load_calibration(self, filepath: Path) -> bool:
        """Load calibration data from file"""
        if not filepath.exists():
            logger.error(f"Calibration file not found: {filepath}")
            return False
        
        try:
            with open(filepath, 'rb') as f:
                calibration_data = pickle.load(f)
            
            self.camera_matrix = calibration_data['camera_matrix']
            self.dist_coeffs = calibration_data['dist_coeffs']
            self.rvecs = calibration_data.get('rvecs')
            self.tvecs = calibration_data.get('tvecs')
            self.calibration_error = calibration_data.get('calibration_error', 0.0)
            
            logger.info(f"Calibration data loaded from {filepath}")
            logger.info(f"Reprojection error: {self.calibration_error:.4f} pixels")
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to load calibration: {e}")
            return False
    
    def undistort_image(self, image: np.ndarray) -> np.ndarray:
        """
        Undistort image using calibration parameters
        
        Args:
            image: Input image
            
        Returns:
            Undistorted image
        """
        if self.camera_matrix is None or self.dist_coeffs is None:
            logger.warning("No calibration data, returning original image")
            return image
        
        h, w = image.shape[:2]
        new_camera_matrix, roi = cv2.getOptimalNewCameraMatrix(
            self.camera_matrix, self.dist_coeffs, (w, h), 1, (w, h)
        )
        
        # Undistort
        undistorted = cv2.undistort(image, self.camera_matrix, self.dist_coeffs, None, new_camera_matrix)
        
        # Crop to ROI
        x, y, w, h = roi
        undistorted = undistorted[y:y+h, x:x+w]
        
        return undistorted
    
    def get_focal_length(self) -> Tuple[float, float]:
        """
        Get focal length in pixels
        
        Returns:
            Tuple of (fx, fy)
        """
        if self.camera_matrix is None:
            logger.warning("No calibration data, returning default focal length")
            return (525.0, 525.0)
        
        fx = self.camera_matrix[0, 0]
        fy = self.camera_matrix[1, 1]
        
        return (fx, fy)
    
    def get_principal_point(self) -> Tuple[float, float]:
        """
        Get principal point (optical center)
        
        Returns:
            Tuple of (cx, cy)
        """
        if self.camera_matrix is None:
            logger.warning("No calibration data, returning image center")
            return (0.0, 0.0)
        
        cx = self.camera_matrix[0, 2]
        cy = self.camera_matrix[1, 2]
        
        return (cx, cy)


class AccuracyValidator:
    """
    Validate measurement accuracy against known reference objects
    """
    
    def __init__(self):
        """Initialize accuracy validator"""
        self.reference_measurements: Dict[str, float] = {}
        logger.info("Accuracy validator initialized")
    
    def add_reference_measurement(self, name: str, value_cm: float):
        """
        Add a reference measurement
        
        Args:
            name: Measurement name
            value_cm: True value in cm
        """
        self.reference_measurements[name] = value_cm
        logger.info(f"Added reference: {name} = {value_cm} cm")
    
    def validate_measurement(
        self,
        name: str,
        measured_value_cm: float,
        tolerance_percent: float = 2.0
    ) -> Tuple[bool, float]:
        """
        Validate a measurement against reference
        
        Args:
            name: Measurement name
            measured_value_cm: Measured value in cm
            tolerance_percent: Acceptable tolerance percentage
            
        Returns:
            Tuple of (is_valid, error_percent)
        """
        if name not in self.reference_measurements:
            logger.warning(f"No reference measurement for {name}")
            return False, 0.0
        
        reference = self.reference_measurements[name]
        error = abs(measured_value_cm - reference)
        error_percent = (error / reference) * 100
        
        is_valid = error_percent <= tolerance_percent
        
        logger.info(
            f"{name}: Reference={reference:.1f}cm, Measured={measured_value_cm:.1f}cm, "
            f"Error={error_percent:.2f}% {'✓' if is_valid else '✗'}"
        )
        
        return is_valid, error_percent
    
    def validate_all_measurements(
        self,
        measurements: Dict[str, float],
        tolerance_percent: float = 2.0
    ) -> Tuple[float, Dict[str, float]]:
        """
        Validate all measurements and calculate overall accuracy
        
        Args:
            measurements: Dictionary of measured values
            tolerance_percent: Acceptable tolerance
            
        Returns:
            Tuple of (accuracy_percent, error_dict)
        """
        errors = {}
        valid_count = 0
        total_count = 0
        
        for name, measured in measurements.items():
            if name in self.reference_measurements:
                is_valid, error = self.validate_measurement(name, measured, tolerance_percent)
                errors[name] = error
                total_count += 1
                if is_valid:
                    valid_count += 1
        
        accuracy = (valid_count / total_count * 100) if total_count > 0 else 0.0
        
        logger.info(f"Overall accuracy: {accuracy:.1f}% ({valid_count}/{total_count} within tolerance)")
        
        return accuracy, errors

