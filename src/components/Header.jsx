import { Link, useLocation } from 'react-router-dom'
import { useCategory } from '../context/CategoryContext'
import { categories } from '../data/projects'
import './Header.css'

function Header() {
  const location = useLocation()
  const isHome = location.pathname === '/'
  const { activeCategory, setActiveCategory } = useCategory()

  return (
    <header className="header">
      <div className="header__left">
        <Link to="/" className="header__name">
          <span>Ryan Stone</span>
        </Link>
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
        <Link to="/info" className="header__link">
          <span>Info</span>
        </Link>
      </nav>
    </header>
  )
}

export default Header
