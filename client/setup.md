# SmartBite Frontend Setup

## Node.js Version Compatibility

This project is configured to work with **Node.js 18.18.0** and above.

## Quick Setup

1. **Navigate to client directory**:
   ```bash
   cd client
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open browser**: http://localhost:5173

## Configuration

- **Frontend**: http://localhost:5173
- **Node.js API**: http://localhost:8000
- **Flask/Python API**: http://localhost:5000

## Troubleshooting

### If you get Vite version errors:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### If you get dependency conflicts:
```bash
# Use legacy peer deps
npm install --legacy-peer-deps
```

### If you get port conflicts:
- Change port in `vite.config.js` if 5173 is occupied
- Ensure backend servers are running on correct ports

## Backend Integration

The frontend is configured to:
- Proxy `/api` requests to Node.js server (port 8000)
- Handle authentication via JWT tokens
- Support both light and dark themes
- Provide responsive design for all devices

## Features Included

✅ Vertical sidebar navigation
✅ Custom cursor (desktop only)
✅ Theme switcher (light/dark/system)
✅ Responsive design
✅ Smooth animations
✅ Accessibility features
✅ Performance optimizations