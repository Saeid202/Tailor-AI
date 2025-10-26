# Installation Guide

## System Requirements

### Hardware
- **Camera**: USB webcam or built-in camera (1080p recommended)
- **GPU**: NVIDIA GPU with CUDA support (recommended for depth estimation)
- **RAM**: 16GB minimum, 32GB recommended
- **Storage**: 10GB free space

### Software
- **OS**: Windows 10/11, Linux (Ubuntu 20.04+), macOS 11+
- **Python**: 3.8 - 3.10 (3.9 recommended)
- **CUDA**: 11.7+ (if using GPU)

## Installation Steps

### 1. Clone Repository

```bash
git clone <repository-url>
cd Tailor-AI
```

### 2. Create Virtual Environment

**Windows:**
```powershell
python -m venv venv
.\venv\Scripts\activate
```

**Linux/macOS:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install PyTorch

**With CUDA (GPU):**
```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

**CPU Only:**
```bash
pip install torch torchvision torchaudio
```

### 4. Install Dependencies

```bash
pip install -r requirements.txt
```

**Note on Detectron2:**
If Detectron2 installation fails, install it manually:

**Windows:**
```powershell
pip install detectron2 -f https://dl.fbaipublicfiles.com/detectron2/wheels/cu118/torch2.0/index.html
```

**Linux:**
```bash
python -m pip install 'git+https://github.com/facebookresearch/detectron2.git'
```

### 5. Install PyTorch3D

**With CUDA:**
```bash
pip install "git+https://github.com/facebookresearch/pytorch3d.git@stable"
```

**CPU Only:**
```bash
pip install --no-index --no-cache-dir pytorch3d -f https://dl.fbaipublicfiles.com/pytorch3d/packaging/wheels/py39_cu118_pyt201/download.html
```

### 6. Verify Installation

```bash
python -c "import cv2, mediapipe, torch, open3d; print('All core dependencies installed!')"
```

## Post-Installation Setup

### 1. Camera Calibration (Optional but Recommended)

For maximum accuracy, calibrate your camera:

```bash
# 1. Print calibration pattern
# Download from: https://raw.githubusercontent.com/opencv/opencv/master/doc/pattern.png

# 2. Create calibration directory
mkdir -p data/calibration

# 3. Capture calibration images (10-15 images from different angles)
# Save them in data/calibration/

# 4. Run calibration
python main.py --calibrate
```

### 2. Test Demo Mode

```bash
python main.py --demo
```

This will show real-time pose detection and orientation guidance.

### 3. Run First Scan

```bash
python main.py
```

## Troubleshooting

### Issue: "No module named 'detectron2'"

**Solution:**
```bash
pip install 'git+https://github.com/facebookresearch/detectron2.git'
```

### Issue: "CUDA out of memory"

**Solutions:**
1. Use smaller depth model: Edit `config/config.yaml`:
   ```yaml
   models:
     depth_estimation:
       model: "MiDaS_small"
   ```

2. Reduce camera resolution in config:
   ```yaml
   camera:
     resolution:
       width: 1280
       height: 720
   ```

### Issue: "Camera not found"

**Solutions:**
1. Check camera device ID in `config/config.yaml`
2. Try different device IDs (0, 1, 2...)
3. Ensure no other application is using the camera

### Issue: MediaPipe fails to load

**Solution:**
```bash
pip uninstall mediapipe
pip install mediapipe==0.10.8
```

### Issue: Open3D visualization doesn't work

**Linux Solution:**
```bash
sudo apt-get install libgl1-mesa-glx libglib2.0-0
```

## GPU Acceleration

To enable GPU acceleration:

1. Install NVIDIA drivers (latest version)
2. Install CUDA Toolkit 11.8+
3. Install PyTorch with CUDA support (see step 3 above)
4. Verify GPU is available:
   ```bash
   python -c "import torch; print(f'CUDA available: {torch.cuda.is_available()}')"
   ```

## Performance Optimization

### For Maximum Accuracy (98%+):
- Use GPU acceleration
- Use `DPT_Large` depth model
- Camera resolution: 1920x1080
- Good lighting conditions
- Calibrated camera

### For Faster Processing:
- Use CPU (acceptable for most use cases)
- Use `MiDaS_small` depth model
- Camera resolution: 1280x720
- Model complexity: 1 (in config)

## Next Steps

After successful installation:
1. Read [README.md](README.md) for usage instructions
2. Review [config/config.yaml](config/config.yaml) for customization
3. Run demo mode to test your setup
4. Perform camera calibration for best results
5. Start your first body scan!

## Support

For issues and questions:
- Check [Troubleshooting](#troubleshooting) section
- Review GitHub Issues
- Check logs in `logs/` directory

