"""
Check which dependencies are available
"""

print("Checking dependencies...")
print("=" * 70)

dependencies = {
    'yaml': 'pyyaml',
    'numpy': 'numpy',
    'cv2': 'opencv-python',
    'PIL': 'pillow',
    'scipy': 'scipy',
    'mediapipe': 'mediapipe',
    'torch': 'torch',
    'open3d': 'open3d',
    'trimesh': 'trimesh',
}

available = []
missing = []

for module, package in dependencies.items():
    try:
        __import__(module)
        print(f"[OK] {package:20} - installed")
        available.append(package)
    except ImportError:
        print(f"[  ] {package:20} - NOT installed")
        missing.append(package)

print("=" * 70)
print(f"\nAvailable: {len(available)}/{len(dependencies)}")
print(f"Missing: {len(missing)}/{len(dependencies)}")

if missing:
    print("\nTo install missing dependencies:")
    print(f"pip install {' '.join(missing)}")
    
print("\nNote: MediaPipe, PyTorch, and some ML libraries require Python 3.8-3.11")
print(f"Current Python version: {__import__('sys').version}")

