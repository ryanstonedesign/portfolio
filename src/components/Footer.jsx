import { useLocation } from 'react-router-dom'
import { useFooter } from '../context/FooterContext'
// import SettingsPopover from './SettingsPopover'
import './Footer.css'

function Footer() {
  const { centerContent } = useFooter()
  const location = useLocation()
  const isInfoPage = location.pathname === '/info'
  const isHome = location.pathname === '/'
  const useGradient = isInfoPage || isHome

  return (
    <footer className={`footer ${useGradient ? 'footer--with-gradient' : ''}`}>
      <div className="footer__left">
        <span>© 2026 Ryan Stone</span>
      </div>

      <div className="footer__center">
        {centerContent}
      </div>

      <div className="footer__right">
        {/* <SettingsPopover /> */}
        <a href="mailto:ryanstonedesign@gmail.com" className="footer__email-link"><span>Send email</span></a>
      </div>
    </footer>
  )
}

export default Footer
