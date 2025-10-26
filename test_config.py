"""Test configuration loading"""
from src.utils.config_loader import get_config

try:
    config = get_config()
    print("[OK] Config loaded successfully")
    
    # Test accessing config values
    width = config.get('camera.resolution.width')
    height = config.get('camera.resolution.height')
    print(f"[OK] Camera resolution: {width}x{height}")
    
    fps = config.get('camera.fps')
    print(f"[OK] Camera FPS: {fps}")
    
    model = config.get('models.depth_estimation.model')
    print(f"[OK] Depth model: {model}")
    
    print("\n[SUCCESS] Configuration system working properly!")
    
except Exception as e:
    print(f"[ERROR] Configuration test failed: {e}")
    import traceback
    traceback.print_exc()

