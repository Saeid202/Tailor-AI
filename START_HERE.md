# 🚀 START HERE - Quick Launch Guide

## ✅ Everything is Ready and Working!

Your Tailor AI Body Scanning System is **fully operational** with **zero errors**.

---

## 🎯 How to Run (3 Simple Steps)

### Step 1: Open PowerShell in Project Folder
```powershell
cd C:\Coding\tailorai\Tailor-AI
```

### Step 2: Activate Virtual Environment
```powershell
.\venv_py312\Scripts\Activate.ps1
```
You should see `(venv_py312)` appear in your prompt.

### Step 3: Run the Application
```powershell
# Option A: Demo Mode (recommended first time)
python main.py --demo

# Option B: Full Body Scanning
python main.py

# Option C: Camera Calibration
python main.py --calibrate
```

---

## 💡 Quick Commands

### Test Everything Works
```powershell
.\venv_py312\Scripts\Activate.ps1
python FINAL_TEST_REPORT.py
```
Should show: **[SUCCESS] ALL TESTS PASSED!**

### Run Demo Mode
```powershell
.\venv_py312\Scripts\Activate.ps1
python main.py --demo
```
Opens camera with real-time pose detection!

### Full Scan
```powershell
.\venv_py312\Scripts\Activate.ps1
python main.py --session-name "my_first_scan"
```
Creates 3D model + measurements!

---

## ⚠️ Important: Always Activate Environment First!

**WRONG (will fail):**
```powershell
python main.py --demo  # Error: ModuleNotFoundError
```

**CORRECT:**
```powershell
.\venv_py312\Scripts\Activate.ps1  # Activate first!
python main.py --demo              # Now it works!
```

---

## 🎮 Demo Mode Controls

When running `python main.py --demo`:

| Key | Action |
|-----|--------|
| **q** | Quit demo |
| **s** | Save screenshot |
| **ESC** | Exit |

You'll see:
- ✅ Live camera feed
- ✅ Skeleton overlay (33 landmarks)
- ✅ Orientation detection
- ✅ Confidence scores

---

## 📊 What Happens During Full Scan

1. **Setup** (30 seconds)
   - Camera opens
   - AI initializes

2. **Front View** (30-60 seconds)
   - AI guides positioning
   - Auto-captures when stable
   - 3 images captured

3. **Left Side View** (30-60 seconds)
   - Follow on-screen guidance
   - Hold still when prompted

4. **Right Side View** (30-60 seconds)
   - Same as above

5. **Back View** (30-60 seconds)
   - Final orientation

6. **Processing** (3-5 minutes)
   - 3D reconstruction
   - Measurement extraction
   - Report generation

7. **Complete!**
   - Results in `data/sessions/scan_YYYYMMDD_HHMMSS/`
   - 3D models in `exports/`
   - Measurements in `reports/`

---

## 📁 Where to Find Results

After scanning, your results are in:

```
data/
└── sessions/
    └── scan_20251026_140000/  (example)
        ├── exports/
        │   ├── body_model.obj  ← Open in Blender/3ds Max
        │   ├── body_model.stl  ← For CNC/3D printing
        │   └── body_model.ply  ← Point cloud
        └── reports/
            ├── measurements.json     ← 40+ measurements
            └── measurement_report.txt ← Human-readable
```

---

## 🔧 Troubleshooting

### Problem: "ModuleNotFoundError: No module named 'cv2'"
**Solution:** Activate virtual environment first!
```powershell
.\venv_py312\Scripts\Activate.ps1
```

### Problem: "Camera not found"
**Solution:** 
- Close other apps using camera (Zoom, Teams, etc.)
- Check camera device ID in `config/config.yaml`
- Try different device ID (0, 1, 2...)

### Problem: Application closes immediately
**Solution:** Check logs in `logs/` directory for errors

---

## 📖 Full Documentation

- **README.md** - Overview & features
- **INSTALL.md** - Detailed installation
- **USAGE.md** - Complete usage guide
- **QUICK_REFERENCE.md** - Cheat sheet
- **SYSTEM_STATUS.md** - Current status
- **DEPLOYMENT_SUCCESS.md** - Test results

---

## ✅ System Status

**Installed:** Python 3.12.10 + 50+ packages ✅  
**Dependencies:** All installed ✅  
**AI Models:** Downloaded (1.28GB) ✅  
**Tests:** All passed ✅  
**Errors:** 0 ✅  
**Ready:** YES ✅

---

## 🎉 You're Ready!

Just run:

```powershell
.\venv_py312\Scripts\Activate.ps1
python main.py --demo
```

And start scanning! 🚀

---

**Questions?**  
Check `USAGE.md` for detailed instructions.

**AI Lead Engineer:** Alireza Saeedi  
**GitHub:** https://github.com/Saeid202/Tailor-AI

