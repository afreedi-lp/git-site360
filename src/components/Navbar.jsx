import { Link, useLocation } from 'react-router-dom';

const links = [
  { path: '/', label: 'Home' },
  { path: '/about', label: 'About' },
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/contact', label: 'Contact' },
];

function Navbar() {
  const location = useLocation();

  return (
    <nav className="navbar" id="main-navbar">
      <div className="container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🔍</span>
          <span className="logo-text">Git Auditer</span>
        </Link>

        <ul className="navbar-links">
          {links.map(({ path, label }) => (
            <li key={path}>
              <Link
                to={path}
                className={location.pathname === path ? 'active' : ''}
                id={`nav-${label.toLowerCase()}`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
