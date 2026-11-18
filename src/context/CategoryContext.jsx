import { createContext, useContext, useState } from 'react'
import { defaultCategory } from '../data/projects'

// The carousel filter, set from the header and read by the work page
const CategoryContext = createContext(null)

export function CategoryProvider({ children }) {
  const [activeCategory, setActiveCategory] = useState(defaultCategory)

  return (
    <CategoryContext.Provider value={{ activeCategory, setActiveCategory }}>
      {children}
    </CategoryContext.Provider>
  )
}

export const useCategory = () => useContext(CategoryContext)
