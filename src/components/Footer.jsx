import { useFooter } from '../context/FooterContext'
import SettingsPopover from './SettingsPopover'
import './Footer.css'

function Footer() {
  const { centerContent, onPrevRef, onNextRef } = useFooter()

  const handlePrev = () => {
    if (onPrevRef.current) onPrevRef.current()
  }

  const handleNext = () => {
    if (onNextRef.current) onNextRef.current()
  }

  const hasNavigation = onPrevRef.current || onNextRef.current

  return (
    <footer className="footer">
      <div className="footer__left">
        <span>Designed and built by Ryan</span>
      </div>

      <div className="footer__center">
        {hasNavigation && (
          <button className="footer__nav footer__nav--prev" onClick={handlePrev} aria-label="Previous">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
        )}
        {centerContent}
        {hasNavigation && (
          <button className="footer__nav footer__nav--next" onClick={handleNext} aria-label="Next">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        )}
      </div>

      <div className="footer__right">
        <SettingsPopover />
        <a href="mailto:ryanstonedesign@gmail.com" className="footer__email-link">Send an email</a>
      </div>
    </footer>
  )
}

export default Footer
