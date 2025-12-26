import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'system',
      isDark: false,
      
      setTheme: (theme) => {
        set({ theme })
        
        if (theme === 'system') {
          const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
          get().applyTheme(systemDark)
        } else {
          get().applyTheme(theme === 'dark')
        }
      },
      
      applyTheme: (isDark) => {
        set({ isDark })
        
        if (isDark) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      },
      
      initializeTheme: () => {
        const { theme } = get()
        
        if (theme === 'system') {
          const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
          get().applyTheme(systemDark)
          
          // Listen for system theme changes
          window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (get().theme === 'system') {
              get().applyTheme(e.matches)
            }
          })
        } else {
          get().applyTheme(theme === 'dark')
        }
      },
    }),
    {
      name: 'smartbite-theme',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
)

export default useThemeStore