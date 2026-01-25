import { useLocation } from 'react-router-dom'
import { useCategory } from '../context/CategoryContext'
import { useTransition } from '../context/TransitionContext'
import { categories } from '../data/projects'
import './Header.css'

function Header() {
  const location = useLocation()
  const isHome = location.pathname === '/'
  const { activeCategory, setActiveCategory } = useCategory()
  const { transitionTo } = useTransition()

  const handleNavClick = (e, path) => {
    e.preventDefault()
    if (location.pathname !== path) {
      transitionTo(path)
    }
  }

  const isInfoPage = location.pathname === '/info'

  return (
    <header className={`header ${isInfoPage ? 'header--with-gradient' : ''}`}>
      <div className="header__left">
        <a href="/" className="header__name" onClick={(e) => handleNavClick(e, '/')}>
          <span>Ryan Stone</span>
        </a>
      </div>

      {isHome && (
        <nav className="header__tabs">
          {categories.map((category, index) => (
            <button
              key={category}
              className={`header__tab ${activeCategory === category ? 'header__tab--active' : ''}`}
              data-category={category}
              onClick={() => setActiveCategory(category)}
            >
              <span style={{ animationDelay: `${0.05 + index * 0.03}s` }}>
                {category === 'ux' ? 'UX' : category === 'brand' ? 'Brand' : category.charAt(0).toUpperCase() + category.slice(1)}
              </span>
            </button>
          ))}
        </nav>
      )}

      <nav className="header__right">
        <a href="/info" className="header__link" onClick={(e) => handleNavClick(e, '/info')}>
          <span>Info</span>
        </a>
      </nav>
    </header>
  )
}

export default Header
