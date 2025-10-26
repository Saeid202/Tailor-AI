# Python Version Compatibility

## ⚠️ Important: Python Version Requirement

**This project requires Python 3.8 - 3.11** (3.9 or 3.10 recommended)

### Why Not Python 3.12+?

Several critical dependencies do not yet have pre-built wheels for Python 3.12 and 3.13:

- **MediaPipe** - Core pose detection library
- **PyTorch** - Deep learning framework (limited 3.12 support)
- **PyTorch3D** - 3D deep learning
- **Some other ML libraries**

## Recommended Setup

### Option 1: Use Python 3.10 or 3.11

1. **Download Python 3.11** from [python.org](https://www.python.org/downloads/)
2. Install and create virtual environment:

```bash
# Windows
python3.11 -m venv venv
.\venv\Scripts\activate

# Linux/Mac
python3.11 -m venv venv
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

### Option 2: Use Conda (Recommended for ML Projects)

```bash
conda create -n tailor-ai python=3.10
conda activate tailor-ai
pip install -r requirements.txt
```

### Option 3: Use pyenv (Linux/Mac)

```bash
pyenv install 3.10.13
pyenv local 3.10.13
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Current Python Version Check

```bash
python --version
```

Should show: `Python 3.8.x`, `3.9.x`, `3.10.x`, or `3.11.x`

## What If I Only Have Python 3.13?

You have two options:

### 1. Install Python 3.10/3.11 alongside (Recommended)

- Windows: Download from python.org and install to different directory
- Linux: Use package manager (`apt install python3.10`)
- Mac: Use Homebrew (`brew install python@3.10`)

### 2. Wait for Dependencies to Update (Not Recommended)

The ML ecosystem is gradually adding Python 3.12/3.13 support, but it may take several months for all dependencies to be fully compatible.

## Testing Without Full Dependencies

If you want to test the project structure without ML dependencies:

```bash
pip install -r requirements_minimal.txt
python test_imports.py
python test_config.py
```

This will verify:
- ✓ Project structure
- ✓ Python syntax
- ✓ Configuration system
- ✓ Basic utilities

But won't be able to run the full body scanning system.

## CI/CD Recommendations

For production deployment, use:

```yaml
python-version: ['3.9', '3.10', '3.11']
```

Do NOT use 3.12+ until all dependencies are verified compatible.

## Docker Alternative

Use the provided Dockerfile (if available) which bundles the correct Python version:

```bash
docker build -t tailor-ai .
docker run -it tailor-ai
```

## Summary

| Python Version | Status | Recommendation |
|----------------|--------|----------------|
| 3.7 and below | ❌ Not supported | Upgrade to 3.9+ |
| 3.8 | ✅ Supported | OK but consider upgrading |
| 3.9 | ✅ Fully Supported | **Recommended** |
| 3.10 | ✅ Fully Supported | **Recommended** |
| 3.11 | ✅ Fully Supported | **Recommended** |
| 3.12 | ⚠️ Partial | Some dependencies missing |
| 3.13 | ❌ Not Yet | Wait for ML ecosystem |

---

**For best experience: Use Python 3.10 or 3.11**

