import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

  const toggleTheme = () => {
    const root = document.documentElement
    if (root.classList.contains('dark')) {
      root.classList.remove('dark')
      localStorage.setItem('karken-theme', 'light')
      setIsDark(false)
    } else {
      root.classList.add('dark')
      localStorage.setItem('karken-theme', 'dark')
      setIsDark(true)
    }
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/40 dark:bg-[#0E2431]/40 backdrop-blur-md hover:bg-slate-200/50 dark:hover:bg-white/10 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-karken-yellow"
      aria-label="Alternar tema"
      title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-karken-yellow transition-transform duration-300 rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="h-5 w-5 text-karken-dark dark:text-white transition-transform duration-300 rotate-0 hover:-rotate-12" />
      )}
    </button>
  )
}
