import { createContext, useContext, useState } from 'react'

const FooterContext = createContext()

export function FooterProvider({ children }) {
  const [centerContent, setCenterContent] = useState(null)

  return (
    <FooterContext.Provider value={{ centerContent, setCenterContent }}>
      {children}
    </FooterContext.Provider>
  )
}

export function useFooter() {
  return useContext(FooterContext)
}

