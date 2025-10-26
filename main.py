"""
Tailor AI - Advanced 3D Body Scanning System
Main Application Entry Point

Usage:
    python main.py [--session-name SESSION_NAME] [--config CONFIG_PATH]
"""
import argparse
import sys
from pathlib import Path

from src.scanning_orchestrator import ScanningOrchestrator
from src.utils.logger import logger
from src.utils.config_loader import get_config


def print_banner():
    """Print application banner"""
    banner = """
    ╔═══════════════════════════════════════════════════════════════╗
    ║                                                               ║
    ║                       TAILOR AI                               ║
    ║                                                               ║
    ║          Advanced 3D Body Scanning System                     ║
    ║          98%+ Measurement Accuracy for CNC Manufacturing      ║
    ║                                                               ║
    ╚═══════════════════════════════════════════════════════════════╝
    
    Features:
    ✓ AI-Guided Multi-View Capture (Front, Side, Back)
    ✓ Real-time Pose Detection & Orientation Guidance
    ✓ Advanced 3D Reconstruction (SMPL-X + Neural Depth)
    ✓ High-Precision Body Measurements
    ✓ CNC-Ready 3D Models (OBJ, PLY, STL)
    
    """
    print(banner)


def progress_callback(progress: float, state: str):
    """
    Progress callback for scanning updates
    
    Args:
        progress: Progress percentage (0-100)
        state: Current scanning state
    """
    # Simple progress indicator
    bar_length = 50
    filled = int(bar_length * progress / 100)
    bar = '█' * filled + '░' * (bar_length - filled)
    print(f'\r[{bar}] {progress:.1f}% - {state}', end='', flush=True)


def main():
    """Main application entry point"""
    
    # Parse command line arguments
    parser = argparse.ArgumentParser(
        description="Tailor AI - Advanced 3D Body Scanning System"
    )
    parser.add_argument(
        '--session-name',
        type=str,
        default=None,
        help='Name for this scanning session'
    )
    parser.add_argument(
        '--config',
        type=str,
        default='config/config.yaml',
        help='Path to configuration file'
    )
    parser.add_argument(
        '--calibrate',
        action='store_true',
        help='Run camera calibration mode'
    )
    parser.add_argument(
        '--demo',
        action='store_true',
        help='Run in demo mode (preview only)'
    )
    
    args = parser.parse_args()
    
    # Print banner
    print_banner()
    
    # Load configuration
    try:
        config = get_config(args.config)
        logger.info(f"Configuration loaded from {args.config}")
    except Exception as e:
        logger.error(f"Failed to load configuration: {e}")
        return 1
    
    # Camera calibration mode
    if args.calibrate:
        logger.info("Starting camera calibration mode...")
        from src.utils.calibration import CameraCalibrator
        
        calibrator = CameraCalibrator()
        
        print("\nCamera Calibration Instructions:")
        print("1. Print a checkerboard pattern (9x6 inner corners, 25mm squares)")
        print("2. Capture 10-15 images of the checkerboard from different angles")
        print("3. Save images in 'data/calibration/' directory")
        print("\nPress Enter when ready...")
        input()
        
        # Find calibration images
        calibration_dir = Path("data/calibration")
        if not calibration_dir.exists():
            logger.error("Calibration directory not found: data/calibration/")
            return 1
        
        image_paths = list(calibration_dir.glob("*.jpg")) + list(calibration_dir.glob("*.png"))
        
        if not image_paths:
            logger.error("No calibration images found in data/calibration/")
            return 1
        
        logger.info(f"Found {len(image_paths)} calibration images")
        
        # Calibrate
        success = calibrator.calibrate_from_images(image_paths, show_detections=True)
        
        if success:
            # Save calibration
            calibration_file = Path("config/camera_calibration.pkl")
            calibrator.save_calibration(calibration_file)
            logger.info(f"Calibration saved to {calibration_file}")
            print("\n✓ Camera calibration successful!")
        else:
            logger.error("Camera calibration failed")
            return 1
        
        return 0
    
    # Demo mode (preview only)
    if args.demo:
        logger.info("Starting demo mode...")
        from src.camera.camera_controller import CameraController
        from src.vision.pose_detector import PoseDetector
        from src.vision.orientation_detector import OrientationDetector
        
        camera = CameraController()
        pose_detector = PoseDetector()
        orientation_detector = OrientationDetector()
        
        def demo_callback(frame):
            """Demo frame processing"""
            landmarks = pose_detector.detect(frame)
            if landmarks:
                frame = pose_detector.draw_landmarks(frame, landmarks, draw_connections=True)
                orientation, confidence = orientation_detector.detect_orientation(landmarks)
                frame = orientation_detector.draw_orientation_overlay(
                    frame, orientation, confidence
                )
            return frame
        
        camera.open()
        camera.preview(window_name="Tailor AI - Demo Mode", callback=demo_callback)
        camera.release()
        pose_detector.release()
        
        return 0
    
    # Main scanning mode
    logger.info("=" * 70)
    logger.info("STARTING BODY SCANNING SESSION")
    logger.info("=" * 70)
    
    print("\nInstructions:")
    print("1. Stand 2 meters from the camera")
    print("2. Wear form-fitting clothing for best results")
    print("3. Ensure good lighting (avoid shadows)")
    print("4. Follow on-screen guidance for each orientation")
    print("5. Hold still when prompted for capture")
    print("\nControls:")
    print("  - 's': Manual capture")
    print("  - 'n': Skip to next orientation")
    print("  - 'q': Quit scanning")
    print("\nPress Enter to start...")
    input()
    
    try:
        # Create scanning orchestrator
        orchestrator = ScanningOrchestrator(session_name=args.session_name)
        
        # Start scanning
        orchestrator.start_scanning(callback=progress_callback)
        
        # Get session summary
        summary = orchestrator.get_session_summary()
        
        print("\n\n" + "=" * 70)
        print("SCANNING SESSION COMPLETE")
        print("=" * 70)
        print(f"\nSession: {summary['session_name']}")
        print(f"Total Captures: {summary['total_captures']}")
        print(f"Output Directory: {summary['session_dir']}")
        print("\nGenerated Files:")
        print("  - 3D Models: exports/body_model.obj, .ply, .stl")
        print("  - Point Cloud: exports/body_model_pointcloud.ply")
        print("  - Measurements: reports/measurements.json")
        print("  - Report: reports/measurement_report.txt")
        print("\n" + "=" * 70)
        
        logger.info("Application completed successfully")
        return 0
        
    except KeyboardInterrupt:
        print("\n\nScanning interrupted by user")
        logger.info("Scanning interrupted by user")
        return 0
        
    except Exception as e:
        logger.error(f"Error during scanning: {e}", exc_info=True)
        print(f"\n\nError: {e}")
        return 1


if __name__ == "__main__":
    sys.exit(main())

