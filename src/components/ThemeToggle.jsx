import { useEffect, useState } from 'react'

const THEMES = ['dark', 'company', 'light']
const THEME_LABELS = {
  dark: 'Dark',
  company: 'Company',
  light: 'Light',
}

const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'dark'
  const stored = localStorage.getItem('theme')
  if (THEMES.includes(stored)) return stored
  return window.matchMedia('(prefers-color-scheme: light)').matches
    ? 'light'
    : 'dark'
}

function ThemeToggle() {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove(...THEMES)
    root.classList.add(theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  return (
    <div
      id="theme-toggle"
      className="theme-toggle-group"
      role="radiogroup"
      aria-label="Theme selector"
    >
      {THEMES.map((themeId) => {
        const isActive = theme === themeId
        return (
          <button
            key={themeId}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={`Switch to ${THEME_LABELS[themeId]} theme`}
            className={`theme-toggle-option ${isActive ? 'is-active' : ''}`}
            onClick={() => setTheme(themeId)}
          >
            {THEME_LABELS[themeId]}
          </button>
        )
      })}
    </div>
  )
}

export default ThemeToggle
