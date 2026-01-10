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
        <Link to="/" className="header__name">Ryan Stone</Link>
      </div>

      {isHome && (
        <nav className="header__tabs">
          {categories.map((category) => (
            <button
              key={category}
              className={`header__tab ${activeCategory === category ? 'header__tab--active' : ''}`}
              onClick={() => setActiveCategory(category)}
            >
              {category === 'ux' ? 'UX' : category === 'brand' ? 'Brand' : category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </nav>
      )}

      <nav className="header__right">
        <Link to="/info" className="header__link">
          Info
        </Link>
      </nav>
    </header>
  )
}

export default Header
