"""
Test depth estimation model loading
This will download the DPT model from PyTorch Hub (~400MB)
"""
import torch
import numpy as np
import cv2

print("=" * 70)
print("DEPTH ESTIMATION MODEL TEST")
print("=" * 70)
print()

print("Loading DPT-Large model from PyTorch Hub...")
print("(This will download ~400MB on first run)")
print()

try:
    # Check CUDA availability
    if torch.cuda.is_available():
        device = "CUDA GPU"
        gpu_name = torch.cuda.get_device_name(0)
        print(f"[OK] GPU Available: {gpu_name}")
    else:
        device = "CPU"
        print(f"[INFO] Using CPU (GPU not available)")
    
    print(f"[INFO] Device: {device}")
    print()
    
    # Load model (this may take a while on first run)
    print("[INFO] Loading MiDaS DPT_Large model...")
    model = torch.hub.load("intel-isl/MiDaS", "DPT_Large", trust_repo=True)
    print("[OK] Model loaded successfully!")
    
    # Load transforms
    midas_transforms = torch.hub.load("intel-isl/MiDaS", "transforms", trust_repo=True)
    transform = midas_transforms.dpt_transform
    print("[OK] Transform loaded successfully!")
    
    # Test with a dummy image
    print()
    print("[INFO] Testing with dummy image...")
    dummy_image = np.random.randint(0, 255, (480, 640, 3), dtype=np.uint8)
    
    # Convert to RGB
    image_rgb = cv2.cvtColor(dummy_image, cv2.COLOR_BGR2RGB)
    
    # Transform
    input_batch = transform(image_rgb)
    
    # Set device
    device_torch = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device_torch)
    model.eval()
    input_batch = input_batch.to(device_torch)
    
    # Predict
    with torch.no_grad():
        prediction = model(input_batch)
        prediction = torch.nn.functional.interpolate(
            prediction.unsqueeze(1),
            size=dummy_image.shape[:2],
            mode="bicubic",
            align_corners=False,
        ).squeeze()
    
    depth_map = prediction.cpu().numpy()
    print(f"[OK] Depth prediction successful! Shape: {depth_map.shape}")
    
    print()
    print("=" * 70)
    print("[SUCCESS] DEPTH ESTIMATION MODEL FULLY FUNCTIONAL!")
    print("=" * 70)
    print()
    print("Model cached and ready for body scanning!")
    
except Exception as e:
    print()
    print(f"[FAIL] Depth model test failed: {e}")
    import traceback
    traceback.print_exc()

