import React from 'react'
import heroImage from '../../../assets/gemini_generated_hero_image.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import {
  faMagnifyingGlass,
  faCircleUser,
  faUserPlus,
  faComment,
  faNewspaper,
  faBars,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons';

import { Link } from 'react-router-dom';

export const Header = () => {
  return (
    <header className="site-header">
      <div className="hero-image-container">
        <img src={heroImage} alt="" />
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
          <ul>
            <li>
              <Link to="" className='link-btn'>
                <FontAwesomeIcon icon={faCircleUser} />
                Allready a member? Login
              </Link>
            </li>
            <li>
              <Link to="" className='link-btn'>
                <FontAwesomeIcon icon={faUserPlus} aria-hidden="true" />
                <span>Sign Up</span>
              </Link></li>
          </ul>
        </nav>
      </div>
    </header>
  )
}
