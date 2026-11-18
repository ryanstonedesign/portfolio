import { Outlet, useLocation } from 'react-router-dom'
import { CategoryProvider } from '../context/CategoryContext'
import { FooterProvider } from '../context/FooterContext'
import { TransitionProvider } from '../context/TransitionContext'
import Header from './Header'
import Footer from './Footer'
import PageTransition from './PageTransition'
import './Layout.css'

function Layout() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  return (
    <TransitionProvider>
      <CategoryProvider>
        <FooterProvider>
          <PageTransition>
            <div className={`app ${isHome ? 'app--home-desktop' : ''}`}>
              <Header />
              <main>
                <Outlet />
              </main>
              <Footer />
            </div>
          </PageTransition>
        </FooterProvider>
      </CategoryProvider>
    </TransitionProvider>
  )
}

export default Layout
