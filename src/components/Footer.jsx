import { useFooter } from '../context/FooterContext'
import SettingsPopover from './SettingsPopover'
import './Footer.css'

function Footer() {
  const { centerContent } = useFooter()

  return (
    <footer className="footer">
      <div className="footer__left">
        <a href="https://dribbble.com/" target="_blank" rel="noopener noreferrer">Dribbble</a>
        <span className="footer__separator">,</span>
        <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer">Twitter</a>
        <span className="footer__separator">,</span>
        <a href="https://linkedin.com/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
      </div>

      <div className="footer__center">
        {centerContent}
      </div>

      <div className="footer__right">
        <SettingsPopover />
        <a href="mailto:hello@ryanstone.design">Send An Email</a>
      </div>
    </footer>
  )
}

export default Footer
