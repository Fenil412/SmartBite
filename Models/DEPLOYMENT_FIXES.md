# Render Deployment Memory Fixes

## Issues Fixed

### 1. Python 3.13 Compatibility Error
**Problem**: Pandas 2.2.3 compilation fails with Python 3.13.4 due to `_PyLong_AsByteArray` API changes.

**Solution**:
- Added `runtime.txt` specifying Python 3.11.9
- Updated `render.yaml` to use Python 3.11.9
- Reverted pandas to 2.1.4 for better compatibility
- Reverted numpy to 1.24.4 for compatibility

### 2. Rust Compilation Error (maturin/cargo)
**Problem**: Some packages require Rust compilation which fails on Render's read-only filesystem.

**Solution**:
- Downgraded pydantic from 2.5.2 to 2.4.2 (newer versions use Rust)
- Removed openpyxl and xlsxwriter (optional Excel dependencies)
- Created minimal requirements.txt as backup option

### 3. Memory Usage Optimization (512Mi Limit)
**Problem**: Application exceeds 512Mi memory limit during startup due to heavy ML libraries.

**Solutions**:
- **Lazy Loading**: Removed module-level imports of ML services
- **Removed Unused Imports**: Eliminated `normalize_payload` import (unused)
- **Optional Dependencies**: Made Excel export libraries optional
- **Gunicorn Optimization**: 
  - Reduced threads from 2 to 1
  - Reduced max-requests from 1000 to 500
  - Removed `--preload` flag to prevent early loading
- **Memory Environment Variables**:
  - Added `PYTHONUNBUFFERED=1` for better memory management
  - Added `MALLOC_TRIM_THRESHOLD_=100000` for memory trimming

### 4. Lazy Loading Implementation
**Files Modified**:
- `Models/app/api/routes.py`: Implemented lazy loading for `predict_distribution` and `optimize_week`
- `Models/app/api/analytics.py`: Lazy loading for pandas and openpyxl in Excel export
- `Models/app/api/admin.py`: Lazy loading for pandas and openpyxl in Excel/CSV export
- `Models/app/services/weekly_optimizer.py`: Lazy loading for pulp library
- Added fallback distributions when ML model fails to load
- Added fallback optimization when pulp library fails to load

### 5. Heavy Libraries Identified and Optimized
**Libraries with Lazy Loading**:
- `pandas` (used only for Excel/CSV exports)
- `openpyxl` (used only for Excel exports - now optional)
- `sentence-transformers` (already had lazy loading)
- `faiss-cpu` (already had lazy loading)
- `joblib` (ML model loading - now lazy)
- `pulp` (linear programming - now lazy)

## Files Changed
- `Models/runtime.txt` (updated to Python 3.11.9)
- `Models/render.yaml` (updated Python version)
- `Models/Procfile`
- `Models/requirements.txt` (downgraded problematic packages)
- `Models/requirements-minimal.txt` (new - backup option)
- `Models/app/api/routes.py`
- `Models/app/api/analytics.py`
- `Models/app/api/admin.py`
- `Models/app/services/weekly_optimizer.py`

## Deployment Command
The start command is now optimized for memory:
```bash
gunicorn app.main:app --workers 1 --threads 1 --timeout 120 --max-requests 500 --max-requests-jitter 50
```

## Package Version Strategy
**Current requirements.txt**:
- pandas==2.1.4 (stable, no Rust compilation)
- numpy==1.24.4 (compatible with pandas 2.1.4)
- pydantic==2.4.2 (before Rust adoption)
- Removed openpyxl, xlsxwriter (optional Excel dependencies)

**Backup requirements-minimal.txt** (if issues persist):
- Only core Flask dependencies
- No pandas, numpy, or ML libraries
- All advanced features will use fallbacks

## Expected Results
- Python 3.13 compilation errors should be resolved
- Rust compilation errors should be resolved
- Memory usage should stay under 512Mi limit
- ML features will still work via lazy loading
- Graceful fallbacks when ML libraries unavailable
- Excel/CSV exports will work when dependencies are available

## Fallback Behaviors
- **ML Model Unavailable**: Uses default meal distribution (25% breakfast, 30% lunch, 35% dinner, 10% snacks)
- **Pulp Unavailable**: Uses simple daily calorie target for all days
- **Pandas/openpyxl Unavailable**: Excel/CSV exports return error message, JSON exports still work
- **Sentence Transformers Unavailable**: Returns dummy embeddings
- **FAISS Unavailable**: Skips vector operations

## Troubleshooting
If deployment still fails:
1. Replace `requirements.txt` with `requirements-minimal.txt`
2. All ML features will use fallback implementations
3. Excel exports will be disabled but JSON exports will work
4. Core Flask API functionality will remain intact

## Memory Optimization Summary
1. **Startup Memory**: Reduced by removing heavy imports at module level
2. **Runtime Memory**: Libraries loaded only when needed
3. **Gunicorn Settings**: Optimized for low memory usage
4. **Python Version**: Fixed compatibility issues
5. **Package Versions**: Used stable versions without Rust compilation
6. **Environment Variables**: Added memory management settings