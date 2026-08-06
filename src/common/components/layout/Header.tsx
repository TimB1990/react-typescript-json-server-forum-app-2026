import heroImage from '../../../assets/gemini_generated_hero_image.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import {
  faMagnifyingGlass,
  faCircleUser,
  faUserPlus,
  faComment,
  faNewspaper,
  faBars,
  faChevronRight,
  faRightFromBracket
} from '@fortawesome/free-solid-svg-icons';

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import type { User } from '../../types/users';

export const Header = () => {

  const { user: rawUser, logout, loading } = useAuth();

  const theUser = rawUser as User | null;

  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login')
  }

  return (
    <header style={{ position: 'relative' }} className="site-header">
      <div style={{ backgroundColor: 'transparent', position: 'absolute', left: '1rem', top: '1rem', zIndex: 100 }}>
        <code style={{ color: 'red' }}>v0.1 - Early alpha, for showcase purposes only</code>
      </div>
      <div className="hero-image-container">
        <img src={heroImage} alt="" />
        <div className="hero-nav-container">
          <nav>
            <ul>
              <li>
                <button className='search-button'>
                  <FontAwesomeIcon icon={faMagnifyingGlass} />
                  <span>Search...</span>
                </button>
              </li>
            </ul>
            <ul>
              <li>
                <Link to="/" className='link-btn'>
                  <FontAwesomeIcon icon={faComment} />
                  <span>Forum</span>
                </Link>
              </li>
              <li>
                <Link to="/" className='link-btn'>
                  <FontAwesomeIcon icon={faNewspaper} />
                  <span>News</span>
                </Link>
              </li>
              <li>
                <Link to="/" className='link-btn'>
                  <FontAwesomeIcon icon={faBars} />
                  <span>More</span>
                  <FontAwesomeIcon icon={faChevronRight} />
                </Link>
              </li>
            </ul>

            {/* conditionally render based on Auth state */}
            <ul>
              {loading ? (
                <li>
                  <span className="link-btn">loading...</span>
                </li>
              ) : theUser ? (
                <>
                  {/* LOGGED IN: Show Profile Link & Logout */}
                  <li>
                    <Link to="/profile" className="link-btn">
                      <FontAwesomeIcon icon={faCircleUser} />
                      <span>{theUser.username || theUser.email || 'Profile'}</span>
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="link-btn"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', color: 'inherit' }}
                    >
                      <FontAwesomeIcon icon={faRightFromBracket} />
                      <span>Logout</span>
                    </button>
                  </li>
                </>
              ) : (
                <>
                  {/* LOGGED OUT: Show Login and Sign Up */}
                  <li>
                    <Link to="/login" className="link-btn">
                      <FontAwesomeIcon icon={faCircleUser} />
                      Already a member? Login
                    </Link>
                  </li>
                  <li>
                    <Link to="/register" className="link-btn">
                      <FontAwesomeIcon icon={faUserPlus} aria-hidden="true" />
                      <span>Sign Up</span>
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  )
}
