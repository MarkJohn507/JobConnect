import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext()

export function useTheme() {
  return useContext(ThemeContext)
}

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('jc-theme')
    return saved ? saved === 'dark' : true
  })

  useEffect(() => {
    localStorage.setItem('jc-theme', dark ? 'dark' : 'light')
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
  }, [dark])

  const toggle = () => setDark(d => !d)

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}
