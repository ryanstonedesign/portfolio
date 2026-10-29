import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { FooterProvider } from '../context/FooterContext'
import { TransitionProvider } from '../context/TransitionContext'
import Header from './Header'
import Footer from './Footer'
import CustomCursor from './CustomCursor'
import PageTransition from './PageTransition'
import './Layout.css'

function Layout() {
  const { pathname } = useLocation()
  const isPrivate = pathname === '/private'
  const isHome = pathname === '/' || isPrivate

  // Private section uses the dark theme
  useEffect(() => {
    if (isPrivate) {
      document.documentElement.dataset.theme = 'dark'
    } else {
      delete document.documentElement.dataset.theme
    }
  }, [isPrivate])

  return (
    <TransitionProvider>
      <FooterProvider>
        <PageTransition>
          <div className={`app ${isHome ? 'app--home-desktop' : ''}`}>
            <CustomCursor />
            <Header />
            <main>
              <Outlet />
            </main>
            <Footer />
          </div>
        </PageTransition>
      </FooterProvider>
    </TransitionProvider>
  )
}

export default Layout
