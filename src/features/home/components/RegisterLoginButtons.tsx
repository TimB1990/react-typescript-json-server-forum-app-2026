import { faArrowRightToBracket } from '@fortawesome/free-solid-svg-icons/faArrowRightToBracket'
import { faUserPlus } from '@fortawesome/free-solid-svg-icons/faUserPlus'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Link } from 'react-router-dom'

export const RegisterLoginButtons = () => {
    return (
        <div className='register-login-buttons'>
            <Link to="/register" className='register-login-link-btn primary'>
                <FontAwesomeIcon icon={faUserPlus} aria-hidden="true" />
                <span>Sign Up</span>
            </Link>
            <Link to="/login" className='register-login-link-btn'>
                <FontAwesomeIcon icon={faArrowRightToBracket} aria-hidden="true" />
                <span>Sign in</span>
            </Link>
        </div>
    )
}
