import { createContext, useContext, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

const TransitionContext = createContext()

export function TransitionProvider({ children }) {
  const [isExiting, setIsExiting] = useState(false)
  const navigate = useNavigate()

  const transitionTo = useCallback((path) => {
    setIsExiting(true)
    
    // Wait for exit animation, then navigate
    setTimeout(() => {
      navigate(path)
      setIsExiting(false)
    }, 1000) // 1000ms for exit animation
  }, [navigate])

  return (
    <TransitionContext.Provider value={{ isExiting, transitionTo }}>
      {children}
    </TransitionContext.Provider>
  )
}

export function useTransition() {
  const context = useContext(TransitionContext)
  if (!context) {
    throw new Error('useTransition must be used within a TransitionProvider')
  }
  return context
}
