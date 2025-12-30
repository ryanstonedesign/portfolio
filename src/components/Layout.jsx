import { Outlet } from 'react-router-dom'
import { FooterProvider } from '../context/FooterContext'
import { CategoryProvider } from '../context/CategoryContext'
import Header from './Header'
import Footer from './Footer'
import CustomCursor from './CustomCursor'
import './Layout.css'

function Layout() {
  return (
    <FooterProvider>
      <CategoryProvider>
        <div className="app">
          <CustomCursor />
          <Header />
          <main>
            <Outlet />
          </main>
          <Footer />
        </div>
      </CategoryProvider>
    </FooterProvider>
  )
}

export default Layout
