import footerImage from "../../../assets/gemini_generated_footer_image.png"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faMoon, faLightbulb, faCircleHalfStroke, faRss } from "@fortawesome/free-solid-svg-icons"
import { faFacebookF, faInstagram, faXTwitter, faYoutube, faDiscord } from "@fortawesome/free-brands-svg-icons"
import { Link } from "react-router-dom"

export const Footer = () => {
  return (
    <div className='site-footer'>
      <div className="footer-image-container">
        <img src={footerImage} alt="" />
        <div className="footer-navbars">
            <nav className="footer-top-nav">
              <div className="theme-selector">
                <button title="Light Mode" className="footer-btn"><FontAwesomeIcon icon={faLightbulb} /></button>
                <button title="Dark Mode" className="footer-btn"><FontAwesomeIcon icon={faMoon} /></button>
                <button title="System Preference" className="footer-btn"><FontAwesomeIcon icon={faCircleHalfStroke} /></button>
              </div>
              <div className="socials">
                <a href="" className="footer-btn fb" >
                  <FontAwesomeIcon icon={faFacebookF} />
                </a>
                <a href="" className="footer-btn ig" >
                  <FontAwesomeIcon icon={faInstagram} />
                </a>
                <a href="" className="footer-btn x" >
                  <FontAwesomeIcon icon={faXTwitter} />
                </a>
                <a href="" className="footer-btn yt" >
                  <FontAwesomeIcon icon={faYoutube} />
                </a>
                <a href="" className="footer-btn dc" >
                  <FontAwesomeIcon icon={faDiscord} />
                </a>
              </div>
            </nav>
            <div className="divider"></div>
            <nav className="footer-bottom-nav">
              <div>
                <Link className="footer-btn" to="">Privacy Policy</Link>
                <Link className="footer-btn" to="">Contact</Link>
                <Link className="footer-btn" to="">Cookies</Link>
                <Link className="footer-btn" to=""><FontAwesomeIcon icon={faRss} /> RSS</Link>
              </div>
              <div>
                <p>Forum Application 2026</p>
                <p>Powered by community</p>
              </div>
            </nav>
        </div>
      </div>
    </div>
  )
}
