import { faArrowRightToBracket } from '@fortawesome/free-solid-svg-icons/faArrowRightToBracket'
import { faUserPlus } from '@fortawesome/free-solid-svg-icons/faUserPlus'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export const RegisterLoginButtons = () => {
    return (
        <div className='register-login-buttons'>
            <button className='btn-default orange'>
                <FontAwesomeIcon icon={faUserPlus} aria-hidden="true" />
                <span>Sign Up</span>
            </button>
            <button className='btn-default'>
                <FontAwesomeIcon icon={faArrowRightToBracket} aria-hidden="true" />
                <span>Sign in</span>
            </button>
        </div>
    )
}
