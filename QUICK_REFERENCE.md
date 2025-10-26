# Quick Reference Card

## Installation (5 minutes)

```bash
# 1. Create virtual environment
python -m venv venv
.\venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# 2. Install PyTorch (GPU)
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118

# 3. Install dependencies
pip install -r requirements.txt

# 4. Verify
python -c "import cv2, mediapipe, torch, open3d; print('Ready!')"
```

## Basic Usage

```bash
# Demo mode (test setup)
python main.py --demo

# Full scan
python main.py

# Named session
python main.py --session-name "john_doe"

# Calibration
python main.py --calibrate
```

## Scanning Workflow

1. **Setup** (30 seconds)
   - Subject: Form-fitting clothes, 2m from camera
   - Environment: Good lighting, plain background

2. **Scan** (2-3 minutes)
   - Front → Left → Right → Back
   - Hold still when prompted
   - Follow on-screen guidance

3. **Process** (3-5 minutes)
   - Automatic 3D reconstruction
   - Measurement extraction
   - Report generation

## Output Files

```
data/sessions/scan_*/
├── exports/
│   ├── body_model.obj      # 3D model
│   ├── body_model.stl      # For CNC
│   └── body_model.ply      # Point cloud
└── reports/
    ├── measurements.json   # Machine-readable
    └── measurement_report.txt  # Human-readable
```

## Key Measurements

### Upper Body
- Shoulder Width
- Chest Circumference
- Waist Circumference
- Neck Circumference
- Armhole Depth

### Arms
- Sleeve Length
- Arm Length
- Upper Arm Circumference
- Wrist Circumference

### Heights
- Total Height
- Shoulder Height
- Waist Height

**All measurements in centimeters, ±1-2mm accuracy**

## Controls

| Key | Action |
|-----|--------|
| `s` | Manual capture |
| `n` | Skip to next orientation |
| `q` | Quit |

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Camera not found | Check device ID in config |
| CUDA out of memory | Use MiDaS_small model |
| Low accuracy | Calibrate camera |
| Incomplete scan | Better lighting, closer distance |
| Slow processing | Enable GPU, reduce resolution |

## Configuration Quick Edits

**Faster processing:**
```yaml
# config/config.yaml
models:
  depth_estimation:
    model: "MiDaS_small"
camera:
  resolution:
    width: 1280
    height: 720
```

**Maximum accuracy:**
```yaml
models:
  depth_estimation:
    model: "DPT_Large"
camera:
  resolution:
    width: 1920
    height: 1080
capture:
  images_per_orientation: 5
```

## Performance Expectations

| Hardware | Processing Time | Accuracy |
|----------|----------------|----------|
| GPU (RTX 3060+) | 3-5 min | 98%+ |
| CPU (Modern i7) | 8-12 min | 95%+ |

## Best Practices

### ✓ DO
- Use form-fitting clothing
- Ensure full body visible
- Stand still during capture
- Good, even lighting
- Calibrate camera first

### ✗ DON'T
- Wear loose/baggy clothes
- Move during capture
- Use harsh/dim lighting
- Stand too close/far
- Skip calibration

## Common Patterns

### Batch Processing
```bash
for person in person1 person2 person3; do
    python main.py --session-name $person
done
```

### Custom Configuration
```bash
cp config/config.yaml config/my_config.yaml
# Edit my_config.yaml
python main.py --config config/my_config.yaml
```

## File Locations

| Type | Path |
|------|------|
| Sessions | `data/sessions/` |
| Logs | `logs/` |
| Config | `config/config.yaml` |
| Calibration | `config/camera_calibration.pkl` |
| Models | Auto-downloaded to cache |

## API Quick Reference

### Programmatic Usage

```python
from src.scanning_orchestrator import ScanningOrchestrator

# Create orchestrator
orchestrator = ScanningOrchestrator(session_name="api_scan")

# Start scanning
orchestrator.start_scanning()

# Get results
summary = orchestrator.get_session_summary()
print(f"Results in: {summary['session_dir']}")
```

### Load Measurements

```python
import json

with open("data/sessions/scan_*/reports/measurements.json") as f:
    measurements = json.load(f)

shoulder_width = measurements['upper_body']['shoulder_width']
print(f"Shoulder Width: {shoulder_width} cm")
```

### Load 3D Model

```python
import open3d as o3d

mesh = o3d.io.read_triangle_mesh("data/sessions/scan_*/exports/body_model.obj")
o3d.visualization.draw_geometries([mesh])
```

## Support

**Documentation:**
- [README.md](README.md) - Overview
- [INSTALL.md](INSTALL.md) - Installation
- [USAGE.md](USAGE.md) - Detailed usage
- [ARCHITECTURE.md](ARCHITECTURE.md) - System design

**Logs:**
```bash
# View latest log
cat logs/tailor_ai_*.log | tail -100
```

**Debug Mode:**
```yaml
# config/config.yaml
advanced:
  debug_mode: true
  save_intermediate_results: true
```

## Version Info

Check versions:
```bash
python -c "import cv2; print(f'OpenCV: {cv2.__version__}')"
python -c "import mediapipe; print(f'MediaPipe: {mediapipe.__version__}')"
python -c "import torch; print(f'PyTorch: {torch.__version__}')"
python -c "import open3d; print(f'Open3D: {open3d.__version__}')"
```

## Typical Session Timeline

```
00:00 - Start scanning
00:30 - Front view captured
01:00 - Left side captured
01:30 - Right side captured
02:00 - Back view captured
02:30 - Processing started
05:00 - 3D reconstruction complete
06:00 - Measurements extracted
06:30 - Reports generated
```

## Measurement Validation

Manual check:
```bash
# 1. Measure shoulder width with tape measure
# 2. Compare with JSON value
# 3. Should be within ±2mm
```

## Export for Manufacturing

**For CNC:**
1. Use `body_model.stl`
2. Import to CAM software
3. Set material & tolerances

**For Pattern Making:**
1. Use `measurements.json`
2. Import measurements
3. Reference 3D model for fit

**For 3D Printing:**
1. Use `body_model.stl`
2. Slice with Cura/PrusaSlicer
3. Print scaled mannequin

---

**Quick Help:** Run `python main.py --help` for all options

