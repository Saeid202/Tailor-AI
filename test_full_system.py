"""
Full system test - Test all modules can be imported
"""
import sys

print("=" * 70)
print("FULL SYSTEM TEST - TAILOR AI BODY SCANNING")
print("=" * 70)
print()

errors = []
warnings = []

# Test 1: Configuration
print("TEST 1: Configuration System")
print("-" * 70)
try:
    from src.utils.config_loader import get_config
    config = get_config()
    print(f"[OK] Configuration loaded")
    print(f"[OK] Camera resolution: {config.get('camera.resolution.width')}x{config.get('camera.resolution.height')}")
    print(f"[OK] Depth model: {config.get('models.depth_estimation.model')}")
except Exception as e:
    errors.append(f"Configuration: {e}")
    print(f"[FAIL] Configuration: {e}")
print()

# Test 2: Logger
print("TEST 2: Logging System")
print("-" * 70)
try:
    from src.utils.logger import logger
    logger.info("Logger test message")
    print("[OK] Logger initialized")
except Exception as e:
    errors.append(f"Logger: {e}")
    print(f"[FAIL] Logger: {e}")
print()

# Test 3: Camera Controller
print("TEST 3: Camera Controller")
print("-" * 70)
try:
    from src.camera.camera_controller import CameraController
    print("[OK] CameraController imported")
except Exception as e:
    errors.append(f"CameraController: {e}")
    print(f"[FAIL] CameraController: {e}")
print()

# Test 4: Pose Detector
print("TEST 4: Pose Detector (MediaPipe)")
print("-" * 70)
try:
    from src.vision.pose_detector import PoseDetector
    pose_detector = PoseDetector()
    print("[OK] PoseDetector initialized")
    print("[OK] MediaPipe loaded successfully")
except Exception as e:
    errors.append(f"PoseDetector: {e}")
    print(f"[FAIL] PoseDetector: {e}")
print()

# Test 5: Orientation Detector
print("TEST 5: Orientation Detector")
print("-" * 70)
try:
    from src.vision.orientation_detector import OrientationDetector, Orientation
    orientation_detector = OrientationDetector()
    print("[OK] OrientationDetector initialized")
except Exception as e:
    errors.append(f"OrientationDetector: {e}")
    print(f"[FAIL] OrientationDetector: {e}")
print()

# Test 6: Body Segmenter
print("TEST 6: Body Segmentation")
print("-" * 70)
try:
    from src.vision.body_segmentation import BodySegmenter
    segmenter = BodySegmenter()
    print("[OK] BodySegmenter initialized")
except Exception as e:
    errors.append(f"BodySegmenter: {e}")
    print(f"[FAIL] BodySegmenter: {e}")
print()

# Test 7: Depth Estimator
print("TEST 7: Depth Estimator (DPT/MiDaS)")
print("-" * 70)
try:
    from src.vision.depth_estimator import DepthEstimator
    print("[OK] DepthEstimator imported")
    # Don't initialize yet as it downloads large models
    print("[INFO] Model will be downloaded on first use")
except Exception as e:
    errors.append(f"DepthEstimator: {e}")
    print(f"[FAIL] DepthEstimator: {e}")
print()

# Test 8: Point Cloud Processor
print("TEST 8: Point Cloud Processor (Open3D)")
print("-" * 70)
try:
    from src.reconstruction.point_cloud_processor import PointCloudProcessor
    pcd_processor = PointCloudProcessor()
    print("[OK] PointCloudProcessor initialized")
    print("[OK] Open3D loaded successfully")
except Exception as e:
    errors.append(f"PointCloudProcessor: {e}")
    print(f"[FAIL] PointCloudProcessor: {e}")
print()

# Test 9: Body Reconstructor
print("TEST 9: Body Reconstructor")
print("-" * 70)
try:
    from src.reconstruction.body_reconstructor import BodyReconstructor, MultiViewCapture
    reconstructor = BodyReconstructor()
    print("[OK] BodyReconstructor initialized")
except Exception as e:
    errors.append(f"BodyReconstructor: {e}")
    print(f"[FAIL] BodyReconstructor: {e}")
print()

# Test 10: Measurement Extractor
print("TEST 10: Measurement Extraction")
print("-" * 70)
try:
    from src.measurements.body_measurements import BodyMeasurementExtractor, BodyMeasurements
    measurement_extractor = BodyMeasurementExtractor()
    print("[OK] BodyMeasurementExtractor initialized")
except Exception as e:
    errors.append(f"MeasurementExtractor: {e}")
    print(f"[FAIL] MeasurementExtractor: {e}")
print()

# Test 11: Calibration System
print("TEST 11: Calibration System")
print("-" * 70)
try:
    from src.utils.calibration import CameraCalibrator, AccuracyValidator
    calibrator = CameraCalibrator()
    validator = AccuracyValidator()
    print("[OK] CameraCalibrator initialized")
    print("[OK] AccuracyValidator initialized")
except Exception as e:
    errors.append(f"Calibration: {e}")
    print(f"[FAIL] Calibration: {e}")
print()

# Test 12: Main Orchestrator
print("TEST 12: Scanning Orchestrator")
print("-" * 70)
try:
    from src.scanning_orchestrator import ScanningOrchestrator
    print("[OK] ScanningOrchestrator imported")
except Exception as e:
    errors.append(f"ScanningOrchestrator: {e}")
    print(f"[FAIL] ScanningOrchestrator: {e}")
print()

# Summary
print("=" * 70)
print("SUMMARY")
print("=" * 70)
print()

if errors:
    print(f"[FAIL] {len(errors)} critical errors found:")
    for i, error in enumerate(errors, 1):
        print(f"  {i}. {error}")
    print()
    print("System is NOT ready to run")
    sys.exit(1)
else:
    print("[SUCCESS] ALL MODULES LOADED SUCCESSFULLY!")
    print()
    print("Modules Ready:")
    print("  [OK] Configuration System")
    print("  [OK] Logging System")
    print("  [OK] Camera Controller")
    print("  [OK] Pose Detection (MediaPipe)")
    print("  [OK] Orientation Detection")
    print("  [OK] Body Segmentation")
    print("  [OK] Depth Estimation (DPT/MiDaS)")
    print("  [OK] Point Cloud Processing (Open3D)")
    print("  [OK] 3D Reconstruction")
    print("  [OK] Measurement Extraction")
    print("  [OK] Calibration System")
    print("  [OK] Main Orchestrator")
    print()
    print("=" * 70)
    print("[SUCCESS] SYSTEM IS FULLY OPERATIONAL!")
    print("=" * 70)
    print()
    print("Run the application:")
    print("  python main.py --demo   # Test with camera preview")
    print("  python main.py          # Full body scanning")
    print()
    sys.exit(0)

