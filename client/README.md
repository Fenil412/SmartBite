# SmartBite Frontend

A modern React application for AI-powered meal planning and nutrition optimization.

## 🚀 Features

- **Modern UI/UX**: Built with React, Tailwind CSS, and Framer Motion
- **Vertical Sidebar Layout**: Clean, professional navigation
- **Dark/Light Theme**: System-aware theme switching with persistence
- **Custom Cursor**: Interactive cursor effects (desktop only)
- **Responsive Design**: Mobile-first approach with collapsible sidebar
- **Performance Optimized**: Code splitting, lazy loading, and optimized animations
- **Accessibility**: WCAG-compliant with keyboard navigation and ARIA labels

## 🛠️ Tech Stack

- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **State Management**: Zustand
- **HTTP Client**: Axios + React Query
- **Routing**: React Router
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React

## 📦 Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── home/           # Homepage sections
│   ├── Layout.jsx      # Main layout with sidebar
│   ├── Sidebar.jsx     # Navigation sidebar
│   └── Footer.jsx      # Footer component
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── store/              # Zustand stores
├── api/                # API configuration
├── lib/                # Utility functions
└── styles/             # Global styles
```

## 🎨 Design System

### Colors
- **Primary**: Green shades (health/nutrition theme)
- **Secondary**: Teal shades (complementary)
- **Accent**: Blue, yellow, red for specific use cases

### Typography
- **Font**: Inter (Google Fonts)
- **Sizes**: Responsive scale from text-sm to text-6xl

### Components
- **Cards**: Rounded-3xl with subtle shadows
- **Buttons**: Gradient backgrounds with hover effects
- **Animations**: Subtle fade-in, slide-up, and scale effects

## 🔧 Configuration

### Theme System
- Supports light, dark, and system themes
- Persisted in localStorage
- Smooth transitions between themes

### Custom Cursor
- Automatically disabled on touch devices
- Respects `prefers-reduced-motion`
- Context-aware hover states

### Performance
- Lazy loading for heavy components
- Image optimization with blur placeholders
- Memoized expensive calculations

## 🌐 API Integration

The frontend integrates with:
- **Node.js Backend**: Authentication, user data, meal plans
- **Python ML Service**: AI recommendations (via Node.js proxy)
- **Groq AI**: Chat and insights (via Node.js proxy)

## 📱 Responsive Behavior

- **Desktop**: Fixed sidebar with full navigation
- **Tablet**: Collapsible sidebar with overlay
- **Mobile**: Drawer-style navigation with hamburger menu

## ♿ Accessibility

- WCAG 2.1 AA compliant
- Keyboard navigation support
- Screen reader friendly
- High contrast ratios
- Focus indicators
- Reduced motion support

## 🚀 Deployment

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to your hosting provider

3. **Configure environment variables** for production

## 🤝 Contributing

1. Follow the existing code style
2. Use TypeScript for new components
3. Add proper accessibility attributes
4. Test on multiple devices and browsers
5. Ensure animations respect `prefers-reduced-motion`

## 📄 License

MIT License - see LICENSE file for details