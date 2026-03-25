import { Outlet, useLocation } from 'react-router-dom'
import { FooterProvider } from '../context/FooterContext'
import { CategoryProvider } from '../context/CategoryContext'
import { TransitionProvider } from '../context/TransitionContext'
import Header from './Header'
import Footer from './Footer'
import CustomCursor from './CustomCursor'
import PageTransition from './PageTransition'
import './Layout.css'

function Layout() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  return (
    <TransitionProvider>
      <FooterProvider>
        <CategoryProvider>
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
        </CategoryProvider>
      </FooterProvider>
    </TransitionProvider>
  )
}

export default Layout
