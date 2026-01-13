import { useFooter } from '../context/FooterContext'
// import SettingsPopover from './SettingsPopover'
import './Footer.css'

function Footer() {
  const { centerContent } = useFooter()

  return (
    <footer className="footer">
      <div className="footer__left">
        <span>Designed and built by Ryan</span>
      </div>

      <div className="footer__center">
        {centerContent}
      </div>

      <div className="footer__right">
        {/* <SettingsPopover /> */}
        <a href="mailto:ryanstonedesign@gmail.com" className="footer__email-link">Send an email</a>
      </div>
    </footer>
  )
}

export default Footer
