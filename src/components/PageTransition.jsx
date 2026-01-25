import { useTransition } from '../context/TransitionContext'
import './PageTransition.css'

function PageTransition({ children }) {
  const { isExiting } = useTransition()

  return (
    <div className={`page-transition ${isExiting ? 'page-transition--exiting' : ''}`}>
      {children}
    </div>
  )
}

export default PageTransition
