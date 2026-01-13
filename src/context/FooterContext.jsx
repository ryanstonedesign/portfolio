import { createContext, useContext, useState, useRef } from 'react'

const FooterContext = createContext()

export function FooterProvider({ children }) {
  const [centerContent, setCenterContent] = useState(null)
  const onPrevRef = useRef(null)
  const onNextRef = useRef(null)

  const setNavigation = (onPrev, onNext) => {
    onPrevRef.current = onPrev
    onNextRef.current = onNext
  }

  const clearNavigation = () => {
    onPrevRef.current = null
    onNextRef.current = null
  }

  return (
    <FooterContext.Provider value={{ 
      centerContent, 
      setCenterContent,
      onPrevRef,
      onNextRef,
      setNavigation,
      clearNavigation
    }}>
      {children}
    </FooterContext.Provider>
  )
}

export function useFooter() {
  return useContext(FooterContext)
}




