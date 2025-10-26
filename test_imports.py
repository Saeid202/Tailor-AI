"""
Test script to check if all modules can be imported
"""
import sys
from pathlib import Path

def test_basic_imports():
    """Test basic Python imports"""
    errors = []
    
    # Test standard library imports
    try:
        import yaml
        print("[OK] yaml imported successfully")
    except ImportError as e:
        errors.append(f"[FAIL] yaml: {e}")
    
    # Test if src package structure is correct
    try:
        import src
        print("[OK] src package structure OK")
    except ImportError as e:
        errors.append(f"[FAIL] src package: {e}")
    
    # Test utils module imports (without dependencies)
    try:
        from src.utils.config_loader import ConfigLoader
        print("[OK] ConfigLoader can be imported")
    except ImportError as e:
        errors.append(f"[FAIL] ConfigLoader: {e}")
    except Exception as e:
        print(f"[WARN] ConfigLoader import OK but has dependency issues: {e}")
    
    return errors

def test_file_structure():
    """Test that all required files exist"""
    required_files = [
        'main.py',
        'requirements.txt',
        'config/config.yaml',
        'src/__init__.py',
        'src/camera/__init__.py',
        'src/camera/camera_controller.py',
        'src/vision/__init__.py',
        'src/vision/pose_detector.py',
        'src/vision/orientation_detector.py',
        'src/vision/body_segmentation.py',
        'src/vision/depth_estimator.py',
        'src/reconstruction/__init__.py',
        'src/reconstruction/point_cloud_processor.py',
        'src/reconstruction/body_reconstructor.py',
        'src/measurements/__init__.py',
        'src/measurements/body_measurements.py',
        'src/utils/__init__.py',
        'src/utils/config_loader.py',
        'src/utils/logger.py',
        'src/utils/image_processing.py',
        'src/utils/calibration.py',
        'src/scanning_orchestrator.py',
    ]
    
    missing = []
    for file_path in required_files:
        if not Path(file_path).exists():
            missing.append(file_path)
        else:
            print(f"[OK] {file_path}")
    
    return missing

def test_syntax():
    """Test Python syntax of all files"""
    import py_compile
    import glob
    
    errors = []
    py_files = glob.glob('src/**/*.py', recursive=True) + ['main.py']
    
    for py_file in py_files:
        try:
            py_compile.compile(py_file, doraise=True)
            print(f"[OK] Syntax OK: {py_file}")
        except py_compile.PyCompileError as e:
            errors.append(f"[FAIL] Syntax error in {py_file}: {e}")
    
    return errors

if __name__ == "__main__":
    print("=" * 70)
    print("TESTING TAILOR AI BODY SCANNING SYSTEM")
    print("=" * 70)
    print()
    
    # Test 1: File Structure
    print("TEST 1: File Structure")
    print("-" * 70)
    missing_files = test_file_structure()
    if missing_files:
        print(f"\n[FAIL] Missing files: {len(missing_files)}")
        for f in missing_files:
            print(f"  - {f}")
    else:
        print("\n[PASS] All required files present")
    print()
    
    # Test 2: Syntax Check
    print("TEST 2: Python Syntax")
    print("-" * 70)
    syntax_errors = test_syntax()
    if syntax_errors:
        print(f"\n[FAIL] Syntax errors found: {len(syntax_errors)}")
        for e in syntax_errors:
            print(f"  {e}")
    else:
        print("\n[PASS] All Python files have valid syntax")
    print()
    
    # Test 3: Basic Imports (without heavy dependencies)
    print("TEST 3: Basic Imports")
    print("-" * 70)
    import_errors = test_basic_imports()
    if import_errors:
        print(f"\n[WARN] Some imports failed (may need dependencies): {len(import_errors)}")
        for e in import_errors:
            print(f"  {e}")
    else:
        print("\n[PASS] Basic imports successful")
    print()
    
    # Summary
    print("=" * 70)
    print("SUMMARY")
    print("=" * 70)
    
    total_errors = len(missing_files) + len(syntax_errors)
    
    if total_errors == 0:
        print("[SUCCESS] ALL CRITICAL TESTS PASSED!")
        print("[SUCCESS] Project structure is correct")
        print("[SUCCESS] No syntax errors found")
        print("[SUCCESS] Ready for dependency installation")
        sys.exit(0)
    else:
        print(f"[ERROR] {total_errors} critical errors found")
        print("Please fix errors before proceeding")
        sys.exit(1)

