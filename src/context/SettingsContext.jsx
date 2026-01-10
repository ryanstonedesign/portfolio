import { createContext, useContext, useState } from 'react'

const SettingsContext = createContext()

export function SettingsProvider({ children }) {
  const [carouselSpeed, setCarouselSpeed] = useState(2000)
  const [imageTransition, setImageTransition] = useState('instant')
  const [imageOpacity, setImageOpacity] = useState('full')

  return (
    <SettingsContext.Provider value={{ 
      carouselSpeed, 
      setCarouselSpeed,
      imageTransition,
      setImageTransition,
      imageOpacity,
      setImageOpacity
    }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}

